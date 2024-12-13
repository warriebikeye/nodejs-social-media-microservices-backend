const express = require('express');
const admin = require('firebase-admin');
const port = process.env.PORT || 10000;
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();
app.use(express.json());
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-config.json'))
});

// Notification Routes
app.post('/sendNotification', (req, res) => {
  const { title, body, token } = req.body;

  const messagePayload = {
    notification: { title, body },
    token
  };

  admin.messaging().send(messagePayload)
    .then(response => {
      res.status(200).send(`Notification sent: ${response}`);
    })
    .catch(error => {
      res.status(500).send(`Error sending notification: ${error}`);
    });
});

// Background job to send notifications to users every day
cron.schedule('0 0 * * *', () => {
  console.log('Sending scheduled notifications...');
  const users = ['user_token_1', 'user_token_2'];  // Example users (should come from database)

  users.forEach(userToken => {
    const messagePayload = {
      notification: {
        title: 'New Notification',
        body: 'Check out the latest updates on the platform.'
      },
      token: userToken
    };

    admin.messaging().send(messagePayload)
      .then(response => {
        console.log(`Notification sent to ${userToken}:`, response);
      })
      .catch(error => {
        console.log('Error sending notification:', error);
      });
  });
});

app.listen(port, () => console.log(`Firebase Service running on port ${port}`));
