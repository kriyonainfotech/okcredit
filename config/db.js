const mongoose = require("mongoose");

// Replace this with your MongoDB URI (from MongoDB Compass or MongoDB Atlas)
const uri =
  "mongodb+srv://kriyonainfotech:kriyonainfotech@cluster0.ntvag.mongodb.net/okbook"; // For local MongoDB
// OR
// const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/your_database_name"; // For MongoDB Atlas

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process with failure
  }
};

// Export the connectDB function
module.exports = connectDB;
