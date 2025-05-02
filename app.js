const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());
const username = process.env.MONGO_USERNAME; // Default username
const password = process.env.MONGO_PASSWORD; // Default password
const clusterUrl = process.env.MONGO_CLUSTER_URL; // Default cluster URL
const dbName = process.env.MONGO_DB_NAME; // Default database name

// Construct the MongoDB URI dynamically
const uri = `mongodb://${username}:${password}@${clusterUrl}/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
let planetCollection;

// Connect to MongoDB and initialize the database and collection
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("superData"); // Replace with your database name
    planetCollection = db.collection("planets"); // Replace with your collection name
    
    console.log("Connected to MongoDB and initialized database/collection.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
connectToDatabase();

// POST endpoint to fetch planet data by ID
app.post('/planet', async (req, res) => {
    try {
      const planetId = parseInt(req.body.id, 10);
      console.log("Querying planet with ID:", planetId); // Debug log
      const planetData = await planetCollection.findOne({ id: planetId });
      console.log("Fetched planet data:", planetData); // Debug log
  
      if (!planetData) {
        res.status(404).send("Planet not found. Please select a valid planet ID.");
      } else {
        res.send(planetData);
      }
    } catch (err) {
      console.error("Error fetching planet data:", err);
      res.status(500).send("Error in Planet Data");
    }
  });

// Serve the index.html file
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '/', 'index.html'));
});

// Health check endpoints
app.get('/os', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({
    "os": OS.hostname(),
    "env": process.env.NODE_ENV,
  });
});

app.get('/live', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({
    "status": "live",
  });
});

app.get('/ready', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send({
    "status": "ready",
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server successfully running on port - 3000");
});

module.exports = app;