import mongoose from "mongoose";

interface ICooldown {
  userId: string;
  commandName: string;
  expiresAt: Date;
}

const cooldownSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    commandName: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL index to auto-delete expired documents
cooldownSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for fast lookups
cooldownSchema.index({ userId: 1, commandName: 1 }, { unique: true });

const CooldownModel = mongoose.model<ICooldown>(
  "Cooldown",
  cooldownSchema,
  "cooldowns",
);

export default CooldownModel;
