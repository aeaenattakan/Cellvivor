import express from 'express';
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import model from "./src/model/model.js";
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIO } from 'socket.io';
import { setupSocket } from './socket.js'; // ✅ Import socket logic

const app = express();
const { urlencoded, json } = bodyParser;

const mongo_uri = "mongodb+srv://bammynithirathaya:cellvivor@cluster0.ovn4dde.mongodb.net/guessitdb?retryWrites=true&w=majority&appName=Cluster0";

// --- MongoDB Schemas ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  progress: { type: Number, required: true },
  gameprogress: { type: String, required: true },
  weakness: { type: Array, required: true },
});
const User = mongoose.models.Users || mongoose.model('Users', userSchema);

const keywordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  hint: { type: String },
  level: { type: String },
  category: { type: String }
});
const Keyword = mongoose.models.Keywords || mongoose.model('Keywords', keywordSchema);

const gameplaySchema = new mongoose.Schema({
  hinter: { type: String, required: true },
  guesser: { type: String, required: true },
  mistakes: { type: Array, required: true },
  score: { type: Number, required: true },
  localScore: { type: Number, default: 0 },
});
const Gameplay = mongoose.models.Gameplay || mongoose.model('Gameplay', gameplaySchema);

mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
  () => console.log("[success] Connected to MongoDB"),
  error => {
    console.log("[failed] MongoDB connection error: " + error);
    process.exit();
  }
);

// --- Middleware ---
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

// --- Static Files ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

// --- HTTP + WebSocket Server ---
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
});
setupSocket(io); // ✅ Hook up socket logic

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`[success] Server running on port ${port}`);
});

// --- Routes ---
app.get('/test/:id', (req, res) => {
  res.send(`Received ID: ${req.params.id}`);
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
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

app.get('/api/random-keyword', async (req, res) => {
  try {
    const count = await Keyword.countDocuments();
    if (count === 0) return res.status(404).json({ error: 'No keywords found' });
    const random = Math.floor(Math.random() * count);
    const keywordDoc = await Keyword.findOne().skip(random);
    res.json({ keyword: keywordDoc.word, hint: keywordDoc.hint });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { progress: req.body.progress },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send("User not found");
    res.json(updatedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/api/check-user', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOne({ name, email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/api/signin', async (req, res) => {
  try {
    const { name, email } = req.body;
    const existing = await User.findOne({ name, email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const newUser = new User({ name, email, progress: 0, gameprogress: 0, weakness: [] });
    const savedUser = await newUser.save();
    res.status(201).json({
      success: true,
      message: "Sign in successful",
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        progress: savedUser.progress,
        gameprogress: savedUser.gameprogress
      }
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOne({ name, email });
    if (user) {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          progress: user.progress,
          gameprogress: user.gameprogress
        }
      });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/api/gameplay-mistake', async (req, res) => {
  try {
    const { userId, keyword, result } = req.body;
    if (!userId || !keyword || !result) {
      return res.status(400).json({ error: 'Missing userId, keyword, or result' });
    }

    let gameplay = await Gameplay.findOne({ guesser: userId });
    if (!gameplay) {
      gameplay = new Gameplay({
        hinter: 'system',
        guesser: userId,
        mistakes: [],
        score: 0
      });
    }

    gameplay.mistakes.push(result);
    if (result.startsWith('TT:')) {
      gameplay.score += 1;
    }

    await gameplay.save();
    res.json({ success: true, gameplay });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gameplay-score', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const gameplay = await Gameplay.findOne({ guesser: userId });
    if (!gameplay) {
      return res.json({ score: 0 });
    }
    res.json({ score: gameplay.score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/progress/save', async (req, res) => {
  const { userId, scene } = req.body;
  if (!userId || !scene) return res.status(400).json({ error: 'Missing userId or scene' });
  await User.updateOne({ _id: userId }, { $set: { gameprogress: scene } });
  res.sendStatus(200);
});

app.get('/progress/load/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ lastScene: user?.gameprogress || "Chapter1" });
});

app.use((req, res) => {
  res.status(404).send("Path not found");
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message || "Server error");
});

export default app;
