# Profile Vault

A consent-first profile directory that imports CSV data, encrypts PII at rest, and keeps PII masked until an explicit reveal request.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** FastAPI, Python 3.11+
- **Database:** SQLite by default; the schema can be migrated to PostgreSQL
- **PII protection:** Fernet symmetric field-level encryption

## Architecture

`backend/routes.py` contains HTTP route definitions, `backend/services.py` owns CSV and profile logic, `backend/database.py` owns persistence, and `backend/security.py` owns encryption/masking. The frontend only receives masked values from `GET /api/profiles`. Cleartext PII is returned only by `POST /api/profiles/{id}/reveal`, which is called after the UI consent workflow.

The sample data is intentionally fictional and lives in `users.csv`.

## Run locally

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:PII_ENCRYPTION_KEY = python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
cd ..
python -m backend
```

The API runs at `http://localhost:8000`. Keep `PII_ENCRYPTION_KEY` stable across restarts so existing encrypted records remain decryptable.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`, then choose **Import CSV** and select `users.csv`.

## API

- `GET /api/health` - health check
- `GET /api/profiles` - returns profile metadata and masked PII only
- `POST /api/profiles/import` - validates and encrypts a CSV upload
- `POST /api/profiles/{id}/reveal` - returns one profile's cleartext PII after consent

For production, put both services behind HTTPS, replace the demo reveal route with authenticated identity and authorization checks, use PostgreSQL, and store the encryption key in a secret manager.

## Validation

```powershell
python -m compileall backend
cd frontend
npm run build
```
