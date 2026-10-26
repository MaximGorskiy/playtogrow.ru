import test from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, createDemo, transition, balance, earned, validateState, limitsUsed, dayKey, rewardAvailability } from '../docs/model.js';

const now = new Date('2026-10-26T09:00:00Z');
const demo = () => createDemo(now);
const run = (s, role, action, data, date = now) => validateState(transition(s, role, action, data, date));
const request = (s, id, rewardId = 'time', date = now) => run(s, 'child', 'requestReward', { id, rewardId }, date);

test('demo starts with an auditable 150 points, three completed quests', () => {
  const s = validateState(demo());
  assert.equal(balance(s), 150); assert.equal(earned(s), 150);
  assert.equal(s.tasks.filter(t => t.status === 'done').length, 3);
});

test('demo content is bilingual while older backups remain valid', () => {
  const s = demo();
  assert.ok(s.profile.goalEn);
  assert.ok(Object.values(CATEGORIES).every(category => category.labelEn));
  assert.ok(s.tasks.every(task => task.titleEn && task.descriptionEn));
  assert.ok(s.rewards.every(reward => reward.titleEn && reward.descriptionEn));
  const legacy = structuredClone(s);
  delete legacy.profile.goalEn;
  for (const item of [...legacy.tasks, ...legacy.rewards]) { delete item.titleEn; delete item.descriptionEn; delete item.reportEn; }
  assert.equal(validateState(legacy), legacy);
});

test('child submits, parent confirms once, moderator cannot double-credit', () => {
  const original = demo();
  let s = run(original, 'child', 'submit', { id: 'read', report: 'Прочитал главу и обсудил ее с мамой.' });
  assert.equal(balance(s), 150);
  s = run(s, 'parent', 'review', { id: 'read', decision: 'approve', feedback: 'Спасибо за рассказ!' });
  assert.equal(balance(s), 180);
  assert.equal(original.tasks.find(t => t.id === 'read').status, 'active');
  assert.throws(() => run(s, 'moderator', 'review', { id: 'read', decision: 'approve' }), /уже проверено/);
  assert.throws(() => run(s, 'child', 'submit', { id: 'read', report: 'Повторный отчет.' }), /Сначала/);
});

test('revision requires helpful feedback and allows resubmission', () => {
  let s = demo();
  assert.throws(() => run(s, 'parent', 'review', { id: 'talk', decision: 'revise', feedback: '' }), /Комментарий/);
  s = run(s, 'moderator', 'review', { id: 'talk', decision: 'revise', feedback: 'Расскажи еще об одном интересном факте.' });
  assert.equal(balance(s), 150);
  s = run(s, 'child', 'submit', { id: 'talk', report: 'Еще узнал, как делать самолет из бумаги.' });
  s = run(s, 'parent', 'review', { id: 'talk', decision: 'approve' });
  assert.equal(balance(s), 185);
});

test('role restrictions are enforced by the model', () => {
  assert.throws(() => run(demo(), 'child', 'review', { id: 'talk', decision: 'approve' }), /взрослому/);
  assert.throws(() => run(demo(), 'parent', 'start', { id: 'walk' }), /ребенку/);
  assert.throws(() => run(demo(), 'child', 'saveGoal', { goal: 'Новая цель развития', focus: 'sport' }), /модератор/);
  assert.throws(() => run(demo(), 'moderator', 'saveRules', {}), /родителю/);
  assert.throws(() => run(demo(), 'child', 'createTask', {}), /взрослому/);
  assert.throws(() => run(demo(), 'unknown', 'start', { id: 'walk' }), /роль/);
});

test('redemption reserves balance; cancellation refunds exactly once', () => {
  let s = request(demo(), 'claim-1');
  assert.equal(balance(s), 90); assert.equal(earned(s), 150);
  s = run(s, 'child', 'cancelReward', { id: 'claim-1' });
  assert.equal(balance(s), 150);
  assert.throws(() => run(s, 'parent', 'cancelReward', { id: 'claim-1' }), /ожидающую/);
  assert.throws(() => request(s, 'claim-1'), /уже отправлена/);
});

test('only parent can deliver; delivery does not charge a second time', () => {
  let s = request(demo(), 'claim-1');
  assert.throws(() => run(s, 'child', 'deliverReward', { id: 'claim-1' }), /родителю/);
  assert.throws(() => run(s, 'moderator', 'deliverReward', { id: 'claim-1' }), /родителю/);
  s = run(s, 'parent', 'deliverReward', { id: 'claim-1' });
  assert.equal(balance(s), 90);
  assert.throws(() => run(s, 'parent', 'deliverReward', { id: 'claim-1' }), /обработана/);
  assert.throws(() => run(s, 'child', 'cancelReward', { id: 'claim-1' }), /ожидающую/);
});

