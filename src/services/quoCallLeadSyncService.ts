export interface QuoTranscriptLeadRecord {
  id: string;
  callId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  serviceRequested: string;
  bedrooms: string;
  bathrooms: string;
  dateOfServiceRequested: string;
  source: string;
  sourceTab: string;
  campaignName: string;
  dateReceived: string;
  status: string;
  verdict: 'Good lead' | 'Spam' | 'Garbage';
  isJobberSynced: boolean;
  jobberClientId?: string;
  quoteId?: string;
  quoteNumber?: string;
  quotedAmount: number;
  notes: string;
  transcriptText?: string;
  callSummary?: string;
  callNextSteps?: string;
  aiHandled?: string | null;
  recordingUrl?: string;
  lineName?: string;
}

/**
 * Real Quo (OpenPhone) Cleaning Leads & Missed Call / Sona AI-Screened Transcripts from Oct 15–16, 2026
 */
export const TODAY_REAL_QUO_CLEANING_LEADS: QuoTranscriptLeadRecord[] = [
  {
    id: 'lead-quo-aniket-deb-20261016',
    callId: 'ACe866dfd251ff4674ac426108dfc01ea7',
    customerName: 'Aniket Deb',
    phone: '587-989-2392',
    email: '',
    address: 'Unit 303, 8119 29th Avenue NW',
    city: 'Edmonton',
    postalCode: 'T6K 3S1',
    serviceRequested: '1Bed 1Bath Deep Cleaning (Extra Attention: Bedroom Beneath Bed & Bathroom)',
    bedrooms: '1 Bedroom',
    bathrooms: '1 Bathroom',
    dateOfServiceRequested: '2026-10-16',
    source: 'Quo Sona AI / Missed Call Transcript',
    sourceTab: 'Voice & Quick Quotes',
    campaignName: 'Tidyups Cleaning - GMB (+1 587-900-7223) • Screened by Sona AI Assistant',
    dateReceived: '2026-10-16T14:30:41.830Z',
    status: 'New',
    verdict: 'Good lead',
    isJobberSynced: false,
    quotedAmount: 140.0,
    aiHandled: 'ai-agent',
    lineName: 'Tidyups Cleaning - GMB (+1 587-900-7223)',
    callSummary:
      'Missed call screened by Sona AI Assistant + follow-up call: Aniket Deb (587-989-2392) requested a 1Bed 1Bath Deep Cleaning at Unit 303, 8119 29th Avenue NW, Edmonton for today evening. Extra attention requested beneath the bed in the bedroom and in the bathroom. Discussed 3-hour minimum ($140.00 CAD) vs caller budget; promised revised quote via text.',
    callNextSteps: 'Tidyups Cleaning: Send quote via text to Aniket Deb at (587) 989-2392.',
    transcriptText: [
      '[Call 1 — Screened by Sona AI Assistant on GMB Line +1 587-900-7223 at 2026-10-16 14:30 UTC]:',
      'Sona (TidyUps AI): Hi there. This is Sona. I am a TidyUps Cleaning assistant. How can I help today?',
      'Caller (+15879892392): Hello. Yeah, I called a few moments before. I actually stay in Edmonton. So can I get the cleaning services?',
      'Sona (TidyUps AI): May I have your first and last name?',
      'Caller (+15879892392): Aniket Deb. A-N-I-K-E-T, D-E-B.',
      'Sona (TidyUps AI): Thank you, Aniket. What is the best number to reach you at?',
      'Caller (+15879892392): (587) 989-2392.',
      'Sona (TidyUps AI): What is the address where you need cleaning?',
      'Caller (+15879892392): Unit 303, 8119 is the building number, 29th Avenue Northwest, Edmonton.',
      'Sona (TidyUps AI): How many bedrooms does the property have? And how many bathrooms are there?',
      'Caller (+15879892392): One bedroom. One bathroom.',
      'Sona (TidyUps AI): What type of cleaning would you like? Basic, deep, move in, or move out?',
      'Caller (+15879892392): Deep.',
      'Sona (TidyUps AI): What cleaning date would you prefer?',
      'Caller (+15879892392): Today. Evening.',
      'Sona (TidyUps AI): What areas would you like us to give extra attention?',
      'Caller (+15879892392): The bedroom, like beneath the bed. And the bathroom also.',
      'Sona (TidyUps AI): Thank you, Aniket. Your cleaning details are recorded, and a TidyUps Cleaning team member will call you shortly with a quote.',
      '',
      '[Call 2 — Live Call on GMB Line +1 587-900-7223 at 2026-10-16 14:25 UTC]:',
      'Caller (+15879892392): I am calling through your ad for cleaning services. We stay in a small one bedroom flat — a bedroom, a small dining space, and one kitchen. Not moving out, just a regular/deep clean. How much will it be charged?',
      'TidyUps Cleaning: Our minimum service is 3 hours, which is about $140. Let me see what I can come up with — I will send you a quote by text in a second.',
    ].join('\n'),
    notes:
      '🎙️ [Missed Call Screened by Sona AI Assistant + Live Call — Oct 16, 2026]: Caller Aniket Deb (587-989-2392) requested 1Bed 1Bath Deep Cleaning at Unit 303, 8119 29th Avenue NW, Edmonton (Preferred: Today Evening). Extra focus: bedroom beneath the bed & bathroom. 3-hr minimum quoted at $140.00 CAD; promised text quote.',
  },
  {
    id: 'lead-quo-blaze-kimball-20261016',
    callId: 'AC0bf054f0f090483bbb0585b09e5506c0',
    customerName: 'Blaze (Glade)',
    phone: '306-880-7071',
    email: '',
    address: '5318 Kimball Place',
    city: 'Edmonton',
    postalCode: 'T6X 0A1',
    serviceRequested: '2Bed 1Bath Airbnb Basement Suite Turnover Cleaning',
    bedrooms: '2 Bedrooms',
    bathrooms: '1 Bathroom',
    dateOfServiceRequested: '2026-10-16',
    source: 'Quo Inbound Call Transcript',
    sourceTab: 'Voice & Quick Quotes',
    campaignName: 'Tidyups Cleaning - GMB (+1 587-900-7223) • Inbound Call Transcript',
    dateReceived: '2026-10-16T14:29:57.575Z',
    status: 'New',
    verdict: 'Good lead',
    isJobberSynced: false,
    quotedAmount: 185.0,
    aiHandled: 'live',
    lineName: 'Tidyups Cleaning - GMB (+1 587-900-7223)',
    recordingUrl:
      'https://share.quo.com/v1/resource/call-recording/cd6a2ac668364777af4d7bda19cb10f1.mp3?sig=nuh65ADkfmE7gy6E7wXrObepoLxlaG4I1Gx0q296qns',
    callSummary:
      'Caller Blaze (Glade, 306-880-7071) requested regular Airbnb turnover cleaning for a 2-bedroom, 1-bathroom basement suite at 5318 Kimball Place, Edmonton. Guest check-out is at 11:00 AM and next check-in is at 4:00 PM. Confirmed payment and cleaner dispatch.',
    callNextSteps: 'Tidyups Cleaning: Confirm cleaner schedule and text quote/update to Blaze at (306) 880-7071.',
    transcriptText: [
      '[Call 1 — Oct 15, 2026 23:36 UTC on GMB Line +1 587-900-7223]:',
      'Caller Blaze (+13068807071): Filled out a form for cleaning services for a basement suite. The suite has 2 bedrooms and 1 washroom for regular use as an Airbnb.',
      'TidyUps Cleaning: Will prepare a quote and text it to Blaze.',
      '',
      '[Call 2 — Oct 16, 2026 14:29 UTC on GMB Line +1 587-900-7223]:',
      'Caller Blaze (+13068807071): Confirmed payment for the cleaning at 5318 Kimball Place. Guest checks out at 11:00 AM and next check-in is at 4:00 PM.',
      'TidyUps Cleaning: Confirmed we can provide a cleaner for the turnover window.',
      '',
      '[Call 3 — Oct 16, 2026 17:16 UTC on GMB Line +1 587-900-7223]:',
      'Caller Blaze (+13068807071): Checked in on cleaner arrival time at 5318 Kimball Place. TidyUps Cleaning calling and messaging the cleaner to head over.',
    ].join('\n'),
    notes:
      '🎙️ [Quo Call Transcript — Oct 16, 2026]: Blaze / Glade (306-880-7071) — 2Bed 1Bath Airbnb Basement Suite at 5318 Kimball Place, Edmonton. Check-out 11:00 AM / Next check-in 4:00 PM. Needs quote & cleaner dispatch confirmation.',
  },
  {
    id: 'lead-clean-rahum-4293',
    callId: 'AC3d13a7bfc4394ca99bf7d1f4761baa54',
    customerName: 'Rahum (Raheem)',
    phone: '416-560-1354',
    email: '',
    address: '7112 49 Street Northwest',
    city: 'Edmonton',
    postalCode: 'T6B 1K5',
    serviceRequested: '3Bed 2Bath Basic Initial Cleaning 2026',
    bedrooms: '3 Bedrooms',
    bathrooms: '2 Bathrooms',
    dateOfServiceRequested: '2026-10-16',
    source: 'Voice / Quick Quote',
    sourceTab: 'Voice & Quick Quotes',
    campaignName: 'Cleaning Services Ads (+1 587-742-2500) • Quo Call Transcript',
    dateReceived: '2026-10-15T23:30:36.527Z',
    status: 'New',
    verdict: 'Good lead',
    isJobberSynced: true,
    jobberClientId: 'Z2lkOi8vSm9iYmVyL0NsaWVudC8xNTY0MjM1NDI=',
    quoteId: 'Z2lkOi8vSm9iYmVyL1F1b3RlLzY3Mzg5MjY3',
    quoteNumber: 'QT-4293',
    quotedAmount: 221.07,
    aiHandled: 'live',
    lineName: 'Cleaning Services Ads (+1 587-742-2500)',
    recordingUrl:
      'https://share.quo.com/v1/resource/call-recording/e20bb8ac256047d0a1b892c309fac3ac.mp3?sig=kIJfy0C09BcSJfifWFHFRXaDx1R4PJ6iTaZi_-Ee1TA',
    callSummary:
      'Caller Rahum (416-560-1354) requested a regular cleaning for a 3-bedroom, 2-bathroom house at 7112 49 Street NW, Edmonton. Quoted $221.07 CAD ($50 deposit) and synced to Jobber Quote #4293.',
    callNextSteps: 'Synced to Jobber Client #156423542 & Quote #4293 (https://secure.getjobber.com/quotes/67389267).',
    transcriptText: [
      '[Quo Call Transcript on Cleaning Services Ads +1 587-742-2500 — 2026-10-15 23:30 UTC]:',
      'TidyUps Cleaning: TidyUps Cleaning.',
      'Caller Rahum (+14165601354): Hi, I am looking to get my house cleaned. It is a three bedroom and two washroom at 7112 49 Street Northwest, Edmonton.',
      'TidyUps Cleaning: Prepared 3Bed 2Bath Basic Initial Cleaning quote ($221.07 CAD) and sent via text.',
    ].join('\n'),
    notes:
      '3Bed 2Bath Basic Cleaning (4 hrs @ $48.50/hr = $194.00) + $12.50 Fuel Surcharge - $10.00 Google Ad Discount = $221.07 CAD (Deposit: $50.00). Synced with Jobber Client #156423542 & Quote #4293 (https://secure.getjobber.com/quotes/67389267).',
  },
];

