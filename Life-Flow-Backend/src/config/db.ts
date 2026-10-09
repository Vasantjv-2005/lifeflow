
import mongoose from "mongoose";

/**
 * Collections required by the LifeFlow backend.
 *
 * MongoDB collections are created automatically during
 * database initialization if they do not already exist.
 */
const REQUIRED_COLLECTIONS = [
    "users",
    "simulations",
    "scenarios",
    "decisions",
] as const;

/**
 * Connects to MongoDB and ensures all required collections exist.
 *
 * Existing collections and their data are preserved.
 * No dummy documents are inserted.
 */
const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error(
                "MONGODB_URI is missing from the .env file."
            );
        }

        // Connect to MongoDB Atlas.
        await mongoose.connect(mongoURI);

        console.log("MongoDB connected successfully.");

        const database = mongoose.connection.db;

        if (!database) {
            throw new Error(
                "MongoDB database is unavailable after connecting."
            );
        }

        console.log(`Database: ${database.databaseName}`);

        // Read the collections that already exist.
        const existingCollections = await database
            .listCollections({}, { nameOnly: true })
            .toArray();

        const existingNames = new Set(
            existingCollections.map((collection) => collection.name)
        );

        // Create any missing collections.
        for (const collectionName of REQUIRED_COLLECTIONS) {
            if (existingNames.has(collectionName)) {
                console.log(
                    `Collection already exists: ${collectionName}`
                );
                continue;
            }

            try {
                await database.createCollection(collectionName);

                console.log(
                    `Collection created successfully: ${collectionName}`
                );
            } catch (error) {
                // Handle a collection created concurrently by another process.
                const isNamespaceExists =
                    typeof error === "object" &&
                    error !== null &&
                    "code" in error &&
                    error.code === 48;

                if (!isNamespaceExists) {
                    throw error;
                }

                console.log(
                    `Collection already exists: ${collectionName}`
                );
            }
        }

        console.log(
            "LifeFlow database initialization completed successfully."
        );
    } catch (error) {
        console.error("MongoDB initialization failed:", error);

        // Do not start the API without a working database.
        await mongoose.disconnect().catch(() => undefined);

        throw error;
    }
};

export default connectDB;
