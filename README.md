# Discord Bot Boilerplate

A robust, class-based Discord bot boilerplate built using `discord.js` v14, TypeScript, and Mongoose. This framework uses an automatic command and event handler to make bot development clean and structured.

## Prerequisites

- [Node.js](https://nodejs.org/) (Check `.nvmrc` for specific version)
- [Yarn](https://yarnpkg.com/)
- A MongoDB Database URL
- A Discord Bot Application (Token & Client ID)

## Setup Instructions

1. Clone or copy this repository.
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your `.env` variables:
   - `TOKEN`: Your Discord Bot Token
   - `CLIENT_ID`: Your Discord Bot Client ID
   - `MONGO_URI`: Your MongoDB connection string

## Running the Bot

**Development Mode** (auto-restarts on file changes):
```bash
yarn dev
```

**Production Mode** (compiles TypeScript to JavaScript and runs the build):
```bash
yarn start
```

## Structure

- `src/base`: Core bot architecture classes (`Handler`, `CustomClient`, `Command`, `Events`) and schemas.
- `src/commands`: Place your command files here. They are organized in subdirectories (e.g., `src/commands/utils`).
- `src/events`: Place your Discord event files here.
- `src/configs`: Configuration files, such as environment variables loader.

## Creating a Command

Create a new TypeScript file inside any subdirectory in `src/commands` (e.g., `src/commands/fun/CoinFlip.ts`):

```ts
import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";

export default class MyCommand extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "mycommand",
      description: "My cool command description",
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      options: [
        {
          name: "option",
          description: "An option",
          type: ApplicationCommandOptionType.String,
          required: false
        }
      ]
    });
  }

  async Execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: "Hello from my command!" });
  }
}
```

## Creating an Event

Create a new TypeScript file inside any subdirectory in `src/events` (e.g., `src/events/guild/MessageCreate.ts`):

```ts
import { Events, Message } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Events";

export default class MessageCreate extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.MessageCreate,
      description: "Triggered when a message is created",
      once: false
    });
  }

  Execute(message: Message) {
    if (message.author.bot) return;
    console.log(`New message: ${message.content}`);
  }
}
```
