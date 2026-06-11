export function getWhatsAppUrl(number, message = '') {
  const cleanNumber = number.replace(/\D/g, '');
  const base = `https://wa.me/${cleanNumber}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}
