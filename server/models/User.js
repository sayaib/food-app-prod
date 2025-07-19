
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  otp: String,
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model('User', userSchema);
