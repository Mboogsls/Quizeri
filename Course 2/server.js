require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");


const app = express();
const PORT = 8080;
const SECRET_KEY = "kxmwm92922k*8lwsk/skssl2@#$%^^2WVVW";  
const STUDENT_ID = "M00872711"; 
const DB_URL = "mongodb+srv://micheal:micheal03@cluster0.uhmpg7j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "fileSharingDB";

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

let db;

MongoClient.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(DB_NAME);
    console.log(" Connected to MongoDB Atlas");
  })
  .catch(err => console.error("Database connection error:", err));

//  Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: "Access denied" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

//Register Static files
app.use(`/${STUDENT_ID}/uploads`, express.static(path.join(__dirname, "uploads")));

//  Register New User
app.post(`/${STUDENT_ID}/register`, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection("users").insertOne({ username, password: hashedPassword });
  res.json({ success: true, message: "User registered successfully" });
});

// Login User
app.post(`/${STUDENT_ID}/login`, async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection("users").findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ success: true, token });
});

//  Get all files (Requires authentication)
app.get(`/${STUDENT_ID}/files`, authenticateToken, async (req, res) => {
  const files = await db.collection("files").find().toArray();
  res.json(files);
});

app.get(`/${STUDENT_ID}/users`, authenticateToken, async (req, res) => {
  try {
      const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
      res.json(users);
  } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// Upload a file (Requires authentication)
app.post(`/${STUDENT_ID}/upload`, authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileData = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    createdAt: new Date(),
    uploadedBy: req.user.username
  };

  await db.collection("files").insertOne(fileData);
  res.json({ success: true, message: "File uploaded successfully", file: fileData });
});

//  Delete a file (Requires authentication)
app.delete(`/${STUDENT_ID}/delete/:filename`, authenticateToken, async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);

  try {
      // Delete file from the database
      const result = await db.collection("files").deleteOne({ filename });

      if (result.deletedCount === 0) {
          return res.status(404).json({ error: "File not found in database" });
      }

      // Delete file from filesystem
      fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") { // Ignore if file is already deleted
              console.error("File deletion error:", err);
              return res.status(500).json({ error: "Error deleting file" });
          }
      });

      res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Follow Users
// Follow Users (Stores in "follows" collection)
app.post(`/${STUDENT_ID}/follow/:userId`, authenticateToken, async (req, res) => {
  try {
      const userId = req.params.userId;
      const currentUserId = req.user.id; // Get the logged-in user's ID

      if (userId === currentUserId) {
          return res.status(400).json({ error: "You cannot follow yourself!" });
      }

      // Convert IDs to ObjectId
      const followerId = new ObjectId(currentUserId);
      const followingId = new ObjectId(userId);

      // Check if the follow relationship already exists
      const existingFollow = await db.collection("follows").findOne({
          follower: followerId,
          following: followingId
      });

      if (existingFollow) {
          return res.status(400).json({ error: "You are already following this user!" });
      }

      // Insert into the "follows" collection
      await db.collection("follows").insertOne({
          follower: followerId,
          following: followingId,
          followedAt: new Date()
      });

      res.json({ success: true, message: "You are now following this user." });

  } catch (error) {
      console.error("Follow Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



//  Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/${STUDENT_ID}/`));