/**
 * Extracts structured cleaning lead fields from an OpenPhone / Quo call transcript & summary.
 * Returns null if the call is clearly a non-cleaning vendor/sales call (e.g., Yelp, Direct Energy, car dealership, wrong number).
 */
export function extractCleaningLeadFromQuoTranscript(params: {
  callId: string;
  callerPhone: string;
  callerName?: string;
  lineName: string;
  transcriptText: string;
  summaryText: string;
  nextStepsText?: string;
  aiHandled?: string | null;
  recordingUrl?: string;
  timestamp: string;
}): QuoTranscriptLeadRecord | null {
  const {
    callId,
    callerPhone,
    callerName,
    lineName,
    transcriptText,
    summaryText,
    nextStepsText,
    aiHandled,
    recordingUrl,
    timestamp,
  } = params;

  const combined = `${summaryText} ${transcriptText}`.toLowerCase();

  // Filter out non-cleaning vendor/solicitor/wrong-number calls so they don't pollute the Clean Google Sheet
  const nonLeadIndicators = [
    'yelp',
    'direct energy',
    'evolution energy',
    'electricity contract',
    'gas bill',
    'chevy trax',
    'lakewood chev',
    'trading account',
    'mistakenly reached',
    'no actionable details',
    'book conversation',
  ];
  if (nonLeadIndicators.some((kw) => combined.includes(kw))) {
    return null;
  }

  // Must mention cleaning, bedroom, bathroom, washroom, move-out, house, flat, condo, suite, or quote
  const cleaningKeywords = [
    'clean',
    'bedroom',
    'bathroom',
    'washroom',
    'move out',
    'move-out',
    'move in',
    'deep',
    'airbnb',
    'suite',
    'flat',
    'house',
    'quote',
    'carpet',
    'oven',
  ];
  if (!cleaningKeywords.some((kw) => combined.includes(kw))) {
    return null;
  }

  // Extract bedrooms
  let bedrooms = '3 Bedrooms';
  const bedMatch =
    combined.match(/\b(one|two|three|four|five|1|2|3|4|5)\s*(?:-|\s)?bed(?:room)?s?\b/i) ||
    combined.match(/how many bedrooms[^|]*?\b(one|two|three|four|five|1|2|3|4|5)\b/i);
  if (bedMatch) {
    const wordMap: Record<string, string> = {
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
    };
    const num = wordMap[bedMatch[1].toLowerCase()] || bedMatch[1];
    bedrooms = `${num} Bedroom${num === '1' ? '' : 's'}`;
  }

  // Extract bathrooms
  let bathrooms = '2 Bathrooms';
  const bathMatch =
    combined.match(/\b(one|two|three|four|1|1\.5|2|2\.5|3|4)\s*(?:-|\s)?(?:bath|wash)(?:room)?s?\b/i) ||
    combined.match(/bathrooms are there[^|]*?\b(one|two|three|1|2|3)\b/i);
  if (bathMatch) {
    const wordMap: Record<string, string> = {
      one: '1',
      two: '2',
      three: '3',
      four: '4',
    };
    const num = wordMap[bathMatch[1].toLowerCase()] || bathMatch[1];
    bathrooms = `${num} Bathroom${num === '1' ? '' : 's'}`;
  }

  // Extract service type
  let serviceRequested = `${bedrooms.replace(' Bedrooms', 'Bed').replace(' Bedroom', 'Bed')} ${bathrooms
    .replace(' Bathrooms', 'Bath')
    .replace(' Bathroom', 'Bath')} Residential Cleaning`;
  if (combined.includes('move out') || combined.includes('move-out') || combined.includes('move in')) {
    serviceRequested = `${bedrooms.replace(' Bedrooms', 'Bed').replace(' Bedroom', 'Bed')} ${bathrooms
      .replace(' Bathrooms', 'Bath')
      .replace(' Bathroom', 'Bath')} Move-Out / Move-In Cleaning`;
  } else if (combined.includes('deep')) {
    serviceRequested = `${bedrooms.replace(' Bedrooms', 'Bed').replace(' Bedroom', 'Bed')} ${bathrooms
      .replace(' Bathrooms', 'Bath')
      .replace(' Bathroom', 'Bath')} Deep Cleaning`;
  } else if (combined.includes('airbnb')) {
    serviceRequested = `${bedrooms.replace(' Bedrooms', 'Bed').replace(' Bedroom', 'Bed')} ${bathrooms
      .replace(' Bathrooms', 'Bath')
      .replace(' Bathroom', 'Bath')} Airbnb Turnover Cleaning`;
  }

  // Extract street address if mentioned
  const fullRaw = `${summaryText}\n${transcriptText}`;
  let address = 'Edmonton, AB';
  const addrRegex =
    /\b(?:Unit\s+\d+\s*(?:,|at)?\s*)?\d{2,5}\s+[A-Za-z0-9.\s]{2,25}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Place|Pl|Way|Boulevard|Blvd|Close|Court|Ct)(?:\s+(?:NW|NE|SW|SE|Northwest|Northeast|Southwest|Southeast))?/i;
  const addrMatch = fullRaw.match(addrRegex);
  if (addrMatch) {
    address = addrMatch[0].trim();
  }

  // Extract caller name if Sona AI or summary captured it
  let resolvedName = callerName && !callerName.startsWith('+') && !callerName.startsWith('(') ? callerName : '';
  if (!resolvedName) {
    const namePatterns = [
      /name as ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
      /Caller\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
      /Thank you,\s+([A-Z][a-z]+)/,
      /this is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    ];
    for (const pat of namePatterns) {
      const m = fullRaw.match(pat);
      if (
        m &&
        m[1] &&
        !['Sona', 'Sonia', 'Tidyups', 'Richard', 'Alice'].includes(m[1].trim())
      ) {
        resolvedName = m[1].trim();
        break;
      }
    }
  }
  if (!resolvedName) {
    resolvedName = `Inbound Caller (${callerPhone})`;
  }

  // Estimate price if mentioned or based on bedrooms
  let quotedAmount = 221.07;
  const priceMatch = fullRaw.match(/\$(\d{2,4}(?:\.\d{2})?)/);
  if (priceMatch && Number(priceMatch[1]) >= 80) {
    quotedAmount = Number(priceMatch[1]);
  } else if (bedrooms.startsWith('1')) {
    quotedAmount = 140.0;
  } else if (bedrooms.startsWith('2')) {
    quotedAmount = 185.0;
  }

  const isAiScreened = aiHandled === 'ai-agent' || combined.includes('this is sona') || combined.includes('this is sonia');
  const sourceLabel = isAiScreened
    ? 'Quo Sona AI / Missed Call Transcript'
    : 'Quo Inbound Call Transcript';

  return {
    id: `lead-quo-${callId}`,
    callId,
    customerName: resolvedName,
    phone: callerPhone,
    email: '',
    address,
    city: 'Edmonton',
    postalCode: '',
    serviceRequested,
    bedrooms,
    bathrooms,
    dateOfServiceRequested: timestamp.slice(0, 10),
    source: sourceLabel,
    sourceTab: 'Voice & Quick Quotes',
    campaignName: `${lineName} • ${isAiScreened ? 'Screened by Sona AI Assistant' : 'Inbound Call'}`,
    dateReceived: timestamp,
    status: 'New',
    verdict: 'Good lead',
    isJobberSynced: false,
    quotedAmount,
    aiHandled: isAiScreened ? 'ai-agent' : 'live',
    lineName,
    recordingUrl: recordingUrl || '',
    callSummary: summaryText,
    callNextSteps: nextStepsText || '',
    transcriptText,
    notes: `🎙️ [${isAiScreened ? 'Missed Call Screened by Sona AI Assistant' : 'Quo Call Transcript'} on ${lineName}]: ${
      summaryText || transcriptText.slice(0, 260)
    }`,
  };
}
