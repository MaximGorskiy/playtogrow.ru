"""Build and validate static bilingual discovery pages for Play to Grow."""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
VERSION = "20261030-1"
UPDATED = "2026-10-30"
INDEXNOW_KEY = "7f9c6a24d18b43e0a5719d83c2ef640b"
RU_BASE = "https://playtogrow.ru"
EN_BASE = "https://playtogrow.online/en"

LANDING_EN = {
    "skip": "Skip to content", "slogan": "play to grow", "navLabel": "Main navigation",
    "navIdea": "How it works", "navParticipants": "For parents", "navPsychologists": "For psychologists",
    "navPilot": "Pilot", "navContact": "Contact", "languageLabel": "Site language", "openDemo": "Open demo",
    "heroEyebrow": "A pilot project for families and psychologists",
    "heroTitle": "Turning an interest in games into a driving force for a child's development",
    "heroLead": "A child chooses useful quests, gets adult support, and moves toward agreed gaming rewards — without shame, pressure, or fighting their interests.",
    "joinPilot": "Join the pilot", "viewDemo": "View the demo",
    "heroNote": "We are currently testing the idea with the first families. No registration or child data is required on this website.",
    "visualQuest": "Quest", "visualStep": "Step", "visualGrowth": "Growth",
    "recruitEyebrow": "Pilot recruitment is open",
    "recruitTitle": "I am looking for patients and families affected by computer and gaming addiction",
    "recruitText": "At this first stage, I am looking for parents with a child or teenager whose gaming causes conflict or displaces school, movement, relationships, or other important activities. Together, we will test whether familiar gaming motivation can help restore interest in real-life growth.",
    "recruitLabel": "Who the pilot is for", "badgeFamily": "Families with children and teens",
    "badgeVoluntary": "Voluntary participation", "badgeDialogue": "Open dialogue",
    "howEyebrow": "How the idea works", "howTitle": "Instead of taking games away, make them a bridge to growth and mutual understanding. What each participant gains:",
    "howIntro": "Goals and rewards are agreed within the family in advance. The child keeps a sense of choice, the adult notices the effort, and a specialist helps keep the focus on development.",
    "step1Title": "The child plays", "step1Text": "Their favorite games for as long as they want — and even longer.",
    "step2Title": "The parent sees the child develop", "step2Text": "With stronger achievements and skills outside games.",
    "step3Title": "The psychologist and moderator work together", "step3Text": "To identify growth opportunities for the young patient.",
    "rolesEyebrow": "Three participants — one team", "rolesTitle": "Each participant has specific actions in the system",
    "childTitle": "Child", "childText": "Chooses a quest, submits the result, earns points, and requests an agreed gaming reward.",
    "parentTitle": "Parent", "parentText": "Confirms the report, confirms delivery of the reward, and contributes financially to the project's development according to the family's means.",
    "moderatorTitle": "Moderator", "moderatorText": "Adds a psychologist's professional expertise to the quest set, continuously analyzes the child's progress, and oversees the process.",
    "stageEyebrow": "An honest note on the project stage", "stageTitle": "This is a pilot, not a finished medical program",
    "stageText": "We are gathering feedback, refining the method, and testing scenarios with families and psychologists. The platform does not diagnose, replace a doctor or psychotherapist, or promise guaranteed outcomes.",
    "tryDemo": "Try the prototype →", "financeEyebrow": "Transparent funding",
    "financeTitle": "All funds go only toward developing the project",
    "financeText": "During the pilot, participating parents fund the project. All funds received go to development, infrastructure, and improving the project. The project author takes no personal profit. Earning revenue is planned only after the platform is launched.",
    "financeDevelopment": "Development", "financeInfrastructure": "Infrastructure", "financeResearch": "Method development",
    "specialistEyebrow": "An invitation to professionals", "specialistTitle": "I am looking for psychologists for professional dialogue and collaboration",
    "specialistText": "If you work with children, teenagers, families, or problematic gaming behavior, let us discuss the method, ethical boundaries, and pilot format. Professional criticism is as valuable here as support.",
    "resourcesEyebrow": "Detailed information", "resourcesTitle": "Answers for families and professionals",
    "resourcesIntro": "Separate pages explain the pilot, project boundaries, working method, and frequently asked questions.",
    "resourceAbout": "About the project", "resourceAboutText": "The purpose, participants, and current stage of Play to Grow.",
    "resourceParents": "For parents", "resourceParentsText": "What a family does and how rewards work.",
    "resourceChildren": "For children", "resourceChildrenText": "How to choose quests and receive agreed bonuses.",
    "resourceMethod": "Method and sources", "resourceMethodText": "Working principles, professional boundaries, and sources.",
    "resourceSafety": "Safety and data", "resourceSafetyText": "What the demo stores and why personal information is not needed.",
    "resourceFaq": "Questions and answers", "resourceFaqText": "Short answers about the pilot, roles, and limitations.",
    "contactEyebrow": "Get in touch directly", "contactTitle": "Tell me briefly about your situation or propose a collaboration",
    "contactText": "For the first conversation, please do not send diagnoses, documents, or other sensitive information. Simply say whether you are a parent or a professional and how you would prefer to be contacted.",
    "phoneLabel": "Phone", "contactMissing": "Public contact details will be added before publication.",
    "footerSlogan": "Play to Grow · Turn play into growth",
    "footerNote": "Pilot project. This website does not collect personal data and is not a medical service.", "toTop": "Back to top ↑",
}

