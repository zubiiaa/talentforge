import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const experienceSchema = new Schema(
  {
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
  },
  { _id: false },
);

const educationSchema = new Schema(
  {
    school: String,
    degree: String,
    field: String,
    startYear: String,
    endYear: String,
  },
  { _id: false },
);

const projectSchema = new Schema(
  { name: String, link: String, description: String },
  { _id: false },
);

const certificateSchema = new Schema(
  { name: String, issuer: String, year: String },
  { _id: false },
);

const customItemSchema = new Schema(
  { title: String, subtitle: String, description: String },
  { _id: false },
);

const customSectionSchema = new Schema(
  { heading: String, items: { type: [customItemSchema], default: [] } },
  { _id: false },
);

const resumeSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled resume" },
    bulletPoints: { type: Boolean, default: true },

    fullName: { type: String, default: "" },
    headline: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    summary: { type: String, default: "" },

    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certificates: { type: [certificateSchema], default: [] },
    customSections: { type: [customSectionSchema], default: [] },
  },
  { timestamps: true },
);

export type ResumeDoc = InferSchemaType<typeof resumeSchema> & { _id: string };

export const Resume: Model<ResumeDoc> =
  (models.Resume as Model<ResumeDoc>) ?? model<ResumeDoc>("Resume", resumeSchema);
