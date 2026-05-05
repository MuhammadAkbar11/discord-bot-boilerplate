import mongoose from "mongoose";

interface IGuildConfig {
  guildId: string;
  logs: {
    moderation: {
      enabled: boolean;
      channelId: string;
    };
  };
}

const guildConfigSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    logs: {
      moderation: {
        enabled: Boolean,
        channelId: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

const GuildConfigSchema = mongoose.model<IGuildConfig>(
  "GuildConfig",
  guildConfigSchema,
  "guildConfig",
);

export default GuildConfigSchema;
