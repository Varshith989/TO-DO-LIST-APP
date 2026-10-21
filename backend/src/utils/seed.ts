import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Task } from '../models/task.model.js';
import { calculateTaskCompositeScore } from '../services/sort.service.js';

export async function autoSeedIfEmpty(): Promise<void> {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  console.log('[Seed] Database empty. Auto-seeding demo data...');
  const demoEmail = 'demo.engineer@taskmaster.dev';
  const user = await User.create({
    name: 'Demo Lead Engineer',
    email: demoEmail,
    password: 'Password123!',
  });

  const now = new Date();

  const sampleTasks = [
    {
      title: 'Fix Android native memory leak in splash screen',
      description: 'Resolve native bridging SIGSEGV on low-memory Android devices. Check JNI reference counts.',
      priority: 'urgent' as const,
      dueDateTime: new Date(now.getTime() + 2 * 3600 * 1000),
      deadline: new Date(now.getTime() + 4 * 3600 * 1000),
      category: ['Engineering', 'Mobile'],
      isCompleted: false,
      userId: user._id,
    },
    {
      title: 'Deploy hotfix patch to production API cluster',
      description: 'Apply security header hardening and rate limiter policy updates across pods.',
      priority: 'high' as const,
      dueDateTime: new Date(now.getTime() + 8 * 3600 * 1000),
      deadline: new Date(now.getTime() + 16 * 3600 * 1000),
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
      isCompleted: true,
      userId: user._id,
    },
  ];

  await Task.insertMany(sampleTasks);
  console.log('[Seed] Auto-seeded 6 demo tasks for demo.engineer@taskmaster.dev successfully!');
}

async function runStandaloneSeed() {
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
    }

    await Task.deleteMany({ userId: user._id });
    const now = new Date();
    const sampleTasks = [
      {
        title: 'Fix Android native memory leak in splash screen',
        description: 'Resolve native bridging SIGSEGV on low-memory Android devices. Check JNI reference counts.',
        priority: 'urgent' as const,
        dueDateTime: new Date(now.getTime() + 2 * 3600 * 1000),
        deadline: new Date(now.getTime() + 4 * 3600 * 1000),
        category: ['Engineering', 'Mobile'],
        isCompleted: false,
        userId: user._id,
      },
      {
        title: 'Deploy hotfix patch to production API cluster',
        description: 'Apply security header hardening and rate limiter policy updates across pods.',
        priority: 'high' as const,
        dueDateTime: new Date(now.getTime() + 8 * 3600 * 1000),
        deadline: new Date(now.getTime() + 16 * 3600 * 1000),
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
        isCompleted: true,
        userId: user._id,
      },
    ];

    await Task.insertMany(sampleTasks);
    console.log('[Seed] Standalone seed complete!');
  } finally {
    await disconnectDB();
  }
}

// Run standalone if executed directly via CLI
if (process.argv[1] && process.argv[1].includes('seed')) {
  runStandaloneSeed().catch(console.error);
}
