import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
//import model from "./src/model/model.js"

const { urlencoded, json } = bodyParser;

var mongo_uri = "mongo db config";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
  hobbies: { type: Array, required: true },
});

const { connect } = mongoose;

mongoose.Promise = global.Promise;

connect(mongo_uri, { useNewUrlParser: true }).then(
  () => {
    console.log("[success] task 2 : connected to the database ");
  },
  error => {
    console.log("[failed] task 2 " + error);
    process.exit();
  }
);

var app = express();

app.use(cors());

// คำสั่งสำหรับแปลงค่า JSON ให้สามารถดึงและส่งค่าไปยัง MongoDB Atlas ได้
app.use(urlencoded({ extended: true }));
app.use(json());

var port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("[success] task 1 : listening on port " + port);
});


const User = mongoose.model('Users', userSchema);


app.get('/users', async (req, res) => {
    try {
      const users = await User.find();  
      console.log(users);
      res.json(users);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });

app.use((req, res) => {
    res.status(404).send("Path not found");
});

// error handling middleware (optional)
app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message || "Server error");
});

export default app;