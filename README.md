# Changelog

## 0.0.3 - FILL OUT DATE BEFORE PUSHING THE MAIN

_TO ADD BEFORE PUSHING TO MAIN_

### Added

#### **Commands:**

- Added the `/hltv player stats <playerName>` command, to retrieve the stats of any player on HTLV using their nickname. ([`#1`](https://github.com/Asviix/Arqon/issues/1))

### Changed

#### **Localization:**

- Complete rework of the localizations and its methods: ([`223a3`](https://github.com/Asviix/Arqon/commit/223a327b8c626f57bce5061b939f317d32826e28))
  - **Architectural Upgrade:** Switched from fragile JSON files to **TypeScript modules (.ts)**, allowing dynamic import ans full native language support.
  - **Improved Developper Experience (DX):** Created the highly compact `_()` (underscore) alias for translation, reducing verbose calls like `client.localizationManager.getString()`.
  - **Enhanced Type Safety:** Parameterized strings now use a **strong, structured object model** (instead of positional arguments) defined in a central `interfaces.ts` file. This guarantees that every translation call is correct and self-documenting, eliminating argument order errors and providing IntelliSense for placeholder keys.
  - **Dynamic Loading:** The system now intelligently detects whether the code is running via `ts-node` **or compiled JavaScript**, automatically loading the correct source files and ensuring seamless deployment.

#### **Refactoring:**

- Slight changes on how `index.ts` declares the token from the environment strings.
- Small change of how `/ping (command.ts)` checks for edge-cases on the Uptime variable.
- Refactored imports in all files to include a named path for better readability and maintainability. ([`c9197`](https://github.com/Asviix/Arqon/commit/c9197dea0ebefa31936df35a28269c2d678e8807))
- Other small changes.
- Ordered import names alphabetically. [`#2`]

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
