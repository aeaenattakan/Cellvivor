import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
//import model from "./src/model/model.js"

const { urlencoded, json } = bodyParser;

var mongo_uri = "mongodb+srv://bammynithirathaya:cellvivor@cluster0.ovn4dde.mongodb.net/guessitdb?retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  progress: { type: Number, required: true },
  gameprogress: { type: Number, required: true },
});
const User = mongoose.model('Users', userSchema);


const keywordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  hint: { type: String },      
  level: { type: String },       // (easy, medium, hard)
  category: { type: String }    
});
const Keyword = mongoose.model('Keywords', keywordSchema);

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

app.get('/test/:id', (req, res) => {
  res.send(`Received ID: ${req.params.id}`);
});

app.get('/users', async (req, res) => {
    try {
      const users = await User.find();  
      console.log(users);
      res.json(users);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });
  
app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/keywords', async (req, res) => {
    try {
      const keywords = await Keyword.find();
      res.json(keywords);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });

  app.post('/keywords', async (req, res) => {
  try {
    const newKeyword = new Keyword(req.body);
    const savedKeyword = await newKeyword.save();
    res.status(201).json(savedKeyword);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { progress: req.body.progress },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).send(error.message);
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