# Project Conventions

To ensure the codebase remains clean, maintainable, and predictable as it scales, all contributors should adhere to the following project conventions.

## 📂 Folder Structure

*   **`src/commands/<category>/`**: All command files must be grouped logically by category (e.g., `utils`, `games`, `moderation`). Do not place commands in the root of `src/commands/`.
*   **`src/components/buttons/` & `src/components/selectMenus/`**: UI interaction handlers. Avoid creating subdirectories here unless absolutely necessary.
*   **`src/events/<discord_category>/`**: Event handlers grouped by Discord's conceptual categories (e.g., `guild`, `client`).
*   **`src/lib/`**: Standalone, generalized utility scripts that are NOT Discord event handlers or command logic (e.g., logger, API wrappers, string formatters).
*   **`src/constants/`**: Static configuration values that are NOT environment variables.

## 📝 Naming Patterns

*   **Classes**: PascalCase (`Command`, `InteractionLifecycle`).
*   **Interfaces**: PascalCase prefixed with an `I` (`ICommandExecutionContext`).
*   **Enums**: PascalCase prefixed with an `E` (`EEmbedColor`).
*   **Constants**: UPPER_SNAKE_CASE (`DEFAULT_PAGINATION_PAGE_SIZE`).
*   **File Names**: PascalCase for all class-based files (`Server.ts`, `EmbedUtility.ts`). Lowercase for config/constants (`bot.ts`, `limits.ts`).

## ⚙️ Constants vs. Configuration

*   **Constants (`src/constants/`)**: Used for hardcoded, application-wide values that rarely change (e.g., UI colors, timeout durations, pagination limits). They do NOT change depending on the environment.
*   **Configuration (`src/configs/varsConfig.ts` / `.env`)**: Used for secrets, tokens, database URLs, and environment-dependent IDs (e.g., `DEV_GUILD_ID`).

Do not use "magic strings" or "magic numbers" in your command logic. Always extract them to the `constants/` directory.

## 🪪 Interaction Naming (Custom IDs)

When setting `customId` for Buttons or Select Menus, use a strictly colon-delimited structure.

**Format:** `componentName:ownerId:arg1:arg2`

1.  **`componentName`**: MUST exactly match the `name` property declared in the constructor of your component class. Use `snake_case` (e.g., `server_page`, `flipcoin`).
2.  **`ownerId`**: (Optional but recommended) Pass the ID of the user who initiated the command to ensure only they can interact with the component.
3.  **Args**: Any additional state required to handle the interaction (e.g., current page index).

## 💬 Embed Styling

To ensure the bot feels premium and visually consistent, do not manually construct generic `EmbedBuilder` instances scattered throughout the code.

Always use `EmbedUtility` (`src/lib/embed/EmbedUtility.ts`):
*   `EmbedUtility.createBaseEmbed()`
*   `EmbedUtility.createSuccessEmbed()`
*   `EmbedUtility.createErrorEmbed()`

This guarantees uniform colors (defined in `constants/embeds.ts`) and automatic footer formatting.

## 🚦 Error Handling

Never allow errors to crash the process or leave a user hanging without a reply.
*   Any unhandled errors thrown inside a `Execute()` method are automatically caught by `CommandHandler.ts` and sent to `ErrorHandler.ts`.
*   If you need to explicitly throw an error (e.g., invalid arguments), import an error class from `src/lib/errors/AppError.ts` (like `ValidationError`) and throw it. The system will handle the rest.

## 🏷️ Project Versioning

This project follows [Semantic Versioning (SemVer)](https://semver.org/).

**Format:** `MAJOR.MINOR.PATCH`

1.  **MAJOR**: Significant architectural changes or breaking API modifications (e.g., refactoring the entire command handler).
2.  **MINOR**: New features added in a backwards-compatible manner (e.g., adding a new utility class or a major command).
3.  **PATCH**: Backwards-compatible bug fixes and minor improvements.

All notable changes should be documented in the `CHANGELOG.md` file following the [Keep a Changelog](https://keepachangelog.com/) format.
