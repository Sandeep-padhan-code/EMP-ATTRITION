# Employee Attrition Intelligence Platform — Deployment

## Backend (Render)
- Create a Render Web Service from this GitHub repository.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn server.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/health`
- Set `CORS_ORIGINS` to the deployed frontend URL after deployment.

## Frontend (Vercel)
- Import the same GitHub repository.
- Root Directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  `VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com`

The frontend is already configured to use `VITE_API_BASE_URL`.

## Important
- Do not commit `frontend/node_modules`.
- Do not expose real employee data or real credentials.
- The app currently seeds demo accounts. Change/remove demo credentials before production use.
- SQLite is local to the backend instance; for persistent production data, use a managed database.
