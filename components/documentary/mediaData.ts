export type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
  source: string;
  sourceUrl: string;
  date: string;
  location: string;
};

const HINDU_SOURCE =
  'https://www.thehindu.com/photos/when-protest-meets-crackdown-cockroach-janta-party-protest-in-pictures/article71247873.ece';
const EXPRESS_SOURCE =
  'https://indianexpress.com/photos/india-news/in-photos-cjp-holds-second-protest-at-jantar-mantar-over-exam-irregularities/';
const MINT_SOURCE =
  'https://www.livemint.com/photos/inside-cjps-jantar-mantar-protest-a-visual-story-of-placards-slogans-tambourine-and-flowers-11780730802315.html';

/**
 * Photographs reproduced from the original reporting, in display order.
 * Captions follow the publishers' own captions; credits name the photographer
 * or agency wherever the source did.
 */
export const photos: Photo[] = [
  {
    id: 'lead-ground',
    src: '/photos/lead-ground.jpg',
    width: 1200,
    height: 675,
    alt: 'A dense crowd at Jantar Mantar holds Indian flags, handwritten placards and a large cut-out while television cameras film them.',
    caption:
      'Students and supporters gather at Jantar Mantar for CJP’s second protest, holding flags, placards and a cut-out of a cockroach.',
    credit: 'Express Photo / The Indian Express',
    source: 'The Indian Express',
    sourceUrl: EXPRESS_SOURCE,
    date: 'June 2026',
    location: 'Jantar Mantar, New Delhi',
  },
  {
    id: 'thali',
    src: '/photos/thali.jpg',
    width: 1200,
    height: 675,
    alt: 'Protesters raise steel plates and spoons above their heads in a crowd holding Indian flags and a banner reading “Peaceful Protest”.',
    caption:
      'Supporters answer Abhijeet Dipke’s call to bring thali and chammach — plates and spoons — banging them as a symbol of protest.',
    credit: 'Express Photo / The Indian Express',
    source: 'The Indian Express',
    sourceUrl: EXPRESS_SOURCE,
    date: 'June 2026',
    location: 'Jantar Mantar, New Delhi',
  },
  {
    id: 'flowers',
    src: '/photos/flowers.jpg',
    width: 645,
    height: 900,
    alt: 'A hand offers a single pink flower to an officer in a blue uniform outside a police station.',
    caption:
      'A CJP member offers flowers to security personnel stationed outside Parliament Street police station.',
    credit: 'Mint',
    source: 'Mint',
    sourceUrl: MINT_SOURCE,
    date: '6 June 2026',
    location: 'Parliament Street, New Delhi',
  },
  {
    id: 'tambourine',
    src: '/photos/tambourine.jpg',
    width: 1600,
    height: 1067,
    alt: 'Two hands hold a tambourine decorated with a red and gold design above a blurred crowd.',
    caption:
      'A CJP supporter plays a tambourine, also known as a dafli, during the protest.',
    credit: 'PTI / Mint',
    source: 'Mint',
    sourceUrl: MINT_SOURCE,
    date: '6 June 2026',
    location: 'Jantar Mantar, New Delhi',
  },
  {
    id: 'scuffle',
    src: '/photos/scuffle.jpg',
    width: 1200,
    height: 780,
    alt: 'Protesters and police personnel push against each other beside an ice-cream cart, one protester wrapped in the Indian flag.',
    caption:
      'CJP protesters and police personnel get into a scuffle in New Delhi on 20 July.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Central Delhi',
  },
  {
    id: 'police-line',
    src: '/photos/police-line.jpg',
    width: 1200,
    height: 1600,
    alt: 'Close-up of a khaki police uniform showing a “Nagaland Armed Police” shoulder badge.',
    caption:
      'A personnel with the Nagaland Armed Police badge, deployed amid the CJP protests on 20 July.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Central Delhi',
  },
  {
    id: 'phone',
    src: '/photos/phone.jpg',
    width: 1200,
    height: 2086,
    alt: 'A hand holds a phone showing a video of a street confrontation.',
    caption:
      'A CJP protester plays a video on his phone in which he alleges police brutality.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Central Delhi',
  },
  {
    id: 'bangla-sahib',
    src: '/photos/bangla-sahib.jpg',
    width: 1200,
    height: 900,
    alt: 'People sit in rows on the marble floor under white canopies inside Bangla Sahib gurdwara.',
    caption:
      'People, including CJP protesters, take shelter inside Bangla Sahib gurdwara during the protest.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Gurdwara Bangla Sahib, New Delhi',
  },
  {
    id: 'poster',
    src: '/photos/poster.jpg',
    width: 1200,
    height: 900,
    alt: 'A handmade poster at night reads “Ab aur chup nahi rahenge” in black letters on white, bordered in red.',
    caption:
      'A poster near Kerala House on the night of 20 July: “Ab aur chup nahi rahenge” — we will stay silent no longer.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Kerala House, New Delhi',
  },
  {
    id: 'dipke',
    src: '/photos/dipke.jpg',
    width: 1200,
    height: 675,
    alt: 'A young man in a black T-shirt covers his face with his hand, surrounded by a crowd at night.',
    caption:
      'CJP founder Abhijeet Dipke breaks down before a gathering of protesters outside Kerala House.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Kerala House, New Delhi',
  },
  {
    id: 'rebuild',
    src: '/photos/rebuild.jpg',
    width: 1200,
    height: 1600,
    alt: 'A crowd stands under a large white and blue canopy at night as volunteers repair the stage.',
    caption:
      'Protesters rebuild the stage at Jantar Mantar on the night of 20 July, after the day’s protests.',
    credit: 'Akul Baiju / The Hindu',
    source: 'The Hindu',
    sourceUrl: HINDU_SOURCE,
    date: '20 July 2026',
    location: 'Jantar Mantar, New Delhi',
  },
];

