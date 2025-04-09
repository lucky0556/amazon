const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const uri = "mongodb://localhost:27017"; // Replace with your MongoDB connection string
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to server");

        const database = client.db('amazon'); // Replace with your database name
        const collection = database.collection('orders'); // Replace with your collection name

        // Sample data to insert
        const items = [
            { name: "Item 1", description: "Description for Item 1" },
            { name: "Item 2", description: "Description for Item 2" }
        ];

        // Insert data into MongoDB
        const result = await collection.insertMany(items);
        console.log(`${result.insertedCount} documents were inserted`);
    } catch (err) {
        console.error('Error connecting to the database', err);
    } finally {
        await client.close();
    }
}

app.get('/items', async (req, res) => {
    try {
        const database = client.db('amazon');
        const collection = database.collection('orders');
        const items = await collection.find();
        res.json(items);
    } catch (err) {
        console.error('Error fetching items', err);
        res.status(500).send('Error fetching items');
    }
});

app.post('/items', async (req, res) => {
    try {
        const newItem = req.body;
        const database = client.db('amazon');
        const collection = database.collection('orders');
        const result = await collection.insertOne(newItem);
        res.status(201).json(result.ops[0]);
    } catch (err) {
        console.error('Error adding item', err);
        res.status(500).send('Error adding item');
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await run();
});