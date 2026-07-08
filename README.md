# Kitab Era

A small React + Express website for uploading and reading novels.

## Features
- Public hero section with an Explore button
- Writer cards visible without login
- Writer detail pages for online reading and PDF downloads
- Hidden admin panel with username/password authentication
- Admin can add writers and upload novels

## Run locally
1. Install dependencies: `npm install`
2. Start both apps: `npm run dev`
3. Open the Vite URL shown in the terminal

## Admin login
Default credentials:
- Username: `admin`
- Password: `kitabera123`

You can override them with environment variables:
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

## Firebase database
The server can use Firestore instead of the local `server/data/db.json` file.

1. Copy [`.env.example`](.env.example) to [`.env`](.env) or edit the local [`.env`](.env) file directly.
2. Fill in these values from your Firebase service account:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
3. Restart the server.

The private key should keep newline escapes as `\n`. If those variables are missing, the app falls back to the local JSON file.
