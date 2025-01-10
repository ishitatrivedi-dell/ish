const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 8000;

// MongoDB connection details
const uri = "mongodb+srv://ishitatrivedicg:KCT83aMrI0OJe0hw@cluster0.togj8.mongodb.net/"; 
const dbName = "yt";

// Middleware
app.use(express.json());

let db, users, videos, comments, subscriptions, playlists ;  // Added 'subscriptions' collection

// Connect to MongoDB and initialize collections
async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");
        videos = db.collection("videos");  // Initialize the 'videos' collection
        comments = db.collection("comments");  // Initialize the 'comments' collection
        subscriptions = db.collection("subscriptions"); // Initialize the 'subscriptions' collection
        playlists = db.collection("playlist"); // Initialize the 'playlist' collection

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

// GET: Fetch playlists for a specific user by userId
app.get('/playlists/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from the URL parameters

        // Fetch playlists from the 'playlists' collection where the userId matches
        const userPlaylists = await playlists.find({ userId: userId }).toArray();

        if (userPlaylists.length === 0) {
            return res.status(404).send("No playlists found for this user");
        }

        res.status(200).json(userPlaylists); // Send the playlists as a JSON response
    } catch (err) {
        res.status(500).send("Error fetching playlists: " + err.message);
    }
});


// POST: Upload a new video
app.post('/playlists', async (req, res) => {
    try {
        const newPlaylist = req.body; // Get the new playlist data from the request body

        // Validate if all required fields are provided
        if (!newPlaylist.playlistId || !newPlaylist.userId || !newPlaylist.name || !newPlaylist.createdDate || newPlaylist.isPublic === undefined) {
            return res.status(400).send("Missing required fields");
        }

        // Insert the new playlist document into the 'playlists' collection
        const result = await playlists.insertOne(newPlaylist);

        // Send success response
        res.status(201).send(`Playlist created with ID: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error creating playlist: " + err.message);
    }
});


// PUT: Add a video to a playlist
app.put('/playlists/:playlistId/videos', async (req, res) => {
    try {
        const playlistId = req.params.playlistId; // Get playlistId from the URL parameters
        const { videoId } = req.body; // Get videoId from the request body

        if (!videoId) {
            return res.status(400).send("Video ID is required");
        }

        // Update the playlist by pushing the new videoId into the 'videos' array
        const result = await playlists.updateOne(
            { playlistId: playlistId }, // Find playlist by playlistId
            { $push: { videos: videoId } } // Push the new videoId into the 'videos' array
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Playlist not found or no changes made");
        }

        res.status(200).send(`Video added to playlist ${playlistId}`);
    } catch (err) {
        res.status(500).send("Error adding video to playlist: " + err.message);
    }
});

// DELETE: Delete a playlist
app.delete('/playlists/:playlistId', async (req, res) => {
    try {
        const playlistId = req.params.playlistId; // Get playlistId from the URL parameters

        // Delete the playlist from the 'playlists' collection
        const result = await playlists.deleteOne({ playlistId: playlistId });

        if (result.deletedCount === 0) {
            return res.status(404).send("Playlist not found");
        }

        res.status(200).send(`Playlist with playlistId: ${playlistId} deleted successfully`);
    } catch (err) {
        res.status(500).send("Error deleting playlist: " + err.message);
    }
});
// POST: Subscribe to a channel
app.post('/subscriptions', async (req, res) => {
    try {
        const newSubscription = req.body; // Get the new subscription data from the request body

        // Validate if all required fields are provided
        if (!newSubscription.subscriptionId || !newSubscription.subscriber || !newSubscription.channel || !newSubscription.subscribedAt) {
            return res.status(400).send("Missing required fields");
        }

        // Insert the new subscription document into the 'subscriptions' collection
        const result = await subscriptions.insertOne(newSubscription);

        // Send success response
        res.status(201).send(`Subscribed to channel with subscriptionId: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error subscribing to channel: " + err.message);
    }
});

// GET: Fetch comments for a specific video
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

app.post('/comments', async (req, res) => {
    try {
        const newComment = req.body; // Get the new comment data from the request body

        // Validate if all required fields are provided
        if (!newComment.commentId || !newComment.videoId || !newComment.userId || !newComment.text || !newComment.postedAt) {
            return res.status(400).send("Missing required fields");
        }

        // Insert the new comment document into the 'comments' collection
        const result = await comments.insertOne(newComment);

        // Send success response
        res.status(201).send(`Comment added with commentId: ${result.insertedId}`);
    } catch (err) {
        res.status(500).send("Error adding comment: " + err.message);
    }
});
// PATCH: Increment likes for a specific comment
app.patch('/comments/:commentId/likes', async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get commentId from the URL parameters

        // Increment the likes field for the specified comment
        const result = await comments.updateOne(
            { commentId: commentId },  // Find the comment by commentId
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
// DELETE: Delete a specific comment by commentId
app.delete('/comments/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId; // Get commentId from the URL parameters

        // Delete the comment from the 'comments' collection
        const result = await comments.deleteOne({ commentId: commentId });

        if (result.deletedCount === 0) {
            return res.status(404).send("Comment not found");
        }

        res.status(200).send(`Comment with commentId: ${commentId} deleted successfully`);
    } catch (err) {
        res.status(500).send("Error deleting comment: " + err.message);
    }
});
// GET: Fetch all playlists for a user by userId
app.get('/playlists/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from the URL parameters

        // Fetch all playlists from the 'playlists' collection where the userId matches
        const userPlaylists = await playlists.find({ userId: userId }).toArray();

        if (userPlaylists.length === 0) {
            return res.status(404).send("No playlists found for this user");
        }

        res.status(200).json(userPlaylists); // Send the playlists as a JSON response
    } catch (err) {
        res.status(500).send("Error fetching playlists: " + err.message);
    }
});
// PATCH: Update user profile picture by userId
app.patch('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // Get userId from the URL parameters
        const { profilePicture } = req.body;  // Get the new profile picture URL from the request body

        // Validate if the profilePicture field is provided
        if (!profilePicture) {
            return res.status(400).send("Profile picture URL is required");
        }

        // Update the profilePicture field for the user
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