PAGES = {
    "about": {
        "ru": {"title": "О проекте Play to Grow", "description": "Цель Play to Grow, три участника системы и честное описание текущей стадии пилотного проекта.", "eyebrow": "О проекте", "lead": "Play to Grow связывает выбранные ребенком полезные действия в реальной жизни с игровыми наградами, которые семья согласовала заранее.", "summary": "Пилот для семей и психологов, а не готовая медицинская программа.", "sections": [
            {"title": "Задача проекта", "paragraphs": ["Не бороться с самим интересом к играм, а использовать уже существующую мотивацию для учебы, чтения, движения, творчества, общения и самостоятельности.", "Ребенок выбирает задание из подходящих вариантов. После выполнения он показывает результат, родитель проверяет отчет и выдает заранее согласованную награду."]},
            {"title": "Три участника", "bullets": ["Ребенок выбирает задание, публикует результат, получает баллы и запрашивает награду.", "Родитель проверяет отчет, подтверждает фактическую выдачу награды и участвует в семейных договоренностях.", "Модератор с профессиональными знаниями психолога подбирает задания, анализирует динамику и корректирует план."]},
            {"title": "Текущая стадия", "tone": "limit", "paragraphs": ["Сейчас опубликованы посадочная страница и статическая демонстрация трех ролей в одном браузере. Мы ищем первые семьи и психологов, чтобы проверить рабочие сценарии и уточнить методику.", "Play to Grow не ставит диагноз, не заменяет врача или психотерапевта и не обещает гарантированного результата."]},
        ]},
        "en": {"title": "About Play to Grow", "description": "The purpose of Play to Grow, its three participant roles, and an honest description of the pilot's current stage.", "eyebrow": "About the project", "lead": "Play to Grow connects useful real-life actions chosen by a child with gaming rewards agreed by the family in advance.", "summary": "A pilot for families and psychologists, not a finished medical program.", "sections": [
            {"title": "Project purpose", "paragraphs": ["The goal is not to fight the child's interest in games, but to use an existing source of motivation for learning, reading, movement, creativity, relationships, and independence.", "The child chooses from suitable quests. After completing one, they share the result; a parent reviews the report and provides the reward agreed in advance."]},
            {"title": "Three participants", "bullets": ["The child chooses a quest, shares the result, earns points, and requests a reward.", "The parent reviews the report, confirms actual reward delivery, and takes part in the family agreement.", "A moderator with a psychologist's professional knowledge selects quests, analyzes progress, and adjusts the plan."]},
            {"title": "Current stage", "tone": "limit", "paragraphs": ["The current release is a landing page and a static three-role demo in one browser. We are looking for the first families and psychologists to test the workflow and refine the method.", "Play to Grow does not diagnose, replace a doctor or psychotherapist, or promise a guaranteed outcome."]},
        ]},
    },
    "how-it-works": {
        "ru": {"title": "Как работает Play to Grow", "description": "Пошаговый цикл задания: выбор ребенком, отчет, проверка родителем, баллы, игровая награда и анализ с психологом.", "eyebrow": "Рабочий цикл", "lead": "Цель, задание и награда обсуждаются заранее. Ребенок сохраняет выбор, взрослые замечают усилие, а психолог помогает анализировать динамику.", "summary": "Выбор → действие → отчет → проверка → награда → анализ.", "sections": [
            {"title": "Шесть шагов", "ordered": ["Семья и психолог выбирают направление развития.", "Ребенок выбирает одно из предложенных заданий.", "Ребенок выполняет задание и отправляет короткий отчет.", "Родитель подтверждает результат или спокойно возвращает его на доработку.", "После подтверждения ребенок получает баллы и запрашивает согласованную игровую награду.", "Психолог анализирует динамику и вместе с семьей меняет следующие задания."]},
            {"title": "Что считается наградой", "paragraphs": ["Это может быть дополнительное игровое время, внутриигровой бонус или валюта, совместная игра либо другая ценная для ребенка возможность. Семья заранее определяет, какие награды допустимы и как они выдаются."]},
            {"title": "Что платформа не делает", "tone": "note", "bullets": ["Не покупает игровую валюту автоматически.", "Не подключается к аккаунтам ребенка в играх.", "Не измеряет и не блокирует экранное время.", "Не заменяет профессиональную оценку состояния ребенка."]},
        ]},
        "en": {"title": "How Play to Grow works", "description": "The quest cycle: child choice, report, parent review, points, a gaming reward, and progress analysis with a psychologist.", "eyebrow": "The working cycle", "lead": "The goal, quest, and reward are discussed in advance. The child keeps a choice, adults notice the effort, and a psychologist helps analyze progress.", "summary": "Choice → action → report → review → reward → analysis.", "sections": [
            {"title": "Six steps", "ordered": ["The family and psychologist choose a development area.", "The child chooses one of the available quests.", "The child completes it and submits a short report.", "A parent approves the result or calmly returns it for an update.", "After approval, the child earns points and requests an agreed gaming reward.", "The psychologist analyzes progress and adjusts future quests with the family."]},
            {"title": "What can be a reward", "paragraphs": ["It may be extra game time, an in-game bonus or currency, playing together, or another opportunity that matters to the child. The family decides in advance which rewards are acceptable and how they are delivered."]},
            {"title": "What the platform does not do", "tone": "note", "bullets": ["It does not buy game currency automatically.", "It does not connect to the child's gaming accounts.", "It does not measure or block screen time.", "It does not replace a professional assessment of the child's condition."]},
        ]},
    },
    "for-parents": {
        "ru": {"title": "Play to Grow для родителей", "description": "Что делает родитель в Play to Grow, как согласовать задания и игровые награды и когда нужна консультация специалиста.", "eyebrow": "Родителям", "lead": "Родитель не превращает каждое дело в торг. Его задача — заранее договориться о правилах, замечать реальные усилия и последовательно выполнять обещания.", "summary": "Понятные правила, спокойная проверка и согласованные награды.", "sections": [
            {"title": "Что потребуется от родителя", "bullets": ["Вместе выбрать несколько подходящих заданий, а не назначать одно без выбора.", "Заранее обсудить стоимость наград в баллах и семейные ограничения.", "Проверять конкретный результат, а не сравнивать ребенка с другими.", "Подтверждать только фактически выданную награду.", "Обсуждать динамику и трудности с психологом."]},
            {"title": "Когда стоит обратиться к специалисту", "tone": "warning", "paragraphs": ["Частые конфликты вокруг игр сами по себе не являются диагнозом. Если игры заметно вытесняют сон, учебу, отношения или другие важные области жизни, либо ребенок продолжает играть несмотря на серьезные последствия, обсудите ситуацию с квалифицированным психологом или врачом."]},
            {"title": "Первое обращение", "paragraphs": ["Для первого разговора достаточно написать, что вы родитель, указать возрастную группу ребенка без имени и кратко описать, какие трудности вызывают игры. Не отправляйте через публичные контакты диагнозы, медицинские документы и другие чувствительные сведения."]},
        ]},
        "en": {"title": "Play to Grow for parents", "description": "The parent's role in Play to Grow, how to agree on quests and gaming rewards, and when professional advice may be needed.", "eyebrow": "For parents", "lead": "A parent does not turn every task into a transaction. Their role is to agree on clear rules, notice real effort, and consistently keep promises.", "summary": "Clear rules, calm review, and agreed rewards.", "sections": [
            {"title": "What the parent does", "bullets": ["Offer several suitable quests instead of assigning one with no choice.", "Agree on point costs and family limits before the quest begins.", "Review the specific result instead of comparing the child with others.", "Confirm only a reward that was actually delivered.", "Discuss progress and difficulties with a psychologist."]},
            {"title": "When to contact a professional", "tone": "warning", "paragraphs": ["Frequent arguments about games are not a diagnosis by themselves. If gaming noticeably displaces sleep, education, relationships, or other important parts of life, or continues despite serious negative consequences, discuss the situation with a qualified psychologist or doctor."]},
            {"title": "First contact", "paragraphs": ["For a first conversation, say that you are a parent, give the child's age range without their name, and briefly describe the difficulties related to gaming. Do not send diagnoses, medical records, or other sensitive information through public contact channels."]},
        ]},
    },
    "for-children": {
        "ru": {"title": "Play to Grow для детей и подростков", "description": "Простое объяснение ребенку: как выбирать задания, показывать результат, получать баллы и согласованные игровые бонусы.", "eyebrow": "Детям и подросткам", "lead": "Ты выбираешь одно из предложенных заданий в реальной жизни. За выполненный результат можно получить баллы и запросить игровую награду, о которой вы договорились заранее.", "summary": "Ты выбираешь задание; взрослые помогают и выполняют договоренности.", "sections": [
            {"title": "Что делаешь ты", "ordered": ["Смотришь доступные задания и выбираешь подходящее.", "Выполняешь его в своем темпе.", "Пишешь коротко, что получилось, и прикладываешь результат, если это нужно.", "После проверки получаешь баллы.", "Выбираешь доступную награду и отправляешь запрос родителю."]},
            {"title": "Если задание не подходит", "paragraphs": ["Можно сказать об этом родителю или психологу, попросить помощь, выбрать другой вариант или предложить свое задание. Смысл системы — не наказание и не оценка личности, а понятный следующий шаг."]},
            {"title": "Что важно знать", "tone": "note", "paragraphs": ["Демоверсия не подключается к твоей игре и не видит игровой аккаунт. Не вводи в нее настоящее имя, адрес, школу, пароли или другие личные сведения."]},
        ]},
        "en": {"title": "Play to Grow for children and teenagers", "description": "A simple explanation for a child: choose quests, show the result, earn points, and request agreed gaming bonuses.", "eyebrow": "For children and teens", "lead": "You choose one of the available real-life quests. A completed result can earn points that you use to request a gaming reward agreed in advance.", "summary": "You choose the quest; adults support you and keep the agreement.", "sections": [
            {"title": "What you do", "ordered": ["Look through the available quests and choose one that fits.", "Complete it at your own pace.", "Write a short note about the result and attach evidence if needed.", "Earn points after the result is reviewed.", "Choose an available reward and send a request to your parent."]},
            {"title": "If a quest does not work for you", "paragraphs": ["Tell a parent or psychologist, ask for help, choose another option, or suggest your own quest. The system is not meant as a punishment or a judgment of you; it is meant to make the next step clear."]},
            {"title": "Important", "tone": "note", "paragraphs": ["The demo does not connect to your game and cannot see your gaming account. Do not enter your real full name, address, school, passwords, or other personal information."]},
        ]},
    },
    "for-psychologists": {
        "ru": {"title": "Play to Grow для психологов", "description": "Роль психолога в пилоте Play to Grow: профессиональный отбор заданий, анализ динамики, этические границы и сотрудничество.", "eyebrow": "Психологам", "lead": "Специалист помогает превратить общую идею в индивидуальный, наблюдаемый и этически приемлемый процесс для конкретной семьи.", "summary": "Ищем профессиональный диалог, критику методики и участие в пилоте.", "sections": [
            {"title": "Предполагаемая роль", "bullets": ["Уточнять запрос семьи и функциональные трудности без постановки диагноза через сайт.", "Подбирать наблюдаемые задания и критерии выполнения.", "Помогать семье согласовать награды, не усиливающие конфликт и финансовый риск.", "Анализировать динамику, причины срывов и необходимость изменения плана.", "Обозначать случаи, когда формат проекта не подходит и нужна другая помощь."]},
            {"title": "Что мы хотим проверить", "paragraphs": ["Нас интересует не количество выданных наград само по себе, а устойчивость участия, перенос инициативы в реальную жизнь, качество семейных договоренностей и отсутствие усиления конфликта."]},
            {"title": "Приглашение к сотрудничеству", "tone": "limit", "paragraphs": ["Проект ищет психологов, работающих с детьми, подростками, семьями или проблемным игровым поведением. Нужны критика формулировок, обсуждение этических границ и совместная разработка пилотного протокола."]},
        ]},
        "en": {"title": "Play to Grow for psychologists", "description": "The psychologist's role in the Play to Grow pilot: professional quest selection, progress review, ethical boundaries, and collaboration.", "eyebrow": "For psychologists", "lead": "A professional helps turn the general idea into an individualized, observable, and ethically appropriate process for a specific family.", "summary": "We invite professional dialogue, critical review, and pilot collaboration.", "sections": [
            {"title": "Proposed role", "bullets": ["Clarify the family's request and functional difficulties without diagnosing through the website.", "Select observable quests and completion criteria.", "Help the family agree on rewards that do not intensify conflict or financial risk.", "Analyze progress, reasons for setbacks, and the need to adjust the plan.", "Identify situations where this format is unsuitable and different support is needed."]},
            {"title": "What we want to test", "paragraphs": ["The relevant outcomes are not simply the number of rewards delivered. We want to examine sustained participation, initiative in real life, the quality of family agreements, and whether conflict is avoided rather than intensified."]},
            {"title": "Invitation to collaborate", "tone": "limit", "paragraphs": ["We are looking for psychologists who work with children, teenagers, families, or problematic gaming behavior. We welcome critical review of the wording, discussion of ethical boundaries, and joint development of a pilot protocol."]},
        ]},
    },
    "pilot": {
        "ru": {"title": "Участие в пилоте Play to Grow", "description": "Кого ищет пилот Play to Grow, как проходит первый контакт, что финансируют родители и какие результаты не гарантируются.", "eyebrow": "Пилотный этап", "lead": "Мы ищем первые семьи и психологов, чтобы проверить понятность сценария, жизнеспособность договоренностей и направления развития платформы.", "summary": "Добровольное участие, минимизация данных и честные ограничения.", "sections": [
            {"title": "Кого мы ищем", "bullets": ["Родителей с ребенком или подростком, у которых игры стали постоянным источником конфликтов или вытесняют важные дела.", "Психологов для профессионального сопровождения, обсуждения методики и этических границ.", "Семьи, готовые обсуждать правила и давать конкретную обратную связь."]},
            {"title": "Как начинается работа", "ordered": ["Короткое знакомство без передачи документов и подробных персональных данных.", "Обсуждение ожиданий, границ и того, подходит ли пилот семье.", "Согласование небольшого набора заданий и наград.", "Проверка сценария и регулярный разбор трудностей.", "Решение о продолжении, изменении или прекращении участия."]},
            {"title": "Финансирование", "tone": "note", "paragraphs": ["На пилотном этапе проект финансируют родители участников по своим возможностям. Все средства направляются на разработку, инфраструктуру и развитие методики. Автор не получает личной прибыли до ввода платформы в эксплуатацию."]},
            {"title": "Чего мы не обещаем", "tone": "warning", "paragraphs": ["Участие не гарантирует уменьшение игрового времени, исчезновение конфликтов или клинический результат. Пилот может быть остановлен, если формат не подходит ребенку или семье."]},
        ]},
        "en": {"title": "Joining the Play to Grow pilot", "description": "Who the pilot is looking for, how first contact works, what parent funding supports, and which outcomes are not guaranteed.", "eyebrow": "Pilot stage", "lead": "We are looking for the first families and psychologists to test whether the workflow is clear, agreements are workable, and the platform is developing in the right direction.", "summary": "Voluntary participation, minimal data, and honest limitations.", "sections": [
            {"title": "Who we are looking for", "bullets": ["Parents of a child or teenager when gaming has become a constant source of conflict or displaces important activities.", "Psychologists for professional support and discussion of the method and ethical boundaries.", "Families willing to discuss rules and provide specific feedback."]},
            {"title": "How participation begins", "ordered": ["A short introduction without sending documents or detailed personal data.", "A discussion of expectations, boundaries, and whether the pilot fits the family.", "Agreement on a small set of quests and rewards.", "Testing the workflow and regularly reviewing difficulties.", "A decision to continue, adjust, or stop participation."]},
            {"title": "Funding", "tone": "note", "paragraphs": ["During the pilot, participating parents contribute according to their means. All funds go to development, infrastructure, and refinement of the method. The author takes no personal profit before the platform is launched."]},
            {"title": "What we do not promise", "tone": "warning", "paragraphs": ["Participation does not guarantee reduced gaming time, the disappearance of conflict, or a clinical outcome. The pilot may stop if the format is not suitable for the child or family."]},
        ]},
    },
    "methodology": {
        "ru": {"title": "Методика и источники Play to Grow", "description": "Рабочая гипотеза, принципы, критерии наблюдения и официальные источники о проблемном игровом поведении.", "eyebrow": "Методика и источники", "lead": "Play to Grow пока является проверяемой рабочей гипотезой, а не доказанным методом лечения. Мы отделяем наблюдаемые действия от клинической диагностики.", "summary": "Выбор, конкретные действия, заранее согласованные правила и анализ динамики.", "sections": [
            {"title": "Рабочая гипотеза", "paragraphs": ["Если интерес к играм уже является сильной мотивацией, его можно связать с небольшими реальными действиями, которые ребенок выбирает из подходящего набора. Понятный цикл отчета и награды может помочь семье обсуждать усилие конкретно, а не через общий конфликт вокруг игр."]},
            {"title": "Принципы пилота", "bullets": ["Выбор ребенка внутри безопасных вариантов.", "Небольшие наблюдаемые задания вместо абстрактных требований.", "Правила и награды обсуждаются до выполнения.", "Родитель подтверждает реальный результат и фактическую выдачу.", "Психолог анализирует контекст, динамику и побочные эффекты.", "План меняется, если мотивация превращается в давление или усиливает конфликт."]},
            {"title": "Что оценивается", "paragraphs": ["На пилоте можно наблюдать завершение заданий, регулярность участия, самостоятельный выбор, качество семейных договоренностей и субъективную оценку конфликта. Эти показатели не являются диагнозом и не доказывают лечебную эффективность."]},
            {"title": "Официальные источники", "links": [["ВОЗ: Gaming disorder в ICD-11", "https://www.who.int/standards/classifications/frequently-asked-questions/gaming-disorder/"], ["ВОЗ: вопросы и ответы об игровом расстройстве", "https://www.who.int/news-room/questions-and-answers/item/addictive-behaviours-gaming-disorder"], ["American Academy of Pediatrics: семейный медиаплан", "https://www.healthychildren.org/English/family-life/Media/Pages/How-to-Make-a-Family-Media-Use-Plan.aspx"]], "paragraphs": ["ВОЗ описывает игровое расстройство через нарушение контроля, приоритет игр над другими занятиями и продолжение несмотря на негативные последствия при значимом нарушении функционирования. Диагноз относится к компетенции квалифицированного специалиста; большое количество игрового времени само по себе недостаточно."]},
        ]},
        "en": {"title": "Play to Grow method and sources", "description": "The working hypothesis, principles, observation criteria, and official sources on problematic gaming behavior.", "eyebrow": "Method and sources", "lead": "Play to Grow is currently a testable working hypothesis, not an evidence-based treatment. Observable actions are kept separate from clinical diagnosis.", "summary": "Choice, concrete action, agreed rules, and progress review.", "sections": [
            {"title": "Working hypothesis", "paragraphs": ["When gaming is already a strong source of motivation, it may be connected to small real-life actions chosen by the child from a suitable set. A clear report-and-reward cycle may help a family discuss effort in concrete terms instead of through a general conflict about games."]},
            {"title": "Pilot principles", "bullets": ["Child choice within safe options.", "Small observable quests instead of abstract demands.", "Rules and rewards agreed before completion.", "A parent confirms both the result and actual reward delivery.", "A psychologist considers context, progress, and unintended effects.", "The plan changes if motivation becomes pressure or increases conflict."]},
            {"title": "What is observed", "paragraphs": ["The pilot may track quest completion, continued participation, independent choice, the quality of family agreements, and subjective reports of conflict. These measures are not a diagnosis and do not demonstrate treatment effectiveness."]},
            {"title": "Official sources", "links": [["WHO: Gaming disorder in ICD-11", "https://www.who.int/standards/classifications/frequently-asked-questions/gaming-disorder/"], ["WHO: Q&A on gaming disorder", "https://www.who.int/news-room/questions-and-answers/item/addictive-behaviours-gaming-disorder"], ["American Academy of Pediatrics: Family Media Plan", "https://www.healthychildren.org/English/family-life/Media/Pages/How-to-Make-a-Family-Media-Use-Plan.aspx"]], "paragraphs": ["WHO describes gaming disorder through impaired control, priority given to gaming over other activities, and continuation despite negative consequences when this causes significant functional impairment. Diagnosis belongs to a qualified professional; a high amount of gaming time alone is not sufficient."]},
        ]},
    },
    "safety": {
        "ru": {"title": "Безопасность, этика и данные", "description": "Какие данные хранит демонстрация Play to Grow, чего нельзя вводить и как отделяется публичный сайт от будущей защищенной системы.", "eyebrow": "Безопасность и данные", "lead": "Публичный сайт предназначен для знакомства с идеей. Для его просмотра и демоверсии не нужны реальные персональные данные ребенка.", "summary": "Демо хранит учебные данные только в localStorage текущего браузера и домена.", "sections": [
            {"title": "Что хранит текущая демоверсия", "bullets": ["Псевдоним и учебные примеры заданий, если пользователь их меняет.", "Отчеты, баллы, награды и настройки внутри localStorage браузера.", "Отдельную копию на каждом устройстве, в каждом браузере и на каждом домене."]},
            {"title": "Чего не следует вводить", "tone": "warning", "bullets": ["Фамилию и полное имя ребенка.", "Адрес, школу, расписание и точное местоположение.", "Медицинские документы, диагнозы и заключения.", "Пароли и данные игровых аккаунтов.", "Фотографии и сведения, по которым можно идентифицировать ребенка."]},
            {"title": "Технические ограничения", "paragraphs": ["Переключатель ролей в демо не является авторизацией. Данные можно изменить инструментами браузера, они не синхронизируются и удаляются при очистке хранилища. Сайт не подключается к играм и не контролирует устройства."]},
            {"title": "Будущая рабочая система", "tone": "limit", "paragraphs": ["Реальные учетные записи, разграничение доступа и работа с персональными данными потребуют отдельного backend, согласий, правил хранения и удаления, журнала действий и правовой проверки. Эти функции не включены в текущую публичную демонстрацию."]},
        ]},
        "en": {"title": "Safety, ethics, and data", "description": "What the Play to Grow demo stores, what not to enter, and how the public website is separated from a future protected system.", "eyebrow": "Safety and data", "lead": "The public website introduces the idea. Viewing it and using the demo do not require a child's real personal data.", "summary": "Demo data stays in localStorage for the current browser and domain.", "sections": [
            {"title": "What the current demo stores", "bullets": ["A nickname and sample quest content if the user changes them.", "Reports, points, rewards, and settings in browser localStorage.", "A separate copy on every device, browser, and domain."]},
            {"title": "What not to enter", "tone": "warning", "bullets": ["The child's full legal name.", "Address, school, schedule, or precise location.", "Medical documents, diagnoses, or professional reports.", "Passwords or gaming-account credentials.", "Photos or details that identify the child."]},
            {"title": "Technical limitations", "paragraphs": ["The role switch in the demo is not authentication. Browser tools can change the data; it is not synchronized and is deleted when site storage is cleared. The website does not connect to games or control devices."]},
            {"title": "Future production system", "tone": "limit", "paragraphs": ["Real accounts, access control, and personal-data processing require a separate backend, consent and retention rules, managed deletion, an audit log, and legal review. These capabilities are not part of the public demo."]},
        ]},
    },
    "contact": {
        "ru": {"title": "Связаться с Play to Grow", "description": "Контакты автора Play to Grow для родителей, семей и психологов. Что написать в первом сообщении и какие данные не отправлять.", "eyebrow": "Контакты", "lead": "Напишите, если хотите обсудить участие семьи в пилоте или профессиональное сотрудничество.", "summary": "Для первого сообщения достаточно вашей роли, общего вопроса и удобного способа связи.", "sections": [
            {"title": "Контакты", "links": [["Telegram: @MaksimGorskiy", "https://t.me/MaksimGorskiy"], ["Email: 31415926x2@gmail.com", "mailto:31415926x2@gmail.com"], ["Телефон: +7 920 015-63-12", "tel:+79200156312"]]},
            {"title": "Что написать", "bullets": ["Кто вы: родитель, психолог или другой специалист.", "Возрастную группу ребенка без имени, если обращается родитель.", "Какой вопрос вы хотите обсудить.", "Как и когда удобнее получить ответ."]},
            {"title": "Не отправляйте чувствительные данные", "tone": "warning", "paragraphs": ["До согласования безопасного канала не присылайте диагнозы, документы, фотографии, адреса, пароли и другие персональные сведения ребенка."]},
        ]},
        "en": {"title": "Contact Play to Grow", "description": "Play to Grow contact details for parents, families, and psychologists, including what to write and what data not to send.", "eyebrow": "Contact", "lead": "Get in touch to discuss family participation in the pilot or professional collaboration.", "summary": "A first message only needs your role, a general question, and your preferred contact method.", "sections": [
            {"title": "Contact details", "links": [["Telegram: @MaksimGorskiy", "https://t.me/MaksimGorskiy"], ["Email: 31415926x2@gmail.com", "mailto:31415926x2@gmail.com"], ["Phone: +7 920 015-63-12", "tel:+79200156312"]]},
            {"title": "What to write", "bullets": ["Whether you are a parent, psychologist, or another professional.", "The child's age range without their name if you are a parent.", "The general question you want to discuss.", "How and when you prefer to receive a reply."]},
            {"title": "Do not send sensitive data", "tone": "warning", "paragraphs": ["Until a suitable secure channel is agreed, do not send diagnoses, documents, photographs, addresses, passwords, or other personal information about a child."]},
        ]},
    },
}

