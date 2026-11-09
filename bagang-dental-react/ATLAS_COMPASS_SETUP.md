# Connect MongoDB Atlas + Compass to Bag-ang Dental

Atlas = the cloud database. Compass = the desktop app to look at it. Both use the **same connection string**,
and the website's server (`server/`) uses it too, through `server/.env`.

```
Website (React)  ->  Express API (server/)  ->  MongoDB Atlas  <-  MongoDB Compass
                          reads MONGODB_URI from server/.env      uses the same string
```

## Part 1 - Create the Atlas database (about 10 minutes)

1. Sign up at https://www.mongodb.com/cloud/atlas/register (Google sign-in works).
2. Create a project, then **Create** a cluster: choose **M0 (Free)**, provider AWS, a nearby region (e.g. Singapore). Create.
3. **Database Access -> Add New Database User**
   - Authentication: Password. Username e.g. `bagang_admin`.
   - Use **Autogenerate Secure Password** and copy it now. Prefer letters and numbers only; if it has symbols, you
     must URL-encode them in the connection string (`@` = `%40`, `#` = `%23`, `/` = `%2F`, `:` = `%3A`).
   - Role: *Read and write to any database* (or "Atlas admin" for a school project).
4. **Network Access -> Add IP Address -> Add Current IP Address**. (If you change Wi-Fi, add the new IP again.
   For quick testing only, `0.0.0.0/0` allows everyone; the password is then your only protection.)
5. **Database -> Connect -> Drivers** (Node.js). Copy the string. It looks like:
   `mongodb+srv://bagang_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
6. Edit it: replace `<password>` (remove the `< >`), and add the database name before the `?`:
   `mongodb+srv://bagang_admin:YOURPASSWORD@cluster0.abcde.mongodb.net/bagang_dental?retryWrites=true&w=majority`

## Part 2 - Connect the system

1. In the project root: `npm run install:all`
2. Open `server/.env` (create it with `cp server/.env.example server/.env` if missing) and set:
   ```
   MONGODB_URI=<your string from step 6>
   ADMIN_API_KEY=<any long random text, not "change-me">
   ```
3. Test the connection: `npm run db:check`
   - You should see `Connected OK -> Atlas`. Errors come with a hint (wrong password, IP not allowed, ...).
4. Start the system, in two terminals:
   ```
   npm run server     # API on :5000, prints "MongoDB connected: ... /bagang_dental"
   npm run dev        # website on :5173
   ```
   The first start creates the collections and fills `services`, `dentists` and `schedules` automatically.
5. Open http://localhost:5173, make a booking on **Book Appointment**, note the 4-digit number, and look it up in **Check Queue**.

## Part 3 - Connect Compass

1. Download and install Compass: https://www.mongodb.com/try/download/compass
2. Open it -> **Add new connection**.
3. Paste the **same** `MONGODB_URI` from `server/.env` -> **Connect**.
   (Save it with *Save & Connect* / the star so you can reopen it later.)
4. In the left panel open `bagang_dental`. You will see: `patients`, `appointments`, `appointment_invoices`,
   `patient_services`, `services`, `dentists`, `schedules`, `messages`.
5. Click `appointments` -> your test booking is there. Press **Refresh** to see new bookings (it is not live).

Useful Compass filters (type in the Filter box and click Find):

| Collection | Filter | Shows |
|---|---|---|
| `appointments` | `{ "app_status": "waiting" }` | patients still waiting |
| `appointments` | `{ "queue_number": "4821" }` | one booking |
| `appointment_invoices` | `{ "is_paid": false }` | unpaid invoices |
| `messages` | `{ "handled": false }` | unanswered contact messages |

Edit a document by hovering it and clicking the pencil. Changing `services.service_cost` changes the price the
booking API uses. If you set an appointment to `completed` or `cancelled` by hand, also set `active` to `false`.

## Troubleshooting

| Message | Fix |
|---|---|
| `bad auth` / `Authentication failed` | Wrong user/password, or unencoded symbol in the password. Reset it in Database Access. |
| `Server selection timed out` | Your IP is not in Network Access. Add it and wait ~1 minute. |
| `querySrv ENOTFOUND` | Typo in the cluster address, or the network blocks DNS. Re-copy the string; try another network. |
| Compass connects but no `bagang_dental` | The API has not run yet, or `.env` points to a different database name. Run `npm run server`. |
| Website says "Cannot reach the server" | `npm run server` is not running, or it crashed (read its terminal). |

Never share or commit `server/.env`; it contains your database password. If it leaks, change the password in Atlas.
