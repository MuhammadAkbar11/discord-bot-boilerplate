# Command System

This project features a **Unified Command System**, allowing a single command file to dynamically support both Discord Slash (`/`) commands and text-based Prefix (`y!`) commands simultaneously.

## Unified Execution Flow

Every command file extending the `Command` base class must implement the `Execute` method. Instead of passing a generic message or interaction object, the system provides an `ICommandExecutionContext` object:

```ts
interface ICommandExecutionContext {
  type: "slash" | "prefix";
  commandName: string;
  args: string[];
  prefix?: string;
  interaction?: ChatInputCommandInteraction;
  message?: Message<true>;
}
```

This context wrapper allows your logic to flexibly respond depending on the execution type:

```ts
async Execute(context: ICommandExecutionContext) {
  const user = context.interaction?.user ?? context.message!.author;
  const reply = `Hello ${user.username}!`;

  if (context.interaction) {
    await context.interaction.reply({ content: reply });
  } else {
    await context.message!.reply({ content: reply });
  }
}
```

## Command Configuration

In the `constructor` of your command class, you configure settings using the `ICommandOptions` object.

### The `supports` Configuration

This is the most critical option for unified commands. You must explicitly declare which execution modes your command supports:

```ts
supports: {
  slash: true,  // Register and execute as a Discord Slash command
  prefix: true  // Execute when typing the prefix + name in chat
}
```

### Slash Commands Options

Slash commands often require specific `options` (e.g., arguments or subcommands). You declare these just like the native Discord API:

```ts
options: [
  {
    name: "target",
    description: "The user to target",
    type: ApplicationCommandOptionType.User,
    required: true,
  },
];
```

### Prefix Commands & Argument Parsing

When a prefix command is executed, the `PrefixParser` processes the remaining text and safely splits it into the `context.args` array.

- _Basic:_ `y!say hello world` → `context.args = ["hello", "world"]`
- _Quoted:_ `y!embed "Hello World"` → `context.args = ["Hello World"]`

## Subcommands

Subcommands are fully supported and automatically resolved by the `CommandHandler`. To use subcommands:

1.  Define the subcommand structure in your main command's `options`.
2.  Create separate files for your subcommands following the naming convention: `MainCommandSubCommand.ts` (e.g., `ConfigSet.ts`).
3.  Set the `name` property of the subcommand class to the subcommand's name, and `commandName` to the parent command's name.

The execution flow automatically routes the execution to the correct subcommand file if one is found.
