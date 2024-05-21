const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3026;

// Connect to MongoDB
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


// Define user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,                                           
  });
  const User = mongoose.model('User', userSchema);
  
  // Define content schema
  const contentSchema = new mongoose.Schema({
    userId: String,
    type: String,
    title: String,
    content: String,
  });
  const Content = mongoose.model('Content', contentSchema);
  
  // User Signup
  app.post('/api/signup', async (req, res) => {
      try {
        const {email, password } = req.body;
    
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ success: false, message: 'User already exists' });
        }
    
        // Create a new user without hashing the password
        const newUser = new User({ email, password });
        await newUser.save();
    
        res.json({ success: true, message: 'User successfully registered' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
      }
    });
  
    // User login
    app.post('/api/login', async (req, res) => {
      try {
        const { email, password } = req.body;
    
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    
          if (password !== user.password) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
    
        res.json({ success: true, message: 'User successfully logged in', token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
      }
    });
    
    // Change Password
  app.put('/api/change-password', async (req, res) => {
      try {
        const { email, oldPassword, newPassword } = req.body;
    
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        // Compare old password
        if (oldPassword !== user.password) {
          return res.status(401).json({ success: false, message: 'Invalid old password' });
        }
    
        // Update the user password
        await User.updateOne({ _id: user._id }, { password: newPassword });
    
        res.json({ success: true, message: 'Password changed successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
      }
    });
  
  
    // Add Content
  app.post('/api/content', async (req, res) => {
      try {
        const { type, title, content } = req.body;
        const userId = req.user.userId; 
    
        // Create new content
        const newContent = new Content({ userId, type, title, content });
        await newContent.save();
    
        res.json({ success: true, message: 'Content added successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
      }
    });
    
    // Update Content
    app.put('/api/content/:contentId', async (req, res) => {
      try {
        const { title, content } = req.body;
        const { contentId } = req.params;
        const userId = req.user.userId; 
    
        
        await Content.updateOne({ _id: contentId, userId }, { title, content });
    
        res.json({ success: true, message: 'Content updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
      }
    });
    
        ////json.call { content.userId
        
        ////resizeBy
        //// }
      
      
    
   // Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
