he# Project Overview: Electron.js (DashArchive)

**Generated:** 2026-01-13
**Type:** Desktop Application (Electron)

## Executive Summary

**DashArchive** is an intelligent, privacy-focused file organizer powered by local AI. It is built as a desktop application using Electron, leveraging local LLMs (@mlc-ai/web-llm) for intelligence without data leaving the device.

## Technology Stack

| Category     | Technology           | Description          |
| :----------- | :------------------- | :------------------- |
| **Core**     | Electron             | Desktop runtime      |
| **Frontend** | React + Vite         | UI Framework         |
| **Language** | TypeScript           | Type safety          |
| **Styling**  | TailwindCSS          | Utility-first CSS    |
| **Database** | Drizzle ORM + SQLite | Local data storage   |
| **AI**       | @mlc-ai/web-llm      | Local LLM inference  |
| **Testing**  | Vitest + Playwright  | Unit and E2E testing |

## Architecture Classification

- **Type:** Monolith (Single Repository)
- **Pattern:** Layered Architecture (Main Process vs Renderer Process)
- **Communication:** IPC Isolation (Context Isolation enabled)

## Key Directories

- `src/main`: Backend logic (Main process)
- `src/renderer`: Frontend UI (Renderer process)
- `src/preload`: Bridge between Main and Renderer
- `drizzle`: Database migrations
- `resources`: Static assets

## Status

- **Development:** Active
- **Documentation:** Basic (README, CONTRIBUTING), now enhanced with BMad Method docs.
