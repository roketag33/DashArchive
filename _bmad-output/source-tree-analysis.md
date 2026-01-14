# Source Tree Analysis

**Root:** `/Users/alexandre/Documents/dev/Electron.js`

## Directory Structure

```
Electron.js/
├── src/
│   ├── main/                 # Electron Main Process (Backend)
│   │   ├── db/               # Database logic (Schema, mutations)
│   │   │   └── schema.ts     # Drizzle schema definitions
│   │   ├── ipc/              # IPC Handlers (API Layer)
│   │   └── index.ts          # Application Entry Point
│   │
│   ├── renderer/             # Electron Renderer Process (Frontend)
│   │   ├── src/
│   │   │   ├── components/   # React UI Components
│   │   │   │   ├── ui/       # Reusable UI elements (Shadcn/Radix likely)
│   │   │   │   └── features/ # Feature-based components
│   │   │   ├── hooks/        # Custom React Hooks
│   │   │   ├── context/      # Global State (AIContext, etc.)
│   │   │   └── main.tsx      # Frontend Entry Point
│   │   └── index.html        # HTML Entry Point
│   │
│   ├── preload/              # Preload Scripts
│   │   └── index.ts          # Context Bridge definitions
│   │
│   └── shared/               # Shared types/utils between Main and Renderer
│
├── drizzle/                  # SQL Migrations
├── resources/                # Static assets (icons, etc.)
├── build/                    # Build configuration (icons, etc.)
├── tests/                    # Test configuration
└── docs/                     # Project documentation
```

## Critical Flows

1.  **Entry:** `src/main/index.ts` initializes the app and creates windows.
2.  **UI:** `src/renderer/src/main.tsx` hydrates the React app.
3.  **Bridge:** `src/preload/index.ts` exposes safe APIs to the renderer.
4.  **Database:** `src/main/db/schema.ts` defines the data model, managed by Drizzle.
