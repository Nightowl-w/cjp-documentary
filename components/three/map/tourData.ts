export type TimePreset = 'golden' | 'day' | 'night';

export interface Hotspot {
  id: string;
  label: string;
  short: string;
  description: string;
  kind: 'instrument' | 'camp' | 'route' | 'landmark';
  /** Higher weight wins label de-cluttering. */
  weight: number;
}

/**
 * Interpretive map of Jantar Mantar and the protest ground.
 * Positions are approximate (not survey-grade) and are used to tell the
 * story of June–July 2026, not to measure the site.
 */
export const HOTSPOTS: Hotspot[] = [
  {
    id: 'samrat',
    label: 'Samrat Yantra',
    short: 'The 27-metre sundial',
    description:
      'The giant gnomon at the centre of the complex. Built in 1724 to measure time from shadows — in 2026 it became the backdrop for demands of accountability.',
    kind: 'instrument',
    weight: 3,
  },
  {
    id: 'jaiprakash',
    label: 'Jai Prakash Yantra',
    short: 'Hemispheric sky bowls',
    description:
      'Two hemispherical bowls that mapped the sky. From above they look like instruments of measurement; from the ground they became the quietest corner of the protest.',
    kind: 'instrument',
    weight: 2,
  },
  {
    id: 'ram',
    label: 'Ram Yantra',
    short: 'Cylindrical dials',
    description:
      'Twin cylindrical instruments with central pillars, used with the masonry markings to track altitude and azimuth.',
    kind: 'instrument',
    weight: 1.6,
  },
  {
    id: 'misra',
    label: 'Misra Yantra',
    short: 'A composite instrument',
    description:
      'A later addition to the complex — several dials combined in one structure, including ones that could read noon at four different cities.',
    kind: 'instrument',
    weight: 1.6,
  },
  {
    id: 'stage',
    label: "The people's stage",
    short: 'Evening speeches',
    description:
      'Abhijeet Dipke, Sonam Wangchuk and student organisers addressed the crowd from here. The demand was read out nightly: accountability, starting with the Education Minister.',
    kind: 'camp',
    weight: 3,
  },
  {
    id: 'tents',
    label: 'Tents & the sit-in',
    short: 'Seven weeks on the ground',
    description:
      'Shelter for students and families who stayed through Delhi’s June heat and July rain. The sit-in held from 6 June until the agitation was called off on 25 July.',
    kind: 'camp',
    weight: 2.4,
  },
  {
    id: 'langar',
    label: 'Langar & water lines',
    short: 'Food, water, medical support',
    description:
      'Volunteers ran langar, water and medical help through the day. On 20 June, CJP accused Delhi Police of cutting access to water, food and washrooms.',
    kind: 'camp',
    weight: 1.6,
  },
  {
    id: 'medical',
    label: 'Medical camp',
    short: 'Volunteer care',
    description:
      'A volunteer medical post and ambulance stood by through the sit-in and the hunger strikes.',
    kind: 'camp',
    weight: 1.2,
  },
  {
    id: 'stop',
    label: 'Where the march was stopped',
    short: '20 July · barricades',
    description:
      'The Chalo Sansad march was halted here with layered barricades, batons and tear gas. Delhi Police counted around 180 injured, including personnel; protesters said a peaceful march was met with force. The grounds were cleared and rebuilt overnight.',
    kind: 'route',
    weight: 3,
  },
  {
    id: 'bangla',
    label: 'Gurdwara Bangla Sahib',
    short: 'Shelter during the crackdown',
    description:
      'The nearby gurdwara took people in as police cleared the protest ground on 20 July — the neighbourhood that held the movement while the ground was swept.',
    kind: 'landmark',
    weight: 2,
  },
  {
    id: 'parliament',
    label: 'Parliament',
    short: 'The direction of the march',
    description:
      'The marchers never reached it. Ten days later — on 25 July 2026 — the Education Minister resigned and the protest was called off “in good faith”.',
    kind: 'landmark',
    weight: 2,
  },
];

export interface TourStop {
  id: string;
  title: string;
  text: string;
  position: [number, number, number];
  target: [number, number, number];
  hotspot: string | null;
  route?: boolean;
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 'overview',
    title: 'Fifty days on one patch of ground',
    text: 'An 18th-century observatory that became, in 2026, the address for India’s exam-crisis protest.',
    position: [44, 38, 50],
    target: [2, 0, -6],
    hotspot: null,
  },
  {
    id: 'instruments',
    title: 'Instruments built to measure time',
    text: 'The Samrat Yantra’s shadow measured the hour. In 2026 the same ground measured how long a paper leak can go unanswered.',
    position: [13, 10, 18],
    target: [0, 3.5, 2],
    hotspot: 'samrat',
  },
  {
    id: 'stage',
    title: 'The people’s stage',
    text: 'Dipke, Wangchuk and student organisers spoke here every evening. The demand was simple: accountability, starting at the top.',
    position: [-1, 10, 25],
    target: [13, 2.5, 9],
    hotspot: 'stage',
  },
  {
    id: 'camp',
    title: 'The sit-in that held',
    text: 'Tents, langar, water points, a medical post. The ground was not just a rally — it was a temporary neighbourhood for seven weeks.',
    position: [-11, 12, -28],
    target: [-8, 1, -6],
    hotspot: 'tents',
  },
  {
    id: 'services',
    title: 'Water, food, washrooms',
    text: 'Volunteers held the camp together while organisers accused the police of cutting off water, food and washroom access — a flashpoint on 20 June.',
    position: [-30, 8, 8],
    target: [-19, 1.5, -2],
    hotspot: 'langar',
  },
  {
    id: 'march',
    title: 'Chalo Sansad — and the lathi charge',
    text: 'On 20 July, thousands marched toward Parliament. They were stopped here with barricades, batons and tear gas; the police put the injuries around 180, including their own.',
    position: [13, 12, 6],
    target: [31, 1.5, -30],
    hotspot: 'stop',
    route: true,
  },
  {
    id: 'shelter',
    title: 'The shelter, and the city',
    text: 'As the ground was cleared, the nearby gurdwara took people in. Seven weeks after the sit-in began, the agitation ended on 25 July.',
    position: [8, 9, -30],
    target: [18, 2, -52],
    hotspot: 'bangla',
  },
  {
    id: 'close',
    title: 'What the protest won',
    text: 'Pradhan resigned. Cases were promised to be withdrawn, compensation promised, a paper-leak law promised. The rest is implementation — and this record.',
    position: [48, 40, 42],
    target: [4, 0, -10],
    hotspot: null,
  },
];

export interface PresetOption {
  id: TimePreset;
  label: string;
}

export const PRESETS: PresetOption[] = [
  { id: 'golden', label: 'Golden hour' },
  { id: 'day', label: 'Day' },
  { id: 'night', label: 'Night' },
];

export const LEGEND: { id: string; label: string; swatch: string }[] = [
  { id: 'instrument', label: 'Observatory instruments', swatch: 'bg-[#c09270]' },
  { id: 'camp', label: 'Protest camp', swatch: 'bg-[#4f83b5]' },
  { id: 'route', label: 'March route & stop point', swatch: 'bg-[#e0b45a]' },
  { id: 'landmark', label: 'Landmarks', swatch: 'bg-[#d9d4c8]' },
];