FAQ = {
    "ru": [
        ("Play to Grow лечит игровую зависимость?", "Нет. Сейчас это пилотный проект и демонстрация. Он не ставит диагноз, не заменяет врача или психотерапевта и не обещает лечебного результата."),
        ("Нужно полностью запретить ребенку игры?", "Нет. Идея проекта состоит в том, чтобы использовать существующий интерес к играм как мотивацию для выбранных полезных действий, сохраняя семейные границы."),
        ("Какие задания получает ребенок?", "Задания могут относиться к учебе, чтению, движению, творчеству, общению и самостоятельности. Конкретный набор определяется для семьи вместе с психологом."),
        ("Кто выбирает задание?", "Ребенок выбирает из нескольких подходящих вариантов. Можно попросить помощь, предложить свое задание или обсудить замену."),
        ("Какие награды можно использовать?", "Игровое время, внутриигровой бонус или валюта, совместная игра либо другая согласованная возможность. Ограничения и способ выдачи семья определяет заранее."),
        ("Платформа сама выдает игровую валюту?", "Нет. Сайт не подключается к игровым аккаунтам и ничего не покупает. Родитель предоставляет согласованную награду самостоятельно."),
        ("Какую роль выполняет психолог?", "Помогает уточнять цели, подбирать наблюдаемые задания, анализировать динамику и менять план, если он не помогает или усиливает конфликт."),
        ("Хранятся ли данные ребенка на сервере?", "Текущая публичная демоверсия не имеет серверной базы. Учебные данные сохраняются только в localStorage конкретного браузера и домена."),
        ("Можно ли вводить настоящие сведения ребенка?", "Не нужно. Используйте вымышленные данные и не вводите полное имя, адрес, школу, документы, диагнозы, фотографии или пароли."),
        ("Как принять участие в пилоте?", "Свяжитесь с автором через Telegram, email или телефон. Для первого разговора достаточно указать, что вы родитель или специалист, и кратко обозначить вопрос."),
        ("Куда направляются деньги родителей?", "На пилотном этапе все поступления направляются на разработку, инфраструктуру и развитие методики. Автор не получает личной прибыли до запуска платформы."),
        ("Работают ли разные роли с разных устройств?", "Пока нет. Текущая версия показывает три роли в одном браузере. Общие учетные записи и синхронизация потребуют отдельного защищенного backend."),
    ],
    "en": [
        ("Does Play to Grow treat gaming addiction?", "No. It is currently a pilot and a demonstration. It does not diagnose, replace a doctor or psychotherapist, or promise a treatment outcome."),
        ("Does a child have to stop gaming completely?", "No. The project uses an existing interest in games as motivation for chosen useful actions while keeping family boundaries."),
        ("What quests does a child receive?", "Quests may cover learning, reading, movement, creativity, relationships, and independence. The specific set is developed for the family with a psychologist."),
        ("Who chooses the quest?", "The child chooses from several suitable options. They can ask for help, suggest their own quest, or discuss a replacement."),
        ("What rewards can be used?", "Game time, an in-game bonus or currency, playing together, or another agreed opportunity. The family sets limits and delivery rules in advance."),
        ("Does the platform deliver game currency?", "No. The site does not connect to gaming accounts or buy anything. A parent provides the agreed reward independently."),
        ("What does the psychologist do?", "They help clarify goals, select observable quests, analyze progress, and change the plan if it is unhelpful or increases conflict."),
        ("Is child data stored on a server?", "The current public demo has no server database. Demo data stays in localStorage for the specific browser and domain."),
        ("Should real child information be entered?", "No. Use fictional data and do not enter a full name, address, school, documents, diagnoses, photos, or passwords."),
        ("How can I join the pilot?", "Contact the author through Telegram, email, or phone. For a first conversation, simply say whether you are a parent or professional and briefly state your question."),
        ("How is parent funding used?", "During the pilot, all contributions go to development, infrastructure, and refinement of the method. The author takes no personal profit before launch."),
        ("Can the roles use different devices?", "Not yet. The current version demonstrates three roles in one browser. Shared accounts and synchronization require a separate protected backend."),
    ],
}

