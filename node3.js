const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const uri =  process.env.MONGODB_URI ||"mongodb+srv://jhenkar695:djtOllDTmxZGYgKy@cluster0.vcolgra.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const PORT =  process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(uri);

let database;
let collection;

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected successfully to server");
        database = client.db('amazon'); // Replace with your database name
        collection = database.collection('orders'); // Replace with your collection name
    } catch (err) {
        console.error('Error connecting to the database', err);
        process.exit(1); // Exit the process if the connection fails
    }
}

// Connect to the database when the server starts
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start server', err);
});

app.get('/items/:user', async (req, res) => {
    try {
        const user = req.params.user; 
        collection = database.collection(user);
        const itemsCursor = collection.find({}); // Fetch all items
        const items = await itemsCursor.toArray(); // Convert cursor to array
        res.json(items);
    } catch (err) {
        console.error('Error fetching items', err);
        res.status(500).send('Error fetching items');
    }
});

app.get('/item', async (req, res) => {
    try {
        
        collection = database.collection('accounts');
        const itemsCursor = collection.find({}); // Fetch all items
        const items = await itemsCursor.toArray(); // Convert cursor to array
        res.json(items);
    } catch (err) {
        console.error('Error fetching items', err);
        res.status(500).send('Error fetching items');
    }
});

app.post('/items', async (req, res) => {
    try {
        
        const {user,newItems} = req.body;
        
        if (!user|| typeof user !== 'string') {
            console.log("string");
            return res.status(400).send('Invalid input data: User must be a string');
            
        }
        
        if (!Array.isArray(newItems)) {
            console.log("array");
            return res.status(400).send('Invalid input data: Expected an array of items');
        }
        
        collection = database.collection(user);
        
        const result = await collection.insertMany(newItems);
        
        res.status(201).json(result.insertedIds);
        console.log("items inserted");
    } catch (err) {
        console.error('Error adding items', err);
        res.status(500).send('Error adding items');
    }
});

app.get('/accounts', async (req, res) => {
    try {
        collection=database.collection('accounts');
        const itemsCursor = collection.find({}); // Fetch all items
        const items = await itemsCursor.toArray(); // Convert cursor to array
        res.json(items);
    } catch (err) {
        console.error('Error fetching items', err);
        res.status(500).send('Error fetching items');
    }
});

app.post('/accounts', async (req, res) => {
    try {
        const {user,pass} = req.body;
        collection=database.collection('accounts');

        const existingUser = await collection.findOne({ user:user });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        
        const result = await collection.insertOne({user:user,password:pass});
        
        res.status(201).json(result);
        console.log("items inserted");
    } catch (err) {
        console.error('Error adding items', err);
        res.status(500).send('Error adding items');
    }
});

app.post('/collection', async (req, res) => {
    try {
        const {user} = req.body;
        
        const collections = await database.listCollections({ name: user }).toArray();
        if (collections.length > 0) {
            return res.status(400).json({ message: `Collection ${user} already exists` });
        }

        await database.createCollection(user);
            res.status(201).json({ message: `Collection ${user} created successfully` });
    } catch (err) {
        console.error('Error adding items', err);
        res.status(500).send('Error adding items');
    }
});


app.put('/items/:orderId', async (req, res) => {
    const orderId=req.params.orderId;
    const {status} = req.body;
    console.log('Received parameters:', orderId, status);

    try {
        // Update the item in the collection
        const result = await collection.updateOne(
            { or_id: orderId }, // Filter to find the document to update
            { $set: { status: status } } // Update operation
        );

        if (result.modifiedCount > 0) {
            res.json({ message: 'Item updated successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        console.error('Error updating item', err);
        res.status(500).json({ message: 'Error updating item', error: err.message });
    }
});

/*app.put('/items/:user', async (req, res) => {
    const user=req.params.orderId;
    const {price,orderId} = req.body;
    console.log(price);
    const price1 = parseInt(price, 10);
    console.log('Received parameters:', orderId, price1);

    try {
        // Update the item in the collection
        const result = await collection.updateOne(
            { or_id: orderId }, // Filter to find the document to update
            { $set: { price: price1 } } // Update operation
        );

        if (result.modifiedCount > 0) {
            res.json({ message: 'Item updated successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        console.error('Error updating item', err);
        res.status(500).json({ message: 'Error updating item', error: err.message });
    }
});*/

