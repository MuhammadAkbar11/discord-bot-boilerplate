# System Architecture

This document provides a high-level overview of the bot's core architecture and execution flow.

## 🏗️ Project Structure

The project is structured into clear, separated layers to keep the codebase clean as the bot scales:

- **`src/base/`**: Contains abstract class definitions (`Command`, `Event`, `Button`, `SelectMenu`). Every command and interaction class extends these bases.
- **`src/commands/`**: Contains actual command implementations, organized into subdirectories by feature/category (e.g., `utils`, `games`).
- **`src/components/`**: Contains handlers for interactive UI elements.
  - `buttons/` for `ButtonInteraction`
  - `selectMenus/` for `AnySelectMenuInteraction`
- **`src/events/`**: Discord event listeners (e.g., `MessageCreate`, `InteractionCreate`).
- **`src/lib/`**: Contains reusable, centralized utility systems (e.g., Logger, Error Handler, Interaction Lifecycle tracker).
- **`src/constants/`**: Contains static, application-wide constant values (limits, colors, defaults).

## ⚡ Execution Flow

### 1. Initialization (`Handler.ts`)

When the bot starts, the `Handler` loops through the directories inside `src/commands/`, `src/events/`, and `src/components/` to dynamically import and cache the files into `CustomClient` collections.

### 2. Event Dispatching

The Discord API emits events which are caught by the specific files in `src/events/`.
For instance, the `InteractionCreate` event triggers `src/events/guild/CommandHandler.ts`, and the `MessageCreate` event triggers `src/events/guild/PrefixCommandHandler.ts`.

### 3. Command System & Handler Flow

Whether the user uses a `/slash` command or a `prefix!` command, the flow converges in `CommandHandler.ts`:

1.  **Parsing (Prefix Only)**: The `PrefixParser` utility safely extracts the command name and arguments, handling quotes and escapes.
2.  **Validation**: `CommandHandler.ts` checks cooldowns, Discord permissions, and role restrictions.
3.  **Execution**: The `.Execute()` method on the corresponding `Command` class is invoked with an `ICommandExecutionContext` object that provides unified access to both `interaction` and `message` properties.
4.  **Error Catching**: Any uncaught exceptions during execution are passed directly to `ErrorHandler.ts` to log the failure and send a safe, user-friendly error embed.

### 4. Interaction Systems

Buttons and Select Menus follow a similar path:

1.  The `customId` of the component determines which class handles it. We use the pattern `componentName:arg1:arg2`.
2.  `CommandHandler.ts` finds the component in its collection using `customId.split(":")[0]`.
3.  The `.Execute()` method on the `Button` or `SelectMenu` is invoked.

_Note: Interactive messages sent by the bot can be tracked via `InteractionLifecycle.ts` to ensure components expire gracefully after a set period._
