import { CATEGORIES, ROLES, STATUS, createDemo, balance, earned, dayKey, limitsUsed, rewardAvailability, transition, validateState } from './model.js';

const STORAGE_SCOPE = location.pathname.replace(/(?:index|demo)\.html$/, '');
const KEY = `playtogrow:demo:v1:${STORAGE_SCOPE}`;
const LEGACY_KEY = `questrost:demo:v1:${STORAGE_SCOPE}`;
const LANG_KEY = `playtogrow:language:${location.pathname.split('/').filter(Boolean)[0] || 'root'}`;
const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const DEFAULT_LANG = document.documentElement.dataset.defaultLanguage === 'en' ? 'en' : 'ru';
const PUBLIC_HOSTS = new Set(['playtogrow.ru', 'www.playtogrow.ru', 'playtogrow.online', 'www.playtogrow.online']);
const REQUESTED_LANG = new URLSearchParams(location.search).get('lang');
let lang = ['ru', 'en'].includes(REQUESTED_LANG) ? REQUESTED_LANG : PUBLIC_HOSTS.has(location.hostname) ? DEFAULT_LANG : localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
if (!['ru', 'en'].includes(lang)) lang = DEFAULT_LANG;
localStorage.setItem(LANG_KEY, lang);
const englishDemo = createDemo();
const L = (ru, en) => lang === 'en' ? en : ru;
const dataText = (item, field) => lang === 'en' && item?.[`${field}En`] ? item[`${field}En`] : item?.[field] || '';
const categoryName = id => lang === 'en' ? CATEGORIES[id].labelEn : CATEGORIES[id].label;
const roleName = id => L(ROLES[id], { child: 'Child', parent: 'Parent', moderator: 'Moderator' }[id]);
const statusName = id => L(STATUS[id], { available: 'Available', active: 'In progress', review: 'Awaiting review', revision: 'Needs an update', done: 'Completed' }[id]);
const TRANSLATIONS = new Map([
  ['Перейти к содержимому', 'Skip to content'], ['играй, чтобы расти.', 'turn play into growth.'],
  ['СЕМЕЙНОЕ ПРОСТРАНСТВО', 'FAMILY SPACE'], ['Задания, отчеты и награды', 'Quests, reports, and rewards'],
  ['Основная навигация', 'Main navigation'], ['Мой день', 'My day'], ['Мои награды', 'My rewards'], ['Мой прогресс', 'My progress'], ['Наша команда', 'Our team'],
  ['Обзор', 'Overview'], ['Проверка заданий', 'Quest review'], ['Награды', 'Rewards'], ['Договоренности', 'Family agreement'], ['План развития', 'Growth plan'], ['Библиотека заданий', 'Quest library'], ['Прогресс', 'Progress'], ['Команда', 'Team'], ['Как это работает', 'How it works'],
  ['Как получить награду', 'How to earn a reward'], ['Выбери задание, отправь отчет', 'Choose a quest and send a report'], ['и накопи баллы.', 'to earn points.'], ['О демоверсии', 'About the demo'],
  ['Мое пространство', 'My space'], ['Демо', 'Demo'], ['Роль участника', 'Participant role'], ['Ребенок', 'Child'], ['Родитель', 'Parent'], ['Модератор', 'Moderator'],
  ['Три роли, один браузер. Все данные — учебные и сохраняются на этом устройстве.', 'Three roles, one browser. All demo data stays on this device.'], ['Как попробовать', 'Try the demo'], ['Восстановить', 'Restore'],
  ['Играй, чтобы расти.', 'Play to grow.'], ['Демонстрационный режим · Без регистрации', 'Demo mode · No account required'],
  ['Задания и игровые награды', 'Quests and gaming rewards'], ['Проверка заданий и выдача наград', 'Quest review and reward delivery'], ['Настройка заданий и плана развития', 'Quest and development plan setup'], ['Выбери задание, выполни его и отправь результат родителю.', 'Choose a quest, complete it, and send the result to your parent.'], ['Добавить задание', 'Add a quest'],
  ['ЗАДАНИЯ В РЕАЛЬНОСТИ — БОНУСЫ В ИГРЕ', 'REAL-WORLD QUESTS — IN-GAME REWARDS'], ['РОДИТЕЛЬСКИЙ КАБИНЕТ', 'PARENT DASHBOARD'], ['КАБИНЕТ МОДЕРАТОРА', 'MODERATOR DASHBOARD'],
  ['Получай внутриигровые бонусы за выбранные тобой задания и реальные успехи.', 'Earn in-game bonuses for the real-world quests you choose and complete.'], ['Проверяйте результаты и выдавайте согласованные игровые награды.', 'Review results and provide the agreed gaming rewards.'], ['Добавляйте задания и настраивайте план развития.', 'Add quests and adjust the development plan.'],
  ['Выполни задание, отправь короткий отчет родителю и получи баллы. Баллы можно обменять на заранее согласованные игровые награды.', 'Complete a quest, send a short report to your parent, and earn points. Points can be exchanged for gaming rewards agreed in advance.'], ['Ребенок отправляет отчет. После вашего подтверждения система начисляет баллы; затем вы подтверждаете фактическую выдачу награды.', "The child sends a report. After your approval, the system awards points; you then confirm that the reward was actually delivered."], ['Выберите направление, задайте условия и баллы, затем отслеживайте отчеты и прогресс.', 'Choose an area, set the requirements and points, then track reports and progress.'],
  ['Выбрать задание', 'Choose a quest'], ['Настроить план', 'Update the plan'], ['Проверить отчеты', 'Review reports'], ['Прогресс участника', 'Participant progress'], ['Доступно для наград', 'Available for rewards'], ['Посмотреть награды', 'View rewards'], ['Подтверждено сегодня', 'Approved today'], ['Заданий ждут проверки', 'Quests awaiting review'],
  ['Твои текущие задания', 'Your current quests'], ['Сейчас в работе', 'In progress now'], ['Выбери следующее задание', 'Choose your next quest'], ['Доступные задания', 'Available quests'], ['Начни одно из доступных заданий. Можно выбрать то, которое тебе подходит.', 'Start one of the available quests. Choose the one that works for you.'], ['Ребенок выбирает одно из предложенных заданий.', 'The child chooses one of the available quests.'],
  ['В этом направлении пока нет заданий', 'No quests in this area yet'], ['Можно выбрать другое направление или добавить задание из кабинета взрослого.', 'Choose another area or add a quest from an adult account.'],
  ['СЛЕДУЮЩАЯ ДОСТУПНАЯ НАГРАДА', 'NEXT AVAILABLE REWARD'], ['Время для игры', 'Game time'], ['Выполняй задания и копи баллы', 'Complete quests and earn points'], ['для этой награды.', 'for this reward.'], ['К наградам', 'View rewards'], ['ФОКУС РАЗВИТИЯ', 'GROWTH FOCUS'], ['Модератор команды', 'Team moderator'], ['Баллы начисляются после подтверждения задания родителем.', 'Points are awarded after a parent approves the quest.'],
  ['Направление заданий', 'Quest area'], ['Все квесты', 'All quests'], ['Подробнее', 'Details'], ['Отчет', 'Report'], ['Продолжить', 'Continue'], ['Проверить', 'Review'], ['Открыть', 'Open'],
  ['НАГРАДЫ ЗА ПОДТВЕРЖДЕННЫЕ ЗАДАНИЯ', 'REWARDS FOR APPROVED QUESTS'], ['Выбери награду, на которую хватает баллов', 'Choose a reward you have enough points for'], ['Награды и договоренности', 'Rewards and agreements'], ['Баллы Play to Grow можно обменять на согласованные с родителем награды.', 'Play to Grow points can be exchanged for rewards agreed with a parent.'], ['Вместе', 'Together'], ['Хочу эту награду', 'Request this reward'], ['Общее занятие выбирает семья', 'The family chooses the shared activity'], ['Выдачу подтверждает родитель', 'A parent confirms delivery'],
  ['История наград', 'Reward history'], ['Баллы зарезервированы', 'Points reserved'], ['Выдано родителем', 'Delivered by parent'], ['Отменено, баллы возвращены', 'Cancelled, points returned'], ['Подтвердить выдачу', 'Confirm delivery'], ['Отменить', 'Cancel'], ['Ждет родителя', 'Waiting for parent'], ['Выдано', 'Delivered'], ['Отменено', 'Cancelled'], ['Здесь будут твои награды', 'Your rewards will appear here'], ['Выбери награду из каталога — родитель увидит заявку в своем кабинете.', 'Choose a reward from the catalog. Your parent will see the request in their account.'],
  ['ПОДДЕРЖКА ВМЕСТО ОЦЕНОК', 'SUPPORT INSTEAD OF GRADES'], ['Замечаем каждый шаг', 'Every step matters'], ['Прочитайте отчет, обсудите результат и помогите, если что-то не получилось.', 'Read the report, discuss the result, and help if something did not work out.'], ['Ждут вашей проверки', 'Waiting for your review'], ['Все отчеты проверены', 'All reports are reviewed'], ['Новые появятся здесь, когда ребенок расскажет о выполненном задании.', 'New reports will appear here after the child shares what they completed.'], ['Уже посмотрели', 'Already reviewed'], ['Посмотреть и проверить', 'Open and review'],
  ['ТВОЙ ПУТЬ В РЕАЛЬНОМ МИРЕ', 'YOUR REAL-WORLD JOURNEY'], ['Большое начинается с малого', 'Big growth starts small'], ['Здесь видны выполненные дела и направления, в которых ты пробуешь себя.', 'See what you have completed and the areas you are exploring.'], ['Шаги за неделю', 'Steps this week'], ['Количество подтвержденных заданий', 'Confirmed quests'], ['Что ты развиваешь', 'Skills you are growing'], ['Опыт за выполненные задания', 'XP from completed quests'], ['Твои достижения', 'Your achievements'], ['Первый шаг', 'First step'], ['Выполни первое задание', 'Complete your first quest'], ['Пробую разное', 'Trying new things'], ['Задания трех направлений', 'Complete quests in three areas'], ['Пять побед', 'Five wins'], ['Выполни пять заданий', 'Complete five quests'], ['Открыто', 'Unlocked'], ['Впереди', 'Still ahead'],
  ['ДОГОВАРИВАЕМСЯ ЗАРАНЕЕ', 'AGREE ON THE RULES FIRST'], ['Понятные правила для всех', 'Clear rules for everyone'], ['Выберите вместе, какие награды радуют ребенка и подходят семье.', 'Choose rewards together that motivate the child and work for the family.'], ['Семейные договоренности', 'Family agreement'], ['Имя или псевдоним ребенка', "Child's name or nickname"], ['Любимая игра', 'Favorite game'], ['Игровое время в день, мин', 'Game time per day, min'], ['Бюджет наград в неделю, ₽', 'Weekly reward budget, ₽'], ['Сохранить договоренности', 'Save agreement'], ['Правила поддерживают', 'Rules that support growth'], ['Выбор остается у ребенка', 'The child keeps the choice'], ['Предложите несколько подходящих заданий. Можно попросить помощи или попробовать позже.', 'Offer several suitable quests. The child can ask for help or try later.'], ['Награды обсуждаются заранее', 'Agree on rewards in advance'], ['Понятная стоимость в баллах, доступный бюджет и конкретный способ получения.', 'Use a clear point cost, an affordable budget, and a specific delivery method.'], ['Игра остается частью дня', 'Games remain one part of the day'], ['Лимит общий для игровых наград. Сам сайт не блокирует устройства и не измеряет время в игре.', 'The family limit applies to game rewards. The site does not block devices or measure play time.'],
  ['ИДЕИ ДЛЯ РОСТА', 'IDEAS FOR GROWTH'], ['У каждого квеста есть смысл', 'Every quest has a purpose'], ['Добавьте подходящее задание в план и адаптируйте сложность под ребенка.', "Add a suitable quest and adjust it to the child's current abilities."], ['Свое задание', 'Custom quest'], ['В план', 'Add to plan'],
  ['НА ОДНОЙ СТОРОНЕ', 'ON THE SAME TEAM'], ['Твоя команда поддержки', 'Your support team'], ['Ребенок выбирает, родитель поддерживает, модератор помогает с направлением.', 'The child chooses, the parent supports, and the moderator helps guide the plan.'], ['Выбирает квесты, пробует новое, рассказывает о результате и решает, на что копить баллы.', 'Chooses quests, tries new things, shares the result, and decides what to save points for.'], ['Проверяет задания, обсуждает правила, помогает получить награды и замечает усилия.', 'Reviews quests, agrees on rules, helps deliver rewards, and notices the effort.'], ['Подбирает задания по направлениям развития, меняет фокус и дает обратную связь.', 'Selects quests by growth area, updates the focus, and gives feedback.'], ['НАША ОБЩАЯ ЦЕЛЬ', 'OUR SHARED GOAL'], ['Изменить цель', 'Change goal'],
  ['Закрыть', 'Close'], ['Обратная связь', 'Feedback'], ['Выбирай, если тебе интересно. После выполнения расскажи, что получилось.', 'Choose this quest if it interests you. When you finish, tell us how it went.'], ['Беру этот квест', 'Start this quest'], ['Что у тебя получилось?', 'How did it go?'], ['Расскажи, что ты сделал, что понравилось или где понадобилась помощь…', 'Tell us what you did, what you enjoyed, or where you needed help…'], ['Достаточно нескольких предложений. Фото и личные данные не нужны.', 'A few sentences are enough. No photos or personal information are needed.'], ['Отправить на проверку', 'Send for review'], ['Что получилось хорошо? Что можно попробовать еще?', 'What went well? What could they try next?'], ['Нужно дополнить', 'Needs an update'],
  ['Новый квест', 'New quest'], ['Название', 'Title'], ['Например, прогулка с открытием', 'For example, a discovery walk'], ['Направление', 'Area'], ['Что нужно сделать и как показать результат', 'What to do and how to share the result'], ['Небольшая понятная задача, посильная ребенку…', 'A small, clear quest that is manageable for the child…'], ['Баллы за выполнение', 'Points for completion'], ['Примерно минут', 'Approx. minutes'], ['Добавить в план', 'Add to plan'], ['Фокус развития', 'Growth focus'], ['Наша цель', 'Our goal'], ['Приоритетное направление', 'Priority area'], ['Сохранить цель', 'Save goal'],
  ['Попробуйте Play to Grow', 'Try Play to Grow'], ['Реальные дела. Игровые награды. Поддержка команды.', 'Real-world actions. Game-related rewards. Support from your team.'], ['Награда', 'Reward'], ['Скачать копию', 'Download backup'], ['Восстановить из файла', 'Restore from file'], ['Скачать исходные данные', 'Download raw data'], ['Начать демо заново', 'Reset demo'], ['Попросить награду', 'Request a reward'], ['Отправить заявку', 'Send request'], ['Подтверждение выдачи', 'Confirm reward delivery'], ['Награда выдана', 'Reward delivered'], ['Начать заново?', 'Start over?'], ['Скачать текущую копию', 'Download current backup'], ['Сбросить демо', 'Reset demo'], ['Восстановить копию?', 'Restore this backup?'], ['Заменить данные', 'Replace data'],
  ['Сохраненные данные недоступны или повреждены. Они не перезаписаны. Можно скачать исходные данные или явно сбросить демо.', 'Saved data is unavailable or damaged. It has not been overwritten. Download the raw data or explicitly reset the demo.'], ['Сначала восстановите хранилище в разделе «О демоверсии».', 'Restore browser storage from “About the demo” first.'], ['Браузер не сохранил изменения. Проверьте доступ к локальному хранилищу и свободное место.', 'The browser could not save the change. Check local storage access and available space.'],
]);
[
  ['Play to Grow · 2026', 'Play to Grow · 2026'], ['баллов', 'points'], ['опыта', 'XP'], ['выполнено', 'completed'], ['на проверке', 'awaiting review'],
  ['баллов доступно', 'points available'], ['Сайт учитывает договоренности. Игровое время, валюту и бонусы предоставляет родитель; автоматического подключения к играм нет. Баллы резервируются при заявке и возвращаются при отмене.', 'The site follows the family agreement. A parent provides game time, currency, and bonuses; there is no automatic game connection. Points are reserved when requested and returned if cancelled.'],
  ['Это учебная команда. Переключатель ролей позволяет попробовать весь сценарий на одном устройстве. Для реальных отдельных учетных записей и совместной работы потребуется сервер.', 'This is a demo team. The role switch lets you try the full flow on one device. Real separate accounts and collaboration will require a server.'],
  ['При возврате на доработку объясните, что нужно дополнить (от 5 символов). Баллы начисляются один раз после подтверждения.', 'When asking for an update, explain what is missing (at least 5 characters). Points are awarded once, after approval.'],
  ['Подтвердить', 'Approve'], ['Подтвердить ·', 'Approve ·'], ['Беру этот квест', 'Start this quest'], ['ОТЧЕТ РЕБЕНКА', "CHILD'S REPORT"],
  ['После отправки баллы будут зарезервированы. Родитель подтвердит выдачу. Пока награда не выдана, заявку можно отменить и вернуть баллы.', 'After sending, the points will be reserved. A parent confirms delivery. Until then, the request can be cancelled and the points returned.'],
  ['Подтвердите после того, как предоставили награду ребенку. Это запись в истории; сайт сам не запускает игру и не покупает валюту.', 'Confirm only after giving the reward to the child. This records the event; the site does not launch games or purchase currency.'],
  ['Опишите понятное повседневное изменение, которое сможете замечать вместе.', 'Describe a clear everyday change that everyone can notice together.'],
  ['Примерные значения для демонстрации, а не рекомендации по возрасту. Неделя начинается в понедельник; день — по московскому времени. Ожидающие заявки резервируют лимит до выдачи или отмены.', 'These are demo values, not age-based recommendations. The week starts on Monday; days use Moscow time. Pending requests reserve the allowance until delivery or cancellation.'],
  ['Достигнут дневной лимит игрового времени. Обсуди с родителем другой день.', 'The daily game-time limit has been reached. Talk with your parent about another day.'],
  ['Эта награда выходит за недельный бюджет семьи.', "This reward is outside the family's weekly budget."],
  ['Откройте «Еще одна глава», напишите отчет и отправьте на проверку.', 'Open “One More Chapter,” write a short report, and send it for review.'],
  ['Переключите роль вверху страницы. Проверьте отчет — баллы появятся у ребенка.', "Switch roles at the top of the page. Review the report and the child's points will update."],
  ['От ребенка запросите награду. От родителя подтвердите ее выдачу.', 'Request a reward as the child, then confirm delivery as the parent.'],
  ['Выберите фокус развития и добавьте квест из библиотеки.', 'Choose a growth focus and add a quest from the library.'],
  ['Демо для проверки идеи, не медицинская программа. Переключение ролей не защищает данные. Сведения хранятся только в этом браузере, без синхронизации и подключения к играм. Используйте вымышленные данные.', 'This demo explores the idea; it is not a medical program. Switching roles does not protect data. Information stays in this browser, with no sync or game connection. Use fictional details.'],
  ['Копия содержит задания, отчеты и историю. Импорт заменяет текущее демо. Можно переносить копию между браузерами вручную.', 'The backup contains quests, reports, and history. Import replaces the current demo. You can move a backup between browsers manually.'],
  ['Все изменения в демоверсии этого браузера будут заменены исходным примером. Сначала можно сохранить копию.', 'All changes in this browser demo will be replaced with the original example. You can save a backup first.'],
  ['Квест выбран. Можно начинать в своем темпе!', 'Quest selected. Start when you are ready!'],
  ['Заявка отправлена родителю. Баллы зарезервированы.', 'Request sent to the parent. Points are reserved.'],
  ['Выдача награды отмечена.', 'Reward delivery recorded.'], ['Заявка отменена. Баллы снова доступны.', 'Request cancelled. The points are available again.'],
  ['Демо восстановлено. Можно попробовать другой сценарий.', 'The demo has been reset. You can try another scenario.'], ['Копия восстановлена.', 'Backup restored.'],
  ['Отчет отправлен. Взрослый проверит его и начислит баллы.', 'Report sent. An adult will review it and award points.'],
  ['Задание возвращено с подсказкой. Ребенок может дополнить отчет.', 'The quest was returned with guidance. The child can update the report.'],
  ['Задание подтверждено, баллы начислены!', 'Quest approved and points awarded!'], ['Квест добавлен в план ребенка.', "Quest added to the child's plan."],
  ['Семейные договоренности сохранены.', 'Family agreement saved.'], ['Фокус развития обновлен.', 'Growth focus updated.'],
  ['Данные обновлены в другой вкладке.', 'Data updated in another tab.'], ['Браузер не разрешает чтение хранилища.', 'The browser does not allow access to storage.'],
  ['Браузер не разрешает сохранить данные. Изменения не применены.', 'The browser does not allow saving. No changes were applied.'],
].forEach(([ru, en]) => TRANSLATIONS.set(ru, en));
const PATTERNS = [
  [/^Команда (.+)$/, 'Team $1'], [/^Привет, (.+)!$/, 'Hi, $1!'], [/^Уровень (\d+)$/, 'Level $1'], [/^ИССЛЕДОВАТЕЛЬ · УРОВЕНЬ (\d+)$/, 'EXPLORER · LEVEL $1'],
  [/^(\d+) баллов$/, '$1 points'], [/^(\d+) опыта$/, '$1 XP'], [/^(\d+) выполнено$/, '$1 completed'], [/^(\d+) на проверке$/, '$1 awaiting review'], [/^(\d+) мин$/, '$1 min'], [/^\+(\d+) баллов$/, '+$1 points'],
  [/^(\d+) мин · \+(\d+) баллов$/, '$1 min · +$2 points'], [/^\/ (\d+) баллов$/, '/ $1 points'], [/^Уже (\d+) маленьких побед$/, '$1 small wins already'], [/^(\d+) опыта · еще (\d+) до следующего уровня$/, '$1 XP · $2 to the next level'],
  [/^(\d+) \/ (\d+) мин сегодня и в заявках$/, '$1 / $2 min today and in requests'], [/^(\d+) \/ (\d+) ₽ на этой неделе и в заявках$/, '₽$1 / ₽$2 this week and in requests'], [/^ОТЧЕТ (.+)$/, "$1'S REPORT"],
  [/^Еще (\d+) баллов до награды$/, '$1 more points needed'], [/^Подтвердить · \+(\d+)$/, 'Approve · +$1'],
];
function translateText(value) {
  if (lang !== 'en' || !value) return value;
  const match = String(value).match(/^(\s*)(.*?)(\s*)$/s); let core = match[2];
  core = TRANSLATIONS.get(core) || core;
  for (const [pattern, replacement] of PATTERNS) if (pattern.test(core)) { core = core.replace(pattern, replacement); break; }
  return match[1] + core + match[3];
}
function applyLocale(root = document) {
  document.documentElement.lang = lang;
  document.title = L('Play to Grow — играй, чтобы расти', 'Play to Grow — turn play into growth');
  document.querySelector('meta[name="description"]')?.setAttribute('content', L('Play to Grow — играй, чтобы расти. Семейная платформа развития с заданиями, поддержкой родителей и модератора.', 'Play to Grow turns gaming motivation into small real-world steps, with family support, quests, and agreed rewards.'));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes = [];
  while (walker.nextNode()) if (!['SCRIPT', 'STYLE', 'TEXTAREA'].includes(walker.currentNode.parentElement?.tagName)) nodes.push(walker.currentNode);
  for (const node of nodes) node.nodeValue = translateText(node.nodeValue);
  root.querySelectorAll?.('[aria-label],[placeholder]').forEach(el => {
    for (const attr of ['aria-label', 'placeholder']) if (el.hasAttribute(attr)) el.setAttribute(attr, translateText(el.getAttribute(attr)));
  });
  document.querySelector('.skip-link').textContent = L('Перейти к содержимому', 'Skip to content');
}
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>',
  book: '<path d="M12 5v15M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1Z"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-4h2a4 4 0 0 0 4-4c0-3-4-6-9-6Z"/><path d="M7 9h.01M11 6h.01M16 7h.01M6 14h.01"/>',
  home: '<path d="m3 10 9-7 9 7v10H3Zm6 10v-7h6v7"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3Zm0 0h4a3 3 0 1 0-3-3Z"/>',
  chart: '<path d="M4 3v17h17M8 15v-4m5 4V7m5 8v-5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 5-4 5-4-5Z"/>',
  leaf: '<path d="M20 3c-13 0-18 6-14 12s14 3 14-12ZM4 21l11-12"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  game: '<path d="M7 6h10c4 0 6 13 2 13-2 0-3-4-5-4h-4c-2 0-3 4-5 4C1 19 3 6 7 6Z M7 9v5m-2-2h4m6-1h.01m3 2h.01"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const button = (label, action, id = '', cls = 'btn', disabled = false) => `<button type="button" class="${cls}" data-action="${action}" data-id="${escape(id)}" ${disabled ? 'disabled' : ''}>${label}</button>`;
