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
- _Escaped:_ `y!say hello \"world\"` → `context.args = ["hello", "\"world\""]`

## Command Aliases

Commands can declare multiple alternative names for prefix execution:

```ts
constructor(client: CustomClient) {
  super(client, {
    name: "help",
    description: "Displays a list of all available commands.",
    aliases: ["h"],   // y!h also works
    // ...
  });
}
```

- Aliases are registered during startup with conflict detection.
- If an alias collides with an existing command name or another alias, it is skipped with a logged warning.
- Aliases also work for subcommands (e.g., alias `"userinfo"` can map to `user.info`).
- The `/help` command displays aliases alongside command names in prefix mode.

## Subcommands

Subcommands are fully supported and automatically resolved by the `CommandHandler`. To use subcommands:

1.  Define the subcommand structure in your main command's `options`.
2.  Create separate files for your subcommands extending the `SubCommand` base class.
3.  Set the `name` property to the subcommand's name, and `commandName` to the parent command's name.
4.  Optionally set `subCommandGroup` if the subcommand belongs to a group.
5.  Optionally set `aliases` for prefix alias support.

```ts
export default class Info extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "info",
      commandName: "user",
      aliases: ["userinfo"],
      supports: { slash: true, prefix: true },
    });
  }

  async Execute(context: ICommandExecutionContext) {
    // Implementation
  }
}
```

The execution flow automatically routes to the correct subcommand file if one is found.

### Subcommand Groups

For slash commands, subcommand groups are supported. Define the group in the parent command's options and set `subCommandGroup` on the subcommand class:

```ts
// In parent command options:
options: [
  {
    name: "config",
    description: "Configuration commands",
    type: ApplicationCommandOptionType.SubcommandGroup,
    options: [
      {
        name: "set",
        description: "Set a config value",
        type: ApplicationCommandOptionType.Subcommand,
        options: [/* ... */],
      },
    ],
  },
];

// In subcommand class:
constructor(client: CustomClient) {
  super(client, {
    name: "set",
    commandName: "config",
    subCommandGroup: "config",
    // ...
  });
}
```

## Autocomplete

Commands and subcommands can implement the `AutoComplete` method for slash command autocomplete:

```ts
async AutoComplete(interaction: AutocompleteInteraction): Promise<void> {
  const focused = interaction.options.getFocused();
  const choices = ["option1", "option2", "option3"]
    .filter(c => c.startsWith(focused));
  await interaction.respond(
    choices.map(c => ({ name: c, value: c }))
  );
}
```

The `CommandHandler` automatically routes `AutocompleteInteraction` events to the correct command or subcommand's `AutoComplete()` method.

## Permission System

Commands can specify required permissions and roles:

```ts
constructor(client: CustomClient) {
  super(client, {
    name: "kick",
    default_member_permissions: PermissionsBitField.Flags.KickMembers,
    roles: ["admin-role-id"],       // Also accepts role names
    dm_permission: false,
    // ...
  });
}
```

- `default_member_permissions`: Discord-level permission check (enforced server-side and by the bot).
- `roles`: Role-based access control (supports both role IDs and role names).
- Both work for slash and prefix commands.