// const mongoose = require("mongoose");

// const connectToDb = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             serverSelectionTimeoutMS: 5000,
//             family: 4, // important for college WiFi / IPv4
//         });

//         console.log("✅ MongoDB connected successfully");
//     } catch (error) {
//         console.error("❌ MongoDB connection failed:", error.message);
//         process.exit(1);
//     }
// };

// module.exports = connectToDb;

const mongoose = require("mongoose");

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("✅ MongoDB connected locally via Compass");
    } catch (error) {
        console.error("❌ MongoDB local connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectToDb;
