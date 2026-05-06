import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

/**
 * Result of a pagination calculation.
 */
export interface IPaginationResult<T> {
  /** The items for the current page. */
  items: T[];
  /** The current page number (1-indexed). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** The starting index in the original array. */
  startIndex: number;
  /** The ending index in the original array. */
  endIndex: number;
}

/**
 * Utility class for handling pagination logic and UI components.
 */
export default class PaginationUtility {
  /**
   * Calculates pagination details and slices the items array.
   * @param items The full array of items to paginate.
   * @param page The requested page number (1-indexed).
   * @param pageSize Number of items per page.
   * @returns A pagination result object.
   */
  static getPaginationResult<T>(
    items: T[],
    page: number,
    pageSize: number,
  ): IPaginationResult<T> {
    const totalPages = Math.ceil(items.length / pageSize) || 1;
    const validatedPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validatedPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      items: currentItems,
      page: validatedPage,
      totalPages,
      startIndex,
      endIndex,
    };
  }

  /**
   * Generates an ActionRow with "Previous" and "Next" buttons.
   * @param page The current page number.
   * @param totalPages The total number of pages.
   * @param customIdFactory A function that returns a customId for a given target page.
   * @param style The style of the buttons (defaults to Primary).
   * @returns An ActionRowBuilder containing the navigation buttons.
   */
  static createNavigationRow(
    page: number,
    totalPages: number,
    customIdFactory: (targetPage: number) => string,
    style: ButtonStyle = ButtonStyle.Primary,
  ): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
      new ButtonBuilder()
        .setCustomId(customIdFactory(page - 1))
        .setLabel("Previous")
        .setStyle(style)
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId(customIdFactory(page + 1))
        .setLabel("Next")
        .setStyle(style)
        .setDisabled(page >= totalPages),
    );

    return row;
  }

  /**
   * Generates a standardized pagination footer string.
   * @param page The current page.
   * @param totalPages The total pages.
   * @param extra Optional extra text to append.
   * @returns A formatted footer string.
   */
  static getFooterText(
    page: number,
    totalPages: number,
    extra?: string,
  ): string {
    let footer = `Page ${page} of ${totalPages}`;
    if (extra) footer += ` • ${extra}`;
    return footer;
  }
}
