import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Task } from '../models/task.model.js';
import { calculateTaskCompositeScore } from '../services/sort.service.js';

async function seed() {
  console.log('--- SEEDING TASKMASTER DEMO DATABASE ---');
  await connectDB();

  try {
    const demoEmail = 'demo.engineer@taskmaster.dev';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Demo Lead Engineer',
        email: demoEmail,
        password: 'Password123!',
      });
      console.log(`[Seed] Created demo user account: ${demoEmail}`);
    } else {
      console.log(`[Seed] Using existing demo user account: ${demoEmail}`);
    }

    // Clean previous seed tasks for clean demo state
    await Task.deleteMany({ userId: user._id });
    console.log('[Seed] Cleared previous demo tasks.');

    const now = new Date();

    const sampleTasks = [
      {
        title: 'Fix Android native memory leak in splash screen',
        description: 'Resolve native bridging SIGSEGV on low-memory Android devices. Check JNI reference counts.',
        priority: 'urgent' as const,
        dueDateTime: new Date(now.getTime() + 2 * 3600 * 1000), // in 2 hours
        deadline: new Date(now.getTime() + 4 * 3600 * 1000),    // in 4 hours
        category: ['Engineering', 'Mobile'],
        isCompleted: false,
        userId: user._id,
      },
      {
        title: 'Deploy hotfix patch to production API cluster',
        description: 'Apply security header hardening and rate limiter policy updates across pods.',
        priority: 'high' as const,
        dueDateTime: new Date(now.getTime() + 8 * 3600 * 1000), // in 8 hours
        deadline: new Date(now.getTime() + 16 * 3600 * 1000),  // in 16 hours
        category: ['DevOps', 'Work'],
        isCompleted: false,
        userId: user._id,
      },
      {
        title: 'Refactor composite sort algorithm to support custom client weights',
        description: 'Provide an API query parameter for custom priority vs deadline coefficient ratios.',
        priority: 'high' as const,
        dueDateTime: new Date(now.getTime() + 24 * 3600 * 1000),
        deadline: new Date(now.getTime() + 48 * 3600 * 1000),
        category: ['Engineering'],
        isCompleted: false,
        userId: user._id,
      },
      {
        title: 'Quarterly engineering performance 1-on-1 reviews',
        description: 'Sync with frontend and backend squad leads on career progression and quarterly goals.',
        priority: 'medium' as const,
        dueDateTime: new Date(now.getTime() + 3 * 86400 * 1000),
        deadline: new Date(now.getTime() + 5 * 86400 * 1000),
        category: ['Management', 'Work'],
        isCompleted: false,
        userId: user._id,
      },
      {
        title: '10k morning endurance run & athletic conditioning',
        description: 'Complete the outdoor tempo run with heart rate zone 4 targets.',
        priority: 'medium' as const,
        dueDateTime: new Date(now.getTime() + 4 * 86400 * 1000),
        deadline: new Date(now.getTime() + 7 * 86400 * 1000),
        category: ['Fitness', 'Personal'],
        isCompleted: false,
        userId: user._id,
      },
      {
        title: 'Migrate legacy Redux boilerplate to Zustand store',
        description: 'Clean up reducers, action creators, and replace with atomic Zustand slices and AsyncStorage persistence.',
        priority: 'low' as const,
        dueDateTime: new Date(now.getTime() - 24 * 3600 * 1000),
        deadline: new Date(now.getTime() - 12 * 3600 * 1000),
        category: ['Engineering'],
        isCompleted: true, // Completed task to show strike-through and completion penalty
        userId: user._id,
      },
    ];

    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`[Seed] Successfully inserted ${createdTasks.length} rich demo tasks.\n`);

    console.log('Ranked Task Preview:');
    createdTasks
      .map((t) => ({ ...t.toObject(), score: calculateTaskCompositeScore(t) }))
      .sort((a, b) => b.score - a.score)
      .forEach((t, i) => {
        console.log(` #${i + 1} [Score: ${t.score}] [${t.priority.toUpperCase()}] "${t.title}" (${t.isCompleted ? 'DONE' : 'ACTIVE'})`);
      });

    console.log('\n--- SEED COMPLETE ---');
  } finally {
    await disconnectDB();
  }
}

seed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
