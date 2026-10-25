// Fictional demo entries for HerHealth Timeline. Clearly labeled as demo
// data (isDemo: true, set by storage.loadDemoData) so the UI can flag them
// and let the user reset/clear them separately from real entries.

export const DEMO_ENTRIES = [
  {
    date: '2026-08-02',
    description:
      'Woke up with a dull, heavy ache low in my abdomen that stuck around most of the morning. Took it easy and it eased off by early afternoon.',
    tags: ['Dull ache', 'Bloating'],
    bodyArea: 'Abdomen',
    severity: 4,
    duration: 'A few hours',
    dailyImpact: 'Skipped my usual morning walk, otherwise managed normal tasks.',
    notes: 'Noticed it came on right after waking up, not linked to food as far as I can tell.',
  },
  {
    date: '2026-08-20',
    description:
      'Hit a wall of exhaustion by mid-afternoon even though I slept a full 8 hours. Needed a nap to get through the rest of the day.',
    tags: ['Fatigue', 'Brain fog'],
    bodyArea: 'Whole body',
    severity: 5,
    duration: 'Most of the day',
    dailyImpact: 'Had to reschedule a work call and cut my errands short.',
    notes: '',
  },
  {
    date: '2026-09-05',
    description:
      'Sharp, throbbing headache on the right side that started after lunch and lasted into the evening. Light made it worse.',
    tags: ['Headache'],
    bodyArea: 'Head',
    severity: 6,
    duration: '1–2 days',
    dailyImpact: 'Worked from a dark room in the afternoon, cancelled dinner plans.',
    notes: 'Took a break from screens, which helped a little.',
  },
  {
    date: '2026-09-18',
    description:
      'Felt unusually irritable and low in energy for most of the day, with some trouble falling asleep that night.',
    tags: ['Mood changes', 'Sleep disruption', 'Fatigue'],
    bodyArea: 'Whole body',
    severity: 4,
    duration: 'Most of the day',
    dailyImpact: 'Snapped at a coworker over something small, felt bad about it after.',
    notes: '',
  },
  {
    date: '2026-10-02',
    description:
      'Cramping and bloating in the lower abdomen on and off through the day, with a couple of sharper waves in the evening.',
    tags: ['Cramping', 'Bloating', 'Dull ache'],
    bodyArea: 'Pelvic region',
    severity: 6,
    duration: '1–2 days',
    dailyImpact: 'Used a heating pad in the evening, skipped the gym.',
    notes: 'Similar to what I noted back in early August, but a bit stronger this time.',
  },
  {
    date: '2026-10-14',
    description:
      'Another stretch of low energy and difficulty concentrating at work, plus a mild headache in the late afternoon.',
    tags: ['Fatigue', 'Brain fog', 'Headache'],
    bodyArea: 'Head',
    severity: 5,
    duration: 'A few hours',
    dailyImpact: 'Re-read the same email three times before giving up and taking a break.',
    notes: '',
  },
  {
    date: '2026-10-22',
    description:
      'Brief dizzy spell when standing up quickly after sitting for a long work session, gone within a couple of minutes but left me shaky.',
    tags: ['Dizziness', 'Fatigue'],
    bodyArea: 'Whole body',
    severity: 3,
    duration: 'A few minutes',
    dailyImpact: 'Sat back down and drank some water, no further issues that day.',
    notes: 'First time this has happened — want to keep an eye on it.',
  },
]
