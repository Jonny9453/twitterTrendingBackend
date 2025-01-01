require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { fetchTrendsData } = require('./selenium_script.js');
const connectDB= require('./connect.js')
const{ TrendsModel }= require('./schema.js');

const app = express();
const PORT = process.env.PORT||4000;
 // Configure CORS to allow requests from localhost:5173
 app.use(cors({
    origin: '*',  // Allow requests from any origin
    methods: 'GET,POST,PUT,DELETE,OPTIONS',  // Allow methods
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',  // Allow necessary headers
    preflightContinue: false,  // Send response to preflight request
    optionsSuccessStatus: 200,  // Send 200 for successful OPTIONS request (important for older browsers like IE)
  }));
  

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

// Middleware to parse JSON request bodies
app.use(express.json()); // For parsing application/json

// const dbName = 'twitter_trends';

app.use(express.static('public'));

app.post('/run-script', async (req, res) => {
    const data=req.body;
    console.log(data)
    try {
        // Directly call the fetchTrendsData function from index.js
        await fetchTrendsData(data);  // This will run the logic to fetch and store trends
        
        // Fetch the latest entry from MongoDB
        const latestRecord = await TrendsModel.find().sort({ end_time: -1 }).limit(1);

        // Send the latest record back as a response
        res.json(latestRecord[0]);
    } catch (error) {
        console.error('Error running the script:', error);
        return res.status(500).send('Error running the script or fetching data.');
    }
});

app.listen(PORT, () => {
    console.log(process.env.MONGODB_CONNECTION_LINK)
    console.log('Server is running on port 4000');
});
