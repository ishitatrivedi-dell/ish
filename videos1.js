const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb+srv://ishitatrivedicg:KCT83aMrI0OJe0hw@cluster0.togj8.mongodb.net/"; 
const dbName = "yt";

// Middleware
app.use(express.json());

let db, users, videos; // Added 'videos' collection

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");
        videos = db.collection("videos");  // Initialize the 'videos' collection

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

// DELETE: Remove a user by userId
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;  // Get userId from the URL parameters

        const result = await users.deleteOne({ userId: userId });  // Delete user by userId

        if (result.deletedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).send(`User with userId: ${userId} deleted successfully`);
    } catch (err) {
        res.status(500).send("Error deleting user: " + err.message);
    }
});

// GET: Fetch all videos
app.get('/videos', async (req, res) => {
    try {
        const allVideos = await videos.find().toArray(); // Fetch all videos from the 'videos' collection
        res.status(200).json(allVideos);  // Send back the list of videos in the response
    } catch (err) {
        res.status(500).send("Error fetching videos: " + err.message);
    }
});
