
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));

// Story database structure
const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ""
    },
    theme: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);

// Test backend
app.get("/", (req, res) => {
  res.send("Story Creator backend is running!");
});

// Get all stories
app.get("/api/stories", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch stories" });
  }
});

// Create a story
app.post("/api/stories", async (req, res) => {
  try {
    const { title, content, theme } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Story title is required" });
    }

    const story = await Story.create({
      title: title.trim(),
      content: content || "",
      theme: theme || ""
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: "Could not save story" });
  }
});

// Update a story
app.put("/api/stories/:id", async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json(story);
  } catch (error) {
    res.status(400).json({ message: "Could not update story" });
  }
});

// Delete a story
app.delete("/api/stories/:id", async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete story" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
