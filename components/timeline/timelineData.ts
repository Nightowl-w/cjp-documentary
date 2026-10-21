export type TimelineEventType =
  "protest" | "legal" | "violence" | "statement" | "victory";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: TimelineEventType;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: "exam-cancelled",
    date: "May 2026",
    title: "NEET-UG is cancelled",
    description:
      "Days after the exam is held, it is cancelled amid reports of paper leaks and irregularities. A CBI probe begins, a re-test is announced, and the crisis spreads across CUET, CBSE and SSC-GD examinations.",
    type: "legal",
  },
  {
    id: "remark",
    date: "May 15",
    title: "The “cockroaches” remark",
    description:
      "During a contempt hearing on online criticism of judges, Chief Justice Surya Kant says unemployed young Indians are like “cockroaches” who become activists and attack everyone. The clip goes viral.",
    type: "statement",
  },
  {
    id: "founded",
    date: "May 16",
    title: "The Cockroach Janta Party is founded",
    description:
      "Abhijeet Dipke, a 30-year-old communications strategist then studying in Boston, posts a satirical response and launches CJP as a parody of the BJP. Over a lakh sign-ups follow within days; the party says it is the “Voice of the Lazy and Unemployed”.",
    type: "statement",
  },
  {
    id: "first-protest",
    date: "Jun 6",
    title: "Dipke lands — and goes to Jantar Mantar",
    description:
      "Dipke returns to Delhi from Boston and tells supporters he is headed straight to the protest site. CJP seeks permission for a peaceful demonstration and the first Jantar Mantar gathering begins.",
    type: "protest",
  },
  {
    id: "sit-in",
    date: "Jun 20",
    title: "The sit-in expands",
    description:
      "Hundreds bang steel plates and spoons — a satirical echo of the prime minister’s balcony call. The demand hardens: Education Minister Dharmendra Pradhan must resign over the paper leaks.",
    type: "protest",
  },
  {
    id: "wangchuk",
    date: "Jun 28",
    title: "Wangchuk begins an indefinite fast",
    description:
      "Ramon Magsaysay awardee Sonam Wangchuk, who had called himself an “honorary cockroach”, begins a hunger strike at Jantar Mantar in support of the demand for Pradhan’s resignation.",
    type: "protest",
  },
  {
    id: "charter",
    date: "Jul 15",
    title: "The five demands",
    description:
      "CJP releases its public charter: accountability for paper leaks, real exam reform, and justice for students. The document turns a viral protest into a set of concrete asks.",
    type: "statement",
  },
  {
    id: "hospital",
    date: "Jul 18",
    title: "Wangchuk removed to hospital",
    description:
      "As his fast weakens, authorities move Wangchuk to hospital. CJP calls it a forced removal from the site. Dipke begins his own hunger strike and announces the Chalo Sansad march for 20 July.",
    type: "violence",
  },
  {
    id: "march",
    date: "Jul 20",
    title: "Chalo Sansad — and a lathi charge",
    description:
      "Thousands try to march to Parliament on the opening day of the monsoon session. Police use barricades, batons and tear gas. Delhi Police counts around 180 injured, including personnel; protesters say a peaceful march was met with force. The grounds are cleared and rebuilt overnight.",
    type: "violence",
  },
  {
    id: "fast-ends",
    date: "Jul 23",
    title: "Wangchuk ends his 26-day fast",
    description:
      "Union ministers JP Nadda and Jitendra Singh visit Wangchuk with written assurances: fast-track courts, a stricter law against paper leaks, no cases against peaceful protesters, and a parliamentary discussion. He ends the fast.",
    type: "legal",
  },
  {
    id: "resignation",
    date: "Jul 25",
    title: "Pradhan resigns. The protest is called off.",
    description:
      "Education Minister Dharmendra Pradhan tenders his resignation. After talks with the government, CJP calls off the agitation “in good faith” — and posts: “Cockroaches won. Democracy won.”",
    type: "victory",
  },
];

export const timelineTypeLabels: Record<TimelineEventType, string> = {
  protest: "PROTEST",
  legal: "LEGAL / PROCESS",
  violence: "CRACKDOWN",
  statement: "STATEMENT",
  victory: "OUTCOME",
};

export interface TimelineTypeStyle {
  dot: string;
  badge: string;
  ring: string;
  glow: string;
}

export const timelineTypeStyles: Record<TimelineEventType, TimelineTypeStyle> =
  {
    protest: {
      dot: "bg-accent-gold",
      badge: "border-accent-gold/30 bg-accent-gold/15 text-accent-gold",
      ring: "ring-accent-gold/50",
      glow: "shadow-lg shadow-accent-gold/30",
    },
    legal: {
      dot: "bg-accent-teal",
      badge: "border-accent-teal/30 bg-accent-teal/15 text-accent-teal",
      ring: "ring-accent-teal/50",
      glow: "shadow-lg shadow-accent-teal/30",
    },
    violence: {
      dot: "bg-accent-crimson",
      badge:
        "border-accent-crimson/30 bg-accent-crimson/15 text-accent-crimson",
      ring: "ring-accent-crimson/50",
      glow: "shadow-lg shadow-accent-crimson/30",
    },
    statement: {
      dot: "bg-muted-foreground",
      badge: "border-border bg-muted text-muted-foreground",
      ring: "ring-muted-foreground/40",
      glow: "shadow-lg shadow-muted-foreground/20",
    },
    victory: {
      dot: "bg-accent-gold",
      badge: "border-accent-gold/40 bg-accent-gold/20 text-accent-gold",
      ring: "ring-accent-gold/60",
      glow: "shadow-lg shadow-accent-gold/40",
    },
  };

export const timelineLegend: TimelineEventType[] = [
  "protest",
  "legal",
  "violence",
  "statement",
  "victory",
];
