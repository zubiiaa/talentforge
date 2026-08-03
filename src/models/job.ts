import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String, default: "" },
    remote: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    description: { type: String, required: true },
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

jobSchema.index({ title: "text", company: "text", description: "text" });

export type JobDoc = InferSchemaType<typeof jobSchema> & { _id: string };

export const Job: Model<JobDoc> =
  (models.Job as Model<JobDoc>) ?? model<JobDoc>("Job", jobSchema);
