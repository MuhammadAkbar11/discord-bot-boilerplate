import mongoose from "mongoose";
import { DEFAULT_PREFIX } from "../../constants/bot";

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

export default GuildConfigModel;
