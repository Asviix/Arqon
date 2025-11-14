# Changelog

## 0.0.3 -

__

### Changed

#### **Refactoring:**

- Slight changes on how `index.ts` declares the token from the environment strings.
- Small change of how `/ping (command.ts)` checks for edge-cases on the Uptime variable.
- Other small changes.

#### **GitHub**

- Reworked [`changelod.md`](https://github.com/Asviix/Arqon/blob/main/changelog.md) to now be `README.md` to show various info and the changelog in one place.
- Reworked `README.md` (previously[`changelod.md`](https://github.com/Asviix/Arqon/blob/main/changelog.md)) to align with Markdown syntax rules.

## 0.0.2 - 2025-11-11

_Command Handling Rework and Architectural Refinements._

### Added

#### **Localization:**

- Add new locale strings for the HLTV command. ([en-US.json](https://github.com/Asviix/Arqon/blob/main/src/Locales/en-US.json))

### Changed

#### **Refactoring:**

- Change how the command context (`client`, `interaction`, `languageCode`) is passed, consolidating them into a single context object for the `execute` method. ([baseCommand.ts](https://github.com/Asviix/Arqon/blob/main/src/Commands/BaseCommand.ts))

#### **UX/Display:**

- Rework the `/ping` command to include a structured embed and hide empty uptime fields. ([ping](https://github.com/Asviix/Arqon/tree/main/src/Commands/ping))
- Update `changelog.md` to be more precise and follow a consistent structure. ([changelog.md](https://github.com/Asviix/Arqon/blob/main/changelog.md))

#### **Performance:**

- Make `getString()` from `LocalizationManager` synchronous to avoid unnecessary `await` calls. ([LocalizationManager.ts](https://github.com/Asviix/Arqon/blob/main/src/Locales/LocalizationManager.ts))

## 0.0.1 - 2025-11-10

_First Update._

### Added

- Basic HLTV command.
- BrowserService with puppeteer headless stealth browser for HTML scraping.

### Changed

- Change hierarchy of commands, with nested folders for better maintanability.
