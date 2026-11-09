// Starting data for the services, dentists and schedules collections.
// It is loaded automatically the first time the server starts with an empty database,
// and again (updating existing rows by slug) when you run: npm --prefix server run seed

export const SERVICES = [
  { slug: 'bonding',     service_name: 'Dental Bonding',    service_cost: 150000, service_duration_minutes: 60 },
  { slug: 'crowns',      service_name: 'Dental Crowns',     service_cost: 30000,  service_duration_minutes: 60 },
  { slug: 'dentures',    service_name: 'Dentures',          service_cost: 8500,   service_duration_minutes: 60 },
  { slug: 'cleaning',    service_name: 'Teeth Cleaning',    service_cost: 1000,   service_duration_minutes: 60 },
  { slug: 'extractions', service_name: 'Tooth Extractions', service_cost: 1000,   service_duration_minutes: 40 },
  { slug: 'braces',      service_name: 'Dental Braces',     service_cost: 50000,  service_duration_minutes: 60 },
];

export const DENTISTS = [
  {
    slug: 'monica',
    dentist_fname: 'Monica',
    dentist_lname: 'Empleo',
    dentist_specialty: 'Cosmetic & Restorative',
    dentist_phone: '+63 912 345 6789', // clinic line, replace with the dentist's own number
    dentist_email: 'monica.empleo@bagangdental.com',
  },
  {
    slug: 'fvienj',
    dentist_fname: 'Fvienj',
    dentist_lname: 'Nopuente',
    dentist_specialty: 'Oral Surgery',
    dentist_phone: '+63 912 345 6789', // clinic line, replace with the dentist's own number
    dentist_email: 'fvienj.nopuente@bagangdental.com',
  },
];

// Every dentist works Monday (1) to Saturday (6), 8:00 AM to 5:00 PM. Sunday (0) is closed.
export const WORKING_DAYS = [1, 2, 3, 4, 5, 6];
export const WORK_START = '08:00';
export const WORK_END = '17:00';

// Bookable start times shown on the website.
export const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
