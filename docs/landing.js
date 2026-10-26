import { CONTACTS } from './contact-config.js';

const DEFAULT_LANGUAGE = document.documentElement.dataset.defaultLanguage === 'en' ? 'en' : 'ru';
const SITE_VERSION = '20261026-1';
const LANGUAGE_KEY = `playtogrow:language:${location.pathname.split('/').filter(Boolean)[0] || 'root'}`;
const REQUESTED_LANGUAGE = new URLSearchParams(location.search).get('lang');
let language = ['ru', 'en'].includes(REQUESTED_LANGUAGE) ? REQUESTED_LANGUAGE : localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
if (!['ru', 'en'].includes(language)) language = DEFAULT_LANGUAGE;

const english = {
  skip: 'Skip to content', slogan: 'play to grow', navLabel: 'Main navigation', navIdea: 'The idea', navParticipants: 'Participants', navPilot: 'Pilot', navContact: 'Contact', languageLabel: 'Site language', openDemo: 'Open demo',
  heroEyebrow: 'A pilot project for families and psychologists', heroTitle: "Turning an interest in games into a driving force for a child's development", heroLead: 'A child chooses useful quests, gets adult support, and moves toward agreed gaming rewards — without shame, pressure, or fighting their interests.', joinPilot: 'Join the pilot', viewDemo: 'View the demo', heroNote: 'We are currently testing the idea with the first families. No registration or child data is required on this website.', visualQuest: 'Quest', visualStep: 'Step', visualGrowth: 'Growth',
  recruitEyebrow: 'Pilot recruitment is open', recruitTitle: 'I am looking for patients and families affected by computer and gaming addiction', recruitText: 'At this first stage, I am looking for parents with a child or teenager whose gaming causes conflict or displaces school, movement, relationships, or other important activities. Together, we will test whether familiar gaming motivation can help restore interest in real-life growth.', recruitLabel: 'Who the pilot is for', badgeFamily: 'Families with children and teens', badgeVoluntary: 'Voluntary participation', badgeDialogue: 'Open dialogue',
  howEyebrow: 'How the idea works', howTitle: 'Instead of taking games away, make them a bridge to useful action', howIntro: 'Goals and rewards are agreed within the family in advance. The child keeps a sense of choice, the adult notices the effort, and a specialist helps keep the focus on development.', step1Title: 'Choose a goal', step1Text: 'Learning, reading, movement, creativity, relationships, or independence — only what genuinely matters to the child and family.', step2Title: 'Complete a quest', step2Text: 'The child chooses a quest, completes it, and publishes the results.', step3Title: 'Recognize progress', step3Text: 'Together with a psychologist, we analyze progress over time and plan improvements.',
  rolesEyebrow: 'Three participants — one team', rolesTitle: 'Each participant has specific actions in the system', childTitle: 'Child', childText: 'Chooses a quest, submits the result, earns points, and requests an agreed gaming reward.', parentTitle: 'Parent', parentText: "Confirms the report, confirms delivery of the reward, and contributes financially to the project's development according to the family's means.", moderatorTitle: 'Moderator', moderatorText: "Adds a psychologist's professional expertise to the quest set, continuously analyzes the child's progress, and oversees the process.",
  stageEyebrow: 'An honest note on the project stage', stageTitle: 'This is a pilot, not a finished medical program', stageText: 'We are gathering feedback, refining the method, and testing scenarios with families and psychologists. The platform does not diagnose, replace a doctor or psychotherapist, or promise guaranteed outcomes.', tryDemo: 'Try the prototype →', financeEyebrow: 'Transparent funding', financeTitle: 'All funds go only toward developing the project', financeText: 'During the pilot, participating parents fund the project. All funds received go to development, infrastructure, and improving the project. The project author takes no personal profit. Earning revenue is planned only after the platform is launched.', financeDevelopment: 'Development', financeInfrastructure: 'Infrastructure', financeResearch: 'Method development',
  specialistEyebrow: 'An invitation to professionals', specialistTitle: 'I am looking for psychologists for professional dialogue and collaboration', specialistText: 'If you work with children, teenagers, families, or problematic gaming behavior, let us discuss the method, ethical boundaries, and pilot format. Professional criticism is as valuable here as support.',
  contactEyebrow: 'Get in touch directly', contactTitle: 'Tell me briefly about your situation or propose a collaboration', contactText: 'For the first conversation, please do not send diagnoses, documents, or other sensitive information. Simply say whether you are a parent or a professional and how you would prefer to be contacted.', phoneLabel: 'Phone', contactMissing: 'Public contact details will be added before publication.', footerSlogan: 'Play to Grow · Turn play into growth', footerNote: 'Pilot project. This website does not collect personal data and is not a medical service.', toTop: 'Back to top ↑',
};

const russian = new Map();
document.querySelectorAll('[data-i18n]').forEach((element) => russian.set(element.dataset.i18n, element.textContent));
const text = (key) => language === 'en' ? english[key] : russian.get(key);

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
      output.textContent = language === 'en' ? 'To be confirmed' : 'Контакт уточняется';
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
  document.querySelector('[data-contact-missing]').hidden = configured === 3;
}

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = text(element.dataset.i18n);
    if (value) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = text(element.dataset.i18nAriaLabel);
    if (value) element.setAttribute('aria-label', value);
  });
  document.querySelectorAll('[data-language]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  const demoUrl = document.documentElement.dataset.demoUrl || './demo.html';
  document.querySelectorAll('[data-demo-link]').forEach((link) => link.setAttribute('href', `${demoUrl}?lang=${language}&v=${SITE_VERSION}#child/day`));
  document.title = language === 'en' ? 'Play to Grow — turn play into growth' : 'Play to Grow — играй, чтобы расти';
  renderContacts();
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-language]');
  if (!button) return;
  const nextLanguage = button.dataset.language === 'en' ? 'en' : 'ru';
  localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  const url = new URL(location.href);
  url.searchParams.set('lang', nextLanguage);
  history.replaceState(null, '', url);
  applyLanguage(nextLanguage);
});

applyLanguage(language);