const categoryBadge = category => `<span class="tag ${CATEGORIES[category].color}">${icon(CATEGORIES[category].icon)}${categoryName(category)}</span>`;
const stampLabel = date => new Date(date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', timeZone: 'Europe/Moscow' });
const navigation = {
  child: [['day', 'grid', 'Мой день'], ['rewards', 'gift', 'Мои награды'], ['progress', 'chart', 'Мой прогресс'], ['team', 'people', 'Наша команда'], ['concept', 'leaf', 'Как это работает']],
  parent: [['day', 'grid', 'Обзор'], ['review', 'check', 'Проверка заданий'], ['rewards', 'gift', 'Награды'], ['settings', 'settings', 'Договоренности'], ['concept', 'leaf', 'Как это работает']],
  moderator: [['day', 'grid', 'План развития'], ['library', 'book', 'Библиотека заданий'], ['review', 'check', 'Проверка заданий'], ['rewards', 'gift', 'Награды'], ['progress', 'chart', 'Прогресс'], ['team', 'people', 'Команда'], ['concept', 'leaf', 'Как это работает']],
};
function addEnglishDemoText(current) {
  for (const list of ['tasks', 'rewards']) for (const item of current[list]) {
    const source = englishDemo[list].find(candidate => candidate.id === item.id);
    if (!source) continue;
    for (const field of ['titleEn', 'descriptionEn', 'reportEn']) if (!item[field] && source[field]) item[field] = source[field];
  }
  for (const claim of current.claims) {
    const source = englishDemo.rewards.find(reward => reward.id === claim.rewardId);
    if (!source) continue;
    for (const field of ['titleEn', 'descriptionEn']) if (!claim[field] && source[field]) claim[field] = source[field];
  }
  if (!current.profile.goalEn && current.profile.goal === englishDemo.profile.goal) current.profile.goalEn = englishDemo.profile.goalEn;
  return current;
}
let state, storageError = '', role = 'child', page = 'day', filter = 'all';
try { const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY); state = raw ? addEnglishDemoText(validateState(JSON.parse(raw))) : createDemo(); }
catch { state = createDemo(); storageError = 'Сохраненные данные недоступны или повреждены. Они не перезаписаны. Можно скачать исходные данные или явно сбросить демо.'; }

