import { skillCatalogue } from "./catalogues/people.ts";
import type { BrandLogo } from "./catalogues/brands";
export type Stage =
  | "New"
  | "Reviewing"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected"
  | "Withdrawn";
export const stages: Stage[] = [
  "New",
  "Reviewing",
  "Shortlisted",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
  "Withdrawn",
];
export const openStages = stages.slice(0, 5);
export type Criteria = {
  years: number;
  skills: { name: string; importance: string }[];
  languages: { name: string; proficiency: string }[];
  questions: {
    text: string;
    type: string;
    required: boolean;
    answer: string;
  }[];
};
export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  mode: string;
  type: string;
  status: "Published" | "Draft" | "Closed" | "Archived";
  closing: string;
  description: string;
  created: string;
  criteria: Criteria;
};
export type Candidate = {
  id: string;
  name: string;
  role: string;
  location: string;
  years: number;
  email: string;
  languages: string[];
  skills: string[];
  about: string;
  saved: boolean;
  savedAt?: string;
  tags: string[];
  notes: Note[];
};
export type Note = { id: string; text: string; date: string; author: string };
export type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  stage: Stage;
  screening: "Qualified" | "Not qualified" | "Pending" | "Error";
  date: string;
  channel: string;
  notes: Note[];
  tags: string[];
  messages: { subject: string; body: string; date: string }[];
  history: { text: string; date: string }[];
  startDate?: string;
  confirmation?: "Awaiting confirmation" | "Confirmed" | "Denied";
  rejectionDate?: string;
};
export type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
};
export type TrackedLink = {
  id: string;
  label: string;
  jobId: string;
  channel: string;
  views: number;
  applications: number;
};
export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};
export type Workspace = {
  version: 1;
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  templates: Template[];
  links: TrackedLink[];
  team: Member[];
  tags: string[];
  channels: string[];
  channelLogos?: Record<string, BrandLogo>;
  organization: { name: string; website: string; description: string };
  account: { name: string; email: string };
};
export const locations = [
  "Damascus",
  "Aleppo",
  "Homs",
  "Hama",
  "Latakia",
  "Remote",
];
export const roles = [
  "Programme management",
  "Monitoring & evaluation",
  "Finance",
  "Communications",
  "Logistics",
  "Community outreach",
];
export const skills = skillCatalogue.map((skill) => skill.name);
export const emptyCriteria: Criteria = {
  years: 0,
  skills: [],
  languages: [],
  questions: [],
};
const commonCriteria: Criteria = {
  years: 3,
  skills: [
    { name: "Project management", importance: "Required" },
    { name: "Report writing", importance: "Preferred" },
  ],
  languages: [
    { name: "Arabic", proficiency: "Fluent" },
    { name: "English", proficiency: "Advanced" },
  ],
  questions: [
    {
      text: "Are you available to travel to programme sites?",
      type: "Yes / no",
      required: true,
      answer: "Yes",
    },
  ],
};
const jobSeeds = [
  [
    "j1",
    "Programme Coordinator",
    "Programmes",
    "Damascus",
    "Hybrid",
    "Full time",
    "Published",
    "2026-10-15",
  ],
  [
    "j2",
    "MEAL Officer",
    "Monitoring & evaluation",
    "Aleppo",
    "On-site",
    "Full time",
    "Published",
    "2026-10-08",
  ],
  [
    "j3",
    "Finance & Grants Officer",
    "Finance",
    "Damascus",
    "On-site",
    "Full time",
    "Published",
    "2026-10-20",
  ],
  [
    "j4",
    "Community Outreach Assistant",
    "Programmes",
    "Homs",
    "On-site",
    "Contract",
    "Published",
    "2026-10-12",
  ],
  [
    "j5",
    "Communications Specialist",
    "Communications",
    "Remote",
    "Remote",
    "Part time",
    "Draft",
    "2026-11-01",
  ],
  [
    "j6",
    "Logistics Coordinator",
    "Operations",
    "Latakia",
    "On-site",
    "Full time",
    "Closed",
    "2026-09-10",
  ],
];
const people = [
  [
    "Maya Khalil",
    "Programme management",
    "Damascus",
    6,
    ["Project management", "Budgeting", "Safeguarding", "Report writing"],
  ],
  [
    "Omar Nasser",
    "Monitoring & evaluation",
    "Aleppo",
    4,
    ["MEAL", "Data analysis", "Excel", "Report writing"],
  ],
  [
    "Lina Darwish",
    "Finance",
    "Damascus",
    5,
    ["Budgeting", "Excel", "Procurement"],
  ],
  [
    "Karam Saleh",
    "Community outreach",
    "Homs",
    3,
    ["Community engagement", "Safeguarding", "Report writing"],
  ],
  [
    "Yara Mansour",
    "Programme management",
    "Damascus",
    7,
    ["Project management", "Budgeting", "MEAL"],
  ],
  [
    "Tarek Hamdan",
    "Monitoring & evaluation",
    "Aleppo",
    2,
    ["Data analysis", "Excel", "MEAL"],
  ],
  ["Rana Saad", "Finance", "Hama", 6, ["Budgeting", "Excel", "Report writing"]],
  [
    "Nour Faris",
    "Communications",
    "Remote",
    4,
    ["Communications", "Report writing", "Community engagement"],
  ],
  [
    "Salim Abbas",
    "Logistics",
    "Latakia",
    8,
    ["Procurement", "Project management", "Excel"],
  ],
  [
    "Dima Issa",
    "Programme management",
    "Damascus",
    5,
    ["Project management", "Safeguarding", "Report writing"],
  ],
  [
    "Fadi Zein",
    "Community outreach",
    "Homs",
    1,
    ["Community engagement", "Communications"],
  ],
  [
    "Hala Younes",
    "Monitoring & evaluation",
    "Aleppo",
    5,
    ["MEAL", "Data analysis", "Report writing"],
  ],
] as const;
export const seed: Workspace = {
  version: 1,
  jobs: jobSeeds.map(
    ([id, title, department, location, mode, type, status, closing]) => ({
      id,
      title,
      department,
      location,
      mode,
      type,
      status: status as Job["status"],
      closing,
      created: "2026-09-16",
      description: `Help our team deliver thoughtful, effective programmes for communities across Syria. As our ${title.toLowerCase()}, you will work closely with local partners, support high-quality delivery and turn learning into practical improvements.\n\nYour responsibilities\n• Coordinate day-to-day activities with colleagues and partners.\n• Keep clear records and share progress with the team.\n• Uphold safeguarding, inclusion and accountability in every part of your work.\n\nWe welcome applicants from diverse backgrounds who bring care, curiosity and relevant experience.`,
      criteria: structuredClone(commonCriteria),
    }),
  ),
  candidates: people.map(([name, role, location, years, skill], i) => ({
    id: `c${i + 1}`,
    name,
    role,
    location,
    years,
    email: `${name.toLowerCase().replace(" ", ".")}@example.org`,
    languages: i === 10 ? ["Arabic"] : ["Arabic", "English"],
    skills: [...skill],
    about: `${role} professional with ${years} years of experience supporting community-focused programmes. Experienced in working with local teams, building trusted partnerships and translating plans into measurable outcomes.`,
    saved: [0, 4, 7, 8].includes(i),
    savedAt: [0, 4, 7, 8].includes(i)
      ? `2026-09-${String(21 - i).padStart(2, "0")}T09:00:00Z`
      : undefined,
    tags:
      i % 3 === 0
        ? ["Strong communicator"]
        : i % 3 === 1
          ? ["Field experience"]
          : [],
    notes: [],
  })),
  applications: people.map((_, i) => ({
    id: `a${i + 1}`,
    candidateId: `c${i + 1}`,
    jobId: `j${[1, 2, 3, 4, 1, 2, 3, 1, 6, 1, 4, 2][i]}`,
    stage: (
      [
        "New",
        "New",
        "Reviewing",
        "Shortlisted",
        "Interview",
        "New",
        "Offer",
        "Rejected",
        "Hired",
        "Hired",
        "Withdrawn",
        "Hired",
      ] as Stage[]
    )[i],
    screening: i === 5 ? "Not qualified" : i === 10 ? "Pending" : "Qualified",
    date: `2026-09-${22 - Math.floor(i / 2)}`,
    channel: ["LinkedIn", "Community partners", "Direct"][i % 3],
    notes:
      i === 0
        ? [
            {
              id: "n1",
              text: "Strong programme coordination experience. Explore partner management during the first conversation.",
              author: "You",
              date: "2026-09-22T08:30:00Z",
            },
          ]
        : [],
    tags: i === 0 ? ["Strong communicator"] : [],
    messages: [],
    history: [
      {
        text: "Application received",
        date: `2026-09-${22 - Math.floor(i / 2)}T08:00:00Z`,
      },
    ],
    ...([8, 9, 11].includes(i)
      ? {
          startDate: "2026-09-15",
          confirmation: (
            ["Confirmed", "Awaiting confirmation", "Denied"] as const
          )[[8, 9, 11].indexOf(i)],
        }
      : {}),
  })),
  templates: [
    {
      id: "t1",
      name: "Interview invitation",
      subject: "Your interview for {{ job_title }}",
      body: "Hi {{ candidate_name }},\n\nThank you for your interest in {{ tenant_name }}. We would love to learn more about your experience in a conversation about our {{ job_title }} role.\n\nPlease let us know your availability this week.\n\nBest wishes,\nThe recruitment team",
    },
    {
      id: "t2",
      name: "Application received",
      subject: "Thank you for applying to {{ tenant_name }}",
      body: "Hi {{ candidate_name }},\n\nWe have received your application for {{ job_title }}. Our team will review it and be in touch with next steps.\n\nThank you for your patience.",
    },
    {
      id: "t3",
      name: "Request more information",
      subject: "A question about your {{ job_title }} application",
      body: "Hi {{ candidate_name }},\n\nThank you for applying. Could you share a little more about your recent experience and availability?\n\nBest wishes,\n{{ tenant_name }}",
    },
  ],
  links: [
    {
      id: "l1",
      label: "September recruitment",
      jobId: "j1",
      channel: "LinkedIn",
      views: 248,
      applications: 18,
    },
    {
      id: "l2",
      label: "Partner newsletter",
      jobId: "j2",
      channel: "Community partners",
      views: 176,
      applications: 24,
    },
    {
      id: "l3",
      label: "Finance network",
      jobId: "j3",
      channel: "LinkedIn",
      views: 112,
      applications: 9,
    },
    {
      id: "l4",
      label: "Local opportunities",
      jobId: "j4",
      channel: "Facebook",
      views: 324,
      applications: 21,
    },
  ],
  team: [
    {
      id: "me",
      name: "Sara Haddad",
      email: "sara.haddad@example.org",
      role: "Admin",
      status: "Active",
    },
    {
      id: "u2",
      name: "Adam Rami",
      email: "adam.rami@example.org",
      role: "Recruiter",
      status: "Active",
    },
    {
      id: "u3",
      name: "Leen Sami",
      email: "leen.sami@example.org",
      role: "Recruiter",
      status: "Active",
    },
    {
      id: "u4",
      name: "Jad Noor",
      email: "jad.noor@example.org",
      role: "Recruiter",
      status: "Invited",
    },
  ],
  tags: [
    "Strong communicator",
    "Field experience",
    "Future opportunity",
    "Technical expertise",
  ],
  channels: ["LinkedIn", "Community partners", "Facebook"],
  organization: {
    name: "Olive Branch Initiative",
    website: "https://example.org",
    description:
      "Supporting communities with inclusive programmes, local partnerships and opportunities for meaningful work.",
  },
  account: { name: "Sara Haddad", email: "sara.haddad@example.org" },
};
export const uid = () => crypto.randomUUID();
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
export const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
export function allowedMoves(stage: Stage): Stage[] {
  return stage === "Hired" || stage === "Withdrawn"
    ? []
    : stage === "Rejected"
      ? ["Reviewing"]
      : stages.filter((s) => s !== stage && s !== "Withdrawn");
}
export function moveApplication(
  app: Application,
  stage: Stage,
  startDate?: string,
): Application {
  if (!allowedMoves(app.stage).includes(stage)) return app;
  return {
    ...app,
    stage,
    startDate: stage === "Hired" ? startDate : app.startDate,
    confirmation:
      stage === "Hired" ? "Awaiting confirmation" : app.confirmation,
    rejectionDate:
      stage === "Rejected"
        ? new Date(Date.now() + 3 * 86400000).toISOString()
        : undefined,
    history: [
      {
        text: `Moved from ${app.stage} to ${stage}`,
        date: new Date().toISOString(),
      },
      ...app.history,
    ],
  };
}
