import { ValidationError } from "../errors/AppError";

export default class PrefixParser {
  /**
   * Parses a raw command string into an array of arguments, supporting quotes and escaped quotes.
   * Throws a ValidationError if the input has unmatched quotes.
   *
   * @param input The raw input string after the prefix
   * @returns An array of parsed arguments
   */
  static parse(input: string): string[] {
    const args: string[] = [];
    let currentArg = "";
    let inQuotes = false;
    let isEscaped = false;
    let hasContent = false; // Tracks if we should push an empty string (e.g. from "")

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (isEscaped) {
        currentArg += char;
        isEscaped = false;
        hasContent = true;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        hasContent = true;
        continue;
      }

      if (char === " " || char === "\t" || char === "\n") {
        if (inQuotes) {
          currentArg += char;
          hasContent = true;
        } else {
          if (currentArg.length > 0 || hasContent) {
            args.push(currentArg);
            currentArg = "";
            hasContent = false;
          }
        }
        continue;
      }

      currentArg += char;
      hasContent = true;
    }

    if (isEscaped) {
      // If ends with a trailing backslash
      currentArg += "\\";
      hasContent = true;
    }

    if (inQuotes) {
      throw new ValidationError(
        "Invalid argument formatting: unmatched quotation marks.",
        "Invalid argument formatting: unmatched quotation marks.",
      );
    }

    if (currentArg.length > 0 || hasContent) {
      args.push(currentArg);
    }

    return args;
  }
}