function route() {
  const parts = location.hash.replace(/^#/, '').split('/');
  role = Object.hasOwn(ROLES, parts[0]) ? parts[0] : 'child';
  page = navigation[role].some(([id]) => id === parts[1]) ? parts[1] : 'day';
  filter = 'all';
  if (dialog.open) dialog.close();
  render();
}
function toast(message) {
  const el = document.querySelector('#toast'); el.textContent = translateText(message); el.classList.add('visible');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 5500);
}
let saving = false;
async function commit(action, payload, message) {
  if (saving) return;
  saving = true;
  const actor = role;
  const update = () => {
    if (storageError) throw new Error('Сначала восстановите хранилище в разделе «О демоверсии».');
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    const current = raw ? validateState(JSON.parse(raw)) : state;
    const next = transition(current, actor, action, payload);
    // Write first: a full or blocked browser store must never show false success.
    localStorage.setItem(KEY, JSON.stringify(next)); state = next;
  };
  try {
    // Lock all demo writes across tabs on the same origin when supported.
    if (navigator.locks) await navigator.locks.request(KEY, update); else update();
    dialog.close(); render(); toast(message);
  } catch (error) {
    const msg = error.name === 'QuotaExceededError' || error.name === 'SecurityError' ? 'Браузер не сохранил изменения. Проверьте доступ к локальному хранилищу и свободное место.' : error.message;
    const field = dialog.querySelector('[data-error]');
    if (dialog.open && field) field.textContent = translateText(msg); else toast(msg);
  } finally { saving = false; }
}