test('insufficient balance, unknown records and invalid action are rejected', () => {
  assert.throws(() => request(demo(), 'c', 'currency'), /недостаточно/);
  assert.throws(() => run(demo(), 'child', 'start', { id: 'missing' }), /не найдена/);
  assert.throws(() => run(demo(), 'child', 'missing'), /Неизвестное действие/);
  assert.match(rewardAvailability(demo(), demo().rewards[2], now), /Еще 50/);
});

test('daily limit includes pending reservations and uses the issue date', () => {
  let s = demo(); s.profile.dailyMinutes = 30;
  s = request(s, 'c1');
  assert.throws(() => request(s, 'c2'), /дневной лимит/);
  const tomorrow = new Date('2026-10-27T09:00:00Z');
  assert.throws(() => request(s, 'c2', 'time', tomorrow), /дневной лимит/);
  s = run(s, 'parent', 'deliverReward', { id: 'c1' }, tomorrow);
  assert.equal(limitsUsed(s, tomorrow).minutes, 30);
  const next = new Date('2026-10-28T09:00:00Z');
  assert.equal(limitsUsed(s, next).minutes, 0);
  assert.equal(balance(request(s, 'c2', 'time', next)), 30);
});

test('Moscow midnight and Monday budget reset are consistent', () => {
  assert.equal(dayKey('2026-10-25T21:05:00Z'), '2026-10-26');
  let s = demo(); s.profile.weeklyBudget = 150;
  const sunday = new Date('2026-10-25T12:00:00Z');
  s = request(s, 'c1', 'bonus', sunday);
  assert.equal(limitsUsed(s, now).rubles, 150);
  s = run(s, 'parent', 'deliverReward', { id: 'c1' }, sunday);
  assert.equal(limitsUsed(s, sunday).rubles, 150);
  assert.equal(limitsUsed(s, now).rubles, 0);
});

test('budget checks and settings cannot undercut existing reservations', () => {
  let s = demo(); s.profile.weeklyBudget = 100;
  assert.throws(() => request(s, 'c1', 'bonus'), /бюджет/);
  s = request(demo(), 'c1');
  assert.throws(() => run(s, 'parent', 'saveRules', { child: 'Саша', game: 'Minecraft', dailyMinutes: 10, weeklyBudget: 500 }), /меньше/);
  s = run(s, 'parent', 'cancelReward', { id: 'c1' });
  s = run(s, 'parent', 'saveRules', { child: 'Алекс', game: 'Любимая игра', dailyMinutes: 0, weeklyBudget: 0 });
  assert.equal(s.profile.child, 'Алекс');
  assert.throws(() => request(s, 'c2'), /дневной/);
});

test('moderator creates a valid quest and child completes the full cycle', () => {
  let s = run(demo(), 'moderator', 'createTask', { id: 'new', title: 'Прогулка с картой', titleEn: 'A Map Walk', description: 'Нарисуй карту небольшого безопасного маршрута.', descriptionEn: 'Draw a map of a short, safe route.', category: 'sport', points: 45, minutes: 20 });
  assert.equal(s.tasks[0].titleEn, 'A Map Walk');
  assert.equal(s.tasks[0].descriptionEn, 'Draw a map of a short, safe route.');
  assert.throws(() => run(s, 'child', 'submit', { id: 'new', report: 'Уже все готово.' }), /Сначала/);
  s = run(s, 'child', 'start', { id: 'new' });
  assert.throws(() => run(s, 'child', 'start', { id: 'new' }), /уже выбрано/);
  s = run(s, 'child', 'submit', { id: 'new', report: 'Составил карту и прошел маршрут с родителем.' });
  s = run(s, 'moderator', 'review', { id: 'new', decision: 'approve' });
  assert.equal(balance(s), 195);
  assert.equal(s.revision, 4);
});

test('import validates structure, dates, duplicate IDs, enums and balances', () => {
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(demo()))), demo());
  const corruptions = [
    s => s.version = 99,
    s => s.tasks[0].points = -50,
    s => s.tasks[0].category = '__proto__',
    s => s.tasks[0].status = 'constructor',
    s => s.tasks.push(s.tasks[0]),
    s => s.tasks[0].createdAt = 'bad date',
    s => s.profile.dailyMinutes = 1000,
    s => s.rewards[0].minutes = 0,
    s => s.tasks = null,
  ];
  for (const corrupt of corruptions) { const s = demo(); corrupt(s); assert.throws(() => validateState(s)); }
  const s = request(demo(), 'c1'); s.claims[0].cost = 1000;
  assert.throws(() => validateState(s), /отрицательным/);
});

test('invalid fields do not mutate the original state', () => {
  const s = demo(), original = structuredClone(s);
  for (const points of [NaN, 2.5, 0, 201]) {
    assert.throws(() => run(s, 'parent', 'createTask', { id: 't', title: 'Новое задание', description: 'Описание нового задания', category: 'reading', points, minutes: 10 }));
  }
  assert.throws(() => run(s, 'child', 'submit', { id: 'read', report: '   ' }), /Отчет/);
  assert.deepEqual(s, original);
});
