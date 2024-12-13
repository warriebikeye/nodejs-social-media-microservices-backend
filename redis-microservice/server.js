const express = require('express');
const redis = require('redis');
const port = process.env.PORT || 8000;
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();
app.use(express.json());
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

client.on('connect', () => console.log('Connected to Redis'));

app.get('/cache/:key', (req, res) => {
  const { key } = req.params;
  client.get(key, (err, reply) => {
    if (err) return res.status(500).send(err);
    if (reply) return res.json({ data: reply });
    res.status(404).send('Not found');
  });
});

app.post('/cache/:postId', (req, res) => {
  const { postId } = req.params;
  const postData = req.body;
  client.set(postId, JSON.stringify(postData), 'EX', 3600); // Cache data for 1 hour
  res.status(200).json({ message: 'Post cached successfully' });
});

// Background job to clear cache every hour
cron.schedule('0 * * * *', () => {
  console.log('Clearing Redis cache...');
  client.flushdb((err, succeeded) => {
    if (err) {
      console.log('Error clearing cache:', err);
    } else {
      console.log('Cache cleared:', succeeded);
    }
  });
});

app.listen(port, () => console.log(`Redis Service running on port ${port}`));
