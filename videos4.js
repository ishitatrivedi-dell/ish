const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb+srv://ishitatrivedicg:KCT83aMrI0OJe0hw@cluster0.togj8.mongodb.net/"; 
const dbName = "yt";

// Middleware
app.use(express.json());

let db, users, videos, comments;  // Added 'comments' collection

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");
        videos = db.collection("videos");  // Initialize the 'videos' collection
        comments = db.collection("comments");  // Initialize the 'comments' collection

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
app.patch('/videos/:videoId/likes', async (req, res) => {
    try {
        const videoId = req.params.videoId;  // Get videoId from the URL parameters

        // Find the video by videoId and increment its like count
        const result = await videos.updateOne(
            { videoId: videoId },  // Find video by videoId
            { $inc: { likes: 1 } }  // Increment the 'likes' field by 1
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Video not found or no changes made");
        }

        res.status(200).send(`Like count for video with videoId: ${videoId} updated successfully`);
    } catch (err) {
        res.status(500).send("Error updating like count for video: " + err.message);
    }
});
// DELETE: Remove a user by userId

// DELETE: Remove a video by videoId
app.delete('/videos/:videoId', async (req, res) => {
    try {
        const videoId = req.params.videoId;  // Get videoId from the URL parameters

        // Delete the video document matching the videoId
        const result = await videos.deleteOne({ videoId: videoId });

        if (result.deletedCount === 0) {
            return res.status(404).send("Video not found");
        }

        res.status(200).send(`Video with videoId: ${videoId} deleted successfully`);
    } catch (err) {
        res.status(500).send("Error deleting video: " + err.message);
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