export type VideoRecord = {
  id: string;
  youtubeId: string;
  /** Seconds into the original recording where the excerpt begins. */
  start: number;
  title: string;
  quote: string;
  translated?: boolean;
  speaker: string;
  source: string;
  date: string;
  note: string;
};

export const videos: VideoRecord[] = [
  {
    id: 'organiser-conditions',
    youtubeId: 'BNS7Tr6ngmo',
    start: 0,
    title: 'The conditions of the sit-in',
    quote: 'Access to washrooms. Access to water. Access to light.',
    translated: true,
    speaker: 'A CJP organiser speaking to reporters',
    source: 'The Indian Express',
    date: '20 June 2026',
    note: 'Recorded at the sit-in. Quote translated from Hindi.',
  },
  {
    id: 'wangchuk-fast',
    youtubeId: 'euPMOFtH_38',
    start: 0,
    title: 'Day 14 of the hunger strike',
    quote:
      'We have been on a hunger strike here at Jantar Mantar for the last 14 days — on salt and water.',
    translated: true,
    speaker: 'Sonam Wangchuk, education reformer',
    source: 'Sonam Wangchuk (official channel)',
    date: '28 June 2026',
    note: 'Recorded on day 14 of the fast. Quote translated from Hindi.',
  },
  {
    id: 'parent-testimony',
    youtubeId: 'qa20AKineKc',
    start: 208,
    title: 'A father’s testimony',
    quote: 'I have come here as a father. I have come to show up.',
    translated: true,
    speaker: 'A parent at the protest',
    source: 'The Hindu',
    date: 'Ground report',
    note: 'From The Hindu’s ground report at Jantar Mantar. Opens at 3:28, where the excerpt begins.',
  },
  {
    id: 'dipke-victory',
    youtubeId: 'vDD5ZgZpezk',
    start: 7,
    title: 'The victory speech',
    quote: 'We have done it. Dharmendra Pradhan has resigned.',
    speaker: 'Abhijeet Dipke, founder, Cockroach Janta Party',
    source: 'NDTV',
    date: '25 July 2026',
    note: 'The moment the demand was met. Opens at 0:07, where the audio excerpt begins.',
  },
];

export const youtubeUrl = (video: VideoRecord) =>
  `https://www.youtube.com/watch?v=${video.youtubeId}${video.start > 0 ? `&t=${video.start}s` : ''}`;

export const embedUrl = (video: VideoRecord) =>
  `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1${
    video.start > 0 ? `&start=${video.start}` : ''
  }`;
