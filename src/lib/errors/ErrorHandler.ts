import { Interaction, Message, MessageFlags } from "discord.js";
import logger from "../logger";
import EmbedUtility from "../embed/EmbedUtility";
import { AppError } from "./AppError";

export default class ErrorHandler {
  /**
   * Centralized method to handle all application errors.
   */
  static async handle(error: Error | AppError, context?: { interaction?: Interaction; message?: Message }): Promise<void> {
    const isAppError = error instanceof AppError;
    const userMessage = isAppError ? error.userMessage : "An unexpected error occurred. Please try again later.";
    
    // Log the error
    logger.error({
      event: "application_error",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        isOperational: isAppError ? error.isOperational : false,
      },
      context: {
        userId: context?.interaction?.user.id ?? context?.message?.author.id,
        guildId: context?.interaction?.guildId ?? context?.message?.guildId,
        channelId: context?.interaction?.channelId ?? context?.message?.channelId,
      }
    }, error.message);

    // Respond to user if context is provided
    if (context) {
      await this.respondToUser(context, userMessage || "An error occurred.");
    }

    // If it's not an operational error (i.e., programmer error), we might want to alert admins or even exit in some cases
    if (!isAppError || !error.isOperational) {
      // Logic for critical failures could go here
    }
  }

  private static async respondToUser(context: { interaction?: Interaction; message?: Message }, message: string): Promise<void> {
    const embed = EmbedUtility.createErrorEmbed(message);

    try {
      if (context.interaction && context.interaction.isRepliable()) {
        if (context.interaction.replied || context.interaction.deferred) {
          await context.interaction.followUp({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        } else {
          await context.interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        }
      } else if (context.message) {
        await context.message.reply({ embeds: [embed] });
      }
    } catch (responseError) {
      logger.error({ event: "error_response_failed", error: responseError }, "Failed to send error response to user.");
    }
  }
}
