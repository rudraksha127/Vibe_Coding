import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewforge_ai';
const BCRYPT_COST = parseInt(process.env.BCRYPT_COST || '12', 10);
const email = 'luckyudiya@gmail.com';
const password = 'Rudra@2007';
const role = 'admin';
const profileName = 'Software Engineer';
const username = 'Rudra_2007';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error('CONNECT_ERROR', err && err.message ? err.message : String(err));
    process.exit(1);
  }

  const userSchema = new mongoose.Schema(
    {
      email: String,
      passwordHash: { type: String, select: false },
      role: { type: String, default: 'user' },
      profile: Object,
      authProviders: Array,
      isDeleted: Boolean
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const existing = await User.findOne({ email, isDeleted: false });
  if (existing) {
    console.log('EXISTS:' + existing._id.toString());
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const newUser = await User.create({
    email,
    passwordHash,
    role,
    profile: { name: profileName },
    authProviders: [{ provider: 'password', connectedAt: new Date() }]
  });

  console.log('CREATED:' + newUser._id.toString());
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('ERROR', err && err.stack ? err.stack : err);
  process.exit(1);
});
