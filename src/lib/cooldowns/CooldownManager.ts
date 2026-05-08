/* eslint-disable @typescript-eslint/no-unused-vars */
import CooldownModel from "../../base/models/Cooldown";

export default class CooldownManager {
  /**
   * Gets the remaining cooldown time for a user on a command in seconds.
   * Returns null if no cooldown is active.
   */
  static async getRemainingCooldown(
    userId: string,
    commandName: string,
  ): Promise<number | null> {
    try {
      const cooldown = await CooldownModel.findOne({ userId, commandName });
      if (!cooldown) return null;

      const now = Date.now();
      const expiresAt = cooldown.expiresAt.getTime();

      if (now >= expiresAt) return null;

      return Math.ceil((expiresAt - now) / 1000);
    } catch (error) {
      // Fallback to no cooldown on error to avoid blocking users
      return null;
    }
  }

  /**
   * Sets a cooldown for a user on a command.
   */
  static async setCooldown(
    userId: string,
    commandName: string,
    durationSeconds: number,
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + durationSeconds * 1000);

      await CooldownModel.findOneAndUpdate(
        { userId, commandName },
        { expiresAt },
        { upsert: true, new: true },
      );
    } catch (error) {
      // Ignore errors setting cooldown to avoid blocking execution
    }
  }
}
