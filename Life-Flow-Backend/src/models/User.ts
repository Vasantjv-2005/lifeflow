import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    githubId?: string;
    profilePicture?: string;
    authProvider: "local" | "google" | "github";
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [100, "Email cannot exceed 100 characters"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },

        password: {
            type: String,
            required: function (this: IUser) {
                return this.authProvider === "local" && !this.googleId && !this.githubId;
            },
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },

        googleId: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
        },

        githubId: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
        },

        profilePicture: {
            type: String,
            trim: true,
            default: "",
        },

        authProvider: {
            type: String,
            enum: ["local", "google", "github"],
            default: "local",
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                if (ret._id) ret.id = ret._id.toString();
                delete ret.password;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (_doc, ret: Record<string, unknown>) => {
                if (ret._id) ret.id = ret._id.toString();
                delete ret.password;
                return ret;
            },
        },
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;