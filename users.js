const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3002;

// MongoDB connection details
const uri = "mongodb+srv://ishitatrivedicg:KCT83aMrI0OJe0hw@cluster0.togj8.mongodb.net/"; 
const dbName = "yt";

// Middleware
app.use(express.json());

let db, users;

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit if database connection fails
    }
}

// Initialize Database
initializeDatabase();

// Routes

// GET: List all users
app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).send("Error fetching users: " + err.message);
    }
});

// POST: Add a new user
app.post('/users', async (req, res) => {
    try {
        const newUser = req.body; // Ensure the request body has the correct data
        const result = await users.insertOne(newUser); // Insert into the 'users' collection
        res.status(201).send(`User added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding user: " + err.message);
    }
});

// PUT: Update a user completely
app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = req.body;
        const result = await users.replaceOne({ _id: new ObjectId(id) }, updatedUser);
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error updating user: " + err.message);
    }
});

// PATCH: Partially update a user
app.patch('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const result = await users.updateOne({ _id: new ObjectId(id) }, { $set: updates });
        res.status(200).send(`${result.modifiedCount} document(s) updated`);
    } catch (err) {
        res.status(500).send("Error partially updating user: " + err.message);
    }
});

// DELETE: Remove a user
app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await users.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send(`${result.deletedCount} document(s) deleted`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});


app.listen(port)