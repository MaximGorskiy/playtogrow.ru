import { CONTACTS } from './contact-config.js';

const pageLanguage = document.documentElement.dataset.pageLanguage === 'en' ? 'en' : 'ru';
const isLocalPreview = ['localhost', '127.0.0.1', ''].includes(location.hostname);

function contactHref(type, value) {
  if (type === 'email') return `mailto:${value}`;
  if (type === 'phone') return `tel:${value.replace(/[^+\d]/g, '')}`;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, '')}`;
}

function renderContacts() {
  let configured = 0;
  document.querySelectorAll('[data-contact]').forEach((card) => {
    const type = card.dataset.contact;
    const value = String(CONTACTS[type] || '').trim();
    const output = card.querySelector(`[data-contact-value="${type}"]`);
    if (!value) {
      card.href = '#contact';
      card.classList.add('is-missing');
      output.textContent = pageLanguage === 'en' ? 'To be confirmed' : 'Контакт уточняется';
      return;
    }
    configured += 1;
    card.classList.remove('is-missing');
    card.href = contactHref(type, value);
    if (type === 'telegram') {
      card.target = '_blank';
      card.rel = 'noreferrer';
    }
    output.textContent = value;
  });
  const missing = document.querySelector('[data-contact-missing]');
  if (missing) missing.hidden = configured === 3;
}

if (isLocalPreview) {
  document.querySelectorAll('[data-language][data-local-url]').forEach((link) => {
    link.href = link.dataset.localUrl;
  });
}

renderContacts();