UPDATES = {
    "ru": {"title": "Обновления Play to Grow", "description": "Датированный журнал публичных изменений Play to Grow без персональных данных участников.", "eyebrow": "Обновления", "lead": "Публичные изменения продукта, методики и правил безопасности.", "summary": "Здесь фиксируются изменения, которые важны семьям и специалистам.", "entries": [
        ("30 октября 2026", "Двуязычные страницы и открытая индексация", "Добавлены отдельные русские и английские страницы для родителей, детей и психологов, описание методики, безопасности, пилота и FAQ. Настроены карта сайта, правила поисковых роботов и машиночитаемые сведения о проекте."),
        ("26 октября 2026", "Две одинаковые публичные публикации", "Оба домена синхронизированы, русский язык оставлен основным, английский доступен через переключатель. В демоверсии уточнена навигация ролей и возврат на стартовую страницу."),
    ]},
    "en": {"title": "Play to Grow updates", "description": "A dated record of public Play to Grow changes without participant personal data.", "eyebrow": "Updates", "lead": "Public changes to the product, method, and safety rules.", "summary": "Changes relevant to families and professionals are recorded here.", "entries": [
        ("30 October 2026", "Bilingual pages and open indexing", "Separate Russian and English pages were added for parents, children, and psychologists, together with the method, safety, pilot, and FAQ. Sitemaps, crawler rules, and machine-readable project information were added."),
        ("26 October 2026", "Two synchronized public releases", "Both domains were synchronized, Russian remained the default language, and English stayed available through the language switch. Demo role navigation and the return to the start page were clarified."),
    ]},
}

