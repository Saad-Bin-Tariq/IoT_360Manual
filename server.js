const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL database configuration, add yours
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'f**p',
  password: 'po***es',
  port: 5432,
};

const client = new Client(dbConfig);

// Middleware to parse JSON in HTTP requests
app.use(cors());
app.use(bodyParser.json());

// Connect to the PostgreSQL database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
  });

// Endpoint to receive temperature and humidity data in a POST request
app.post('/sensor-data', async (req, res) => {
  try {
    // Extract temperature and humidity from the request body
    const temperature = req.body.temperature;
    const humidity = req.body.humidity;

    // Validate and process the data as needed
    console.log(`Received Temperature: ${temperature}°C, Humidity: ${humidity}%`);

    // Insert data into the database
    //change your table name
    const query = 'INSERT INTO fyp_data (temperature, humidity) VALUES ($1, $2)';
    const values = [temperature, humidity];

    await client.query(query, values);

    // Respond to the client
    res.status(200).json({ message: 'Data received and inserted successfully' });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to retrieve all data from the table
app.get('/all-data', async (req, res) => {
  try {
    const query = 'SELECT * FROM fyp_data ORDER BY timestamp DESC';
    const result = await client.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle server termination
process.on('SIGINT', () => {
  console.log('Closing the server and PostgreSQL connection');
  client.end()
    .then(() => {
      console.log('PostgreSQL connection closed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error closing PostgreSQL connection', err);
      process.exit(1);
    });
});
