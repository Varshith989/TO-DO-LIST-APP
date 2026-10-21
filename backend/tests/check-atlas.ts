import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';
import { Task } from '../src/models/task.model.js';

dotenv.config();

async function verifyAtlasConnection() {
  const uri = process.env.MONGODB_URI || '';
  console.log('Connecting to URI:', uri.replace(/:([^:@]+)@/, ':****@'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  console.log('✅ Connection Status: CONNECTED');
  console.log('🌐 MongoDB Host:', mongoose.connection.host);
  console.log('📁 Database Name:', mongoose.connection.name);

  const users = await User.countDocuments();
  const tasks = await Task.countDocuments();

  console.log(`👤 Users in Atlas Database: ${users}`);
  console.log(`📋 Tasks in Atlas Database: ${tasks}`);

  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
}

verifyAtlasConnection().catch((err) => {
  console.error('❌ Atlas Connection Failed:', err.message);
  process.exit(1);
});