function illustration() {
  return `<svg class="hero-art" viewBox="0 0 390 280" fill="none" aria-hidden="true">
    <circle cx="210" cy="134" r="113" stroke="#618071" stroke-dasharray="4 7" opacity=".65"/>
    <ellipse cx="216" cy="236" rx="147" ry="22" fill="#102e28" opacity=".5"/>
    <path d="m77 211 66-38 65 38-66 38Z" fill="#a5c982"/><path d="m77 211 65 38v-38l-65-38Z" fill="#6b9972"/>
    <path d="m142 171 66-38 65 38-66 38Z" fill="#d7eca1"/><path d="m142 171 65 38v40l-65-38Z" fill="#a5c982"/><path d="m207 209 66-38v40l-66 38Z" fill="#577c5a"/>
    <path d="m208 131 66-38 65 38-66 38Z" fill="#f0f5cc"/><path d="m208 131 65 38v80l-65-38Z" fill="#c9dda0"/><path d="m273 169 66-38v80l-66 38Z" fill="#8ba373"/>
    <path d="M275 97V39" stroke="#e7eab3" stroke-width="4"/><path d="M277 40c19-12 29 10 49 0v28c-20 10-30-12-49 0Z" fill="#ffb57e"/>
    <path d="m151 130 14-8 14 8v23l-14 8-14-8Z" fill="#fbca7d"/><path d="m165 122 14 8-14 8-14-8Z" fill="#ffe3a5"/>
    <path d="M95 196v-35" stroke="#adcba0" stroke-width="3"/><path d="M95 182c-26-2-26-21-26-21 24 0 26 21 26 21Z" fill="#91b87b"/><path d="M95 173c26 0 27-22 27-22-27 0-27 22-27 22Z" fill="#d4ee92"/>
    <circle cx="113" cy="68" r="23" fill="#f4cb79"/><path d="m113 55 8 13-8 13-8-13Z" stroke="#b88c36" stroke-width="2"/>
    <path d="m210 52 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm129 28 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#e5ecbf"/>
    <circle cx="54" cy="127" r="4" fill="#ffb57e"/><circle cx="335" cy="173" r="3" fill="#d4ee92"/>
  </svg>`;
}

