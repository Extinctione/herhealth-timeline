// Fictional seed discussions for HerCircle, clearly labeled as demo data
// (isDemo: true, set by communityStorage.loadDemoDiscussions) so the UI
// can flag them and let the user clear them separately from real posts.

export const DEMO_DISCUSSIONS = [
  {
    title: 'Anyone else get random dizzy spells before their period?',
    body: "For the last few months I've noticed I get lightheaded for a minute or two, usually a day or so before my period starts. Drinking water helps a bit. Wondering if this is a known thing or if I should bring it up with my doctor.",
    category: 'Periods & Cycles',
    authorHandle: 'Anonymous Quiet Willow',
    createdAt: '2026-09-12T14:20:00.000Z',
    comments: [
      {
        body: 'I get this too! My doctor said it can be related to blood pressure changes around your cycle. Worth mentioning at your next visit.',
        authorHandle: 'Anonymous Hopeful Sparrow',
        createdAt: '2026-09-12T16:05:00.000Z',
      },
      {
        body: 'Logging it in the Timeline feature here really helped me see it was happening every month, same timing.',
        authorHandle: 'Anonymous Steady Maple',
        createdAt: '2026-09-13T09:40:00.000Z',
      },
    ],
  },
  {
    title: 'Starting perimenopause and feeling kind of lost',
    body: "My periods have gotten unpredictable over the last year and I'm having night sweats a few times a week. None of this was really explained to me beforehand. Would love to hear how others are navigating this stage.",
    category: 'Menopause',
    authorHandle: 'Anonymous Curious Harbor',
    createdAt: '2026-09-20T08:15:00.000Z',
    comments: [
      {
        body: "You're definitely not alone in feeling unprepared — it was the same for me. A sleep-focused evening routine helped with the night sweats more than I expected.",
        authorHandle: 'Anonymous Calm River',
        createdAt: '2026-09-20T11:30:00.000Z',
      },
    ],
  },
  {
    title: 'Tips for talking to a new doctor about chronic pain?',
    body: "I'm switching doctors soon and have years of on-and-off pelvic pain that was never fully explained. How do you all bring this up without feeling like you're being dismissed again?",
    category: 'Chronic Conditions',
    authorHandle: 'Anonymous Brave Lotus',
    createdAt: '2026-10-05T19:00:00.000Z',
    comments: [
      {
        body: "Bringing a written timeline of dates and severity made a huge difference for me — it's harder to dismiss a pattern on paper.",
        authorHandle: 'Anonymous Kind Ember',
        createdAt: '2026-10-06T07:50:00.000Z',
      },
      {
        body: "Seconding this. I also write down 2–3 specific questions beforehand so I don't forget them in the moment.",
        authorHandle: 'Anonymous Patient Pearl',
        createdAt: '2026-10-06T12:10:00.000Z',
      },
    ],
  },
]
