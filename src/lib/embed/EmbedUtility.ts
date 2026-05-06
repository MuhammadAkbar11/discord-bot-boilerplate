import { EmbedBuilder, User, ColorResolvable } from "discord.js";

/**
 * Common colors used across the bot's UI.
 */
export enum EEmbedColor {
  Success = "#57F287", // Green
  Error = "#ED4245", // Red
  Info = "#5865F2", // Blurple
  Warning = "#FEE75C", // Yellow
  Default = "#2F3136", // Dark Gray
}

export interface IEmbedOptions {
  user?: User;
  title?: string;
  description?: string;
  color?: ColorResolvable;
  thumbnail?: string;
  image?: string;
}

export default class EmbedUtility {
  /**
   * Creates a base embed with standard styling (timestamp, footer).
   */
  static createBaseEmbed(options?: IEmbedOptions): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(options?.color ?? EEmbedColor.Info)
      .setTimestamp();

    if (options?.title) embed.setTitle(options.title);
    if (options?.description) embed.setDescription(options.description);
    if (options?.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options?.image) embed.setImage(options.image);

    if (options?.user) {
      embed.setFooter({
        text: `Requested by ${options.user.tag}`,
        iconURL: options.user.displayAvatarURL(),
      });
    }

    return embed;
  }

  /**
   * Creates a success-styled embed.
   */
  static createSuccessEmbed(
    description: string,
    options?: Omit<IEmbedOptions, "description" | "color">,
  ): EmbedBuilder {
    return this.createBaseEmbed({
      ...options,
      description: `✅ ${description}`,
      color: EEmbedColor.Success,
    });
  }

  /**
   * Creates an error-styled embed.
   */
  static createErrorEmbed(
    description: string,
    options?: Omit<IEmbedOptions, "description" | "color">,
  ): EmbedBuilder {
    return this.createBaseEmbed({
      ...options,
      description: `❌ ${description}`,
      color: EEmbedColor.Error,
    });
  }

  /**
   * Creates an info-styled embed.
   */
  static createInfoEmbed(
    description: string,
    options?: Omit<IEmbedOptions, "description" | "color">,
  ): EmbedBuilder {
    return this.createBaseEmbed({
      ...options,
      description: `ℹ️ ${description}`,
      color: EEmbedColor.Info,
    });
  }

  /**
   * Creates a warning-styled embed.
   */
  static createWarningEmbed(
    description: string,
    options?: Omit<IEmbedOptions, "description" | "color">,
  ): EmbedBuilder {
    return this.createBaseEmbed({
      ...options,
      description: `⚠️ ${description}`,
      color: EEmbedColor.Warning,
    });
  }
}
