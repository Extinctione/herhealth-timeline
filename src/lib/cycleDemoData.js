// Fictional demo data for HerCycle. Mirrors the demoData.js pattern used
// by the Timeline: clearly fictional, loaded via cycleStorage.loadCycleDemoData
// (which flags every record isDemo: true so the UI can label and clear it
// separately from anything the user actually logs).
//
// Three regular-ish cycles (~28–29 days) culminating close to "today" so
// the prediction panel has something realistic to estimate from, plus
// symptom/mood logs clustered around periods and mid-cycle to populate
// the Insights panel with a recognizable pattern.

export const DEMO_PERIOD_DAYS = [
  { date: '2026-08-02', flow: 'heavy' },
  { date: '2026-08-03', flow: 'heavy' },
  { date: '2026-08-04', flow: 'medium' },
  { date: '2026-08-05', flow: 'light' },
  { date: '2026-08-06', flow: 'light' },

  { date: '2026-08-30', flow: 'heavy' },
  { date: '2026-08-31', flow: 'heavy' },
  { date: '2026-09-01', flow: 'medium' },
  { date: '2026-09-02', flow: 'light' },
  { date: '2026-09-03', flow: 'light' },

  { date: '2026-09-28', flow: 'medium' },
  { date: '2026-09-29', flow: 'heavy' },
  { date: '2026-09-30', flow: 'heavy' },
  { date: '2026-10-01', flow: 'medium' },
  { date: '2026-10-02', flow: 'light' },
]

export const DEMO_SYMPTOM_LOGS = [
  {
    date: '2026-07-30',
    symptoms: ['Bloating', 'Mood changes'],
    mood: 'Irritable',
    notes: 'Felt bloated and a bit on edge the last couple of days.',
  },
  { date: '2026-08-02', symptoms: ['Cramps', 'Fatigue'], mood: 'Low', notes: 'Period started today, fairly strong cramping in the morning.' },
  { date: '2026-08-03', symptoms: ['Cramps', 'Backache'], mood: 'Low', notes: '' },
  { date: '2026-08-09', symptoms: ['Acne'], mood: 'Calm', notes: 'A few breakouts along the jawline — fairly typical for me.' },
  { date: '2026-08-27', symptoms: ['Bloating', 'Headache', 'Mood changes'], mood: 'Irritable', notes: '' },
  { date: '2026-08-30', symptoms: ['Cramps', 'Fatigue'], mood: 'Low', notes: '' },
  { date: '2026-08-31', symptoms: ['Cramps'], mood: 'Low', notes: '' },
  { date: '2026-09-13', symptoms: ['Acne'], mood: 'Calm', notes: '' },
  {
    date: '2026-09-25',
    symptoms: ['Bloating', 'Mood changes', 'Headache'],
    mood: 'Anxious',
    notes: 'Felt unusually anxious the last two days, plus the usual bloating.',
  },
  { date: '2026-09-28', symptoms: ['Cramps', 'Fatigue', 'Backache'], mood: 'Low', notes: '' },
  { date: '2026-09-29', symptoms: ['Cramps'], mood: 'Low', notes: '' },
  { date: '2026-10-15', symptoms: ['Acne'], mood: 'Calm', notes: '' },
  {
    date: '2026-10-22',
    symptoms: ['Bloating', 'Mood changes'],
    mood: 'Irritable',
    notes: 'Starting to feel the usual pre-period bloating and irritability.',
  },
]
