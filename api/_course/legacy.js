// The SharedLife Course: modules and lesson drafts.
// Lives under api/ (underscore = not a function) so lesson text is never served as a static file;
// only /api/course/lessons/:id hands it out, and only to enrolled learners (or for the free preview).
//
// Each lesson: id (stable number, never reuse), title, minutes, summary, points, talk (questions for the
// couple), action (one task), and optionally video (an https youtube-nocookie or vimeo player URL) and preview.
// Text is DRAFT for Shravan and Dr Sanjeev to review. Legal lessons are general information, not legal advice.

export const MODULES = [
  { n: 1, title: 'Why marriage, and why now', blurb: 'What a shared life is for, and the expectations each of us brings to it.' },
  { n: 2, title: 'Self before partnership', blurb: 'Your values, your family story and your emotional habits, before they meet someone else’s.' },
  { n: 3, title: 'Choosing each other', blurb: 'What really makes a good match, and how to choose (or re-choose) with clear eyes.' },
  { n: 4, title: 'Communication and differences', blurb: 'Listening, speaking about needs and working through differences without hurt.' },
  { n: 5, title: 'Money and work', blurb: 'Money habits, budgets, two careers and planning for life’s turns together.' },
  { n: 6, title: 'Family, roles and boundaries', blurb: 'Parents, in-laws, housework and children: agreeing who does what, and where the lines are.' },
  { n: 7, title: 'Marriage and the law', blurb: 'How marriage law works in India, the rights of each spouse, and how a Pre-Nuptial Agreement fits in.' },
  { n: 8, title: 'Designing your shared life', blurb: 'Bringing it together in your own Shared Life Plan, and keeping it alive year after year.' },
];

