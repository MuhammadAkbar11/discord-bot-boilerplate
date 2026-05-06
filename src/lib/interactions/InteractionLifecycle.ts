import { Message, EmbedBuilder } from "discord.js";
import logger from "../logger";

export default class InteractionLifecycle {
  private static trackedInteractions = new Map<string, NodeJS.Timeout>();
  private static readonly GLOBAL_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  /**
   * Track a message with interactive components to expire after a global timeout.
   */
  static track(
    message: Message,
    ownerId: string,
    timeoutMs: number = this.GLOBAL_TIMEOUT,
  ) {
    if (this.trackedInteractions.has(message.id)) {
      clearTimeout(this.trackedInteractions.get(message.id));
    }

    const timeout = setTimeout(async () => {
      await this.expire(message);
      this.trackedInteractions.delete(message.id);
    }, timeoutMs);

    this.trackedInteractions.set(message.id, timeout);
  }

  /**
   * Disables all components and adds an expiration notice.
   */
  static async expire(message: Message) {
    try {
      // Fetch the latest version of the message to ensure we have the correct components
      const latestMessage = await message.fetch().catch(() => null);
      if (!latestMessage || !latestMessage.editable) return;

      if (latestMessage.components.length === 0) return; // No components to disable

      // Disable all components using raw JSON
      const components = latestMessage.components.map((row: any) => {
        return {
          ...row.toJSON(),
          components: row?.components?.map((c: any) => ({
            ...c.toJSON(),
            disabled: true,
          })),
        };
      });

      let content = latestMessage.content;
      let embeds = latestMessage.embeds.map(e => EmbedBuilder.from(e));

      // Add lightweight expiration notice
      if (embeds.length > 0) {
        const lastEmbed = embeds[embeds.length - 1];
        const currentFooter = lastEmbed.data.footer?.text || "";
        // Avoid duplicate notices
        if (!currentFooter.includes("Interaction expired")) {
          lastEmbed.setFooter({
            text: currentFooter
              ? `${currentFooter} • Interaction expired`
              : "Interaction expired",
            iconURL: lastEmbed.data.footer?.icon_url,
          });
        }
      } else {
        if (!content.includes("Interaction expired")) {
          content = content
            ? `${content}\n\n*Interaction expired.*`
            : "*Interaction expired.*";
        }
      }

      await latestMessage.edit({
        content: content || undefined,
        embeds,
        components: components as any,
      });
      logger.debug(
        { event: "interaction_expired", messageId: message.id },
        "Interaction expired successfully",
      );
    } catch (error) {
      logger.error(
        { event: "interaction_expiration_error", messageId: message.id, error },
        "Failed to expire interaction",
      );
    }
  }

  /**
   * Stop tracking a message (e.g. if it was deleted or finalized).
   */
  static untrack(messageId: string) {
    if (this.trackedInteractions.has(messageId)) {
      clearTimeout(this.trackedInteractions.get(messageId)!);
      this.trackedInteractions.delete(messageId);
    }
  }
}
