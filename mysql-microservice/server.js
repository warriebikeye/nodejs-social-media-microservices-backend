const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 6000;
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.use(express.json());

app.post('/posts', (req, res) => {
  const { userId, content } = req.body;
  const query = 'INSERT INTO posts (user_id, content) VALUES (?, ?)';
  connection.query(query, [userId, content], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).json({ id: results.insertId });
  });
});

app.get('/posts', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const query = `
    SELECT id, user_id, content, created_at 
    FROM posts 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  connection.query(query, [limit, offset], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Count total for pagination metadata
    connection.query('SELECT COUNT(*) AS total FROM posts', (countErr, countResult) => {
      if (countErr) {
        return res.status(500).send(countErr);
      }

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        page,
        limit,
        total,
        totalPages,
        data: results
      });
    });
  });
});
app.get('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId) || postId <= 0) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const query = `
      SELECT id, user_id, content, created_at
      FROM posts
      WHERE id = ?
    `;

    connection.query(query, [postId], (err, results) => {
      if (err) {
        logger?.error(`Database error on GET /posts/${postId}: ${err.message}`);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!results || results.length === 0) {
        logger?.info(`Post not found for ID: ${postId}`);
        return res.status(404).json({ message: 'Post not found' });
      }

      logger?.info(`Post retrieved successfully: ID ${postId}`);
      return res.status(200).json(results[0]);
    });

  } catch (error) {
    logger?.error(`Unexpected error on GET /posts/:id - ${error.message}`);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(port, () => console.log(`MySQL Service running on port ${port}`));
