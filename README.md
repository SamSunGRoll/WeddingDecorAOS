# Wedding Décor Operations Automation System - Frontend

This is the frontend application for the Wedding Décor Operations Automation System, built with React, TypeScript, and Vite.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Recommended version: 18.x or 20.x)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation
1.  Open your terminal or command prompt in this folder.
2.  Install all dependencies:
    ```bash
    npm install
    ```

### Running the Project
- **Development Mode:** Runs the app on a local server (usually `http://localhost:5173`).
  ```bash
  npm run dev
  ```
- **Build for Production:** Compiles the code into the `dist/` folder.
  ```bash
  npm run build
  ```
- **Preview Production Build:** Runs the compiled code to test the production version.
  ```bash
  npm run preview
  ```

---

## 📦 Sharing & Packaging (Cleanup)

To share this project via email or a zip file, you should exclude large, automatically generated folders like `node_modules` and `dist`. This will reduce the file size from hundreds of MBs to just a few KBs.

### Option 1: Automated Cleanup (Recommended)
We've added a special cross-platform command (works on Windows, Mac, and Linux) to safely remove all non-essential files before zipping:
```bash
npm run clean
```

### Option 2: Manual Cleanup
Before zipping, manually delete these folders:
- `node_modules/` (The dependencies folder)
- `dist/` (The production build folder)
- `.vite/` (If present inside `node_modules` or at root)

### Files to Include in your ZIP:
When zipping the project, ensure you include:
- `src/` (All source code)
- `public/` (Static assets)
- `package.json` & `package-lock.json` (Dependency lists)
- `tsconfig.*` (TypeScript configurations)
- `vite.config.ts` (Build configuration)
- `index.html` (The entry point)
- `.gitignore` & `eslint.config.js`

---

## 🛠 Tech Stack
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide-react
- **Charts:** Recharts
- **Components:** Built with Radix UI primitives
