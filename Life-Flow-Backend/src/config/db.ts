import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in the .env file");
        }

        // Connect to MongoDB Atlas
        await mongoose.connect(mongoURI);

        console.log("MongoDB connected successfully");

        // Check whether the users collection already exists
        const collections = await mongoose.connection.db
            ?.listCollections()
            .toArray();

        const usersCollectionExists = collections?.some(
            (collection) => collection.name === "users"
        );

        // Create users collection if it does not exist
        if (!usersCollectionExists) {
            await mongoose.connection.createCollection("users");
            console.log("Users collection created successfully");
        } else {
            console.log("Users collection already exists");
        }

        console.log("Database: lifeflow");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;