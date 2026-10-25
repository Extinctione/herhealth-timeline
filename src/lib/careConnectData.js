// Static reference data for Care Connect (the menopause support / care hub).
//
// IMPORTANT — sourcing policy for this file:
// - EMERGENCY_NUMBERS and VERIFIED_HELPLINES are real organizations and
//   numbers, checked against official sources (government health sites,
//   the UK Charity Commission register, and — for India — government
//   press releases / ministry sites) at the time this file was written.
//   This is a short starter list, not a verified global directory — always
//   confirm a number against the organization's own site before relying on
//   it in production, and add more regions as needed.
// - The India entries (112, Women Helpline 181, Tele-MANAS 14416,
//   eSanjeevani OPD, FOGSI) were checked against government/official
//   sources via web search when this section was added. They are not
//   hardcoded from memory. As with the U.S./U.K. entries, re-verify
//   against the organization's own site periodically — helpline numbers
//   and programs do change.
// - This app has no real provider-directory or scheduling backend, so
//   DEMO_DOCTORS and the slots generated for them are explicitly fictional
//   (isDemo: true, labeled "Demo profile" in the UI) rather than invented
//   "real" providers, names, or credentials. Do not remove the demo
//   labeling without replacing this with a real, verified integration.
//   These demo profiles are generic placeholders, not tied to any region.

import { todayISO, addDaysISO } from './format.js'

// ---------------------------------------------------------------------------
// Regions — used to filter Emergency Numbers / Helplines / Online
// Consultation so the page can default to the user's region (India) rather
// than always leading with U.S./U.K. numbers.
// ---------------------------------------------------------------------------

export const CARE_CONNECT_REGIONS = ['India', 'United States', 'United Kingdom']

// ---------------------------------------------------------------------------
// Need Help Now — always shown, not gated behind a tab.
// ---------------------------------------------------------------------------

export const EMERGENCY_GUIDANCE =
  'If you are in a medical emergency — severe bleeding, chest pain, difficulty breathing, thoughts of harming yourself, or anything life-threatening — call your local emergency number immediately or go to the nearest hospital. Do not wait for an online response.'

export const EMERGENCY_NUMBERS = [
  {
    region: 'India',
    items: [
      {
        label: 'Emergency services',
        number: '112',
        note: "All-in-one police/fire/ambulance, 24/7 (India's national Emergency Response Support System, ERSS)",
      },
      {
        label: 'Tele-MANAS (mental health support)',
        number: '14416',
        note: 'Or 1800-891-4416, 24/7, free — mental health crisis or emotional distress, 20+ languages (telemanas.mohfw.gov.in)',
      },
    ],
  },
  {
    region: 'United States',
    items: [
      { label: 'Emergency services', number: '911', note: 'Life-threatening emergencies' },
      {
        label: '988 Suicide & Crisis Lifeline',
        number: '988',
        note: 'Call or text, 24/7 — suicidal crisis or emotional distress (988lifeline.org)',
      },
    ],
  },
  {
    region: 'United Kingdom',
    items: [
      { label: 'Emergency services', number: '999', note: 'Life-threatening emergencies' },
      { label: 'NHS non-emergency advice', number: '111', note: '24/7, for urgent but non-life-threatening help' },
    ],
  },
]

export const EMERGENCY_DISCLAIMER =
  "These numbers are examples from official Indian, U.S., and U.K. sources, chosen as this app's starting regions. If you're elsewhere, use your own local emergency number — this app doesn't detect your location automatically. Switch the region above to see the most relevant numbers."

// ---------------------------------------------------------------------------
// Call a Helpline — real, verified organizations
// ---------------------------------------------------------------------------

export const HELPLINES_DISCLAIMER =
  "A short, manually checked starter list (India, U.S., and U.K.), not a global directory. If a number doesn't connect, check the organization's own website — and add more verified regional helplines here as needed."

export const VERIFIED_HELPLINES = [
  {
    id: 'women-helpline-181-in',
    name: 'Women Helpline (181)',
    phone: '181',
    phoneDisplay: '181',
    region: 'India',
    hours: '24/7, toll-free',
    description:
      'Government of India helpline for women facing violence, harassment, or distress, run by the Ministry of Women & Child Development and integrated with the 112 emergency system. Offers support, counselling, and referrals — does not diagnose or treat medical conditions.',
    source: 'Ministry of Women & Child Development, Government of India',
  },
  {
    id: 'owh',
    name: "OWH Helpline — Office on Women's Health (U.S. HHS)",
    phone: '+18009949662',
    phoneDisplay: '1-800-994-9662',
    region: 'United States',
    hours: '9 a.m.–6 p.m. ET, Monday–Friday',
    description:
      "Free U.S. federal government helpline for women's health questions, including perimenopause and menopause. Does not diagnose, treat, or prescribe — for emergencies, call 911.",
    source: 'womenshealth.gov',
  },
  {
    id: 'menopause-charity-uk',
    name: 'The Menopause Charity',
    phone: '+443001020040',
    phoneDisplay: '0300 102 0040',
    region: 'United Kingdom',
    hours: 'See themenopausecharity.org for current hours',
    description: 'UK registered charity (no. 1191332) focused on menopause information and support.',
    source: 'UK Charity Commission register',
  },
]

