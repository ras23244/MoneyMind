const mongoose = require("mongoose");
// const logger = require("../logger");

function connectToDb() {
    mongoose
        .connect(process.env.MONGO_URI, {})
        .then(() => console.log("Connected to MongoDB Compass"))
        .catch((err) => console.log(`MongoDB connection error: ${err.message}`));
}

module.exports = connectToDb;