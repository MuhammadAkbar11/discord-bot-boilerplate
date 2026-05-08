import mongoose from "mongoose";
import { DEFAULT_PREFIX } from "../../constants/bot";
import logger from "../../lib/logger";

interface IGuildConfig {
  guildId: string;
  prefix: string;
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
      unique: true,
    },
    prefix: {
      type: String,
      default: DEFAULT_PREFIX,
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

const GuildConfigModel = mongoose.model<IGuildConfig>(
  "GuildConfig",
  guildConfigSchema,
  "guildConfig",
);

GuildConfigModel.on("index", (error) => {
  if (error) {
    logger.warn(
      { event: "guild_config_index_failed", error },
      "Failed to build unique index on GuildConfig. Duplicates might exist.",
    );
  }
});

export default GuildConfigModel;
