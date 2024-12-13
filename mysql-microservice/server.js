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

app.listen(port, () => console.log(`MySQL Service running on port ${port}`));
