const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
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

// GET: Fetch a specific video by videoId
app.get('/videos/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;  // Get videoId from the URL parameters

        const video = await videos.findOne({ videoId: videoId });  // Find video by videoId

        if (!video) {
            return res.status(404).send("Video not found");
        }

        res.status(200).json(video);  // Send the video data as JSON in the response
    } catch (err) {
        res.status(500).send("Error fetching video: " + err.message);
    }
});

// POST: Upload a new video
app.post('/videos', async (req, res) => {
    try {
        const newVideo = req.body; // Get the new video data from the request body

        // Validate if all required fields are provided
        if (!newVideo.videoId || !newVideo.title || !newVideo.description || !newVideo.uploader || !newVideo.videoUrl) {
            return res.status(400).send("Missing required fields");
        }

        // Insert the new video document into the 'videos' collection
        const result = await videos.insertOne(newVideo);

        // Send success response
        res.status(201).send(`Video uploaded with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error uploading video: " + err.message);
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