// ---------------------------------------------------------------------------
// Online Consultation — trusted external resources (no booking integration)
// ---------------------------------------------------------------------------

export const TRUSTED_RESOURCES = [
  {
    id: 'esanjeevani-opd',
    name: 'eSanjeevani OPD',
    region: 'India',
    url: 'https://esanjeevaniopd.in/',
    description:
      "Government of India's free national teleconsultation service (Ministry of Health & Family Welfare, under Ayushman Bharat) — video/chat consultations with government-empanelled doctors, by state availability.",
  },
  {
    id: 'fogsi',
    name: 'FOGSI — Federation of Obstetric and Gynaecological Societies of India',
    region: 'India',
    url: 'https://www.fogsi.org/',
    description:
      "India's national professional body for obstetricians and gynaecologists, with member societies across the country — a starting point for understanding standards of care, not a doctor-booking directory.",
  },
  {
    id: 'nhs-menopause',
    name: 'NHS: Menopause help and support',
    region: 'United Kingdom',
    url: 'https://www.nhs.uk/conditions/menopause/help-and-support/',
    description: 'Official NHS guidance on menopause care options and finding support in the UK.',
  },
  {
    id: 'bms-specialist-finder',
    name: 'British Menopause Society',
    region: 'United Kingdom',
    url: 'https://thebms.org.uk/',
    description: 'Professional body for UK menopause specialists, including a specialist-finder tool.',
  },
  {
    id: 'owh-perimenopause',
    name: "Office on Women's Health: Perimenopause",
    region: 'United States',
    url: 'https://womenshealth.gov/topics/perimenopause',
    description: 'U.S. government guidance on perimenopause, including when and how to get care.',
  },
]

// ---------------------------------------------------------------------------
// Find a Doctor / Book an Appointment — DEMO data only (clearly fictional)
// ---------------------------------------------------------------------------

export const SPECIALTY_FOCUS_AREAS = [
  'Gynecology',
  'Menopause & midlife care',
  'Endocrinology',
  'Integrative / holistic care',
  'Mental health & menopause',
  'Pelvic health physiotherapy',
]

export const DEMO_DOCTORS = [
  {
    id: 'demo_doc_1',
    name: 'Dr. Amara Chen',
    focusArea: 'Gynecology',
    bio: 'Demo profile illustrating a general gynecology listing — reproductive and menopausal health.',
    location: 'Riverside Women\u2019s Health Clinic (demo)',
    consultationTypes: ['online', 'in-person'],
    isDemo: true,
  },
  {
    id: 'demo_doc_2',
    name: 'Dr. Priya Raman',
    focusArea: 'Menopause & midlife care',
    bio: 'Demo profile illustrating a menopause-focused listing — symptom management and midlife health.',
    location: 'Maple Grove Family Medicine (demo)',
    consultationTypes: ['online', 'in-person'],
    isDemo: true,
  },
  {
    id: 'demo_doc_3',
    name: 'Dr. Lauren Whitfield',
    focusArea: 'Endocrinology',
    bio: 'Demo profile illustrating an endocrinology listing — hormonal health across the menopause transition.',
    location: 'Harborview Endocrine Associates (demo)',
    consultationTypes: ['online'],
    isDemo: true,
  },
  {
    id: 'demo_doc_4',
    name: 'Dr. Fatima Noor',
    focusArea: 'Integrative / holistic care',
    bio: 'Demo profile illustrating an integrative-care listing — lifestyle and whole-person approaches.',
    location: 'Willow Path Integrative Health (demo)',
    consultationTypes: ['online', 'in-person'],
    isDemo: true,
  },
  {
    id: 'demo_doc_5',
    name: 'Dr. Sofia Marchetti',
    focusArea: 'Mental health & menopause',
    bio: 'Demo profile illustrating a mental-health listing — mood, sleep, and emotional wellbeing support.',
    location: 'Clearwater Behavioral Health (demo)',
    consultationTypes: ['online'],
    isDemo: true,
  },
  {
    id: 'demo_doc_6',
    name: 'Dr. Grace Thompson',
    focusArea: 'Pelvic health physiotherapy',
    bio: 'Demo profile illustrating a pelvic-health listing — physiotherapy for menopause-related symptoms.',
    location: 'Thompson Pelvic Health Studio (demo)',
    consultationTypes: ['in-person'],
    isDemo: true,
  },
]

const SLOT_TIMES = ['9:30 AM', '11:00 AM', '1:15 PM', '3:45 PM']

/**
 * Deterministic, fictional "available slots" for a demo doctor — not real
 * availability, no real scheduling backend exists yet. Offsets vary by
 * doctor id only so the list isn't identical for every provider.
 */
export function getDemoSlots(doctor, today = todayISO()) {
  const seed = doctor.id.length
  const dayOffsets = [2, 4, 7]
  return dayOffsets.map((offset, i) => ({
    id: `${doctor.id}_slot${i}`,
    date: addDaysISO(today, offset + (seed % 3)),
    time: SLOT_TIMES[(i + seed) % SLOT_TIMES.length],
    type: doctor.consultationTypes[(i + seed) % doctor.consultationTypes.length],
  }))
}
