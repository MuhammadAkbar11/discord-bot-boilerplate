# Interaction Systems

This project centralizes the handling of Discord message components (Buttons, Select Menus, and Modals) into distinct, class-based handler files, ensuring that interaction logic does not bloat command files.

## 🖱️ Button Interactions

Buttons are placed in `src/components/buttons/`.

To create a new button handler, extend the `Button` base class.

```ts
import { ButtonInteraction } from "discord.js";
import Button from "../../base/classes/Button";
import CustomClient from "../../base/classes/CustomClient";

export default class ExampleButton extends Button {
  constructor(client: CustomClient) {
    super(client, { name: "example_button" });
  }

  async Execute(interaction: ButtonInteraction) {
    await interaction.reply({ content: "You clicked the example button!" });
  }
}
```

### Passing Arguments via `customId`

When setting the `customId` on a button builder, you can pass state/arguments by separating them with a colon (`:`). The first segment **must** be the name of the button class.

Example `customId`: `server_page:123456789:roles:2`

```ts
// Inside Execute(interaction: ButtonInteraction)
const [name, ownerId, category, page] = interaction.customId.split(":");
```

## 📋 Select Menu Interactions

Select Menus operate identically to buttons but are placed in `src/components/selectMenus/` and extend the `SelectMenu` base class.

```ts
import { AnySelectMenuInteraction } from "discord.js";
import SelectMenu from "../../base/classes/SelectMenu";
import CustomClient from "../../base/classes/CustomClient";

export default class ExampleMenu extends SelectMenu {
  constructor(client: CustomClient) {
    super(client, { name: "example_menu" });
  }

  async Execute(interaction: AnySelectMenuInteraction) {
    const selected = interaction.values[0];
    await interaction.reply({ content: `You chose: ${selected}` });
  }
}
```

## 📝 Modal Interactions

Modals are Discord popup forms with text input fields. They are placed in `src/components/modals/` and extend the `Modal` base class.

### Creating a Modal Trigger (in a Command)

Use `ModalBuilder` and `TextInputBuilder` to construct the modal, then show it with `showModal()`:

```ts
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

// Inside Execute(context: ICommandExecutionContext):
const modal = new ModalBuilder()
  .setCustomId(`my_modal:${context.interaction.user.id}`)
  .setTitle("My Modal");

const input = new TextInputBuilder()
  .setCustomId("field_id")
  .setLabel("Your Input")
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
modal.addComponents(row);

await context.interaction.showModal(modal);
```

### Handling Modal Submissions

Create a modal handler in `src/components/modals/`:

```ts
import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import Modal from "../../base/classes/Modal";
import CustomClient from "../../base/classes/CustomClient";

export default class MyModal extends Modal {
  constructor(client: CustomClient) {
    super(client, { name: "my_modal" });
  }

  async Execute(interaction: ModalSubmitInteraction): Promise<void> {
    // Extract ownerId from customId: "my_modal:ownerId"
    const [_, ownerId] = interaction.customId.split(":");

    // Ownership check
    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: "❌ You cannot interact with this modal.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const value = interaction.fields.getTextInputValue("field_id");
    await interaction.reply({ content: `Received: ${value}`, flags: [MessageFlags.Ephemeral] });
  }
}
```

### Modal Custom ID Convention

Follow the same colon-delimited pattern: `modalName:ownerId:arg1:arg2`

- `modalName`: Must match the `name` in the modal class constructor.
- `ownerId`: The user who initiated the modal (for ownership enforcement).

## ⏳ Interaction Lifecycle & Expiration

Indefinitely persistent buttons can cause "Unknown Interaction" errors or clutter the chat with dead buttons if the bot restarts.

To solve this, we use the `InteractionLifecycle` system (`src/lib/interactions/InteractionLifecycle.ts`).

### How It Works

When you send a message containing interactive components, you can register it with the lifecycle system:

```ts
// In your command file after sending the message
if (responseMessage) {
  InteractionLifecycle.track(responseMessage, user.id);
}
```

1.  A global timer (default: 2 minutes, managed in `constants/interactions.ts`) begins.
2.  If the timeout expires, the system automatically fetches the message, modifies all attached components to `disabled: true`, and appends an `• Interaction expired` notice to the embed footer.

### Refreshing or Finalizing

- **Refreshing**: If a user interacts with the message (e.g., clicking 'Next Page'), simply call `InteractionLifecycle.track(interaction.message, ownerId)` again at the end of your button handler. This resets the timer.
- **Finalizing**: If an interaction leads to a "final" state (e.g., dismissing the menu, or finishing a game), call `InteractionLifecycle.untrack(interaction.message.id)` to safely cancel the timeout and prevent it from firing.

## 📄 Pagination

The project provides a reusable `PaginationUtility` class (`src/lib/pagination/PaginationUtility.ts`) for common pagination patterns.

### Using PaginationUtility

```ts
import PaginationUtility from "../../lib/pagination/PaginationUtility";
import { DEFAULT_PAGINATION_PAGE_SIZE } from "../../constants/limits";

// Calculate page
const result = PaginationUtility.getPaginationResult(
  items,       // Full array of items
  currentPage, // 1-indexed page number
  DEFAULT_PAGINATION_PAGE_SIZE
);

// result.items     → sliced items for this page
// result.page      → validated current page
// result.totalPages → total number of pages

// Create navigation buttons
const navRow = PaginationUtility.createNavigationRow(
  result.page,
  result.totalPages,
  (targetPage) => `pagination:${userId}:${targetPage}` // customId factory
);

// Create footer text
const footer = PaginationUtility.getFooterText(result.page, result.totalPages);
```

### Manual Pagination

You can also build pagination manually using Button Action Rows updating an active embed:

1.  Pass the `pageIndex` in the `customId`.
2.  In the button handler, calculate bounds `start = (page - 1) * pageSize` and `end = start + pageSize` using constants from `src/constants/limits.ts`.
3.  Slice the array, update the embed's description and footer, then call `interaction.update()`.