# Bag-ang Dental Clinic – React + Express + MongoDB

- **Frontend:** Vite, React 18, React Router 6 (`src/`)
- **Backend:** Express + Mongoose API (`server/`)
- **Database:** MongoDB (Atlas or local) – step-by-step Atlas + Compass setup in **[ATLAS_COMPASS_SETUP.md](ATLAS_COMPASS_SETUP.md)**, full guide in **[MONGODB_GUIDE.md](MONGODB_GUIDE.md)**, ERD and collections in **[DATABASE_DESIGN.md](DATABASE_DESIGN.md)**

## Quick start

```bash
npm run install:all                 # installs frontend + server
cp server/.env.example server/.env  # then edit MONGODB_URI and ADMIN_API_KEY
                                    # open MongoDB Compass with the same MONGODB_URI to browse the data

npm run server                      # terminal 1: API on :5000
npm run dev                         # terminal 2: site on :5173
```

Production build: `npm run build`, then `npm start` (the API also serves `dist/`).

## Structure

```
src/
  main.jsx, App.jsx        entry and routes
  api.js                   fetch helpers for the backend
  components/Layout.jsx    header, nav, footer
  pages/                   Home, About, Services, Book (booking + queue), Contact
  data/clinic.js           services, dentists, time slots, contact info
  styles/global.css        all styles
server/
  src/server.js            Express app
  src/config/db.js         MongoDB connection
  src/models/              Patient, Dentist, Service, Schedule, PatientService,
                           Appointment, AppointmentInvoice, Message (Mongoose)
  src/routes/              bookings, invoices, catalog (services/dentists), contact
  src/data/catalog.js      starting services, dentists, schedules, time slots
  src/seed.js              loads that data into MongoDB (npm --prefix server run seed)
  .env.example             configuration template
```

## Notes

- Emails and SMS are not sent yet; the confirmation text on the site is informational.
- Staff endpoints (list bookings, mark `ready`/`completed`/`cancelled`, read messages) need the
  `x-api-key` header; there is no admin screen yet.
- Map uses Leaflet + OpenStreetMap tiles.
