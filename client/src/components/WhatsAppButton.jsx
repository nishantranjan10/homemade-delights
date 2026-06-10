import { useConfig } from '../context/ConfigContext.jsx';
import { whatsappLink } from '../utils.js';

// Reusable WhatsApp CTA. Pass a custom `message` to pre-fill the chat.
export default function WhatsAppButton({
  message = 'Hi Rupali, I would like to place an order!',
  className = '',
  children,
}) {
  const { business } = useConfig();
  return (
    <a
      href={whatsappLink(business.whatsapp, message)}
      target="_blank"
      rel="noreferrer"
      className={`btn-whatsapp ${className}`}
    >
      💬 {children || `WhatsApp ${business.whatsappDisplay}`}
    </a>
  );
}
