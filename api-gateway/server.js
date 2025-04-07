const express = require('express');
const logger = require('./logger'); // Import the logger
const axios = require('axios');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());

// Middleware to check for JWT Token
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger'); // Adjust to your logger path

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      logger.warn('Access denied: No token provided');
      return res.status(403).json({ error: 'Access denied: No token provided' });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    logger.info(`Token verified for user ID: ${decoded.id}`);
    next();
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;


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
