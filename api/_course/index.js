// The SharedLife Course, for couples about to marry or newly married. English and Hindi.
// Private: served only through /api/course/lessons/:id.
//
// A lesson is { id, module, minutes, preview?, title:{en,hi}, summary:{en,hi}, blocks:[...] }.
// Text fields are { en, hi }; when hi is missing the English shows. Blocks:
//   p, h, note, try            { type, en, hi }                       plain text
//   story, example             { type, title:{en,hi}, en, hi }        "\n\n" separates paragraphs
//   list, checklist, talk, takeaways  { type, en:[], hi:[] }
//   steps                      { type, en:[[title, text]], hi:[...] }
//   compare                    { type, left:{title, en:[], hi:[]}, right:{...} }
//   figure                     { type, src, animated?, alt:{en,hi}, caption:{en,hi} }
import m1 from './m1.js';
import { LESSONS as OLD } from './legacy.js';

export const MODULES = [
  { n: 1, title: { en: 'Starting your shared life', hi: 'साझा जीवन की शुरुआत' },
    blurb: { en: 'What a shared life is for, the first year together, and the expectations each of you brings.', hi: 'साझा जीवन का मतलब, साथ का पहला साल, और वे उम्मीदें जो हम दोनों साथ लाते हैं।' } },
  { n: 2, title: { en: 'Knowing yourself, knowing each other', hi: 'ख़ुद को जानना, एक-दूसरे को जानना' },
    blurb: { en: 'Values, family stories and emotional habits, and the questions worth asking each other.', hi: 'मूल्य, परिवार की कहानियाँ, भावनात्मक आदतें, और वे सवाल जो एक-दूसरे से पूछने चाहिए।' } },
  { n: 3, title: { en: 'Talking and listening', hi: 'बात करना और सुनना' },
    blurb: { en: 'Listening that lands, speaking about needs, and working through differences.', hi: 'ऐसा सुनना जो दिल तक पहुँचे, अपनी ज़रूरतें कहना, और मतभेदों को सुलझाना।' } },
  { n: 4, title: { en: 'Closeness and friendship', hi: 'नज़दीकी और दोस्ती' },
    blurb: { en: 'Friendship, affection and the small rituals that keep a couple close.', hi: 'दोस्ती, स्नेह और वे छोटी रस्में जो दो लोगों को क़रीब रखती हैं।' } },
  { n: 5, title: { en: 'Money as a team', hi: 'पैसा, एक टीम की तरह' },
    blurb: { en: 'Money habits, budgets, two careers and planning for life’s turns.', hi: 'पैसे की आदतें, बजट, दो करियर और ज़िंदगी के मोड़ों की तैयारी।' } },
  { n: 6, title: { en: 'Two families, one home', hi: 'दो परिवार, एक घर' },
    blurb: { en: 'Parents, in-laws, housework and children: who does what, and where the lines are.', hi: 'माता-पिता, ससुराल, घर का काम और बच्चे: कौन क्या करेगा, और सीमाएँ कहाँ हैं।' } },
  { n: 7, title: { en: 'Marriage and the law', hi: 'विवाह और क़ानून' },
    blurb: { en: 'How marriage law works in India, each spouse’s rights, and how a Pre-Nuptial Agreement fits in.', hi: 'भारत में विवाह क़ानून, हर जीवनसाथी के अधिकार, और प्री-नप्शियल एग्रीमेंट की भूमिका।' } },
  { n: 8, title: { en: 'Your Shared Life Plan', hi: 'आपका साझा जीवन प्लान' },
    blurb: { en: 'Bringing it together in your own plan, and keeping it alive year after year.', hi: 'सब कुछ अपने प्लान में समेटना, और उसे हर साल जीवित रखना।' } },
];

// Modules 2 to 8 are still the earlier English drafts, waiting to be rewritten in the Module 1 style.
// [new module, Hindi title, old lesson id or null, English title if it changes]
const DRAFTS = [
  [2, 'अपने मूल्य और ज़रूरतें', 5],
  [2, 'आपके भीतर आपके परिवार की कहानी', 6],
  [2, 'भावनात्मक आदतें और जुड़ाव', 7],
  [2, 'वे सवाल जो एक-दूसरे से पूछने चाहिए', 12, 'Questions worth asking each other'],
  [3, 'ऐसा सुनना जो दिल तक पहुँचे', 13],
  [3, 'बिना दोष दिए अपनी ज़रूरतें कहना', 14],
  [3, 'मतभेद सुलझाना और रिश्ता जोड़ना', 15],
  [3, 'रिश्ते को थकाने वाली आदतें, और उनके उपाय', 16],
  [4, 'शादी के केंद्र में दोस्ती', 9, 'Friendship at the heart of marriage'],
  [4, 'स्नेह, नज़दीकी और अंतरंगता', null, 'Affection, closeness and intimacy'],
  [4, 'वे रस्में जो आपको क़रीब रखती हैं', null, 'Rituals that keep you close'],
  [4, 'साथ बढ़ने वाला मेल', 11],
  [5, 'पैसे के स्वभाव', 17],
  [5, 'बजट, बचत और खाते', 18],
  [5, 'दो करियर, एक घर', 19],
  [5, 'ज़िंदगी के मोड़ों की तैयारी', 20],
  [6, 'संयुक्त परिवार, एकल परिवार और बीच की जगह', 21],
  [6, 'घर के काम का बँटवारा', 22],
  [6, 'माता-पिता, ससुराल और स्वस्थ सीमाएँ', 23],
  [6, 'बच्चे: कब, कैसे और क्या', 24],
  [7, 'भारत में विवाह क़ानून कैसे काम करता है', 25],
  [7, 'हर जीवनसाथी को पता होने वाले अधिकार', 26],
  [7, 'भारत में प्री-नप्शियल एग्रीमेंट', 27],
  [7, 'मध्यस्थता, और जब राहें अलग हों', 28],
  [8, 'आपका साझा सपना', 29],
  [8, 'पैसा, घर और परिवार का प्लान', 30],
  [8, 'अपना साझा जीवन प्लान लिखना', 31],
  [8, 'अपने प्लान को जीवित रखना', 32],
];

const draft = ([module, hi, oldId, en], i) => {
  const o = OLD.find((l) => l.id === oldId);
  return {
    id: m1.length + 1 + i, module, minutes: o ? o.minutes : 12, draft: true,
    title: { en: en || o.title, hi },
    summary: { en: o ? o.summary : 'This lesson is being written.' },
    blocks: o ? [
      { type: 'list', en: o.points },
      { type: 'talk', en: o.talk },
      { type: 'try', en: o.action },
    ] : [],
  };
};

export const LESSONS = [...m1, ...DRAFTS.map(draft)];
