# Vazhikal Trails - Full-Stack Local Setup Guide 🚀

Welcome to **Vazhikal**, a social travel platform and collaborative agency marketplace. This application is built with a **React (Vite) frontend** and an **Express / Node.js backend** powered by **Sequelize ORM** mapped to a **PostgreSQL** database.

This guide is designed for absolute beginners to help you set up and run the entire application locally on your computer with minimal effort!

---

## 📂 File Architecture Overview
All files are structured to work together out of the box:
- `server.ts` &mdash; Launches the Express API server, syncs the DB on boot, and proxies Vite assets.
- `src/db/sequelize.ts` &mdash; Connection handshake configurations.
- `src/db/models.ts` &mdash; Persistent table models: `User`, `Post`, `Comment`, `Package`, `Verification`, `FlaggedPost`, `CommentReport`, and `AuditLog`.
- `setup_db.py` &mdash; A Python helper script that automatically creates the database and initializes all tables so you don't have to write manual SQL.

---

## 🛠️ Step 1: Install PostgreSQL & pgAdmin 4
If you do not have database software installed on your PC, download the interactive installer:

1. **Download the installer:** Go to the [Official PostgreSQL download section](https://www.postgresql.org/download/) and choose your OS (Windows / macOS / Linux).
2. **Run Installer:** Double-click the downloaded setup file.
3. **Select Components:** Leave all options checked (important: ensure **PostgreSQL Server**, **pgAdmin 4**, and **Command Line Tools** are selected).
4. **Enter Superuser Password:** Set your administrator password. *(To align with the automator script, use password `password` or see configuration instructions below).*
5. **Port:** Leave the default port on `5432`.

---

## 📝 Step 2: Configure Your Connection Coordinates
The application reads database connection credentials from a `.env` file in the project's root folder.

1. Create a new text file named `.env` in the root folder of this project.
2. Copy and paste the following configuration inside (which matches your credentials):

```env
# Full-stack Server Ports
NODE_ENV=development
PORT=3000

# PostgreSQL Connection Credentials
SQL_HOST=localhost
SQL_PORT=5432
SQL_DB_NAME=vazhikal_db
SQL_USER=postgres
SQL_PASSWORD=password
```

---

## 🐍 Step 3: Run the Database Automator (No Manual SQL Typing!)
We created `setup_db.py` so that you have to write absolutely **zero** database creation queries! This Python routine will create the database `vazhikal_db` and pre-build all 8 tables for you.

1. Open your terminal (macOS/Linux) or Command Prompt (Windows).
2. Make sure you are in the project's directory:
   ```bash
   cd /path/to/extracted/vazhikal-zip-folder
   ```
3. Run the database setup script:
   ```bash
   python setup_db.py
   ```
4. **That is it!** The console will print a checklist confirming that the database `vazhikal_db` and tables (`users`, `posts`, `comments`, etc.) are ready to roll.

---

## 🔍 Step 4: How to View Database Records in pgAdmin 4
Once you start saving users and trails, you can examine the raw data rows using the pgAdmin 4 GUI:

1. **Launch pgAdmin 4:** Search for pgAdmin on your computer and open it.
2. **Connect to Server:** Under the left tree pane, double-click **Servers**. When prompted, enter your master connection password (`password`).
3. **Register / Check Database:** 
   - Expand the **Databases** node. 
   - You should see the database named `vazhikal_db`.
4. **Locate Tables:**
   - Expand **vazhikal_db** &rarr; **Schemas** &rarr; **public** &rarr; **Tables**.
   - Here, all the Sequelize tables will be listed:
     - `users` &mdash; Persisted user accounts, logins, and biographics.
     - `posts` &mdash; Travel experience trails posted by travelers.
     - `comments` &mdash; Collaborative nested discussion replies.
     - `packages` &mdash; Curated travel listings.
     - `audit_logs` &mdash; Real-time system activity history.
5. **View Raw Rows:**
   - Right-click on any table (e.g., `users` or `posts`).
   - Hover over **View/Edit Data** &rarr; Select **All Rows**.
   - The data grid will render at the bottom of pgAdmin showing exactly what has been saved!

---

## 🚀 Step 5: Start the Application (Frontend + Backend combined)
Start the combined development servers on port `3000`:

1. **Mandatory Step &mdash; Install Dependencies First:**
   In your terminal or command prompt, you **must** download the package setup files before trying to run the app. Run:
   ```bash
   npm install
   ```
2. Start the full-stack dev server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛠️ Troubleshooting: "'tsx' is not recognized as an internal or external command"

If you get this error in Windows:

1. **Make sure you ran `npm install` first:** This error happens because the project dependencies (specifically `tsx` which runs the backend server) are not yet downloaded onto your local machine. Running `npm install` inside the project folder downloads them.
2. **If `npm install` fails or you still get the error:**
   - Delete the `node_modules` folder (if any) and run `npm install` again.
   - Or, try running the server using `npx` (which auto-downloads executables temporarily if they are missing):
     ```bash
     npx tsx server.ts
     ```
   - Alternatively, you can install the `tsx` tool globally so Windows recognizes it everywhere:
     ```bash
     npm install -g tsx
     ```

---

## 💡 How Key Features Save Inputs to PostgreSQL
Now, all inputs given on the user interface are 100% saved persistently in the database:

- **Dynamic Login & Sign Up (Onboarding Screen):**
  When you register a new Traveler username (e.g. `'Siddharth'`, password `'mypass'`) and log in, that record is inserted into the PostgreSQL `users` table. The dashboard instantly updates to display your chosen username, bio, and email instead of the fallback `"Sara Wanderer"`.
- **Edit Account Info Form:**
  Modifying your password, email, or bio inside the "Edit Account Info" section immediately executes an HTTP `PUT` request to `/api/users/:email`. This updates the values dynamically in both the active session and the database.
- **Posting Experience Trails:**
  Clicking "Post Experiential Trail" on the dashboard saves the trail inside the `posts` table with your actual logged-in user as the `author`.
- **Discussion Comments & Voting:**
  Comments and upvotes/downvotes are fully recorded in the `comments` and `posts` tables under your unique username.
- **Vast Local Persistence:**
  Logins survive page reloads! If you close or refresh the tab, `localStorage` resumes your active session automatically.

Enjoy exploring and analyzing your local data! 🏕️✈️
