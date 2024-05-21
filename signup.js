// index.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const {MongoClient} = require('mongodb');

const app = express();
const PORT = 3018;
// Connect to MongoDB
//const {MongoClient} = require('mongodb');
mongoose.connect("mongodb://127.0.0.1/data", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  socketTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000, // 30 seconds
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Create a user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

// Create a user model
const User = mongoose.model('User', userSchema);





const PAGE_SIZE = 5;
const MAX_PAGE = 6;


// Parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Signup endpoint
// Signup endpoint
app.post('/signup', async (req, res) => {
    try {
      for (let i = 1; i <= 30; i++) {
        const username = `user${i}`;
        const password = `password${i}`;
  
        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          console.log(`Username '${username}' already taken. Skipping...`);
          continue;
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create a new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        // Get the paginated list of users
const page = 1; // Page number (1-based)
const skip = (page - 1) * PAGE_SIZE; // Number of documents to skip
const users = await User.find().skip(skip).limit(PAGE_SIZE);

console.log('Users:', users); // Add console.log statement
console.log('User ${username} saved');

return res.status(201).json({
  message: 'Signup successful',
  users: users,
});

       
      }
  
      return res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username' });
    }

    // Check if the password matches
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
