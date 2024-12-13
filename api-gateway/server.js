const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to check for JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Access denied');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Invalid token');
    req.user = decoded;
    next();
  });
};

// Routes
app.post('/createPost', verifyToken, async (req, res) => {
  try {
    const postData = req.body;
    const response = await axios.post(`${process.env.MYSQL_SERVICE_URL}/posts`, postData);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/comments/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const response = await axios.get(`${process.env.MONGODB_SERVICE_URL}/comments/${postId}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/activity/:userId', verifyToken, async (req, res) => {
  try {
    const { userId, action } = req.params;
    const response = await axios.get(`${process.env.CASSANDRA_SERVICE_URL}/activity/${userId}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/send-notification/:userId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const response = await axios.get(`${process.env.FIREBASE_SERVICE_URL}/send-notification/${userId}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(process.env.API_GATEWAY_PORT, () => {
  console.log(`API Gateway is running on port ${process.env.API_GATEWAY_PORT}`);
});
