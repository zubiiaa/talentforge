import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverNote: { type: String, default: "" },
    status: {
      type: String,
      enum: ["applied", "reviewed", "interview", "rejected", "offer"],
      default: "applied",
    },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export type ApplicationDoc = InferSchemaType<typeof applicationSchema> & { _id: string };

export const Application: Model<ApplicationDoc> =
  (models.Application as Model<ApplicationDoc>) ??
  model<ApplicationDoc>("Application", applicationSchema);
