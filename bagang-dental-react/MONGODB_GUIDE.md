# Connecting the backend to MongoDB

The API in `server/` (Express + Mongoose) stores bookings and contact messages in MongoDB.
You can use **MongoDB Atlas** (free cloud database, easiest) or **MongoDB installed locally**.
You only need one of them.

## 0. What you need

- Node.js 20 or newer (`node -v`)
- This project unzipped, with dependencies installed:

```bash
npm run install:all      # installs the React app and the server
```

---

## Option A – MongoDB Atlas (cloud, recommended)

1. **Create an account** at <https://www.mongodb.com/cloud/atlas/register> and create a free **M0** cluster
   (pick a region near you, for example Singapore).
2. **Create a database user**: *Database Access → Add New Database User → Password*.
   Save the username and password. Avoid special characters in the password, or URL-encode them
   (for example `@` becomes `%40`).
3. **Allow your IP**: *Network Access → Add IP Address*.
   - For development choose *Add Current IP Address*.
   - When you deploy, add your hosting provider's outbound IP (or `0.0.0.0/0` only if you accept the risk,
     since the database user and password are then the only protection).
4. **Get the connection string**: *Database → Connect → Drivers*. It looks like:

   ```
   mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```

5. Put your own user and password in it and add the database name `bagang_dental` before the `?`:

   ```
   mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/bagang_dental?retryWrites=true&w=majority
   ```

6. Create the server config file and paste that string into it:

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env`:

   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/bagang_dental?retryWrites=true&w=majority
   ADMIN_API_KEY=<a long random string>
   ```

---

## Option B – MongoDB on your own computer

1. Install **MongoDB Community Server**: <https://www.mongodb.com/try/download/community>
   (or `brew install mongodb-community` on macOS, or Docker:
   `docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:7`).
2. Make sure it is running (Windows: the *MongoDB* service; macOS: `brew services start mongodb-community`).
3. `cp server/.env.example server/.env` and keep the default:

   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/bagang_dental
   ```

---

## Start everything

Use two terminals from the project root:

```bash
# Terminal 1 – API on http://localhost:5000
npm run server

# Terminal 2 – React app on http://localhost:5173
npm run dev
```

You should see this in terminal 1:

```
MongoDB connected: <host>/bagang_dental
API listening on http://localhost:5000
```

The React dev server forwards every `/api/...` request to port 5000 (see `vite.config.js`),
so no extra setup is needed for the browser.

### Check that it works

```bash
curl http://localhost:5000/api/health
# {"ok":true,"db":"connected"}
```

Then open the site, make a booking on **Book Appointment**, and write down the 4-digit number.
Use the **Check Queue** tab to look it up. In Atlas (*Database → Browse Collections*) or in
MongoDB Compass you will see the collections listed under "What is stored" inside `bagang_dental`.
Collections and indexes are created automatically the first time the server runs.

---

## Viewing and editing the data in MongoDB Compass

[MongoDB Compass](https://www.mongodb.com/try/download/compass) is the free desktop app for browsing the database.

1. Install and open Compass, then click **Add new connection**.
2. Paste the **same connection string** that is in `server/.env`:
   - Local MongoDB: `mongodb://127.0.0.1:27017/bagang_dental`
   - Atlas: the `mongodb+srv://...` string (your IP must be allowed in *Network Access*)
3. Click **Connect**. The database `bagang_dental` appears in the left panel after the API has started once.
4. Open it to see the collections. Useful things to try:
   - `appointments`: filter with `{ "app_status": "waiting" }` or `{ "queue_number": "4821" }`.
   - `appointment_invoices`: filter with `{ "is_paid": false }`.
   - `messages`: filter with `{ "handled": false }`, then edit a document and set `handled` to `true`.
   - `services`: edit `service_cost` directly to change a price (the booking API reads prices from here).
   - **Indexes** tab on `appointments`: you should see `unique_active_slot` and `unique_active_queue_number`.
   - **Schema** tab: quick look at the shape and values of each field.
5. Each collection has **Export Data** (JSON or CSV) for backups and reports.

Tips:

- Compass edits the live database. Changing `app_status` in Compass does not update `active`; if you do it by hand,
  set `active` to `false` for `completed` or `cancelled` so the slot and queue number are freed
  (the staff `PATCH` endpoint does this for you).
- Click **Refresh** in Compass to see new bookings; it does not update automatically.
- If Compass cannot connect to a local database, MongoDB is not running (see Troubleshooting).

---

## What is stored

The collections follow your ERD. Full diagram, field lists and design notes: **[DATABASE_DESIGN.md](DATABASE_DESIGN.md)**.

