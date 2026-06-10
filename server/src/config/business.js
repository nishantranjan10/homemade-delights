// Central source of truth for business details, pricing and timings.
// Kept in one place so it can be served to the frontend and reused server-side.

export const BUSINESS = {
  name: "Rupali's Homemade Delights",
  tagline: 'Home-cooked | Fresh ingredients | Made with love',
  address: '83 Pasir Ris Grove, NV Residences #13-06, 518211',
  whatsapp: '+6583136991', // E.164, used for wa.me links
  whatsappDisplay: '+65 8313 6991',
  paymentMethods: ['PayNow', 'PayLah', 'Cash'],
  fulfilment: ['Pickup', 'Delivery'],
};

export const PRICING = {
  regularMeal: 12, // Lunch or Dinner
  specialItem: 15, // Pre-order only
  comboPrice: 25, // any 2 special items
  comboSize: 2,
};

export const TIMINGS = {
  lunch: {
    label: 'Lunch',
    window: '1:00 PM – 2:00 PM',
    cutoff: 'Confirm by previous night or same day before 9:00 AM',
  },
  dinner: {
    label: 'Dinner',
    window: '6:30 PM – 7:30 PM',
    cutoff: 'Confirm by 4:00 PM same day',
  },
};

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
