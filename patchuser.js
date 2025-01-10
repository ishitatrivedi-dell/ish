const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
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

// PATCH: Update user profile picture by userId
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;  // Get userId from the URL parameters
        const { profilePicture } = req.body;  // Get the profilePicture from the request body

        if (!profilePicture) {
            return res.status(400).send("Profile picture URL is required");
        }

        const result = await users.updateOne(
            { userId: userId },  // Find user by userId
            { $set: { profilePicture: profilePicture } }  // Update the profilePicture field
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("User not found or no changes made");
        }

        res.status(200).send(`User's profile picture updated successfully`);
    } catch (err) {
        res.status(500).send("Error updating user profile picture: " + err.message);
    }
});

