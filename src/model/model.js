import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
  hobbies: { type: Array, required: true },
});

const User = mongoose.model('Users', userSchema);

export default User;