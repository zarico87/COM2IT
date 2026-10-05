# com2it
Matriz de tareas (Eisenhower) con React + Vite + React Router DOM + Tailwind + CSS Modules.

## Uso (pnpm)
    pnpm install
    pnpm dev

## Conectar MongoDB
1. Creá tu API (Express + Mongoose) con: POST /auth/register, POST /auth/login, GET/POST /tasks, PATCH/DELETE /tasks/:id
2. Copiá `.env.example` a `.env` y completá `VITE_API_URL`.
3. Todo el acceso a datos vive en `src/services/api.js`: sin `VITE_API_URL` usa localStorage.
