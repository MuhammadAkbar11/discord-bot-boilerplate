# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
