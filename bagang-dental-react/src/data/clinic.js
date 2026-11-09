// Shared clinic data used by the Services and Book pages.

export const services = [
  { id: 'bonding', icon: '🦷', name: 'Dental Bonding', description: 'Restore and enhance your smile with tooth-colored resin bonding.', costLabel: 'Php 150k', bookingLabel: 'Php 150k', cost: 150000, duration: '30 - 60 minutes' },
  { id: 'crowns', icon: '👑', name: 'Dental Crowns', description: 'Protect and strengthen damaged teeth with durable dental crowns.', costLabel: 'Php 20k - Php 40k', bookingLabel: 'Php 20k-40k', cost: 30000, duration: '2 - 3 appointments' },
  { id: 'dentures', icon: '😁', name: 'Dentures', description: 'Replace missing teeth with comfortable and natural-looking dentures.', costLabel: 'Php 5k - Php 12k', bookingLabel: 'Php 5k-12k', cost: 8500, duration: '3 - 5 appointments' },
  { id: 'cleaning', icon: '✨', name: 'Teeth Cleaning', description: 'Professional cleaning to remove plaque and tartar buildup.', costLabel: 'Php 800 - Php 1.2k', bookingLabel: 'Php 800-1.2k', cost: 1000, duration: '45 - 60 minutes' },
  { id: 'extractions', icon: '🔧', name: 'Tooth Extractions', description: 'Safe and painless removal of problematic or damaged teeth.', costLabel: 'Php 500 - Php 1.5k', bookingLabel: 'Php 500-1.5k', cost: 1000, duration: '20 - 40 minutes' },
  { id: 'braces', icon: '⛓', name: 'Dental Braces', description: 'Gradually guide your teeth into their ideal position.', costLabel: 'Php 28k - 300k', bookingLabel: 'Php 28k-300k', cost: 50000, duration: '12 - 14 months', bookingName: 'Orthodontic Braces' },
];

export const dentists = [
  {
    id: 'monica',
    initials: 'ME',
    name: 'Monica Empleo',
    title: 'Licensed Dental Specialist',
    bio: 'Experienced in cosmetic and restorative dentistry with over 10 years of practice.',
    focus: 'Cosmetic & Restorative',
    info: [
      ['Specialization', 'Cosmetic & restorative dentistry'],
      ['Email', 'monica.empleo@bagangdental.com'],
      ['Status', 'Active'],
      ['License No.', 'DENT-102948'],
      ['Date of Birth', 'April 12, 1986'],
      ['Schedule', 'Monday - Saturday, 8:00 AM - 5:00 PM'],
    ],
  },
  {
    id: 'fvienj',
    initials: 'FN',
    name: 'Fvienj Nopuente',
    title: 'General & Oral Surgery Dentist',
    bio: 'Specializes in surgical extractions and complex dental procedures with precision and care.',
    focus: 'Oral Surgery',
    info: [
      ['Specialization', 'Oral surgery & extractions'],
      ['Email', 'fvienj.nopuente@bagangdental.com'],
      ['Status', 'Active'],
      ['License No.', 'DENT-207531'],
      ['Date of Birth', 'September 3, 1984'],
      ['Schedule', 'Monday - Saturday, 8:00 AM - 5:00 PM'],
    ],
  },
];

export const timeSlots = [
  ['08:00', '8:00 AM'], ['09:00', '9:00 AM'], ['10:00', '10:00 AM'], ['11:00', '11:00 AM'],
  ['13:00', '1:00 PM'], ['14:00', '2:00 PM'], ['15:00', '3:00 PM'], ['16:00', '4:00 PM'],
];

export const CLINIC = {
  phone: '+63 912 345 6789',
  phoneHref: 'tel:+639123456789',
  email: 'hello@bagangdental.com',
  coords: [8.4851, 124.6565],
};