| Collection | Filled by |
|---|---|
| `patients` | Booking form (a returning patient is reused, matched by email and name) |
| `appointments` | Booking form (each has a 4-digit `queue_number`) |
| `appointment_invoices` | Created together with each appointment; updated when a payment is recorded |
| `patient_services` | Created with each booking (which services a patient has booked) |
| `services`, `dentists`, `schedules` | Loaded automatically on the first start from `server/src/data/catalog.js` |
| `messages` | Contact form |

The first time the API starts with an empty database it inserts the services, dentists and their Monday to Saturday
schedules. After editing `server/src/data/catalog.js`, apply the changes with:

```bash
npm --prefix server run seed
```

Rules enforced by the server (and by database indexes, so they hold even with simultaneous requests):

- One active appointment per dentist, date and time slot (a second one gets "already booked").
- A 4-digit queue number belongs to one active appointment at a time. Numbers free up when an appointment is
  `completed` or `cancelled`.
- Bookings must fit the dentist's `schedules` (Monday to Saturday, 8:00 AM to 5:00 PM), be at least one day ahead,
  and use the time slots in `server/src/data/catalog.js`.
- The price comes from `services.service_cost` in the database, never from the browser. Keep it in step with
  `src/data/clinic.js` when prices change.

---

## API reference

Public:

| Method | URL | Purpose |
|---|---|---|
| `GET` | `/api/health` | Server and database status |
| `POST` | `/api/bookings` | Create a booking (body: the booking form fields) |
| `GET` | `/api/bookings/:number` | Status and queue position for a 4-digit number (no personal data returned) |
| `POST` | `/api/contact` | Save a contact message |
| `GET` | `/api/services` | List services (from the `services` collection) |
| `GET` | `/api/dentists` | List dentists |
| `GET` | `/api/dentists/:slug/schedule` | A dentist's weekly working hours |

Staff only (send header `x-api-key: <ADMIN_API_KEY from server/.env>`):

| Method | URL | Purpose |
|---|---|---|
| `GET` | `/api/bookings?date=2026-11-03&status=waiting` | List bookings (both filters optional) |
| `PATCH` | `/api/bookings/:number/status` | Body `{"status":"ready"}`; also `completed`, `cancelled`, `waiting` |
| `POST` | `/api/invoices/:ref/payment` | Body `{"amount":500}`. `:ref` is the 4-digit queue number or the appointment id. Updates `patient_paid`, `total_due`, `is_paid`, `payment_date` |
| `GET` | `/api/invoices?paid=false` | List invoices |
| `GET` | `/api/contact?handled=false` | List contact messages |
| `PATCH` | `/api/contact/:id` | Body `{"handled":true}` |

Example – call the next patient:

```bash
curl -X PATCH http://localhost:5000/api/bookings/4821/status \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -d '{"status":"ready"}'
```

The staff routes have no screen in the website yet; use curl, Postman, Compass, or build an admin page on top of them.

---

## Deploying

Simplest setup, one server for everything:

1. `npm run build` in the project root. This creates `dist/`.
2. Set the environment variables on your host (Render, Railway, Fly.io, a VPS, …):
   `MONGODB_URI`, `ADMIN_API_KEY`, `CLIENT_ORIGIN` (your site URL), `PORT` if required.
3. Start command: `npm --prefix server start` (after `npm --prefix server install`).
   If `dist/` exists, the Express server serves the React site too, so the site and `/api` share one URL.
4. In Atlas *Network Access*, allow your host's IP.

If you host the React app and the API separately, build the React app with
`VITE_API_URL=https://your-api-host` and set `CLIENT_ORIGIN` on the API to the React site's URL.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `MONGODB_URI is not set` | `server/.env` is missing, or you ran the server from a place where it can't find it. Run `npm run server` from the project root. |
| `bad auth` / `Authentication failed` | Wrong database user or password; special characters in the password need URL-encoding. |
| `ECONNREFUSED 127.0.0.1:27017` | Local MongoDB isn't running (Option B). Start the service or container. |
| `Server selection timed out` (Atlas) | Your IP isn't in *Network Access*, or the network blocks port 27017. |
| Browser shows "Cannot reach the server" | The API isn't running, or it crashed on startup. Check terminal 1. |
| CORS error in the console | `CLIENT_ORIGIN` in `server/.env` doesn't match the URL the site is opened from. |
| "That dentist is already booked…" | Working as intended: that date, time and dentist is taken. Pick another slot. |
| `503 Admin access is not configured` | Set `ADMIN_API_KEY` in `server/.env` to something other than `change-me`, then restart. |

## Security notes

- Never commit `server/.env` (it is in `.gitignore`) and rotate the Atlas password if it leaks.
- Booking numbers are only 4 digits, so lookups are rate limited and return no personal details.
  If you later show patient data to patients, add proper authentication first.
- This app stores patient personal data. Check the privacy and data-protection rules that apply to your
  clinic (in the Philippines, the Data Privacy Act) before using it with real patients.