export const LESSONS = [
  // ---------- Module 1 ----------
  {
    id: 1, module: 1, minutes: 12, preview: true,
    title: 'Sharing happiness, not supplying it',
    summary: 'Many of us enter marriage hoping our partner will make us happy. A shared life works the other way round: two people who are each responsible for their own wellbeing choose to share it, and build more together than either could alone.',
    points: [
      'Expecting a partner to “make you happy” quietly turns them into a supplier, and every bad day into their failure.',
      'Happiness you bring into the marriage is the happiness you can share. Look after your health, friendships and purpose as well as the relationship.',
      'Sharing happiness means noticing and celebrating the good: small thanks, shared jokes, plans you both look forward to.',
      'Partners who see themselves as a team on the same side handle life’s turns far better than partners keeping score.',
    ],
    talk: [
      'When do you feel most yourself? Does your partner know?',
      'What is one thing you each do to look after your own happiness, apart from the relationship?',
      'What is a small, everyday moment you would like to share more often?',
    ],
    action: 'Each of you writes three things that made you happy this week that had nothing to do with the other person. Share the lists and talk about how to protect time for them.',
  },
  {
    id: 2, module: 1, minutes: 14,
    title: 'Marriage in India today',
    summary: 'Marriage in India is changing fast: people marry later, more couples choose their own partners, both partners often work, and families are smaller and more spread out. Knowing the landscape helps you design a marriage for the life you will actually live.',
    points: [
      'Arranged, introduced and self-chosen marriages now sit side by side, and many couples combine elements of each.',
      'Dual-income homes are common, which changes expectations about housework, money and time.',
      'Families still matter a great deal, but couples increasingly live away from their parents and must agree their own rules.',
      'There is no single “right” model. The couples who do well are the ones who talk about the model they want.',
    ],
    talk: [
      'How was your parents’ marriage similar to, and different from, the one you want?',
      'Which traditions matter most to each of you, and which would you happily let go?',
    ],
    action: 'Write down one thing you want to keep from the marriages you grew up around, and one thing you want to do differently.',
  },
  {
    id: 3, module: 1, minutes: 13,
    title: 'The expectations we bring',
    summary: 'Every person arrives with unspoken expectations about roles, money, family, intimacy and time. Most differences in marriage are not about the issue itself but about expectations that were never said out loud.',
    points: [
      'Expectations come from family, films, friends and religion, often without us noticing.',
      'An unspoken expectation feels like a broken promise when it is not met, even though it was never agreed.',
      'Saying expectations early turns them into choices you can discuss, adjust and agree.',
    ],
    talk: [
      'Who do you expect will manage the household money? Cook? Plan holidays? Care for parents?',
      'How often do you expect to see each other’s families?',
      'What does a “normal” weekend look like to you?',
    ],
    action: 'Each of you fills in the sentence “In a good marriage, my partner will…” five times, separately. Then compare and mark which ones you share and which need a conversation.',
  },
  {
    id: 4, module: 1, minutes: 10,
    title: 'Your reasons, written down',
    summary: 'Knowing why you are marrying, or why you chose to stay married, gives you something to return to when life gets busy or hard. This short lesson asks you to put those reasons in your own words.',
    points: [
      'Reasons such as companionship, building a family, shared values and growth tend to last; pressure or timelines alone do not.',
      'Writing reasons down makes them clearer and easier to revisit.',
      'Your reasons will be the opening page of your Shared Life Plan in Module 8.',
    ],
    talk: [
      'Why this person? Why now?',
      'What do you hope your marriage looks like in ten years?',
    ],
    action: 'Write a half-page letter to your partner on why you choose them. Keep it; you will use it in Module 8.',
  },

  // ---------- Module 2 ----------
  {
    id: 5, module: 2, minutes: 14,
    title: 'Knowing yourself: values and needs',
    summary: 'Values are what matter most to you; needs are what you require to feel secure and respected. Couples who know their own values and needs can explain them to each other instead of hoping they will be guessed.',
    points: [
      'Common values include family, faith, freedom, achievement, security, adventure and service.',
      'Needs include time alone or together, reassurance, independence, order and fairness.',
      'Values rarely change much; habits and preferences can. Focus agreement on values first.',
    ],
    talk: [
      'Pick your top five values from the list. Which do you share?',
      'What is one need you find hard to ask for?',
    ],
    action: 'Rank your top five values separately, then share. Circle one value you share and one where you differ, and talk about how each shows up in daily life.',
  },
  {
    id: 6, module: 2, minutes: 13,
    title: 'Your family’s story in you',
    summary: 'We learn how to love, argue, spend and apologise in the family we grow up in. Recognising those patterns lets you keep the good ones and choose new ones where you want to.',
    points: [
      'Notice how your family handled anger, money, affection and decisions.',
      'Patterns repeat unless they are named. Naming them is not blaming your parents.',
      'Two family stories meet in every marriage. Neither is the default.',
    ],
    talk: [
      'How did your parents show affection? How did they handle a disagreement?',
      'Who made the big decisions in your home growing up?',
    ],
    action: 'Draw a simple family map going back to your grandparents. Note one strength and one habit you do not want to repeat on each side.',
  },
  {
    id: 7, module: 2, minutes: 15,
    title: 'Emotional habits and how we attach',
    summary: 'Some of us move closer when stressed, others need space. These attachment styles are common and workable once you understand them in yourself and your partner.',
    points: [
      'Seeking closeness and seeking space under stress are both normal ways of coping.',
      'Trouble starts when one partner chases and the other withdraws, and each reads the other as uncaring.',
      'Agreeing a simple signal (“I need an hour, then let’s talk”) helps both partners feel safe.',
    ],
    talk: [
      'When you are upset, do you want to talk it through or have time alone first?',
      'What helps you feel reassured when your partner is busy or away?',
    ],
    action: 'Agree on one phrase each of you can use to ask for space or for closeness, and when you will come back to the conversation.',
  },
  {
    id: 8, module: 2, minutes: 12,
    title: 'Being ready: health, career and independence',
    summary: 'Readiness for marriage is less about age and more about being able to look after yourself and contribute to a shared home. This lesson is a gentle self-check.',
    points: [
      'Physical and mental health are part of readiness. Asking for help is a strength.',
      'Basic life skills (cooking, managing money, keeping commitments) make a partnership more equal.',
      'Being honest about health, debts and career plans before marriage builds trust that lasts.',
    ],
    talk: [
      'Is there anything about your health, finances or career you have not yet shared?',
      'Which household skill would each of you like to learn?',
    ],
    action: 'Complete the readiness checklist privately, then choose one item to share and one goal to work on in the next three months.',
  },

  // ---------- Module 3 ----------
  {
    id: 9, module: 3, minutes: 14,
    title: 'What really makes a good match',
    summary: 'Research on long marriages points less to similar hobbies or horoscopes and more to kindness, shared values, the ability to repair after differences, and a sense of being a team.',
    points: [
      'Kindness and respect in small daily moments matter more than grand gestures.',
      'Shared values (how to live, raise children, use money) matter more than shared interests.',
      'Every couple has some differences that never fully resolve. Good couples learn to live with them gracefully.',
    ],
    talk: [
      'What is one way your partner shows kindness that you appreciate?',
      'Which of your differences do you think will stay with you for life? Can you make peace with it?',
    ],
    action: 'Each of you lists three qualities you most admire in the other. Read them aloud to each other.',
  },
  {
    id: 10, module: 3, minutes: 13,
    title: 'Clear eyes: pressures and biases in choosing',
    summary: 'Family expectations, status, looks, timelines and the wish to please others can all shape a choice of partner. Seeing these pressures clearly helps you decide for the right reasons.',
    points: [
      'Status, income and appearance are easy to see and easy to overweight.',
      'Timelines (“everyone my age is married”) push people to decide before they are sure.',
      'Family views are valuable input; the choice and the life are yours.',
    ],
    talk: [
      'What pressures did you feel, or do you feel, around this decision?',
      'If no one else had an opinion, what would matter most to you?',
    ],
    action: 'Write down the three things that matter most to you in a life partner, then check whether your current choice reflects them.',
  },
  {
    id: 11, module: 3, minutes: 12,
    title: 'Compatibility that grows',
    summary: 'Some compatibility is found; much of it is built. Couples who adapt, learn and change together keep their match alive as life changes around them.',
    points: [
      'People change with jobs, cities, children and age. Expect it.',
      'Curiosity about who your partner is becoming keeps the relationship fresh.',
      'Shared projects (a home, a trip, a cause) build closeness over time.',
    ],
    talk: [
      'How have you each changed since you met?',
      'What is a project you would love to take on together in the next year?',
    ],
    action: 'Plan one new shared experience for the next month and put it in your calendars.',
  },
  {
    id: 12, module: 3, minutes: 15,
    title: 'Questions to ask before you say yes',
    summary: 'A set of practical questions about children, money, careers, family, faith, health and where you will live. For married couples, the same questions help you re-choose each other with today’s answers.',
    points: [
      'Children: whether, when, how many, and how you will raise them.',
      'Money: debts, savings, support for parents, joint or separate accounts.',
      'Careers and city: whose job moves, and how you will decide.',
      'Faith, food, festivals and family visits: what is fixed and what is flexible.',
    ],
    talk: [
      'Go through the question list together. Mark each question “agreed”, “close” or “needs a longer talk”.',
    ],
    action: 'Pick the two questions marked “needs a longer talk” and set a time this week to discuss them properly.',
  },

  // ---------- Module 4 ----------
  {
    id: 13, module: 4, minutes: 13,
    title: 'Listening that lands',
    summary: 'Most of us listen to reply. Listening to understand, and showing that you have understood, is the single most useful skill in a marriage.',
    points: [
      'Reflect back what you heard before giving your view: “So you felt left out when…”',
      'Ask one more question before offering a solution.',
      'Put the phone away. Attention is a form of respect.',
    ],
    talk: [
      'When did you last feel really heard by your partner? What did they do?',
    ],
    action: 'Try the ten-minute exercise: one partner talks about their day for five minutes while the other only listens and reflects back, then swap.',
  },
  {
    id: 14, module: 4, minutes: 13,
    title: 'Speaking about needs without blame',
    summary: 'How a conversation starts usually decides how it ends. A gentle start that describes your feeling and your need invites your partner in instead of putting them on the defensive.',
    points: [
      'Use “I feel… about… and I need…” instead of “You always…” or “You never…”.',
      'Describe the situation, not your partner’s character.',
      'Ask for something specific and doable.',
    ],
    talk: [
      'Rewrite one recent complaint as a gentle start. How does it sound different?',
    ],
    action: 'Each of you practises one gentle-start request this week and notices how the other responds.',
  },
  {
    id: 15, module: 4, minutes: 15,
    title: 'Working through differences, and repairing',
    summary: 'Differences are normal and healthy. What matters is staying respectful while you work through them, taking breaks when feelings run high, and repairing afterwards.',
    points: [
      'If either of you feels flooded, take a 20-minute break and agree when you will return.',
      'Look for the part of your partner’s view you can agree with.',
      'Repair attempts (a joke, a touch, “I’m sorry, let me try again”) are the glue of a strong marriage. Accept them when offered.',
    ],
    talk: [
      'What is your best way of making up after a difference?',
      'What helps you calm down when you feel overwhelmed?',
    ],
    action: 'Agree your own “pause and return” rule and write it down for your Shared Life Plan.',
  },
  {
    id: 16, module: 4, minutes: 14,
    title: 'Habits that wear a marriage down, and their antidotes',
    summary: 'Four habits slowly wear down goodwill: criticism of character, contempt, defensiveness and shutting down. Each has a simple antidote you can practise.',
    points: [
      'Instead of criticism: a gentle start about a specific situation.',
      'Instead of contempt (eye-rolling, mockery): a culture of appreciation.',
      'Instead of defensiveness: take responsibility for your part, even a small part.',
      'Instead of shutting down: take a break and come back.',
      'Respect and safety are not negotiable. If anyone feels unsafe, reach out for professional help straight away.',
    ],
    talk: [
      'Which of these habits do you each slip into under stress?',
      'Which antidote would make the biggest difference for you?',
    ],
    action: 'For one week, each of you notes one thing you appreciate about the other every day and says it out loud.',
  },

  // ---------- Module 5 ----------
  {
    id: 17, module: 5, minutes: 13,
    title: 'Money personalities',
    summary: 'Some people save for security, some spend for joy, some avoid thinking about money at all. Understanding your money personalities turns money from a source of tension into a shared project.',
    points: [
      'Money habits usually come from childhood experiences of plenty or scarcity.',
      'A saver and a spender can balance each other well when they respect each other’s reasons.',
      'Talk about money regularly and calmly, not only when there is a problem.',
    ],
    talk: [
      'What did money feel like in your home growing up?',
      'What would you spend an unexpected ₹50,000 on?',
    ],
    action: 'Take the money-personality quiz separately and compare your answers.',
  },
  {
    id: 18, module: 5, minutes: 15,
    title: 'Budgets, savings and accounts',
    summary: 'A simple plan for income, spending and saving gives a couple calm and freedom. Decide what is joint, what is personal, and how big decisions get made.',
    points: [
      'Many couples use three pots: a joint account for shared costs, and a personal amount each with no questions asked.',
      'Agree a spending limit above which you check with each other first.',
      'Be open about loans, EMIs and support for parents or siblings.',
      'Keep nominations on bank accounts, insurance policies and investments up to date.',
    ],
    talk: [
      'Joint, separate or both: what feels fair to each of you?',
      'What amount should either of you be free to spend without asking?',
    ],
    action: 'Draft a one-page monthly budget together, including a savings goal.',
  },
  {
    id: 19, module: 5, minutes: 12,
    title: 'Two careers, one home',
    summary: 'When both partners work, time becomes as precious as money. Couples who plan careers together, including breaks, moves and study, avoid one partner quietly giving up more than they meant to.',
    points: [
      'Talk about career hopes for the next five years, for both of you.',
      'Decide in advance how you will weigh a job offer in another city.',
      'Plan for career breaks around children or caring for parents, and how you will share the cost.',
    ],
    talk: [
      'Whose career would move first, and why? Is that fair to both of you?',
    ],
    action: 'Each of you writes a five-year career wish list. Look for where they fit and where you will need to take turns.',
  },
  {
    id: 20, module: 5, minutes: 14,
    title: 'Planning for life’s turns',
    summary: 'Illness, job changes, caring for parents and other turns of life are easier when you have planned for them together. A little planning now gives both partners peace of mind.',
    points: [
      'Build an emergency fund of three to six months of expenses.',
      'Make sure each of you has health cover and knows how to use it.',
      'Each of you should have a will and up-to-date nominations.',
      'Know where important documents and passwords are kept.',
    ],
    talk: [
      'If one of you could not work for six months, how would you manage?',
      'Who would you want to make decisions for you if you could not?',
    ],
    action: 'Make a shared list of your important documents, policies and accounts, and agree where it will be kept.',
  },

  // ---------- Module 6 ----------
  {
    id: 21, module: 6, minutes: 13,
    title: 'Joint family, nuclear family and the space between',
    summary: 'Where and with whom you live shapes daily life. Whichever arrangement you choose, agree it openly, with room to revisit as circumstances change.',
    points: [
      'Living with parents can bring support and warmth, and needs clear agreements about privacy and decisions.',
      'Living separately still involves regular contact and care. Agree what that looks like.',
      'Treat both families with equal respect.',
    ],
    talk: [
      'Where do you see yourselves living in the first five years?',
      'How often would you like to visit or host each family?',
    ],
    action: 'Write a short “home agreement”: where you will live, and how you will balance time with each family.',
  },
  {
    id: 22, module: 6, minutes: 12,
    title: 'Sharing the work at home',
    summary: 'Unequal housework and mental load are among the most common sources of quiet resentment. Making the work visible and sharing it fairly keeps goodwill high.',
    points: [
      'List every regular task, including planning and remembering, not just doing.',
      'Fair does not always mean equal. It means both partners agree the split.',
      'Review the split when jobs, health or children change.',
    ],
    talk: [
      'Which household tasks do you enjoy, and which do you dread?',
    ],
    action: 'Make a full list of household tasks and decide together who owns each one.',
  },
  {
    id: 23, module: 6, minutes: 14,
    title: 'Parents, in-laws and healthy boundaries',
    summary: 'Loving your families and protecting your marriage go together. Boundaries are simply agreements about what decisions belong to the two of you.',
    points: [
      'Each partner speaks to their own family about difficult topics.',
      'Decide together what is private to the couple: money, intimacy, arguments.',
      'Care for ageing parents is a shared responsibility. Plan for it early.',
    ],
    talk: [
      'Which decisions do you want to make only as a couple?',
      'How will you share care for parents on both sides as they grow older?',
    ],
    action: 'Agree three decisions that will always be made by the two of you first.',
  },
  {
    id: 24, module: 6, minutes: 15,
    title: 'Children: if, when and how',
    summary: 'Decisions about children are among the biggest in a marriage. Talk early about whether you want children, when, how you will raise them, and what you will do if the path is not as expected.',
    points: [
      'Couples sometimes assume they agree about children and discover late that they do not.',
      'Talk about timing, number, parenting style, schooling and faith.',
      'Fertility can take time or need medical help. Adoption and child-free lives are valid paths too.',
      'Plan how both of you will share care and careers once a child arrives.',
    ],
    talk: [
      'What kind of parent do you hope to be?',
      'If having children takes longer than expected, how would you want to approach it together?',
    ],
    action: 'Write down your hopes about children separately, then compare and note what you agree on.',
  },

  // ---------- Module 7 ----------
  {
    id: 25, module: 7, minutes: 15,
    title: 'How marriage law works in India',
    summary: 'In India, marriage is governed by personal laws that depend on religion, or by the Special Marriage Act, 1954 for civil and inter-faith marriages. Knowing which law applies to you helps you understand your rights and duties.',
    points: [
      'Hindus, Buddhists, Jains and Sikhs are generally governed by the Hindu Marriage Act, 1955; Muslims by Muslim personal law; Christians by the Indian Christian Marriage Act, 1872 and the Divorce Act, 1869; Parsis by the Parsi Marriage and Divorce Act, 1936.',
      'Any couple, whatever their faith, can marry under the Special Marriage Act, 1954, after giving 30 days’ notice to the Marriage Officer.',
      'Registering your marriage gives you clear proof of marriage for visas, bank accounts, insurance and property.',
      'Goa has its own civil code that applies to marriages there.',
    ],
    talk: [
      'Which marriage law applies to you? Have you registered, or planned to register, your marriage?',
    ],
    action: 'Find out the registration process in your state and add it to your shared to-do list.',
  },
  {
    id: 26, module: 7, minutes: 14,
    title: 'Rights every spouse should know',
    summary: 'Both partners have legal rights in a marriage, including maintenance, the right to live in the shared household, and ownership of their own property and stridhan. Knowing them is part of an equal partnership.',
    points: [
      'Stridhan (gifts given to the bride) belongs to her.',
      'Spouses can claim maintenance in many situations, under personal laws and Section 144 of the Bharatiya Nagarik Suraksha Sanhita, 2023.',
      'The Protection of Women from Domestic Violence Act, 2005 gives a right to reside in the shared household and other protections.',
      'Property bought in one name usually belongs to that person unless agreed otherwise, which is why many couples write down their intentions.',
    ],
    talk: [
      'How would you like to own your home and major assets: jointly, or individually?',
    ],
    action: 'List your current assets and how they are owned. Note anything you want to change or record.',
  },
  {
    id: 27, module: 7, minutes: 16,
    title: 'Pre-Nuptial Agreements in India',
    summary: 'A Pre-Nuptial Agreement (PreNup) is a written agreement between partners, before or after the wedding, about property, money, responsibilities and how differences will be resolved. In India it is a growing practice that gives both partners clarity and peace of mind.',
    points: [
      'India has no single statute on PreNups. Courts look at them under general contract law, so they must be fair, voluntary and not against public policy.',
      'In Goa, agreements on the property regime of a marriage have long been recognised.',
      'A PreNup is strongest when both partners have independent advice, full financial disclosure and time to consider it.',
      'Most couples use it for clarity on assets, gifts, debts, family property and a plan to try mediation first if differences arise.',
      'Agreements are drafted by independent advocates. This lesson is general information, not legal advice.',
    ],
    talk: [
      'Which topics would you want a PreNup to cover?',
      'How would you feel about agreeing in good times how you would handle hard times?',
    ],
    action: 'Note the topics you would want covered. If you would like a PreNup, book a free consultation from your account page.',
  },
  {
    id: 28, module: 7, minutes: 14,
    title: 'Mediation, and when paths part',
    summary: 'Most couples will never need this lesson, and knowing it gives peace of mind. Mediation helps couples work through serious differences with a neutral person, and if paths do part, mutual consent keeps the process respectful.',
    points: [
      'Mediation and counselling are often the first step, and family courts encourage them.',
      'Mutual consent divorce (for example under Section 13B of the Hindu Marriage Act and Section 28 of the Special Marriage Act) lets couples part on agreed terms.',
      'The Supreme Court has held that the six-month waiting period for mutual consent can be waived in suitable cases.',
      'Agreeing in advance to try mediation first is one of the most useful clauses couples choose.',
    ],
    talk: [
      'If you ever reached an impasse, who would you trust to help you talk it through?',
    ],
    action: 'Agree together that, if you ever face a serious difference, you will try counselling or mediation first. Write it into your Shared Life Plan.',
  },

  // ---------- Module 8 ----------
  {
    id: 29, module: 8, minutes: 13,
    title: 'Your shared vision',
    summary: 'Start your Shared Life Plan with the big picture: what you want your marriage and your life together to feel like, and what you are building towards.',
    points: [
      'Use your letters from Lesson 4 and your values from Lesson 5.',
      'Write a vision for one year, five years and twenty years.',
      'Keep it short enough to read together every year.',
    ],
    talk: [
      'What three words describe the marriage you want?',
    ],
    action: 'Write the “Our vision” page of your Shared Life Plan together.',
  },
  {
    id: 30, module: 8, minutes: 15,
    title: 'Your money, home and family plan',
    summary: 'Bring together your decisions on money, work, home, family and children into one practical section of your plan.',
    points: [
      'Use your budget (Lesson 18), career lists (Lesson 19) and home agreement (Lesson 21).',
      'Record who owns which tasks at home (Lesson 22) and your family boundaries (Lesson 23).',
      'Note anything you have agreed to revisit later.',
    ],
    talk: [
      'Is there any decision here that one of you is not fully comfortable with yet?',
    ],
    action: 'Complete the “Money, home and family” section of your Shared Life Plan.',
  },
  {
    id: 31, module: 8, minutes: 16,
    title: 'Writing your Shared Life Plan',
    summary: 'Finish your Shared Life Plan: your vision, your agreements, your communication rules and how you will handle life’s turns. It is a personal plan, written in your own words, for the two of you.',
    points: [
      'Sections: Our vision; How we talk and repair; Money, home and family; Planning for life’s turns; How we will review this plan.',
      'Write in plain words, not legal language.',
      'Your plan is private to you. If you later want any part of it to have legal effect, an advocate can turn it into a Pre-Nuptial Agreement.',
    ],
    talk: [
      'Read the full plan aloud together. Does it sound like the two of you?',
    ],
    action: 'Finish, sign and date your Shared Life Plan. Keep one copy each.',
  },
  {
    id: 32, module: 8, minutes: 10,
    title: 'Keeping your plan alive',
    summary: 'A plan is only useful if you return to it. A short yearly review, perhaps on your anniversary, keeps your marriage intentional as life changes.',
    points: [
      'Set a yearly date to read and update your plan together.',
      'Review sooner after big changes: a move, a child, a new job or a loss.',
      'Celebrate what has gone well before talking about what to change.',
    ],
    talk: [
      'When will you hold your first review? Where?',
    ],
    action: 'Put your first yearly review in both your calendars now. Congratulations on completing The SharedLife Course.',
  },
];
