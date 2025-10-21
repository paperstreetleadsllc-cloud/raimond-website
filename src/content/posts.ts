export type Post = {
  slug: string;
  title: string;
  date: string;   // ISO
  excerpt: string;
  tags?: string[];
};

export const posts: Post[] = [
  {
    slug: "trading-desk-modern",
    title: "Building a Modern Trading Desk",
    date: "2025-01-10",
    excerpt: "Hardware, layout, and processes to reduce cognitive load and execution errors.",
    tags: ["process","ops"]
  },
  {
    slug: "edge-and-efficiency",
    title: "Understanding Edge & Efficiency",
    date: "2025-01-18",
    excerpt: "Measuring your edge and compounding it with tighter execution and reviews.",
    tags: ["edge","review"]
  },
  {
    slug: "discipline-advantage",
    title: "Discipline: The Unfair Advantage",
    date: "2025-02-01",
    excerpt: "Practical mechanisms to stop overtrading and respect risk limits.",
    tags: ["discipline","risk"]
  }
];