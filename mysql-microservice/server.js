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

app.listen(port, () => console.log(`MySQL Service running on port ${port}`));
