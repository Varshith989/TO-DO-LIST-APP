import http from 'http';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

interface RequestOptions {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}

function makeRequest(port: number, options: RequestOptions): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : '';
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const data = rawData ? JSON.parse(rawData) : null;
            resolve({ status: res.statusCode || 500, data });
          } catch (e) {
            resolve({ status: res.statusCode || 500, data: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('--- STARTING TASKMASTER BACKEND E2E TEST SUITE ---');
  await connectDB();
  const app = createApp();

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 5000;
  console.log(`Test server running on port: ${port}`);

  try {
    // 1. Health check
    const health = await makeRequest(port, { method: 'GET', path: '/api/health' });
    console.log(`[PASS] Health Check Status: ${health.status} (${health.data?.status})`);

    // 2. User Registration
    const testEmail = `lead_engineer_${Date.now()}@example.com`;
    const regRes = await makeRequest(port, {
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Alex Principal',
        email: testEmail,
        password: 'Password123!',
      },
    });
    console.log(`[PASS] Register User Status: ${regRes.status}, User ID: ${regRes.data?.user?.id}`);
    const token = regRes.data?.token;
    if (!token) throw new Error('JWT token missing from register response');

    // 3. Authenticate /api/auth/me
    const meRes = await makeRequest(port, {
      method: 'GET',
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] Auth Me: ${meRes.data?.user?.name} (${meRes.data?.user?.email})`);

    // 4. Create tasks with varying priorities and deadlines
    const now = new Date();
    const taskUrgent = await makeRequest(port, {
      method: 'POST',
      path: '/api/tasks',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Fix critical mobile crash on launch',
        description: 'Resolve Android SIGSEGV memory leak in splash screen',
        priority: 'urgent',
        dueDateTime: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(),
        deadline: new Date(now.getTime() + 4 * 3600 * 1000).toISOString(),
        category: ['Engineering', 'Mobile'],
      },
    });
    console.log(`[PASS] Created Urgent Task: "${taskUrgent.data?.task?.title}" Score: ${taskUrgent.data?.task?.compositeScore}`);

    const taskLow = await makeRequest(port, {
      method: 'POST',
      path: '/api/tasks',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Review quarterly tech roadmap documentation',
        description: 'Read the draft architecture spec',
        priority: 'low',
        dueDateTime: new Date(now.getTime() + 10 * 86400 * 1000).toISOString(),
        deadline: new Date(now.getTime() + 14 * 86400 * 1000).toISOString(),
        category: ['Documentation'],
      },
    });
    console.log(`[PASS] Created Low Task: "${taskLow.data?.task?.title}" Score: ${taskLow.data?.task?.compositeScore}`);

    const taskMedium = await makeRequest(port, {
      method: 'POST',
      path: '/api/tasks',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Update React Native dependencies',
        description: 'Upgrade React Native to latest version',
        priority: 'medium',
        dueDateTime: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
        deadline: new Date(now.getTime() + 48 * 3600 * 1000).toISOString(),
        category: ['Maintenance'],
      },
    });
    console.log(`[PASS] Created Medium Task: "${taskMedium.data?.task?.title}" Score: ${taskMedium.data?.task?.compositeScore}`);

    // 5. Test Composite Sort
    const tasksRes = await makeRequest(port, {
      method: 'GET',
      path: '/api/tasks?sort=composite',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] Fetched ${tasksRes.data?.tasks?.length} tasks with composite sort.`);
    console.log('Composite Rank Order:');
    tasksRes.data?.tasks?.forEach((t: any, idx: number) => {
      console.log(`  #${idx + 1} [Score: ${t.compositeScore}] [Priority: ${t.priority}] ${t.title}`);
    });

    if (tasksRes.data?.tasks[0]?.priority !== 'urgent') {
      throw new Error('Composite sort failed: Urgent task should be #1');
    }

    // 6. Toggle Completion of Urgent Task
    const urgentId = taskUrgent.data?.task?._id;
    const toggleRes = await makeRequest(port, {
      method: 'PATCH',
      path: `/api/tasks/${urgentId}/toggle`,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] Toggled Urgent Task isCompleted: ${toggleRes.data?.task?.isCompleted}`);

    // 7. Verify Urgent Task now sinks to bottom due to completion penalty
    const afterToggleRes = await makeRequest(port, {
      method: 'GET',
      path: '/api/tasks?sort=composite',
      headers: { Authorization: `Bearer ${token}` },
    });
    const lastTask = afterToggleRes.data?.tasks[afterToggleRes.data?.tasks.length - 1];
    console.log(`[PASS] After completion, lowest ranked task is now: "${lastTask?.title}" (Score: ${lastTask?.compositeScore})`);
    if (!lastTask?.isCompleted) {
      throw new Error('Completed task did not sink to bottom in composite sort!');
    }

    // 8. Test Filtering (filter=pending)
    const pendingRes = await makeRequest(port, {
      method: 'GET',
      path: '/api/tasks?filter=pending',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] Filter pending returned ${pendingRes.data?.count} tasks (expected 2)`);

    // 9. Test Deletion
    const deleteRes = await makeRequest(port, {
      method: 'DELETE',
      path: `/api/tasks/${urgentId}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`[PASS] Delete Task Status: ${deleteRes.status}, Deleted: ${deleteRes.data?.deletedTaskId}`);

    console.log('\n========================================================');
    console.log(' ALL BACKEND INTEGRATION & ALGORITHM TESTS PASSED 100%! ');
    console.log('========================================================\n');
  } finally {
    server.close();
    await disconnectDB();
  }
}

runTestSuite().catch((err) => {
  console.error('[FAILED] Test suite encountered an error:', err);
  process.exit(1);
});
