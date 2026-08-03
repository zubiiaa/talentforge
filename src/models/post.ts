import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true },
);

export type PostDoc = InferSchemaType<typeof postSchema> & { _id: string };

export const Post: Model<PostDoc> =
  (models.Post as Model<PostDoc>) ?? model<PostDoc>("Post", postSchema);
