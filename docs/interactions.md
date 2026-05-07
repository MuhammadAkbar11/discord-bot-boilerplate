# Interaction Systems

This project centralizes the handling of Discord message components (Buttons and Select Menus) into distinct, class-based handler files, ensuring that interaction logic does not bloat command files.

## 🖱️ Button Interactions

Buttons are placed in `src/components/buttons/`.

To create a new button handler, extend the `Button` base class.

```ts
import { ButtonInteraction } from "discord.js";
import Button from "../../base/classes/Button";

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

Pagination is built manually using Button Action Rows updating an active embed. Follow these patterns:

1.  Pass the `pageIndex` in the `customId`.
2.  In the button handler, calculate bounds `start = (page - 1) * pageSize` and `end = start + pageSize` using constants from `src/constants/limits.ts`.
3.  Slice the array, update the embed's description and footer, then call `interaction.update()`.
