# Discord Bot Boilerplate

A robust, class-based Discord bot boilerplate built using `discord.js` v14, TypeScript, and Mongoose. This framework uses an automatic command and event handler to make bot development clean, structured, and highly scalable.

## 🌟 Feature Highlights

- **Unified Command System**: Write a command once and support both Slash and Prefix execution dynamically.
- **Centralized Interaction Handling**: Easy-to-manage Button and Select Menu handlers.
- **Interaction Expiration Lifecycle**: Automatic cleanup and disabling of stale interactive components.
- **Centralized Error Handling**: Unified try-catch flows with safe user-facing error embeds.
- **Structured Logging**: Production-ready logging using `pino`.
- **Advanced Prefix Parser**: Shell-like argument parsing with full support for quoted strings and escaped characters.

## 📖 Documentation

For detailed guides on how the bot is structured and how to develop features, see the `docs/` directory:

- [Architecture Overview](docs/architecture.md)
- [Command System](docs/commands.md)
- [Interactions System](docs/interactions.md)
- [Project Conventions](docs/conventions.md)
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
    cp .env.example .env
    ```

## ⚙️ Environment Configuration

Ensure your `.env` contains the following required variables:

- `DISCORD_TOKEN` / `DEV_DISCORD_TOKEN`: Your Discord bot token.
- `DISCORD_CLIENT_ID` / `DEV_DISCORD_CLIENT_ID`: Your application's client ID.
- `DISCORD_GUILD_ID` / `DEV_GUILD_ID`: Used for instant slash command registration in dev mode.
- `MONGO_URL`: Your MongoDB connection string.

## 🏗️ Project Structure Overview

```text
src/
├── base/        # Core bot architecture (Command, Event, Button, SelectMenu base classes)
├── commands/    # Command files organized by category
├── components/  # Button and Select Menu interaction handlers
├── configs/     # Environment variable validation and config
├── constants/   # Centralized static application values
├── events/      # Discord event listeners
├── lib/         # Reusable utilities (EmbedUtility, InteractionLifecycle, PrefixParser, ErrorHandler)
└── index.ts     # Application entry point
```

## ⚡ Quick-Start Examples

### 1. Unified Command Support Configuration

Control how a command can be executed using the `supports` object in the constructor:

```ts
supports: {
  slash: true,
  prefix: true
}
```

### 2. Basic Command Example

```ts
import { PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import { ICommandExecutionContext } from "../../base/interfaces/ICommandExecutionContext";

export default class Ping extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "ping",
      description: "Replies with Pong!",
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
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

### 3. Button Interaction Example

Buttons are handled cleanly by extracting the logic into dedicated classes within `src/components/buttons/`:

```ts
import { ButtonInteraction } from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";

export default class MyButton extends Button {
  constructor(client: CustomClient) {
    super(client, { name: "my_button" });
  }

  async Execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: "Button clicked!", ephemeral: true });
  }
}
```

### 4. Select Menu Interaction Example

Like buttons, select menus belong in `src/components/selectMenus/`:

```ts
import { AnySelectMenuInteraction } from "discord.js";
import SelectMenu from "../../base/classes/SelectMenu";
import CustomClient from "../../base/classes/CustomClient";

export default class MySelectMenu extends SelectMenu {
  constructor(client: CustomClient) {
    super(client, { name: "my_menu" });
  }

  async Execute(interaction: AnySelectMenuInteraction) {
    const selected = interaction.values[0];
    await interaction.reply({
      content: `You selected: ${selected}`,
      ephemeral: true,
    });
  }
}
```

## 🛠️ Running the Bot

**Development Mode** (auto-restarts on changes):

```bash
yarn dev
```

**Production Mode** (builds TypeScript and runs it):

```bash
yarn start
```
