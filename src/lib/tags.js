// Canonical, descriptive (non-diagnostic) vocabulary used across the app.
// These are plain-language tags for documenting experiences — never
// medical/diagnostic labels.

export const SUGGESTED_TAGS = [
  'Sharp pain',
  'Dull ache',
  'Cramping',
  'Fatigue',
  'Headache',
  'Nausea',
  'Dizziness',
  'Bloating',
  'Mood changes',
  'Sleep disruption',
  'Hot flashes',
  'Joint stiffness',
  'Skin changes',
  'Appetite changes',
  'Brain fog',
  'Heavy bleeding',
  'Shortness of breath',
]

export const BODY_AREAS = [
  'Head',
  'Chest',
  'Abdomen',
  'Pelvic region',
  'Back',
  'Joints / limbs',
  'Skin',
  'Whole body',
  'Other',
]

export const DURATION_OPTIONS = [
  'A few minutes',
  'A few hours',
  'Most of the day',
  '1–2 days',
  '3–7 days',
  'More than a week',
  'Ongoing / recurring',
]

// Topic categories for HerCircle (the community). Separate concern from
// the Timeline vocabulary above, but kept in this same canonical file.
export const COMMUNITY_CATEGORIES = [
  'General',
  'Periods & Cycles',
  'Fertility & Pregnancy',
  'Menopause',
  'Mental Health',
  'Chronic Conditions',
  'Relationships',
  'Other',
]

// ---------------------------------------------------------------------------
// HerCycle — period & cycle tracking vocabulary.
// ---------------------------------------------------------------------------

export const FLOW_LEVELS = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
]

export const CYCLE_SYMPTOMS = [
  'Cramps',
  'Bloating',
  'Headache',
  'Fatigue',
  'Acne',
  'Breast tenderness',
  'Backache',
  'Joint pain',
  'Nausea',
  'Sleep disruption',
  'Hot flashes',
  'Night sweats',
]

export const MOOD_OPTIONS = [
  'Calm',
  'Happy',
  'Energetic',
  'Low',
  'Irritable',
  'Anxious',
  'Tearful',
  'Mood changes',
]

// Life-stage framing for HerCycle, kept inclusive and non-prescriptive.
// null/unset is a valid state — the tracker works without this being set.
export const CYCLE_LIFE_STAGES = [
  { value: 'tracking', label: 'Tracking my period' },
  { value: 'perimenopause', label: 'Perimenopause (changing cycles)' },
  { value: 'postmenopause', label: 'Not currently tracking periods' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]
