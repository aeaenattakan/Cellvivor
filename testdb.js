import mongoose from 'mongoose';

const uri = "mongodb+srv://bammynithirathaya:cellvivor@cluster0.ovn4dde.mongodb.net/guessitdb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ Connection error:", err.message);
  });
