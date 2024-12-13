const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const dotenv = require('dotenv');
const port = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

dotenv.config();

app.use(express.json());

// Mock user data for demonstration - this is usually from a db
const users = [
  { id: 1, username: 'user1', password: 'password123' },
  { id: 2, username: 'user2', password: 'password456' }
];

// Login route: Authenticate user and generate JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }
  
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});


app.listen(port, () => console.log(`Auth Service running on port ${port}`));
