const express = require('express');
const cassandra = require('cassandra-driver');
const port = process.env.PORT || 9000;
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();

const app = express();
app.use(express.json());
// Cassandra connection
const client = new cassandra.Client({
  contactPoints: [process.env.CASSANDRA_HOST],
  localDataCenter: 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE
});

// Background job to process bulk data every midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running bulk data job...');
  const bulkData = [
    { userId: '1', postId: '101', activity: 'liked a post' },
    { userId: '2', postId: '102', activity: 'commented on a post' }
  ];

  const query = 'INSERT INTO activity_logs (user_id, post_id, activity) VALUES (?, ?, ?)';
  
  bulkData.forEach(data => {
    client.execute(query, [data.userId, data.postId, data.activity], { prepare: true })
      .then(() => console.log('Bulk data inserted'))
      .catch(err => console.log('Error inserting bulk data:', err));
  });
});

app.listen(port, () => console.log(`Cassandra Service running on port ${port}`));