function render() {
  const pending = state.tasks.filter(t => t.status === 'review').length;
  const active = state.tasks.filter(t => ['active', 'review', 'revision'].includes(t.status));
  const xp = earned(state), level = Math.floor(xp / 200) + 1;
  const name = escape(state.profile[role]);
  app.innerHTML = `<aside class="sidebar">
    <a class="brand" href="#${role}/day"><img src="./assets/mark.svg" alt="" width="40" height="40"><span>Play to Grow<small>играй, чтобы расти.</small></span></a>
    <div class="family-label">СЕМЕЙНОЕ ПРОСТРАНСТВО</div>
    <div class="family"><span class="avatar small">С</span><span>Команда ${escape(state.profile.child)}<small>Задания, отчеты и награды</small></span></div>
    <nav aria-label="Основная навигация">${navigation[role].map(([id, ico, label]) => `<a href="#${role}/${id}" class="nav-link ${page === id ? 'selected' : ''}" ${page === id ? 'aria-current="page"' : ''}>${icon(ico)}<span>${label}</span>${id === 'review' && pending ? `<b class="nav-count">${pending}</b>` : ''}</a>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="gentle-note">${icon('leaf')}<strong>Как получить награду</strong><p>Выбери задание, отправь отчет<br>и накопи баллы.</p></div>${button(`${icon('shield')} О демоверсии`, 'about', '', 'about-link')}<div class="sidebar-foot">Play to Grow · 2026</div></div>
  </aside>
  <div class="workspace"><header class="topbar"><div class="breadcrumb">Мое пространство<span>/</span><b>${navigation[role].find(([id]) => id === page)?.[2]}</b></div><div class="topbar-right"><span class="demo-dot">Демо</span><div class="language-switch" aria-label="${L('Язык интерфейса', 'Interface language')}"><button type="button" data-action="language" data-id="ru" aria-pressed="${lang === 'ru'}">RU</button><button type="button" data-action="language" data-id="en" aria-pressed="${lang === 'en'}">EN</button></div><label class="role-select"><span class="sr-only">Роль участника</span><select id="role-select">${Object.keys(ROLES).map(id => `<option value="${id}" ${role === id ? 'selected' : ''}>${roleName(id)}</option>`).join('')}</select></label><span class="avatar ${role}">${name.slice(0, 1)}</span></div></header>
  <div class="demo-banner"><span>${icon('people')} Три роли, один браузер. Все данные — учебные и сохраняются на этом устройстве.</span>${button('Как попробовать', 'about', '', 'text-btn')}</div>
  ${storageError ? `<div class="error-banner" role="alert">${escape(storageError)} ${button('Восстановить', 'about', '', 'text-btn')}</div>` : ''}
  <main id="main" tabindex="-1">${page === 'day' ? dashboard(active, xp, level) : page === 'rewards' ? rewardsPage() : page === 'review' ? reviewPage() : page === 'progress' ? progressPage() : page === 'settings' ? settingsPage() : page === 'library' ? libraryPage() : page === 'concept' ? conceptPage() : teamPage()}</main>
  <footer class="footer"><span>${icon('leaf')} Играй, чтобы расти.</span><span>Демонстрационный режим · Без регистрации</span></footer></div>`;
  applyLocale(app);
}

function pageHeading(eyebrow, title, subtitle, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}

function dashboard(active, xp, level) {
  const isChild = role === 'child';
  const approvedToday = state.tasks.filter(t => t.status === 'done' && dayKey(t.reviewedAt) === dayKey()).length;
  const available = state.tasks.filter(t => t.status === 'available');
  const review = state.tasks.filter(t => t.status === 'review');
  const dashboardTitle = isChild ? `${L('Привет', 'Hi')}, ${escape(state.profile.child)}! <span class="wave">✦</span>` : role === 'parent' ? 'Проверка заданий и выдача наград' : 'Настройка заданий и плана развития';
  const dashboardSubtitle = isChild ? 'Выбери задание, выполни его и отправь результат родителю.' : `${L('Команда', 'Team')} ${escape(state.profile.child)} · ${escape(state.profile.game)} · ${escape(dataText(state.profile, 'goal'))}`;
  const heroKicker = isChild ? 'ЗАДАНИЯ В РЕАЛЬНОСТИ — БОНУСЫ В ИГРЕ' : role === 'parent' ? 'РОДИТЕЛЬСКИЙ КАБИНЕТ' : 'КАБИНЕТ МОДЕРАТОРА';
  const heroTitle = isChild ? 'Получай внутриигровые бонусы за выбранные тобой задания и реальные успехи.' : role === 'parent' ? 'Проверяйте результаты и выдавайте согласованные игровые награды.' : 'Добавляйте задания и настраивайте план развития.';
  const heroText = isChild ? 'Выполни задание, отправь короткий отчет родителю и получи баллы. Баллы можно обменять на заранее согласованные игровые награды.' : role === 'parent' ? 'Ребенок отправляет отчет. После вашего подтверждения система начисляет баллы; затем вы подтверждаете фактическую выдачу награды.' : 'Выберите направление, задайте условия и баллы, затем отслеживайте отчеты и прогресс.';
  return pageHeading(new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }), dashboardTitle, dashboardSubtitle, !isChild ? button(`${icon('plus')} Добавить задание`, 'new-task', '', 'btn primary') : '') +
  `<section class="hero ${!isChild ? 'adult-hero' : ''}"><div class="hero-copy"><div class="hero-kicker">${icon('spark')} ${heroKicker}</div><h2>${heroTitle}</h2><p>${heroText}</p>${button(isChild ? `Выбрать задание ${icon('arrow')}` : role === 'moderator' ? `Настроить план ${icon('arrow')}` : `Проверить отчеты ${icon('arrow')}`, isChild ? 'scroll-quests' : role === 'moderator' ? 'goal' : 'go-review', '', 'btn lime')}</div>${illustration()}</section>
  <section class="stats" aria-label="Прогресс участника"><div class="stat"><span class="stat-icon sand">${icon('coin')}</span><div><small>Доступно для наград</small><strong>${balance(state)} <span>баллов</span></strong></div><a href="#${role}/rewards" aria-label="Посмотреть награды">${icon('arrow')}</a></div><div class="stat"><span class="stat-icon violet">${icon('spark')}</span><div><small>Уровень ${level}</small><strong>${xp} <span>опыта</span></strong><div class="tiny-track"><i style="width:${xp % 200 / 2}%"></i></div></div></div><div class="stat"><span class="stat-icon green">${icon('check')}</span><div><small>${isChild ? 'Подтверждено сегодня' : 'Заданий ждут проверки'}</small><strong>${isChild ? approvedToday : review.length} <span>${isChild ? 'выполнено' : 'на проверке'}</span></strong></div></div></section>
  <div class="dashboard-grid"><div class="main-column">${active.length ? `<section><div class="section-heading"><h2>${isChild ? 'Твои текущие задания' : 'Сейчас в работе'}</h2><span class="count">${active.length}</span></div><div class="active-list">${active.map(t => activeCard(t)).join('')}</div></section>` : ''}
  <section id="quests"><div class="section-heading"><div><h2>${isChild ? 'Выбери следующее задание' : 'Доступные задания'}</h2><p>${isChild ? 'Начни одно из доступных заданий. Можно выбрать то, которое тебе подходит.' : 'Ребенок выбирает одно из предложенных заданий.'}</p></div><span class="count">${available.length}</span></div>${filters()}<div class="quest-grid">${available.filter(t => filter === 'all' || t.category === filter).map(questCard).join('') || empty('В этом направлении пока нет заданий', 'Можно выбрать другое направление или добавить задание из кабинета взрослого.')}</div></section></div>
  <aside class="right-column"><section class="goal-card"><span class="eyebrow">СЛЕДУЮЩАЯ ДОСТУПНАЯ НАГРАДА</span><div class="reward-symbol">${icon('game')}</div><h3>${escape(dataText(state.rewards[0], 'title') || L('Время для игры', 'Game time'))}</h3><p>Выполняй задания и копи баллы<br>для этой награды.</p><div class="goal-numbers"><strong>${Math.min(balance(state), state.rewards[0]?.cost || 60)}</strong><span>/ ${state.rewards[0]?.cost || 60} баллов</span></div><div class="track"><i style="width:${Math.min(100, balance(state) / (state.rewards[0]?.cost || 60) * 100)}%"></i></div><a class="btn full" href="#${role}/rewards">К наградам ${icon('arrow')}</a></section>
  <section class="focus-card"><span class="focus-mark">${icon(CATEGORIES[state.profile.focus].icon)}</span><span class="eyebrow">ФОКУС РАЗВИТИЯ</span><h3>${categoryName(state.profile.focus)}</h3><p>${escape(dataText(state.profile, 'goal'))}</p><div class="person-line"><span class="avatar mini moderator">${escape(state.profile.moderator[0])}</span><span>${escape(state.profile.moderator)}<small>Модератор команды</small></span></div></section>
  <div class="soft-note">${icon('leaf')}<p>Баллы начисляются после подтверждения задания родителем.</p></div></aside></div>`;
}

function filters() {
  const categories = Object.keys(CATEGORIES).filter(c => state.tasks.some(t => t.status === 'available' && t.category === c));
  return `<div class="filters" aria-label="Направление заданий">${[['all', L('Все квесты', 'All quests')], ...categories.map(c => [c, categoryName(c)])].map(([id, label]) => `<button class="filter ${filter === id ? 'active' : ''}" data-action="filter" data-id="${id}" aria-pressed="${filter === id}">${label}</button>`).join('')}</div>`;
}
function questCard(t) {
  return `<article class="quest-card"><div class="card-top">${categoryBadge(t.category)}<span class="points">+${t.points} ${icon('coin')}</span></div><h3>${escape(dataText(t, 'title'))}</h3><p>${escape(dataText(t, 'description'))}</p><div class="card-bottom"><span class="duration">${icon('clock')} ${t.minutes} мин</span>${button(role === 'child' ? `${L('Выбрать', 'Choose')} ${icon('arrow')}` : L('Подробнее', 'Details'), 'task', t.id, 'text-btn')}</div></article>`;
}
function activeCard(t) {
  const cat = CATEGORIES[t.category];
  return `<article class="active-card"><span class="task-icon ${cat.color}">${icon(cat.icon)}</span><div class="active-copy"><h3>${escape(dataText(t, 'title'))}</h3><div><span class="status ${t.status}">${icon(t.status === 'review' ? 'clock' : t.status === 'revision' ? 'book' : 'activity')}${statusName(t.status)}</span><span class="muted">${t.minutes} ${L('мин', 'min')} · +${t.points} ${L('баллов', 'points')}</span></div></div>${button(role === 'child' ? t.status === 'review' ? L('Отчет', 'Report') : L('Продолжить', 'Continue') : t.status === 'review' ? L('Проверить', 'Review') : L('Открыть', 'Open'), 'task', t.id, 'btn compact')}</article>`;
}
function empty(title, subtitle = '') { return `<div class="empty">${icon('leaf')}<h3>${title}</h3><p>${subtitle}</p></div>`; }

function rewardsPage() {
  const used = limitsUsed(state);
  return pageHeading('НАГРАДЫ ЗА ПОДТВЕРЖДЕННЫЕ ЗАДАНИЯ', role === 'child' ? 'Выбери награду, на которую хватает баллов' : 'Награды и договоренности', 'Баллы Play to Grow можно обменять на согласованные с родителем награды.') +
    `<div class="wallet"><span class="wallet-total">${icon('coin')}<strong>${balance(state)}</strong> баллов доступно</span><span>${used.minutes} / ${state.profile.dailyMinutes} мин сегодня и в заявках</span><span>${used.rubles} / ${state.profile.weeklyBudget} ₽ на этой неделе и в заявках</span></div>
    <div class="reward-grid">${state.rewards.map(r => { const why = rewardAvailability(state, r); return `<article class="reward-card"><div class="reward-art ${r.kind}">${icon(r.kind === 'time' ? 'game' : r.kind === 'currency' ? 'coin' : r.kind === 'together' ? 'people' : 'gift')}<span>${r.kind === 'time' ? `${r.minutes} мин` : r.kind === 'together' ? 'Вместе' : r.rubles + ' ₽'}</span></div><div class="reward-body"><h3>${escape(dataText(r, 'title'))}</h3><p>${escape(dataText(r, 'description'))}</p><div class="reward-cost">${icon('coin')} ${r.cost} баллов</div>${role === 'child' ? button('Хочу эту награду', 'reward', r.id, 'btn full primary', !!why) : `<div class="muted small-text">${r.kind === 'together' ? 'Общее занятие выбирает семья' : 'Выдачу подтверждает родитель'}</div>`}${role === 'child' && why ? `<small class="availability">${escape(translateText(why))}</small>` : ''}</div></article>`; }).join('')}</div>
    <div class="info-strip">${icon('shield')}<p>Сайт учитывает договоренности. Игровое время, валюту и бонусы предоставляет родитель; автоматического подключения к играм нет. Баллы резервируются при заявке и возвращаются при отмене.</p></div>
    <section><div class="section-heading"><h2>История наград</h2><span class="count">${state.claims.length}</span></div><div class="history-list">${state.claims.map(c => `<article class="claim"><span class="task-icon sand">${icon('gift')}</span><div class="claim-copy"><h3>${escape(dataText(c, 'title'))}</h3><p>${stampLabel(c.requestedAt)} · ${c.cost} ${L('баллов', 'points')} · ${c.status === 'requested' ? L('Баллы зарезервированы', 'Points reserved') : c.status === 'delivered' ? L('Выдано родителем', 'Delivered by parent') : L('Отменено, баллы возвращены', 'Cancelled, points returned')}</p></div><div class="claim-actions">${c.status === 'requested' ? `${role === 'parent' ? button('Подтвердить выдачу', 'deliver', c.id, 'btn primary compact') : ''}${role !== 'moderator' ? button('Отменить', 'cancel-claim', c.id, 'text-btn') : '<span class="status review">Ждет родителя</span>'}` : `<span class="status ${c.status === 'delivered' ? 'done' : ''}">${c.status === 'delivered' ? 'Выдано' : 'Отменено'}</span>`}</div></article>`).join('') || empty('Здесь будут твои награды', 'Выбери награду из каталога — родитель увидит заявку в своем кабинете.')}</div></section>`;
}

function reviewPage() {
  const pending = state.tasks.filter(t => t.status === 'review');
  const reviewed = state.tasks.filter(t => ['done', 'revision'].includes(t.status)).sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));
  return pageHeading('ПОДДЕРЖКА ВМЕСТО ОЦЕНОК', 'Замечаем каждый шаг', 'Прочитайте отчет, обсудите результат и помогите, если что-то не получилось.') +
    `<section><div class="section-heading"><h2>Ждут вашей проверки</h2><span class="count">${pending.length}</span></div><div class="review-grid">${pending.map(t => `<article class="review-card"><div class="card-top">${categoryBadge(t.category)}<span class="points">+${t.points} баллов</span></div><h3>${escape(dataText(t, 'title'))}</h3><p>${escape(dataText(t, 'description'))}</p><blockquote><small>${L('ОТЧЕТ', 'REPORT BY')} ${escape(state.profile.child).toLocaleUpperCase(lang === 'en' ? 'en' : 'ru')}</small>${escape(dataText(t, 'report'))}</blockquote>${button(`Посмотреть и проверить ${icon('arrow')}`, 'task', t.id, 'btn primary')}</article>`).join('') || empty('Все отчеты проверены', 'Новые появятся здесь, когда ребенок расскажет о выполненном задании.')}</div></section><section><div class="section-heading"><h2>Уже посмотрели</h2></div><div class="active-list">${reviewed.slice(0, 20).map(t => `<article class="active-card"><span class="task-icon ${CATEGORIES[t.category].color}">${icon(CATEGORIES[t.category].icon)}</span><div class="active-copy"><h3>${escape(dataText(t, 'title'))}</h3><p>${statusName(t.status)} · ${stampLabel(t.reviewedAt)} · ${roleName(t.reviewer)}</p></div>${button('Открыть', 'task', t.id, 'text-btn')}</article>`).join('')}</div></section>`;
}

function progressPage() {
  const completed = state.tasks.filter(t => t.status === 'done');
  const total = earned(state), level = Math.floor(total / 200) + 1;
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });
  const counts = days.map(d => completed.filter(t => dayKey(t.reviewedAt) === dayKey(d)).length);
  const max = Math.max(3, ...counts);
  return pageHeading('ТВОЙ ПУТЬ В РЕАЛЬНОМ МИРЕ', 'Большое начинается с малого', 'Здесь видны выполненные дела и направления, в которых ты пробуешь себя.') +
    `<div class="progress-summary"><div class="level-emblem">${icon('spark')}<strong>${level}</strong></div><div><span class="eyebrow">ИССЛЕДОВАТЕЛЬ · УРОВЕНЬ ${level}</span><h2>Уже ${completed.length} маленьких побед</h2><p>${total} опыта · еще ${200 - total % 200} до следующего уровня</p><div class="track"><i style="width:${total % 200 / 2}%"></i></div></div></div>
    <div class="two-columns"><section class="panel"><h2>Шаги за неделю</h2><p class="muted">Количество подтвержденных заданий</p><div class="bar-chart" role="img" aria-label="${days.map((d, i) => `${stampLabel(d)}: ${counts[i]}`).join('; ')}">${days.map((d, i) => `<div class="bar-column"><strong>${counts[i]}</strong><div class="bar-space"><i style="height:${Math.max(3, counts[i] / max * 100)}%" class="${i === 6 ? 'today' : ''}"></i></div><span>${d.toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { weekday: 'short', timeZone: 'Europe/Moscow' })}</span></div>`).join('')}</div></section>
    <section class="panel"><h2>Что ты развиваешь</h2><p class="muted">Опыт за выполненные задания</p><div class="skills-list">${Object.entries(CATEGORIES).map(([id, cat]) => { const points = completed.filter(t => t.category === id).reduce((sum, t) => sum + t.points, 0); return `<div class="skill-row"><span class="task-icon ${cat.color}">${icon(cat.icon)}</span><div><div class="skill-caption"><span>${categoryName(id)}</span><b>${points}</b></div><div class="tiny-track"><i style="width:${Math.min(100, points / Math.max(1, total) * 100)}%"></i></div></div></div>`; }).join('')}</div></section></div>
    <section><div class="section-heading"><h2>Твои достижения</h2></div><div class="achievement-grid">${[['Первый шаг', 'Выполни первое задание', completed.length >= 1, 'leaf'], ['Пробую разное', 'Задания трех направлений', new Set(completed.map(t => t.category)).size >= 3, 'spark'], ['Пять побед', 'Выполни пять заданий', completed.length >= 5, 'check']].map(([title, desc, unlocked, ico]) => `<div class="achievement ${unlocked ? 'unlocked' : ''}">${icon(ico)}<div><h3>${title}</h3><p>${desc}</p><small>${unlocked ? 'Открыто' : 'Впереди'}</small></div></div>`).join('')}</div></section>`;
}

function settingsPage() {
  return pageHeading('ДОГОВАРИВАЕМСЯ ЗАРАНЕЕ', 'Понятные правила для всех', 'Выберите вместе, какие награды радуют ребенка и подходят семье.') +
  `<div class="two-columns"><form class="panel form-panel" data-form="rules"><h2>Семейные договоренности</h2><label>Имя или псевдоним ребенка<input name="child" value="${escape(state.profile.child)}" maxlength="30" required></label><label>Любимая игра<input name="game" value="${escape(state.profile.game)}" maxlength="60" required></label><div class="form-row"><label>Игровое время в день, мин<input name="dailyMinutes" type="number" min="0" max="180" value="${state.profile.dailyMinutes}" required></label><label>Бюджет наград в неделю, ₽<input name="weeklyBudget" type="number" min="0" max="10000" value="${state.profile.weeklyBudget}" required></label></div><p class="hint">Примерные значения для демонстрации, а не рекомендации по возрасту. Неделя начинается в понедельник; день — по московскому времени. Ожидающие заявки резервируют лимит до выдачи или отмены.</p><p class="form-error" data-error role="alert"></p><button class="btn primary" type="submit">Сохранить договоренности</button></form>
  <section class="panel rules-explainer"><span class="task-icon green">${icon('shield')}</span><h2>Правила поддерживают</h2><div class="rule-item"><b>01</b><div><h3>Выбор остается у ребенка</h3><p>Предложите несколько подходящих заданий. Можно попросить помощи или попробовать позже.</p></div></div><div class="rule-item"><b>02</b><div><h3>Награды обсуждаются заранее</h3><p>Понятная стоимость в баллах, доступный бюджет и конкретный способ получения.</p></div></div><div class="rule-item"><b>03</b><div><h3>Игра остается частью дня</h3><p>Лимит общий для игровых наград. Сам сайт не блокирует устройства и не измеряет время в игре.</p></div></div></section></div>`;
}

const templates = [
  { title: 'Прогулка с открытием', titleEn: 'A Discovery Walk', category: 'sport', points: 40, minutes: 20, description: 'Пройди согласованный с родителем маршрут. Найди три интересные детали и расскажи о них.', descriptionEn: 'Walk a route agreed with your parent. Find three interesting details and tell someone about them.' },
  { title: 'Книга и один вопрос', titleEn: 'A Book and One Question', category: 'reading', points: 30, minutes: 15, description: 'Прочитай выбранный отрывок. Придумай вопрос, который хотелось бы задать его автору.', descriptionEn: 'Read a chosen passage. Think of one question you would like to ask its author.' },
  { title: 'Бюджет игрового мира', titleEn: 'A Game-World Budget', category: 'school', points: 40, minutes: 20, description: 'Составь список ресурсов для постройки. Посчитай, сколько их нужно и что можно сэкономить.', descriptionEn: 'List the resources for a build. Calculate how much you need and what you could save.' },
  { title: 'Создай своего героя', titleEn: 'Create Your Own Hero', category: 'creative', points: 40, minutes: 25, description: 'Нарисуй героя на бумаге, придумай ему три сильные стороны и одну задачу, с которой ему нужна помощь.', descriptionEn: 'Draw a hero on paper. Give them three strengths and one challenge where they need help.' },
  { title: 'Время для общего дела', titleEn: 'Time for Something Together', category: 'social', points: 35, minutes: 20, description: 'Предложи близкому совместное занятие без экрана. Расскажи, что вам понравилось делать вместе.', descriptionEn: 'Invite someone close to do a screen-free activity together. Share what you enjoyed about it.' },
  { title: 'Собираемся самостоятельно', titleEn: 'Get Ready on Your Own', category: 'household', points: 25, minutes: 10, description: 'Составь небольшой список дел на завтра. Подготовь нужные вещи и проверь себя по списку.', descriptionEn: 'Make a short checklist for tomorrow. Prepare what you need and check it off.' },
];
function libraryPage() {
  return pageHeading('ИДЕИ ДЛЯ РОСТА', 'У каждого квеста есть смысл', 'Добавьте подходящее задание в план и адаптируйте сложность под ребенка.', button(`${icon('plus')} Свое задание`, 'new-task', '', 'btn primary')) +
  `<div class="info-strip">${icon('leaf')}<p>${L('Фокус', 'Focus')}: <strong>${categoryName(state.profile.focus)}</strong>. ${escape(dataText(state.profile, 'goal'))}. ${L('Библиотека содержит примеры; окончательный план выбирают взрослые вместе с ребенком.', 'The library contains examples; adults and the child choose the final plan together.')}</p></div><div class="library-grid">${templates.map((t, i) => `<article class="quest-card"><div class="card-top">${categoryBadge(t.category)}<span class="points">+${t.points} ${icon('coin')}</span></div><h3>${escape(dataText(t, 'title'))}</h3><p>${escape(dataText(t, 'description'))}</p><div class="card-bottom"><span class="duration">${icon('clock')}${t.minutes} мин</span>${button(`${icon('plus')} В план`, 'template', String(i), 'text-btn')}</div></article>`).join('')}</div>`;
}

function teamPage() {
  return pageHeading('НА ОДНОЙ СТОРОНЕ', 'Твоя команда поддержки', 'Ребенок выбирает, родитель поддерживает, модератор помогает с направлением.') +
  `<div class="team-grid">${Object.keys(ROLES).map(id => `<article class="team-card"><span class="avatar large ${id}">${escape(state.profile[id][0])}</span><span class="eyebrow">${roleName(id)}</span><h2>${escape(state.profile[id])}</h2><p>${id === 'child' ? 'Выбирает квесты, пробует новое, рассказывает о результате и решает, на что копить баллы.' : id === 'parent' ? 'Проверяет задания, обсуждает правила, помогает получить награды и замечает усилия.' : 'Подбирает задания по направлениям развития, меняет фокус и дает обратную связь.'}</p></article>`).join('')}</div>
  <section class="team-goal panel"><span class="task-icon green">${icon('leaf')}</span><div><span class="eyebrow">НАША ОБЩАЯ ЦЕЛЬ</span><h2>${escape(dataText(state.profile, 'goal'))}</h2><p>${categoryName(state.profile.focus)} · ${L('Поддержка', 'Supported by')} ${escape(state.profile.parent)} ${L('и', 'and')} ${escape(state.profile.moderator)}</p></div>${role === 'moderator' ? button('Изменить цель', 'goal') : ''}</section><div class="info-strip">${icon('people')}<p>Это учебная команда. Переключатель ролей позволяет попробовать весь сценарий на одном устройстве. Для реальных отдельных учетных записей и совместной работы потребуется сервер.</p></div>`;
}

function conceptPage() {
  const areas = Object.keys(CATEGORIES).map(id => `<span class="concept-area">${icon(CATEGORIES[id].icon)}${categoryName(id)}</span>`).join('');
  const steps = [
    [L('Взрослые предлагают выбор', 'Adults offer a choice'), L('Несколько небольших, понятных и посильных квестов вместо одного требования.', 'Several small, clear, manageable quests instead of a single demand.')],
    [L('Ребенок выбирает путь', 'The child chooses a path'), L('Можно выбрать задание, время и попросить помощи. Отказ или пауза не превращаются в наказание.', 'They can choose the quest and timing, or ask for help. A pause or “not now” does not become a punishment.')],
    [L('Команда замечает результат', 'The team notices the result'), L('Ребенок рассказывает, что получилось; взрослый поддерживает усилие и дает спокойную обратную связь.', 'The child shares what happened; an adult recognizes the effort and gives calm feedback.')],
    [L('Баллы ведут к договоренной награде', 'Points lead to an agreed reward'), L('Игровое время, внутриигровой бонус или общее занятие заранее обсуждаются семьей.', 'Game time, an in-game bonus, or a shared activity is agreed by the family in advance.')],
  ];
  return `<section class="concept-hero"><div><span class="eyebrow">${L('ИДЕЯ PLAY TO GROW', 'THE PLAY TO GROW IDEA')}</span><h1>${L('Интерес к играм может стать точкой роста', 'A love of games can become a starting point for growth')}</h1><p>${L('Play to Grow не спорит с тем, что ребенку интересно. Платформа помогает направить игровую мотивацию в маленькие действия из реальной жизни — учебу, движение, творчество, общение и самостоятельность.', 'Play to Grow does not fight what a child enjoys. It channels gaming motivation into small real-world actions—learning, movement, creativity, communication, and independence.')}</p></div><div class="principle-card">${icon('leaf')}<span>${L('Главный принцип', 'Core principle')}</span><strong>${L('Выбор, а не торговля', 'Choice, not bargaining')}</strong><p>${L('Ребенок остается участником решения, а не исполнителем сделки «сделай — получишь».', 'The child remains part of the decision, rather than completing a “do this, get that” transaction.')}</p></div></section>
  <section class="concept-section"><div class="section-heading"><div><span class="eyebrow">${L('КАК ПРОХОДИТ ОДИН ЦИКЛ', 'ONE QUEST CYCLE')}</span><h2>${L('От интереса — к реальному опыту', 'From interest to real-world experience')}</h2></div></div><div class="concept-flow">${steps.map(([title, text], i) => `<article class="concept-step"><b>${String(i + 1).padStart(2, '0')}</b><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>
  <section class="concept-section concept-split"><div class="panel"><span class="eyebrow">${L('НАПРАВЛЕНИЯ РАЗВИТИЯ', 'AREAS OF GROWTH')}</span><h2>${L('Разные квесты показывают сильные стороны', 'Different quests reveal different strengths')}</h2><p>${L('Задания распределяются по направлениям, чтобы взрослые видели не только трудности, но и то, что ребенку уже удается. Сложность и темп можно менять по реакции ребенка.', 'Quests are grouped by area so adults can see not only challenges, but also what already works well. Difficulty and pace can change in response to the child.')}</p><div class="concept-areas">${areas}</div></div><div class="panel role-purpose"><span class="eyebrow">${L('ТРИ УЧАСТНИКА', 'THREE PARTICIPANTS')}</span><div><strong>${roleName('child')}</strong><p>${L('выбирает, пробует и рассказывает о результате', 'chooses, tries, and shares the result')}</p></div><div><strong>${roleName('parent')}</strong><p>${L('договаривается о наградах, поддерживает и подтверждает', 'agrees on rewards, supports, and confirms')}</p></div><div><strong>${roleName('moderator')}</strong><p>${L('помогает подобрать задания и настроить план развития', 'helps select quests and adjust the growth plan')}</p></div></div></section>
  <section class="concept-note">${icon('shield')}<div><h2>${L('Честно о возможностях демоверсии', 'What this demo does—and does not—do')}</h2><p>${L('Play to Grow — семейный инструмент поддержки, а не медицинская диагностика или лечение. Он не измеряет зависимость, не блокирует игры и не начисляет игровую валюту автоматически. Правила, безопасность и способ выдачи наград определяют взрослые вместе с ребенком.', 'Play to Grow is a family support tool, not medical diagnosis or treatment. It does not measure addiction, block games, or issue game currency automatically. Adults and the child decide the rules, safety boundaries, and how rewards are delivered.')}</p></div></section>`;
}

let returnFocus;
function openDialog(title, content) {
  returnFocus = document.activeElement;
  dialog.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${escape(title)}</h2><button class="icon-btn" data-action="close" aria-label="Закрыть">${icon('close')}</button></div>${content}`;
  applyLocale(dialog);
  dialog.showModal();
}
function taskDialog(id) {
  const t = state.tasks.find(x => x.id === id); if (!t) return;
  openDialog(dataText(t, 'title'), `<div class="dialog-meta">${categoryBadge(t.category)}<span>${icon('clock')}${t.minutes} мин</span><strong>+${t.points} баллов</strong></div><p class="task-description">${escape(dataText(t, 'description'))}</p><span class="status ${t.status}">${statusName(t.status)}</span>${t.report ? `<blockquote><small>ОТЧЕТ РЕБЕНКА</small>${escape(dataText(t, 'report'))}</blockquote>` : ''}${t.feedback ? `<div class="feedback"><strong>Обратная связь</strong><p>${escape(t.feedback)}</p></div>` : ''}
    ${role === 'child' && t.status === 'available' ? `<p class="hint">Выбирай, если тебе интересно. После выполнения расскажи, что получилось.</p><div class="dialog-actions">${button('Беру этот квест', 'start', t.id, 'btn primary')}</div>` : ''}
    ${role === 'child' && ['active', 'revision'].includes(t.status) ? `<form data-form="submit" data-id="${escape(t.id)}"><label>Что у тебя получилось?<textarea name="report" rows="4" minlength="5" maxlength="1500" placeholder="Расскажи, что ты сделал, что понравилось или где понадобилась помощь…" required>${escape(t.report)}</textarea></label><p class="hint">Достаточно нескольких предложений. Фото и личные данные не нужны.</p><p class="form-error" data-error role="alert"></p><button class="btn primary full">Отправить на проверку ${icon('arrow')}</button></form>` : ''}
    ${role !== 'child' && t.status === 'review' ? `<form data-form="review" data-id="${escape(t.id)}"><label>Обратная связь<textarea name="feedback" rows="3" maxlength="600" placeholder="Что получилось хорошо? Что можно попробовать еще?"></textarea></label><p class="hint">При возврате на доработку объясните, что нужно дополнить (от 5 символов). Баллы начисляются один раз после подтверждения.</p><p class="form-error" data-error role="alert"></p><div class="dialog-actions"><button class="btn primary" name="decision" value="approve">${icon('check')} Подтвердить · +${t.points}</button><button class="btn" name="decision" value="revise">Нужно дополнить</button></div></form>` : ''}`);
}
function newTaskDialog(template = {}) {
  const primaryTitle = lang === 'en' ? 'titleEn' : 'title', secondaryTitle = lang === 'en' ? 'title' : 'titleEn';
  const primaryDescription = lang === 'en' ? 'descriptionEn' : 'description', secondaryDescription = lang === 'en' ? 'description' : 'descriptionEn';
  openDialog(L('Новый квест', 'New quest'), `<form data-form="createTask"><label>${L('Название', 'Title')}<input name="${primaryTitle}" minlength="3" maxlength="100" value="${escape(template[primaryTitle] || '')}" placeholder="${L('Например, прогулка с открытием', 'For example, A discovery walk')}" required></label><label>${L('Название на английском (необязательно)', 'Title in Russian (optional)')}<input name="${secondaryTitle}" maxlength="100" value="${escape(template[secondaryTitle] || '')}"></label><label>${L('Направление', 'Area')}<select name="category">${Object.keys(CATEGORIES).map(id => `<option value="${id}" ${id === (template.category || state.profile.focus) ? 'selected' : ''}>${categoryName(id)}</option>`).join('')}</select></label><label>${L('Описание', 'Description')}<textarea name="${primaryDescription}" rows="4" minlength="10" maxlength="1500" required placeholder="${L('Небольшая понятная задача, посильная ребенку…', 'A small, clear quest that is manageable for the child…')}">${escape(template[primaryDescription] || '')}</textarea></label><label>${L('Описание на английском (необязательно)', 'Description in Russian (optional)')}<textarea name="${secondaryDescription}" rows="4" maxlength="1500">${escape(template[secondaryDescription] || '')}</textarea></label><div class="form-row"><label>${L('Баллы за выполнение', 'Points for completion')}<input type="number" name="points" min="5" max="200" value="${template.points || 30}" required></label><label>${L('Примерно минут', 'Approx. minutes')}<input type="number" name="minutes" min="5" max="120" value="${template.minutes || 15}" required></label></div><p class="form-error" data-error role="alert"></p><button class="btn primary full">${L('Добавить в план', 'Add to plan')} ${icon('plus')}</button></form>`);
}
function goalDialog() {
  const primaryGoal = lang === 'en' ? 'goalEn' : 'goal', secondaryGoal = lang === 'en' ? 'goal' : 'goalEn';
  openDialog(L('Фокус развития', 'Growth focus'), `<form data-form="goal"><label>${L('Наша цель', 'Our goal')}<textarea name="${primaryGoal}" rows="3" minlength="5" maxlength="180" required>${escape(state.profile[primaryGoal] || '')}</textarea></label><label>${L('Цель на английском (необязательно)', 'Goal in Russian (optional)')}<textarea name="${secondaryGoal}" rows="3" maxlength="180">${escape(state.profile[secondaryGoal] || '')}</textarea></label><label>${L('Приоритетное направление', 'Priority area')}<select name="focus">${Object.keys(CATEGORIES).map(id => `<option value="${id}" ${state.profile.focus === id ? 'selected' : ''}>${categoryName(id)}</option>`).join('')}</select></label><p class="hint">${L('Опишите понятное повседневное изменение, которое сможете замечать вместе.', 'Describe a clear everyday change that everyone can notice together.')}</p><p class="form-error" data-error role="alert"></p><button class="btn primary full">${L('Сохранить цель', 'Save goal')}</button></form>`);
}
function aboutDialog() {
  openDialog('Попробуйте Play to Grow', `<div class="about-intro">Реальные дела. Игровые награды. Поддержка команды.</div><ol class="demo-steps"><li><strong>Ребенок</strong><span>Откройте «Еще одна глава», напишите отчет и отправьте на проверку.</span></li><li><strong>Родитель</strong><span>Переключите роль вверху страницы. Проверьте отчет — баллы появятся у ребенка.</span></li><li><strong>Награда</strong><span>От ребенка запросите награду. От родителя подтвердите ее выдачу.</span></li><li><strong>Модератор</strong><span>Выберите фокус развития и добавьте квест из библиотеки.</span></li></ol><div class="info-strip"><p>Демо для проверки идеи, не медицинская программа. Переключение ролей не защищает данные. Сведения хранятся только в этом браузере, без синхронизации и подключения к играм. Используйте вымышленные данные.</p></div><div class="backup-actions">${button(`${icon('download')} Скачать копию`, 'export', '', 'btn')}${button('Восстановить из файла', 'import', '', 'btn')}<input type="file" id="import-file" accept="application/json,.json" hidden>${storageError ? button('Скачать исходные данные', 'export-raw', '', 'btn') : ''}</div><p class="hint">Копия содержит задания, отчеты и историю. Импорт заменяет текущее демо. Можно переносить копию между браузерами вручную.</p><div class="dialog-actions">${button('Начать демо заново', 'reset-confirm', '', 'text-btn danger')}</div>`);
}
function download(content, filename) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener('click', async event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault(); document.querySelector('#main').focus(); document.querySelector('#main').scrollIntoView(); return;
  }
  const el = event.target.closest('[data-action]'); if (!el) return;
  const { action, id } = el.dataset;
  if (action === 'close') { dialog.close(); return; }
  if (action === 'language') {
    const nextLang = id === 'en' ? 'en' : 'ru';
    if (PUBLIC_HOSTS.has(location.hostname) && nextLang !== DEFAULT_LANG) {
      const target = new URL(document.documentElement.dataset[`${nextLang}Url`]);
      target.hash = location.hash;
      location.assign(target); return;
    }
    lang = nextLang; localStorage.setItem(LANG_KEY, lang); if (dialog.open) dialog.close(); render(); return;
  }
  if (action === 'filter') { filter = id; const y = scrollY; render(); window.scrollTo(0, y); app.querySelector(`[data-action="filter"][data-id="${id}"]`)?.focus({ preventScroll: true }); return; }
  if (action === 'scroll-quests') { document.querySelector('#quests')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); return; }
  if (action === 'go-review') { location.hash = `${role}/review`; return; }
  if (action === 'task') { taskDialog(id); return; }
  if (action === 'new-task') { newTaskDialog(); return; }
  if (action === 'template') { newTaskDialog(templates[Number(id)]); return; }
  if (action === 'goal') { goalDialog(); return; }
  if (action === 'about') { aboutDialog(); return; }
  if (action === 'start') { await commit('start', { id }, 'Квест выбран. Можно начинать в своем темпе!'); return; }
  if (action === 'reward') {
    const r = state.rewards.find(x => x.id === id); if (!r) return;
    openDialog('Попросить награду', `<div class="reward-confirm">${icon('gift')}<h3>${escape(dataText(r, 'title'))}</h3><p>${escape(dataText(r, 'description'))}</p><strong>${r.cost} баллов</strong></div><p class="hint">После отправки баллы будут зарезервированы. Родитель подтвердит выдачу. Пока награда не выдана, заявку можно отменить и вернуть баллы.</p><p class="form-error" data-error role="alert"></p>${button('Отправить заявку', 'request-reward', id, 'btn primary full')}`); return;
  }
  if (action === 'request-reward') { await commit('requestReward', { rewardId: id, id: crypto.randomUUID() }, 'Заявка отправлена родителю. Баллы зарезервированы.'); return; }
  if (action === 'deliver') {
    const c = state.claims.find(x => x.id === id); if (!c) return;
    openDialog('Подтверждение выдачи', `<p>${L('Награда', 'Reward')}: <strong>${escape(dataText(c, 'title'))}</strong>.</p><p>Подтвердите после того, как предоставили награду ребенку. Это запись в истории; сайт сам не запускает игру и не покупает валюту.</p><p class="form-error" data-error role="alert"></p>${button('Награда выдана', 'deliver-confirm', id, 'btn primary full')}`); return;
  }
  if (action === 'deliver-confirm') { await commit('deliverReward', { id }, 'Выдача награды отмечена.'); return; }
  if (action === 'cancel-claim') { await commit('cancelReward', { id }, 'Заявка отменена. Баллы снова доступны.'); return; }
  if (action === 'export') { download(JSON.stringify(state, null, 2), `play-to-grow-demo-${dayKey()}.json`); return; }
  if (action === 'export-raw') { try { download(localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || '{}', 'play-to-grow-recovery.json'); } catch { toast('Браузер не разрешает чтение хранилища.'); } return; }
  if (action === 'import') { document.querySelector('#import-file')?.click(); return; }
  if (action === 'reset-confirm') {
    openDialog('Начать заново?', `<p>Все изменения в демоверсии этого браузера будут заменены исходным примером. Сначала можно сохранить копию.</p><div class="dialog-actions">${button('Скачать текущую копию', 'export', '', 'btn')}${button('Сбросить демо', 'reset', '', 'btn danger-button')}</div>`); return;
  }
  if (action === 'reset') { await replaceState(createDemo(), 'Демо восстановлено. Можно попробовать другой сценарий.'); return; }
  if (action === 'import-confirm') { if (pendingImport) await replaceState(pendingImport, 'Копия восстановлена.'); pendingImport = null; }
});

document.addEventListener('submit', async event => {
  const form = event.target.closest('[data-form]'); if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.dataset.form === 'submit') await commit('submit', { id: form.dataset.id, report: data.report, reportEn: lang === 'en' ? data.report : '' }, 'Отчет отправлен. Взрослый проверит его и начислит баллы.');
  if (form.dataset.form === 'review') await commit('review', { id: form.dataset.id, feedback: data.feedback, decision: event.submitter?.value || 'approve' }, event.submitter?.value === 'revise' ? 'Задание возвращено с подсказкой. Ребенок может дополнить отчет.' : 'Задание подтверждено, баллы начислены!');
  if (form.dataset.form === 'createTask') await commit('createTask', { ...data, title: data.title || data.titleEn, titleEn: data.titleEn || data.title, description: data.description || data.descriptionEn, descriptionEn: data.descriptionEn || data.description, id: crypto.randomUUID(), points: Number(data.points), minutes: Number(data.minutes) }, 'Квест добавлен в план ребенка.');
  if (form.dataset.form === 'rules') await commit('saveRules', { ...data, dailyMinutes: Number(data.dailyMinutes), weeklyBudget: Number(data.weeklyBudget) }, 'Семейные договоренности сохранены.');
  if (form.dataset.form === 'goal') await commit('saveGoal', { ...data, goal: data.goal || data.goalEn, goalEn: data.goalEn || data.goal }, 'Фокус развития обновлен.');
});
let pendingImport;
async function replaceState(next, message) {
  try {
    const write = () => { localStorage.setItem(KEY, JSON.stringify(next)); state = next; storageError = ''; };
    if (navigator.locks) await navigator.locks.request(KEY, write); else write();
    dialog.close(); render(); toast(message);
  } catch { toast('Браузер не разрешает сохранить данные. Изменения не применены.'); }
}
document.addEventListener('change', async event => {
  if (event.target.id === 'role-select') { location.hash = `${event.target.value}/day`; return; }
  if (event.target.id === 'import-file') {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Файл слишком большой: максимум 2 МБ.');
      pendingImport = validateState(JSON.parse(await file.text()));
      openDialog('Восстановить копию?', `<p>В копии: <strong>${pendingImport.tasks.length} заданий</strong>, <strong>${pendingImport.claims.length} заявок</strong>, <strong>${balance(pendingImport)} баллов</strong>. Текущие данные будут заменены.</p><div class="dialog-actions">${button('Скачать текущую копию', 'export', '', 'btn')}${button('Заменить данные', 'import-confirm', '', 'btn primary')}</div>`);
    } catch (error) { pendingImport = null; toast(`Не удалось прочитать копию. ${error.message}`); }
  }
});
dialog.addEventListener('close', () => returnFocus?.isConnected && returnFocus.focus());
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
window.addEventListener('hashchange', route);
window.addEventListener('storage', event => {
  if (event.key !== KEY && event.key !== null) return;
  try { state = event.newValue ? validateState(JSON.parse(event.newValue)) : createDemo(); storageError = ''; render(); toast('Данные обновлены в другой вкладке.'); }
  catch { storageError = 'Данные другой вкладки не удалось прочитать. Сохраните копию перед восстановлением.'; render(); }
});
route();
