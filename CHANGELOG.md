# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-05-08

### Added
- **Modal Component Handler**: Full modal support with `Modal` base class, `IModal`/`IModalOptions` interfaces, `LoadModals()` in Handler, `ExecuteModal()` in CommandHandler.
- **Autocomplete Support**: `ExecuteAutocomplete()` wired up in `CommandHandler`, routes to command and subcommand autocomplete methods.
- **Persistent Cooldowns**: MongoDB-backed cooldown storage via `CooldownModel` with TTL auto-cleanup, compound indexes, and `CooldownManager` utility.
- **Command Aliases**: Commands and subcommands can declare `aliases` array with conflict detection and prefix resolution.
- **Pagination Utility**: Extracted reusable `PaginationUtility` class (`getPaginationResult`, `createNavigationRow`, `getFooterText`).
- **Startup Validator**: `StartupValidator` class validates environment, detects duplicate commands/aliases, and duplicate component IDs.
- **`/prefix` Command**: Slash-only command to view or change the guild prefix with validation.
- **`/feedback` Command + Modal**: Slash-only command that opens a modal form for user feedback submission.
- **ESLint + Prettier**: `.eslintrc.json` with `@typescript-eslint` rules, Prettier integration, and `lint`/`lint:fix`/`format` scripts.
- **Vitest Testing Framework**: 10 test files covering PrefixParser, EmbedUtility, ErrorHandler, PaginationUtility, StartupValidator, InteractionLifecycle, AliasExecution, Info, Prefix, GuildCreate.
- **Project Documentation**: `docs/architecture.md`, `docs/commands.md`, `docs/conventions.md`, `docs/interactions.md`.
- **Project Completion Status**: Added completion assessment section to PRD (~85% complete).

### Changed
- **Cooldown System**: Migrated from in-memory `Collection` to MongoDB-backed `CooldownManager` with TTL indexes.
- **`IHandler` Interface**: Updated to include `LoadButtons()`, `LoadSelectMenus()`, and `LoadModals()`.
- **`ISubCommand` Interface**: Updated to include `commandName`, `subCommandGroup`, `supports`, and `aliases`.
- **README.md**: Comprehensive rewrite with full quick-start examples for commands, subcommands, buttons, modals, and select menus.
- **docs/commands.md**: Added alias, autocomplete, subcommand group, and permission system documentation.
- **docs/interactions.md**: Added modal handler documentation and PaginationUtility usage guide.
- **docs/conventions.md**: Added modal references to folder structure and custom ID conventions.
- **`package.json`**: Added ESLint, Prettier, and Vitest dev dependencies and scripts.

### Fixed
- `IHandler` interface missing `LoadButtons()`, `LoadSelectMenus()`, `LoadModals()` methods.
- `ISubCommand` interface missing `commandName`, `subCommandGroup`, `supports`, `aliases` properties.
- `GuildConfig` model missing unique index on `guildId` field.

---

## [2.0.0] - 2026-05-06

### Added
- **Unified Command System**: Support for both Slash and Prefix execution in a single command file.
- **Interactive Component Handlers**: Automated discovery and handling for Buttons and Select Menus.
- **Interaction Lifecycle Management**: Automatic expiration and disabling of stale interactive components.
- **Centralized Error Handling**: Unified error hierarchy and safe user-facing error embeds.
- **Structured Logging**: Production-ready logging using `pino`.
- **Advanced Prefix Parser**: Shell-like argument parsing with support for quoted strings and escape characters.
- **Embed Utility**: Factory system for consistent bot UI/UX.
- **Constants System**: Centralized static values for bot configuration and limits.
- **Example Commands**: New examples including `/flipcoin`, `/users`, `/server`, and `/user`.

### Changed
- **Major Refactor**: Transitioned from a simple starter to a robust, class-based boilerplate.
- **Directory Structure**: Renamed `schema/` to `models/` for Mongoose models.
- **Client Architecture**: Extended `CustomClient` with automated handlers and centralized shutdown logic.
- **Environment Management**: Improved environment variable validation with dev/prod separation.
- **Dependency Update**: Updated `discord.js`, `mongoose`, and other core dependencies.

### Fixed
- Environment variable naming mismatch (`MONGO_URI` vs `MONGO_URL`).
- Missing required environment variables in `.env.example`.
- Redundant database operations in guild events.
- Inconsistent naming conventions in interfaces and handlers.
- Missing graceful shutdown handlers.

---

## [1.0.0] - 2026-05-01

### Added
- Initial release of the Discord bot starter.
- Basic command and event handler.
- MongoDB integration with Mongoose.
- Basic slash command support.