# Discord Bot Starter

A robust, class-based Discord bot boilerplate built using `discord.js` v14, TypeScript, and Mongoose. This framework uses an automatic command and event handler to make bot development clean, structured, and highly scalable.

## 🌟 Feature Highlights

- **Unified Command System**: Write a command once and support both Slash and Prefix execution dynamically.
- **Command Aliases**: Declare multiple aliases per command and subcommand for prefix execution.
- **Centralized Interaction Handling**: Easy-to-manage Button, Select Menu, and Modal handlers.
- **Autocomplete Support**: Built-in routing for slash command autocomplete interactions.
- **Interaction Expiration Lifecycle**: Automatic cleanup and disabling of stale interactive components.
- **Persistent Cooldowns**: MongoDB-backed cooldown system with TTL auto-cleanup.
- **Centralized Error Handling**: Unified try-catch flows with safe user-facing error embeds.
- **Structured Logging**: Production-ready logging using `pino`.
- **Advanced Prefix Parser**: Shell-like argument parsing with full support for quoted strings and escaped characters.
- **Startup Validation**: Validates environment, detects duplicate commands/aliases, and duplicate component IDs.
- **ESLint + Prettier**: Pre-configured code quality tooling for consistent style.
- **Vitest Testing**: Test framework configured with example test files.

## 📖 Documentation

For detailed guides on how the bot is structured and how to develop features, see the `docs/` directory:

- [Architecture Overview](docs/architecture.md)
- [Command System](docs/commands.md)
- [Interactions System](docs/interactions.md)
- [Project Conventions](docs/conventions.md)
- [Environment Variables](docs/.env.example)
- [Changelog](CHANGELOG.md)

## 🚀 Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    yarn install
    ```

3.  **Set up your environment:**
    Copy the example environment file and fill in your details.
    ```bash
    cp docs/.env.example .env
    ```

## ⚙️ Environment Configuration

Ensure your `.env` contains the following required variables:

| Variable | Purpose | Required |
|----------|---------|----------|
| `DISCORD_TOKEN` | Production bot token | In production |
| `DISCORD_CLIENT_ID` | Production client ID | In production |
| `DEV_DISCORD_TOKEN` | Development bot token (falls back to `DISCORD_TOKEN`) | In dev |
| `DEV_DISCORD_CLIENT_ID` | Development client ID (falls back to `DISCORD_CLIENT_ID`) | In dev |
| `DEV_GUILD_ID` | Guild ID for instant dev command registration | In dev |
| `MONGO_URL` | MongoDB connection string | Always |

## 🏗️ Project Structure Overview

```text
src/
├── base/          # Core architecture (Command, SubCommand, Event, Button, SelectMenu, Modal base classes + interfaces)
├── commands/      # Command files organized by category (utils, user, games)
├── components/    # Button, Select Menu, and Modal interaction handlers
├── configs/       # Environment variable validation and config
├── constants/     # Centralized static application values
├── events/        # Discord event listeners (client, guild)
├── lib/           # Reusable utilities (EmbedUtility, PaginationUtility, CooldownManager, ErrorHandler, etc.)
├── index.ts       # Application entry point
tests/             # Vitest test files
docs/              # Project documentation
```

## ⚡ Quick-Start Examples

### 1. Creating a Command

Create a file in `src/commands/<category>/` — it will be auto-discovered:

```ts
import { PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";
import ECategory from "../../base/enums/ECategory";

export default class Ping extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "ping",
      description: "Replies with Pong!",
      category: ECategory.utilities,
      options: [],
      aliases: [],
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      dm_permission: true,
      cooldown: 3,
      dev: false,
      supports: { slash: true, prefix: true },
    });
  }

  async Execute(context: ICommandExecutionContext) {
    const reply = "Pong!";
    if (context.interaction) {
      await context.interaction.reply({ content: reply });
    } else {
      await context.message!.reply({ content: reply });
    }
  }
}
```

### 2. Creating a SubCommand

Create a file in `src/commands/<category>/` extending `SubCommand`:

```ts
import SubCommand from "../../base/classes/SubCommand";
import CustomClient from "../../base/classes/CustomClient";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Info extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "info",
      description: "Get user information",
      commandName: "user",       // Parent command name
      aliases: ["userinfo"],     // Prefix alias
      supports: { slash: true, prefix: true },
    });
  }

  async Execute(context: ICommandExecutionContext) {
    // Implementation
  }
}
```

### 3. Button Interaction Handler

Create a file in `src/components/buttons/`:

```ts
import { ButtonInteraction } from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";

export default class MyButton extends Button {
  constructor(client: CustomClient) {
    super(client, { name: "my_button" });
  }

  async Execute(interaction: ButtonInteraction) {
    // Extract args from customId: "my_button:ownerId:data"
    const [, ownerId, data] = interaction.customId.split(":");
    await interaction.reply({ content: `Clicked! Data: ${data}`, ephemeral: true });
  }
}
```

### 4. Modal Interaction Handler

Create a file in `src/components/modals/`:

```ts
import { ModalSubmitInteraction, MessageFlags } from "discord.js";
import Modal from "../../base/classes/Modal";
import CustomClient from "../../base/classes/CustomClient";

export default class MyModal extends Modal {
  constructor(client: CustomClient) {
    super(client, { name: "my_modal" });
  }

  async Execute(interaction: ModalSubmitInteraction) {
    const value = interaction.fields.getTextInputValue("field_id");
    await interaction.reply({ content: `Received: ${value}`, flags: [MessageFlags.Ephemeral] });
  }
}
```

### 5. Select Menu Interaction Handler

Create a file in `src/components/selectMenus/`:

```ts
import { AnySelectMenuInteraction } from "discord.js";
import SelectMenu from "../../base/classes/SelectMenu";
import CustomClient from "../../base/classes/CustomClient";

export default class MyMenu extends SelectMenu {
  constructor(client: CustomClient) {
    super(client, { name: "my_menu" });
  }

  async Execute(interaction: AnySelectMenuInteraction) {
    const selected = interaction.values[0];
    await interaction.reply({ content: `You chose: ${selected}`, ephemeral: true });
  }
}
```

## 🛠️ Running the Bot

| Script | Command | Description |
|--------|---------|-------------|
| `yarn dev` | `ts-node-dev --respawn --transpile-only src/index.ts` | Development with auto-restart |
| `yarn build` | `tsc --build` | Compile TypeScript |
| `yarn start` | `yarn clean && yarn build && node build/index.js` | Production build & run |
| `yarn lint` | `eslint .` | Run ESLint checks |
| `yarn lint:fix` | `eslint . --fix` | Auto-fix ESLint issues |
| `yarn format` | `prettier --write .` | Format code with Prettier |
| `yarn test` | `vitest run` | Run tests once |
| `yarn test:watch` | `vitest` | Run tests in watch mode |

## 📄 License

This project is licensed under the MIT License.