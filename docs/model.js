export const CATEGORIES = {
  reading: { label: 'Чтение', labelEn: 'Reading', icon: 'book', color: 'violet' },
  school: { label: 'Учеба', labelEn: 'Learning', icon: 'spark', color: 'blue' },
  sport: { label: 'Движение', labelEn: 'Movement', icon: 'activity', color: 'green' },
  creative: { label: 'Творчество', labelEn: 'Creativity', icon: 'palette', color: 'orange' },
  social: { label: 'Общение', labelEn: 'Communication', icon: 'people', color: 'pink' },
  household: { label: 'Самостоятельность', labelEn: 'Independence', icon: 'home', color: 'sand' },
};
export const ROLES = { child: 'Ребенок', parent: 'Родитель', moderator: 'Модератор' };
export const STATUS = { available: 'Можно выбрать', active: 'В работе', review: 'На проверке', revision: 'Нужно дополнить', done: 'Выполнено' };
export function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date(date));
}
export function createDemo(now = new Date()) {
  const stamp = new Date(now).toISOString();
  const ago = n => new Date(new Date(now).getTime() - n * 86400000).toISOString();
  const task = (id, title, titleEn, category, points, minutes, description, descriptionEn, status = 'available', extra = {}) => ({ id, title, titleEn, category, points, minutes, description, descriptionEn, status, report: '', feedback: '', createdAt: stamp, ...extra });
  return {
    version: 1, revision: 0,
    profile: { child: 'Саша', parent: 'Анна', moderator: 'Мария', game: 'Minecraft', goal: 'Больше движения и самостоятельности', goalEn: 'More movement and independence', focus: 'sport', dailyMinutes: 60, weeklyBudget: 500 },
    tasks: [
      task('walk', 'Маленькое путешествие', 'A Little Expedition', 'sport', 40, 20, 'Выйди на прогулку и найди три интересные детали вокруг. Расскажи о них дома. Маршрут заранее согласуй с родителем.', 'Take a walk and spot three interesting details around you. Tell your family about them. Agree on the route with your parent first.'),
      task('read', 'Еще одна глава', 'One More Chapter', 'reading', 30, 15, 'Выбери книгу, прочитай одну главу или несколько страниц. Расскажи, что удивило и какой герой запомнился.', 'Choose a book and read one chapter or a few pages. Share what surprised you and which character stayed with you.', 'active'),
      task('build', 'Построй идею в реальности', 'Build Your Idea in Real Life', 'creative', 50, 25, 'Нарисуй постройку, которую хотел бы создать в игре. Добавь размеры и объясни, зачем нужны ее части.', 'Draw a structure you would like to build in a game. Add dimensions and explain what each part is for.'),
      task('desk', 'Место для новых идей', 'A Place for New Ideas', 'household', 25, 10, 'Наведи порядок на своем столе. Найди удобное место для книг, тетрадей и материалов для творчества.', 'Tidy your desk and find a practical place for books, notebooks, and creative supplies.'),
      task('talk', 'Узнай семейную историю', 'Discover a Family Story', 'social', 35, 15, 'Спроси близкого человека о его любимом занятии в детстве. Запиши или запомни одну интересную историю.', 'Ask someone close to you about their favorite childhood activity. Write down or remember one interesting story.', 'review', { report: 'Поговорил с дедушкой: он строил модели самолетов. Хочу попробовать вместе с ним.', reportEn: 'I talked to Grandpa: he used to build model airplanes. I want to try it with him.', submittedAt: stamp }),
      task('done1', 'Собери рюкзак сам', 'Pack Your School Bag', 'household', 40, 10, 'Подготовь вещи для следующего учебного дня.', 'Prepare everything you need for the next school day.', 'done', { report: 'Все собрал по расписанию.', reportEn: 'I packed everything using my timetable.', reviewedAt: ago(1), reviewer: 'parent' }),
      task('done2', 'Математика строителя', "A Builder's Math", 'school', 60, 20, 'Рассчитай периметр и площадь своей комнаты.', 'Calculate the perimeter and area of your room.', 'done', { report: 'Нарисовал план и посчитал площадь.', reportEn: 'I drew a floor plan and calculated the area.', reviewedAt: ago(2), reviewer: 'moderator' }),
      task('done3', 'Разминка исследователя', "Explorer's Warm-up", 'sport', 50, 15, 'Выбери знакомую разминку и выполни ее в удобном темпе.', 'Choose a warm-up you know and complete it at a comfortable pace.', 'done', { report: 'Сделали разминку вместе с мамой.', reportEn: 'Mom and I did the warm-up together.', reviewedAt: ago(3), reviewer: 'parent' }),
    ],
    rewards: [
      { id: 'time', title: '30 минут в любимой игре', titleEn: '30 Minutes in Your Favorite Game', description: 'Выбери удобное время вместе с родителем. В пределах семейного лимита.', descriptionEn: 'Choose a convenient time together with your parent, within your family limit.', kind: 'time', cost: 60, minutes: 30, rubles: 0 },
      { id: 'bonus', title: 'Бонус для твоего мира', titleEn: 'A Bonus for Your Game World', description: 'Согласованный игровой предмет или дополнение. Родитель помогает получить его официальным способом.', descriptionEn: 'An agreed game item or add-on. Your parent helps you get it through an official channel.', kind: 'bonus', cost: 120, minutes: 0, rubles: 150 },
      { id: 'currency', title: 'Копилка игровой валюты', titleEn: 'Game Currency Fund', description: 'Пакет валюты для выбранной игры стоимостью до 300 ₽. Только после согласования с родителем.', descriptionEn: 'A currency pack for the selected game worth up to ₽300, after agreement with a parent.', kind: 'currency', cost: 200, minutes: 0, rubles: 300 },
      { id: 'together', title: 'Приключение вместе', titleEn: 'An Adventure Together', description: 'Совместная прогулка, настольная игра или другое занятие на твой выбор.', descriptionEn: 'A walk, board game, or another shared activity of your choice.', kind: 'together', cost: 80, minutes: 0, rubles: 0 },
    ],
    claims: [],
  };
}
export function earned(state) { return state.tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.points, 0); }
export function balance(state) { return earned(state) - state.claims.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + c.cost, 0); }
function weekStart(date) {
  const d = new Date(dayKey(date) + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
  return d.toISOString().slice(0, 10);
}
export function limitsUsed(state, now = new Date(), exclude = '') {
  const claims = state.claims.filter(c => c.status !== 'cancelled' && c.id !== exclude);
  // Pending requests reserve the allowance until issued or cancelled.
  const counted = c => c.status === 'requested' || dayKey(c.deliveredAt) === dayKey(now);
  return {
    minutes: claims.filter(counted).reduce((sum, c) => sum + c.minutes, 0),
    rubles: claims.filter(c => c.status === 'requested' || (dayKey(c.deliveredAt) >= weekStart(now) && dayKey(c.deliveredAt) <= dayKey(now))).reduce((sum, c) => sum + c.rubles, 0),
  };
}
function check(condition, message) { if (!condition) throw new Error(message); }
function textValue(value, min, max, label) {
  check(typeof value === 'string' && value.trim().length >= min && value.trim().length <= max, `${label}: от ${min} до ${max} символов.`);
  return value.trim();
}
function integer(value, min, max, label) {
  check(Number.isSafeInteger(value) && value >= min && value <= max, `${label}: целое число от ${min} до ${max}.`);
  return value;
}
function allowance(state, reward, now, exclude = '') {
  const used = limitsUsed(state, now, exclude);
  check(used.minutes + reward.minutes <= state.profile.dailyMinutes, 'Достигнут дневной лимит игрового времени. Обсуди с родителем другой день.');
  check(used.rubles + reward.rubles <= state.profile.weeklyBudget, 'Эта награда выходит за недельный бюджет семьи.');
}
export function rewardAvailability(state, reward, now = new Date()) {
  try {
    check(balance(state) >= reward.cost, `Еще ${reward.cost - balance(state)} баллов до награды`);
    allowance(state, reward, now);
    return '';
  } catch (e) { return e.message; }
}
export function transition(state, role, action, payload = {}, now = new Date()) {
  check(Object.hasOwn(ROLES, role), 'Неизвестная роль.');
  const next = structuredClone(state);
  const stamp = new Date(now).toISOString();
  const adult = () => check(role === 'parent' || role === 'moderator', 'Это действие доступно взрослому.');
  const parent = () => check(role === 'parent', 'Это действие доступно родителю.');
  const child = () => check(role === 'child', 'Это действие доступно ребенку.');
  const find = (items, id) => { const item = items.find(t => t.id === id); check(item, 'Запись не найдена. Обнови страницу.'); return item; };
  switch (action) {
    case 'start': {
      child(); const t = find(next.tasks, payload.id);
      check(t.status === 'available', 'Это задание уже выбрано.'); t.status = 'active'; break;
    }
    case 'submit': {
      child(); const t = find(next.tasks, payload.id);
      check(['active', 'revision'].includes(t.status), 'Сначала выбери задание.');
      t.report = textValue(payload.report, 5, 1500, 'Отчет');
      t.reportEn = textValue(payload.reportEn || '', 0, 1500, 'English report');
      t.status = 'review'; t.submittedAt = stamp; break;
    }
    case 'review': {
      adult(); const t = find(next.tasks, payload.id);
      check(t.status === 'review', 'Задание уже проверено или еще не отправлено.');
      check(['approve', 'revise'].includes(payload.decision), 'Выбери результат проверки.');
      t.feedback = textValue(payload.feedback || '', payload.decision === 'revise' ? 5 : 0, 600, 'Комментарий');
      t.status = payload.decision === 'approve' ? 'done' : 'revision'; t.reviewedAt = stamp; t.reviewer = role; break;
    }
    case 'createTask': {
      adult(); check(next.tasks.length < 500, 'Достигнут лимит демоверсии: 500 заданий.');
      check(Object.hasOwn(CATEGORIES, payload.category), 'Выбери направление.');
      const id = textValue(payload.id, 1, 100, 'Идентификатор');
      check(!next.tasks.some(t => t.id === id), 'Задание уже добавлено.');
      next.tasks.unshift({ id, title: textValue(payload.title, 3, 100, 'Название'), titleEn: textValue(payload.titleEn || '', 0, 100, 'English title'), description: textValue(payload.description, 10, 1500, 'Описание'), descriptionEn: textValue(payload.descriptionEn || '', 0, 1500, 'English description'), category: payload.category, points: integer(payload.points, 5, 200, 'Баллы'), minutes: integer(payload.minutes, 5, 120, 'Длительность'), status: 'available', report: '', feedback: '', createdAt: stamp }); break;
    }
    case 'requestReward': {
      child(); const r = find(next.rewards, payload.rewardId);
      check(balance(next) >= r.cost, 'Пока недостаточно баллов.'); allowance(next, r, now);
      check(next.claims.length < 1000, 'Достигнут лимит демоверсии: 1000 заявок.');
      const id = textValue(payload.id, 1, 100, 'Идентификатор');
      check(!next.claims.some(c => c.id === id), 'Заявка уже отправлена.');
      next.claims.unshift({ ...r, rewardId: r.id, id, status: 'requested', requestedAt: stamp }); break;
    }
    case 'deliverReward': {
      parent(); const c = find(next.claims, payload.id);
      check(c.status === 'requested', 'Эта заявка уже обработана.'); allowance(next, c, now, c.id);
      c.status = 'delivered'; c.deliveredAt = stamp; break;
    }
    case 'cancelReward': {
      check(role === 'parent' || role === 'child', 'Заявку отменяет ребенок или родитель.');
      const c = find(next.claims, payload.id); check(c.status === 'requested', 'Можно отменить только ожидающую заявку.');
      c.status = 'cancelled'; c.cancelledAt = stamp; break;
    }
    case 'saveRules': {
      parent(); const used = limitsUsed(next, now);
      const dailyMinutes = integer(payload.dailyMinutes, 0, 180, 'Дневной лимит');
      const weeklyBudget = integer(payload.weeklyBudget, 0, 10000, 'Недельный бюджет');
      check(dailyMinutes >= used.minutes && weeklyBudget >= used.rubles, 'Лимит меньше уже выданных или ожидающих наград. Сначала отмените ожидающие заявки.');
      Object.assign(next.profile, { child: textValue(payload.child, 1, 30, 'Имя ребенка'), game: textValue(payload.game, 1, 60, 'Игра'), dailyMinutes, weeklyBudget }); break;
    }
    case 'saveGoal': {
      check(role === 'moderator', 'План меняет модератор.');
      check(Object.hasOwn(CATEGORIES, payload.focus), 'Выбери направление.');
      next.profile.goal = textValue(payload.goal, 5, 180, 'Цель'); next.profile.goalEn = textValue(payload.goalEn || '', 0, 180, 'English goal'); next.profile.focus = payload.focus; break;
    }
    default: throw new Error('Неизвестное действие.');
  }
  next.revision++;
  return next;
}

export function validateState(s) {
  check(s && typeof s === 'object' && s.version === 1, 'Формат данных не поддерживается.');
  integer(s.revision, 0, Number.MAX_SAFE_INTEGER, 'Версия');
  check(s.profile && Array.isArray(s.tasks) && s.tasks.length <= 500 && Array.isArray(s.rewards) && s.rewards.length <= 50 && Array.isArray(s.claims) && s.claims.length <= 1000, 'Структура данных повреждена.');
  for (const k of ['child', 'parent', 'moderator']) textValue(s.profile[k], 1, 30, 'Имя');
  textValue(s.profile.game, 1, 60, 'Игра'); textValue(s.profile.goal, 5, 180, 'Цель'); textValue(s.profile.goalEn || '', 0, 180, 'English goal');
  check(Object.hasOwn(CATEGORIES, s.profile.focus), 'Неизвестное направление.');
  integer(s.profile.dailyMinutes, 0, 180, 'Лимит'); integer(s.profile.weeklyBudget, 0, 10000, 'Бюджет');
  const validDate = d => check(typeof d === 'string' && /^\d{4}-\d\d-\d\dT/.test(d) && Number.isFinite(Date.parse(d)), 'Некорректная дата.');
  for (const list of [s.tasks, s.rewards, s.claims]) {
    check(new Set(list.map(x => x.id)).size === list.length, 'Повторяющиеся записи.');
    for (const x of list) textValue(x.id, 1, 100, 'Идентификатор');
  }
  for (const t of s.tasks) {
    textValue(t.title, 3, 100, 'Задание'); textValue(t.titleEn || '', 0, 100, 'English task'); textValue(t.description, 10, 1500, 'Описание'); textValue(t.descriptionEn || '', 0, 1500, 'English description');
    check(Object.hasOwn(CATEGORIES, t.category) && Object.hasOwn(STATUS, t.status), 'Некорректное задание.');
    integer(t.points, 5, 200, 'Баллы'); integer(t.minutes, 5, 120, 'Длительность');
    textValue(t.report, ['review', 'done', 'revision'].includes(t.status) ? 5 : 0, 1500, 'Отчет'); textValue(t.reportEn || '', 0, 1500, 'English report'); textValue(t.feedback, 0, 600, 'Комментарий');
    validDate(t.createdAt);
    if (t.status === 'review') validDate(t.submittedAt);
    if (['done', 'revision'].includes(t.status)) { validDate(t.reviewedAt); check(['parent', 'moderator'].includes(t.reviewer), 'Некорректная проверка.'); }
  }
  for (const r of [...s.rewards, ...s.claims]) {
    textValue(r.title, 3, 100, 'Награда'); textValue(r.titleEn || '', 0, 100, 'English reward'); textValue(r.description, 10, 1500, 'Описание'); textValue(r.descriptionEn || '', 0, 1500, 'English description');
    check(['time', 'bonus', 'currency', 'together'].includes(r.kind), 'Неизвестная награда.');
    integer(r.cost, 1, 10000, 'Стоимость'); integer(r.minutes, 0, 180, 'Минуты'); integer(r.rubles, 0, 10000, 'Бюджет');
    check(r.kind === 'time' ? r.minutes > 0 : r.minutes === 0, 'Некорректное время награды.');
  }
  for (const c of s.claims) {
    check(s.rewards.some(r => r.id === c.rewardId), 'Награда не найдена.');
    check(['requested', 'delivered', 'cancelled'].includes(c.status), 'Неизвестный статус заявки.'); validDate(c.requestedAt);
    if (c.status === 'delivered') validDate(c.deliveredAt);
    if (c.status === 'cancelled') validDate(c.cancelledAt);
  }
  check(balance(s) >= 0, 'Баланс не может быть отрицательным.');
  return s;
}
