const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors= require('cors');

const app = express();
const uri = "mongodb://localhost:27017";

const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

const filePath = path.join(__dirname, 'data.json');

// Read the existing JSON file
let items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const client = new MongoClient(uri);

app.get('/items', async(req, res) => {
    //res.json(items);

    try {
        const database = client.db('amazon');
        const collection = database.collection('orders');
        const items = await collection.find({}).toArray();
        res.json(items);
    } catch (err) {
        console.error('Error fetching items', err);
        res.status(500).send('Error fetching items');
    }
});

app.post('/items',async (req, res) => {
    /*const newItem = req.body;
    items=items.concat(newItem);

    // Write the updated JSON back to the file
    fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to the file:', err);
            return res.status(500).send('Error writing to the file');
        }
        res.status(201).json(newItem);
    });*/

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to server");

        const database = client.db('amazon'); // Replace with your database name
        const collection = database.collection('orders'); // Replace with your collection name

        // Read the JSON file
        const filePath = path.join(__dirname, 'data.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!Array.isArray(data)) {
            throw new Error('Data is not an array');
        }
        console.log(data.length);
        if(data.length==0){
            console.log('No data to insert');
            return;
        }
        else{

        // Insert data into MongoDB
        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documents were inserted`);
        }
    } catch (err) {
        console.error('Error connecting to the database', err);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