NAV = {
    "ru": [("Как работает", "how-it-works"), ("Родителям", "for-parents"), ("Психологам", "for-psychologists"), ("Пилот", "pilot"), ("FAQ", "faq")],
    "en": [("How it works", "how-it-works"), ("For parents", "for-parents"), ("For psychologists", "for-psychologists"), ("Pilot", "pilot"), ("FAQ", "faq")],
}


def canonical_url(language: str, slug: str = "") -> str:
    base = RU_BASE if language == "ru" else EN_BASE
    return f"{base}/{slug}/" if slug else f"{base}/"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def json_ld(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render_section(section: dict) -> str:
    tone = esc(section.get("tone", ""))
    body = [f'<section class="knowledge-section {tone}"><h2>{esc(section["title"])}</h2>']
    for paragraph in section.get("paragraphs", []):
        body.append(f"<p>{esc(paragraph)}</p>")
    if section.get("bullets"):
        body.append("<ul>" + "".join(f"<li>{esc(item)}</li>" for item in section["bullets"]) + "</ul>")
    if section.get("ordered"):
        body.append("<ol>" + "".join(f"<li>{esc(item)}</li>" for item in section["ordered"]) + "</ol>")
    if section.get("links"):
        body.append('<ul class="source-list">' + "".join(f'<li><a href="{esc(url)}" rel="noreferrer">{esc(label)}</a></li>' for label, url in section["links"]) + "</ul>")
    body.append("</section>")
    return "".join(body)


def page_shell(language: str, slug: str, data: dict, content: str, schema_type: str = "WebPage", extra_schema: dict | None = None) -> str:
    ru_url, en_url = canonical_url("ru", slug), canonical_url("en", slug)
    canonical = ru_url if language == "ru" else en_url
    home = canonical_url(language)
    lang_code = "RU" if language == "ru" else "EN"
    other_lang = "EN" if language == "ru" else "RU"
    other_url = en_url if language == "ru" else ru_url
    asset_prefix = "../" if language == "ru" else "../../"
    nav = "".join(f'<a href="{canonical_url(language, item_slug)}">{esc(label)}</a>' for label, item_slug in NAV[language])
    schema = {"@context": "https://schema.org", "@type": schema_type, "@id": canonical + "#page", "url": canonical, "name": data["title"], "description": data["description"], "inLanguage": language, "dateModified": UPDATED, "isPartOf": {"@id": canonical_url(language) + "#website"}, "author": {"@type": "Person", "name": "Максим Горский", "url": RU_BASE + "/"}}
    if extra_schema:
        schema.update(extra_schema)
    demo_url = f"{RU_BASE}/demo.html?lang=ru&v={VERSION}#child/day" if language == "ru" else f"https://playtogrow.online/demo.html?lang=en&v={VERSION}#child/day"
    contact_label = "Связаться" if language == "ru" else "Contact"
    home_label = "Стартовая" if language == "ru" else "Home"
    info_label = "Коротко" if language == "ru" else "In brief"
    more_label = "Другие разделы" if language == "ru" else "More sections"
    demo_label = "Открыть демо" if language == "ru" else "Open demo"
    cta_title = "Обсудить участие или сотрудничество" if language == "ru" else "Discuss participation or collaboration"
    cta_text = "Для первого сообщения не нужны документы и персональные данные ребенка." if language == "ru" else "A first message does not require documents or a child's personal data."
    return f'''<!doctype html>
<html lang="{language}">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#173f37">
  <meta name="description" content="{esc(data['description'])}"><meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"><meta name="author" content="Максим Горский">
  <meta property="og:type" content="article"><meta property="og:site_name" content="Play to Grow"><meta property="og:locale" content="{'ru_RU' if language == 'ru' else 'en_US'}"><meta property="og:title" content="{esc(data['title'])}"><meta property="og:description" content="{esc(data['description'])}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{RU_BASE}/assets/mark.svg">
  <meta name="twitter:card" content="summary"><meta name="twitter:title" content="{esc(data['title'])}"><meta name="twitter:description" content="{esc(data['description'])}">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';">
  <title>{esc(data['title'])} — Play to Grow</title>
  <link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="ru" href="{ru_url}"><link rel="alternate" hreflang="en" href="{en_url}"><link rel="alternate" hreflang="x-default" href="{ru_url}">
  <link rel="alternate" type="application/rss+xml" title="Play to Grow updates" href="{canonical_url(language)}feed.xml">
  <link rel="icon" href="{asset_prefix}assets/mark.svg" type="image/svg+xml"><link rel="stylesheet" href="{asset_prefix}landing.css?v={VERSION}"><link rel="stylesheet" href="{asset_prefix}knowledge.css?v={VERSION}">
  <script type="application/ld+json">{json_ld(schema)}</script>
</head>
<body>
  <a class="skip-link" href="#main">{'Перейти к содержимому' if language == 'ru' else 'Skip to content'}</a>
  <header class="site-header"><a class="brand" href="{home}" aria-label="Play to Grow"><img src="{asset_prefix}assets/mark.svg" width="44" height="44" alt=""><span>Play to Grow<small>{'играй, чтобы расти' if language == 'ru' else 'turn play into growth'}</small></span></a><nav class="site-nav" aria-label="{'Основная навигация' if language == 'ru' else 'Main navigation'}">{nav}</nav><div class="header-actions"><div class="language-switch" aria-label="{'Язык сайта' if language == 'ru' else 'Site language'}"><a href="{canonical}" aria-current="page">{lang_code}</a><a href="{other_url}">{other_lang}</a></div></div></header>
  <main id="main" class="knowledge-main" tabindex="-1"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="{home}">{home_label}</a><span>/</span><span>{esc(data['title'])}</span></nav>
    <header class="knowledge-hero"><div><p class="eyebrow">{esc(data['eyebrow'])}</p><h1>{esc(data['title'])}</h1><p>{esc(data['lead'])}</p></div><div class="knowledge-summary"><strong>{info_label}</strong><span>{esc(data['summary'])}</span></div></header>
    <div class="knowledge-layout"><article class="knowledge-article">{content}<section class="knowledge-cta"><div><h2>{cta_title}</h2><p>{cta_text}</p></div><a class="button button-primary" href="{canonical_url(language, 'contact')}">{contact_label}</a></section></article>
      <aside class="knowledge-aside"><div class="aside-card"><strong>{more_label}</strong><div class="aside-links">{nav}</div></div><div class="aside-card"><strong>{'Демонстрация' if language == 'ru' else 'Demonstration'}</strong><p>{'Три роли в одном браузере с учебными данными.' if language == 'ru' else 'Three roles in one browser with sample data.'}</p><a href="{demo_url}">{demo_label}</a></div></aside>
    </div>
  </main>
  <footer class="site-footer"><div class="brand footer-brand"><img src="{asset_prefix}assets/mark.svg" width="38" height="38" alt=""><span>Play to Grow<small>{'Играй, чтобы расти' if language == 'ru' else 'Turn play into growth'}</small></span></div><div><p>{'Пилотный проект. Не является медицинской услугой.' if language == 'ru' else 'Pilot project. Not a medical service.'}</p><div class="knowledge-footer-links"><a href="{canonical_url(language, 'safety')}">{'Безопасность' if language == 'ru' else 'Safety'}</a><a href="{canonical_url(language, 'methodology')}">{'Методика' if language == 'ru' else 'Method'}</a><a href="{canonical_url(language, 'updates')}">{'Обновления' if language == 'ru' else 'Updates'}</a></div></div><a href="#main">{'Наверх ↑' if language == 'ru' else 'Back to top ↑'}</a></footer>
</body></html>'''


def render_page(language: str, slug: str) -> str:
    if slug == "faq":
        data = {"title": "Вопросы и ответы о Play to Grow" if language == "ru" else "Play to Grow questions and answers", "description": "Ответы о заданиях, игровых наградах, ролях, данных и участии в пилоте Play to Grow." if language == "ru" else "Answers about quests, gaming rewards, participant roles, data, and joining the Play to Grow pilot.", "eyebrow": "Частые вопросы" if language == "ru" else "Frequently asked questions", "lead": "Короткие и конкретные ответы о текущей версии проекта." if language == "ru" else "Short, concrete answers about the current version of the project.", "summary": "Демо, пилот и ограничения без рекламных обещаний." if language == "ru" else "The demo, pilot, and limitations without marketing promises."}
        items = FAQ[language]
        content = '<div class="faq-list">' + "".join(f'<section class="faq-item"><h2>{esc(q)}</h2><p>{esc(a)}</p></section>' for q, a in items) + "</div>"
        extra = {"mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}
        return page_shell(language, slug, data, content, "FAQPage", extra)
    if slug == "updates":
        data = UPDATES[language]
        content = "".join(f'<section class="knowledge-section update-entry"><time>{esc(date)}</time><h2>{esc(title)}</h2><p>{esc(text)}</p></section>' for date, title, text in data["entries"])
        return page_shell(language, slug, data, content, "CollectionPage")
    data = PAGES[slug][language]
    return page_shell(language, slug, data, "".join(render_section(section) for section in data["sections"]), "AboutPage" if slug == "about" else "WebPage")


def landing_schema(language: str) -> str:
    canonical = canonical_url(language)
    return json_ld({"@context": "https://schema.org", "@graph": [{"@type": "WebSite", "@id": canonical + "#website", "url": canonical, "name": "Play to Grow", "alternateName": "Play to Grow", "description": "A pilot project that uses a child's interest in computer games as motivation for useful real-life action.", "inLanguage": ["ru", "en"]}, {"@type": "Person", "@id": RU_BASE + "/#author", "name": "Максим Горский", "url": RU_BASE + "/", "email": "mailto:31415926x2@gmail.com", "telephone": "+79200156312"}, {"@type": "WebApplication", "@id": canonical + "#demo", "name": "Play to Grow demo", "url": "https://playtogrow.online/demo.html?lang=en", "applicationCategory": "EducationalApplication", "operatingSystem": "Web", "isAccessibleForFree": True, "inLanguage": ["ru", "en"], "description": "A static demonstration of three roles: child, parent, and moderator. Data stays in the user's browser.", "author": {"@id": RU_BASE + "/#author"}}, {"@type": "WebPage", "@id": canonical + "#page", "url": canonical, "name": "Play to Grow — turn play into growth", "isPartOf": {"@id": canonical + "#website"}, "inLanguage": "en", "dateModified": UPDATED}]})


def render_english_landing() -> str:
    source = (DOCS / "index.html").read_text(encoding="utf-8")
    found = set(re.findall(r'data-i18n="([^"]+)"', source)) | set(re.findall(r'data-i18n-aria-label="([^"]+)"', source))
    missing = found - LANDING_EN.keys()
    if missing:
        raise ValueError(f"Missing English landing translations: {sorted(missing)}")

    pattern = re.compile(r'(<(?P<tag>[a-z0-9]+)\b[^>]*\bdata-i18n="(?P<key>[^"]+)"[^>]*>)(?P<text>.*?)(</(?P=tag)>)', re.I | re.S)
    def replace_text(match: re.Match) -> str:
        if "<" in match.group("text"):
            raise ValueError(f"Nested markup in translated element: {match.group('key')}")
        return match.group(1) + esc(LANDING_EN[match.group("key")]) + match.group(5)
    result = pattern.sub(replace_text, source)

    aria_pattern = re.compile(r'<[^>]*\bdata-i18n-aria-label="(?P<key>[^"]+)"[^>]*>')
    def replace_aria(match: re.Match) -> str:
        tag = match.group(0)
        return re.sub(r'aria-label="[^"]*"', f'aria-label="{esc(LANDING_EN[match.group("key")])}"', tag, count=1)
    result = aria_pattern.sub(replace_aria, result)

    result = result.replace('<html lang="ru" data-page-language="ru" data-local-ru-url="./" data-local-en-url="./en/">', '<html lang="en" data-page-language="en" data-local-ru-url="../" data-local-en-url="./">')
    result = result.replace('<title>Play to Grow — играй, чтобы расти</title>', '<title>Play to Grow — turn play into growth</title>')
    result = result.replace('content="Play to Grow — пилотный проект для семей, столкнувшихся с компьютерной или игровой зависимостью. Игра становится мотивацией для реальных шагов в развитии ребенка."', 'content="Play to Grow is a pilot for families affected by problematic computer and gaming behavior, using gaming motivation for useful real-life action."')
    result = result.replace('<meta name="author" content="Максим Горский">', '<meta name="author" content="Maxim Gorskiy">')
    result = result.replace('content="ru_RU"', 'content="en_US"').replace('content="Play to Grow — играй, чтобы расти"', 'content="Play to Grow — turn play into growth"')
    result = result.replace('content="Интерес ребенка к играм становится мотивацией для полезных действий, которые семья заранее согласует с психологом."', 'content="A child’s interest in games becomes motivation for useful real-life actions agreed by the family with a psychologist."')
    result = result.replace('content="https://playtogrow.ru/"', 'content="https://playtogrow.online/en/"').replace('content="https://playtogrow.ru/assets/mark.svg"', 'content="https://playtogrow.online/assets/mark.svg"')
    result = result.replace('content="Пилотный проект для семей и психологов: реальные задания и согласованные игровые награды."', 'content="A pilot for families and psychologists: real-life quests and agreed gaming rewards."')
    result = result.replace('<link rel="canonical" href="https://playtogrow.ru/">', '<link rel="canonical" href="https://playtogrow.online/en/">')
    result = result.replace('title="Обновления Play to Grow" href="https://playtogrow.ru/feed.xml"', 'title="Play to Grow updates" href="https://playtogrow.online/en/feed.xml"')
    result = result.replace('href="./assets/', 'href="../assets/').replace('src="./assets/', 'src="../assets/')
    result = result.replace('href="./landing.css', 'href="../landing.css').replace('src="./landing.js', 'src="../landing.js')
    result = result.replace('href="./demo.html', 'href="../demo.html')
    result = result.replace('data-local-url="./" aria-current="page">RU', 'data-local-url="../">RU')
    result = result.replace('data-local-url="./en/">EN', 'data-local-url="./" aria-current="page">EN')
    result = result.replace('<script type="application/ld+json">\n  {"@context"', '<script type="application/ld+json">\n  {"@context"', 1)
    result = re.sub(r'<script type="application/ld\+json">.*?</script>', f'<script type="application/ld+json">\n  {landing_schema("en")}\n  </script>', result, count=1, flags=re.S)
    result = result.replace('lang=ru&amp;v=', 'lang=en&amp;v=')
    result = result.replace('<noscript>Основная информация и ссылки на русскую и английскую версии доступны без JavaScript.</noscript>', '<noscript>The main project information and links to the Russian and English versions are available without JavaScript.</noscript>')
    return result


def page_slugs() -> list[str]:
    return list(PAGES) + ["faq", "updates"]


def sitemap(domain: str) -> str:
    language = "ru" if domain == "ru" else "en"
    urls = [canonical_url(language)] + [canonical_url(language, slug) for slug in page_slugs()]
    items = "".join(f"  <url><loc>{xml_escape(url)}</loc><lastmod>{UPDATED}</lastmod></url>\n" for url in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{items}</urlset>\n'


def robots(domain: str) -> str:
    base = RU_BASE if domain == "ru" else "https://playtogrow.online"
    return f"""# Public search and user-requested retrieval are allowed.
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# Model-development and extended-use crawlers require a separate owner decision.
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: *
Allow: /

Sitemap: {base}/sitemap.xml
"""


def llms_text() -> str:
    links = "\n".join(f"- [{PAGES[slug]['en']['title']}]({canonical_url('en', slug)}): {PAGES[slug]['en']['description']}" for slug in PAGES)
    return f"""# Play to Grow

> Play to Grow is a bilingual pilot project that uses a child's interest in computer games as motivation for selected useful real-life actions and family-agreed gaming rewards.

Play to Grow is not a diagnostic or medical service and does not promise treatment outcomes. The public demo has three roles in one browser, uses sample data, and stores changes only in localStorage.

## Canonical versions

- [Русская версия]({RU_BASE}/)
- [English version]({EN_BASE}/)

## Project information

{links}
- [Questions and answers]({canonical_url('en', 'faq')}): Direct answers about quests, rewards, roles, data, and participation.
- [Project updates]({canonical_url('en', 'updates')}): Dated public changes without participant data.

## Contact

- Telegram: https://t.me/MaksimGorskiy
- Email: 31415926x2@gmail.com
- Phone: +7 920 015-63-12

Last updated: {UPDATED}
"""


def llms_full_text() -> str:
    parts = [llms_text(), "\n# Detailed page summaries\n"]
    for slug in PAGES:
        for language in ("ru", "en"):
            data = PAGES[slug][language]
            parts.append(f"\n## {data['title']}\n\nCanonical URL: {canonical_url(language, slug)}\n\n{data['lead']}\n")
            for section in data["sections"]:
                parts.append(f"\n### {section['title']}\n")
                parts.extend(f"\n{paragraph}\n" for paragraph in section.get("paragraphs", []))
                parts.extend(f"\n- {item}" for item in section.get("bullets", []))
                parts.extend(f"\n{i}. {item}" for i, item in enumerate(section.get("ordered", []), 1))
            parts.append("\n")
    return "".join(parts).rstrip() + "\n"


def feed(language: str) -> str:
    data = UPDATES[language]
    base = canonical_url(language)
    items = []
    for date, title, text in data["entries"]:
        guid = base + "updates/#" + re.sub(r"[^0-9]", "", date)
        items.append(f"<item><title>{xml_escape(title)}</title><link>{base}updates/</link><guid>{guid}</guid><description>{xml_escape(text)}</description></item>")
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Play to Grow updates</title><link>{base}</link><description>{xml_escape(data["description"])}</description><language>{language}</language>{"".join(items)}</channel></rss>\n'


def generated_outputs(domain: str, metadata_only: bool = False) -> dict[Path, str]:
    outputs = {Path("robots.txt"): robots(domain), Path("sitemap.xml"): sitemap(domain)}
    if metadata_only:
        return outputs
    outputs[Path("en/index.html")] = render_english_landing()
    for slug in page_slugs():
        outputs[Path(slug) / "index.html"] = render_page("ru", slug)
        outputs[Path("en") / slug / "index.html"] = render_page("en", slug)
    outputs[Path("llms.txt")] = llms_text()
    outputs[Path("llms-full.txt")] = llms_full_text()
    outputs[Path("feed.xml")] = feed("ru")
    outputs[Path("en/feed.xml")] = feed("en")
    outputs[Path(f"{INDEXNOW_KEY}.txt")] = INDEXNOW_KEY + "\n"
    return outputs


def detected_domain(output: Path) -> str:
    repository = os.environ.get("GITHUB_REPOSITORY", "").lower()
    if repository.endswith("/playtogrow.online") or output.resolve().parts[-2:-1] == ("playtogrow.online",):
        return "online"
    if ROOT.name.lower() == "playtogrow.online":
        return "online"
    return "ru"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if generated files are stale")
    parser.add_argument("--domain", choices=["auto", "ru", "online"], default="auto", help="Domain-specific robots and sitemap")
    parser.add_argument("--metadata-only", action="store_true", help="Only write robots.txt and sitemap.xml")
    parser.add_argument("--output", type=Path, default=DOCS)
    args = parser.parse_args()
    domain = detected_domain(args.output) if args.domain == "auto" else args.domain
    outputs = generated_outputs(domain, args.metadata_only)
    stale = []
    for relative, content in outputs.items():
        target = args.output / relative
        if args.check:
            if not target.exists() or target.read_text(encoding="utf-8") != content:
                stale.append(str(relative))
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8", newline="\n")
    if stale:
        print("Stale generated discovery files: " + ", ".join(stale), file=sys.stderr)
        return 1
    print(("Checked" if args.check else "Generated") + f" {len(outputs)} discovery files for {domain}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
