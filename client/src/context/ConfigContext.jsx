import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const ConfigContext = createContext(null);

// Sensible fallback so the UI renders even before the API responds.
const FALLBACK = {
  business: {
    name: "Rupali's Homemade Delights",
    tagline: 'Home-cooked | Fresh ingredients | Made with love',
    address: '83 Pasir Ris Grove, NV Residences #13-06, 518211',
    whatsapp: '+6583136991',
    whatsappDisplay: '+65 8313 6991',
    paymentMethods: ['PayNow', 'PayLah', 'Cash'],
    fulfilment: ['Pickup', 'Delivery'],
  },
  pricing: { regularMeal: 12, specialItem: 15, comboPrice: 25, comboSize: 2 },
  timings: {
    lunch: { label: 'Lunch', window: '1:00 PM – 2:00 PM', cutoff: 'Confirm by previous night or same day before 9:00 AM' },
    dinner: { label: 'Dinner', window: '6:30 PM – 7:30 PM', cutoff: 'Confirm by 4:00 PM same day' },
  },
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);

  useEffect(() => {
    api
      .get('/config')
      .then(setConfig)
      .catch(() => setConfig(FALLBACK));
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export const useConfig = () => useContext(ConfigContext);
