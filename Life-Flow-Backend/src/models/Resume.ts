import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPersonalInfo {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
}

export interface IEducation {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
}

export interface IExperience {
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
}

export interface IProject {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    highlights?: string[];
    isPlanned?: boolean;
}

export interface ICertification {
    name: string;
    issuer: string;
    issueDate?: string;
    credentialId?: string;
    isPlanned?: boolean;
}

export interface IParsedResumeContent {
    personalInfo: IPersonalInfo;
    summary?: string;
    education: IEducation[];
    experience: IExperience[];
    skills: string[];
    technicalTools: string[];
    projects: IProject[];
    certifications: ICertification[];
    languages?: string[];
    achievements?: string[];
}

export interface IResume extends Document {
    userId: Types.ObjectId;
    originalFileName: string;
    fileType: "pdf" | "docx";
    fileSize: number;
    parsedContent: IParsedResumeContent;
    rawText: string;
    parsingStatus: "pending" | "completed" | "failed";
    parsingError?: string;
    createdAt: Date;
    updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        originalFileName: {
            type: String,
            required: [true, "Original file name is required"],
            trim: true,
            maxlength: 255,
        },
        fileType: {
            type: String,
            required: [true, "File type is required"],
            enum: ["pdf", "docx"],
        },
        fileSize: {
            type: Number,
            required: [true, "File size is required"],
            max: [5 * 1024 * 1024, "File size cannot exceed 5MB"],
        },
        parsedContent: {
            personalInfo: {
                fullName: { type: String, default: "" },
                email: { type: String, default: "" },
                phone: { type: String, default: "" },
                location: { type: String, default: "" },
                linkedin: { type: String, default: "" },
                github: { type: String, default: "" },
                portfolio: { type: String, default: "" },
            },
            summary: { type: String, default: "" },
            education: [
                {
                    institution: { type: String, required: true },
                    degree: { type: String, required: true },
                    fieldOfStudy: { type: String, default: "" },
                    startDate: { type: String, default: "" },
                    endDate: { type: String, default: "" },
                    gpa: { type: String, default: "" },
                },
            ],
            experience: [
                {
                    company: { type: String, required: true },
                    role: { type: String, required: true },
                    location: { type: String, default: "" },
                    startDate: { type: String, default: "" },
                    endDate: { type: String, default: "" },
                    current: { type: Boolean, default: false },
                    description: { type: String, default: "" },
                    achievements: { type: [String], default: [] },
                },
            ],
            skills: { type: [String], default: [] },
            technicalTools: { type: [String], default: [] },
            projects: [
                {
                    name: { type: String, required: true },
                    description: { type: String, default: "" },
                    technologies: { type: [String], default: [] },
                    link: { type: String, default: "" },
                    highlights: { type: [String], default: [] },
                    isPlanned: { type: Boolean, default: false },
                },
            ],
            certifications: [
                {
                    name: { type: String, required: true },
                    issuer: { type: String, required: true },
                    issueDate: { type: String, default: "" },
                    credentialId: { type: String, default: "" },
                    isPlanned: { type: Boolean, default: false },
                },
            ],
            languages: { type: [String], default: [] },
            achievements: { type: [String], default: [] },
        },
        rawText: {
            type: String,
            default: "",
        },
        parsingStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        parsingError: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IResume>("Resume", resumeSchema);
