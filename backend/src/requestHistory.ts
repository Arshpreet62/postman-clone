import mongoose, { Document, Schema } from "mongoose";

export interface IRequestHistory extends Document {
  user: mongoose.Types.ObjectId;
  endpoint: string;
  method: string;
  timestamp: Date;
  request: {
    headers: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: any;
  };
}

const RequestHistorySchema = new Schema<IRequestHistory>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  request: {
    headers: { type: Object, default: {} },
    body: { type: Schema.Types.Mixed },
  },
  response: {
    status: { type: Number, required: true },
    statusText: { type: String },
    headers: { type: Object, default: {} },
    body: { type: Schema.Types.Mixed },
  },
});

// Compound index for efficient history lookups
RequestHistorySchema.index({ user: 1, timestamp: -1 });

const RequestHistory = mongoose.model<IRequestHistory>(
  "RequestHistory",
  RequestHistorySchema
);

export default RequestHistory;
