const { configDotenv } = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 7000;
const dotenv = require('dotenv');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

dotenv.Config();

const CommentSchema = new mongoose.Schema({
  postId: String,
  userId: String,
  content: String
});

const Comment = mongoose.model('Comment', CommentSchema);

app.use(express.json());

app.post('/comments', (req, res) => {
  const { postId, userId, content } = req.body;
  const comment = new Comment({ postId, userId, content });
  comment.save()
    .then(doc => res.status(201).json(doc))
    .catch(err => res.status(500).send(err));
});

// Get comments by postId
app.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ postId });
  res.status(200).json(comments);
});

app.listen(port, () => console.log(`MongoDB Service running on port ${port}`));
