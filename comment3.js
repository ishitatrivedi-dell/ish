
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb://127.0.0.1:27017"; 
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
// POST: Add a new comment to a video
app.post('/comments', async (req, res) => {
    try {
        const { videoId, userId, content } = req.body;

        // Validate required fields
        if (!videoId || !userId || !content) {
            return res.status(400).send("Missing required fields: videoId, userId, and content are required.");
        }

        // Create a new comment object
        const newComment = {
            videoId,
            userId,
            content,
            likes: 0, // Initialize likes to 0
            createdAt: new Date() // Add timestamp
        };

        // Insert the comment into the 'comments' collection
        const result = await comments.insertOne(newComment);

        res.status(201).send(`Comment added with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding comment: " + err.message);
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

// PATCH: Increment like count for a specific comment by commentId
app.patch('/comments/:commentId/likes', async (req, res) => {
    try {
        const commentId = req.params.commentId;  // Get commentId from the URL parameters

        // Find the comment by commentId and increment its like count
        const result = await comments.updateOne(
            { commentId: commentId },  // Find comment by commentId
            { $inc: { likes: 1 } }  // Increment the 'likes' field by 1
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Comment not found or no changes made");
        }

        res.status(200).send(`Like count for comment with commentId: ${commentId} updated successfully`);
    } catch (err) {
        res.status(500).send("Error updating like count for comment: " + err.message);
    }
});

// GET: Fetch comments for a specific video by videoId
app.get('/videos/:videoId/comments', async (req, res) => {
    try {
        const videoId = req.params.videoId; // Get videoId from the URL parameters

        // Fetch comments from the 'comments' collection where the videoId matches
        const videoComments = await comments.find({ videoId: videoId }).toArray();

        if (videoComments.length === 0) {
            return res.status(404).send("No comments found for this video");
        }

        res.status(200).json(videoComments); // Send the comments as a JSON response
    } catch (err) {
        res.status(500).send("Error fetching comments: " + err.message);
    }
});
