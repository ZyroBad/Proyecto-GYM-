# Mi Colección Personal (Gym)

Proyecto universitario (React + Express) para llevar una bitácora de sesiones de entrenamiento.

Elegí este tema porque entreno casi todas las semanas y siempre termino apuntando cosas sueltas (en notas del cel o en papel). La idea acá es tener un lugar sencillo para registrar lo que hice y cómo me sentí.

## Qué hace (Fase 1)

- CRUD básico de sesiones: crear, editar y archivar.
- Guarda en **LocalStorage** para no perderlo si cierro el navegador.
- También guarda en el **backend** (Express + Postgres) usando `fetch`.
- No hay login, no hay cosas avanzadas todavía.

## Mis primeras sesiones (ejemplos reales)

- Push pesado pecho/tríceps
- Espalda y bíceps intensidad media
- Pierna completa con sentadilla
- Cardio HIIT 25 min
- Upper body volumen

## Stack

Frontend:
- React 18 + Vite
- CSS normal (sin Tailwind)
- `fetch` nativo (sin Axios)

Backend:
- Node.js + Express
- Postgres (librería `pg`)

## Cómo correrlo

### Backend

1. Ir a `backend/`
2. Crear un `.env` basado en `backend/.env.example`
3. Instalar y levantar:
   - `npm install`
   - `npm run dev`

Endpoint rápido para ver si prendió:
- `GET http://localhost:4000/api/health`

### Frontend

1. Ir a `frontend/`
2. (Opcional) Crear `.env` basado en `frontend/.env.example`
3. Instalar y levantar:
   - `npm install`
   - `npm run dev`

## Screenshots

Pendiente (todavía).

## Nota sobre ExerciseDB (más adelante)

Más adelante quiero probar la API de ExerciseDB (RapidAPI) para sugerir ejercicios o autocompletar nombres, pero en esta fase todavía no está integrada.

