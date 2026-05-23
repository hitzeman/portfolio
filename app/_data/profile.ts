export const profile = {
  name: "Todd Hitzeman",
  firstName: "Todd",
  lastName: "Hitzeman",
  title: "Senior Software Engineer",
  subtitle: "Frontend Architecture · Angular SSR/SSG · .NET · Azure",
  location: "Dallas–Fort Worth, TX",
  email: "hitzeman.todd@gmail.com",
  phone: "949.228.4758",
  linkedin: "https://www.linkedin.com/in/todd-hitzeman",
  status: "Open to senior frontend & full-stack roles",
  tagline:
    "Building enterprise-grade frontend platforms that scale — without sacrificing the craft.",
  about: [
    "I'm a senior software engineer with a strong focus on frontend architecture and building scalable Angular applications. I specialize in modern frontend development — Angular SSR/SSG, shared UI component libraries, and performance-focused application design.",
    "I enjoy owning frontend platforms end-to-end and partnering closely with design and product teams to deliver consistent, maintainable user experiences at scale within large, enterprise environments.",
    "While frontend is my primary focus, I have strong experience working across the stack, including building and integrating .NET APIs and deploying applications in Azure. That breadth lets me design frontend solutions with a real understanding of backend systems and production concerns.",
  ],
  stats: [
    { label: "Years in engineering", value: "9+" },
    { label: "Current role", value: "Sr. SWE" },
    { label: "Primary stack", value: "Angular · .NET" },
    { label: "Cloud", value: "Azure" },
  ],
};

export const skills = {
  Frontend: [
    "Angular",
    "TypeScript",
    "RxJS",
    "SSR / SSG",
    "Shared Component Libraries",
    "Design Systems",
    "Web Performance",
    "Accessibility",
    "HTML / CSS",
    "Responsive UI",
  ],
  Backend: [
    ".NET",
    "C#",
    "REST APIs",
    "Headless CMS",
    "API-Driven Architecture",
  ],
  Cloud: [
    "Azure",
    "CI/CD Pipelines",
    "Application Deployments",
    "Observability",
  ],
  Practice: [
    "Frontend Architecture",
    "Mentorship",
    "Code Review",
    "A/B Testing",
    "Analytics & Experimentation",
    "Unit & E2E Testing",
  ],
};

export type TimelineEntry = {
  company: string;
  role: string;
  period: string;
  location: string;
  duration?: string;
  highlights: string[];
  badge?: string;
};

export const timeline: TimelineEntry[] = [
  {
    company: "loanDepot",
    role: "Sr. Software Engineer",
    period: "Sep 2019 — Present",
    duration: "6 yrs 9 mos",
    location: "Plano, TX",
    badge: "Current",
    highlights: [
      "Lead frontend development for high-traffic, customer-facing Angular applications supporting core business workflows.",
      "Design and maintain scalable Angular architectures focused on long-term maintainability, performance, and consistency across applications.",
      "Implement Angular SSR/SSG solutions to improve page load performance, SEO, and overall user experience.",
      "Integrate headless CMS platforms into Angular applications — dynamic, API-driven content with no compromise on performance.",
      "Contribute to and help evolve a shared UI component library, partnering with UI/UX to enforce consistent design patterns across teams.",
      "Drive modernization by migrating legacy .NET MVC apps to modern Angular frontends with API-driven architectures.",
      "Champion engineering standards through code reviews, unit & E2E testing, and CI/CD pipelines in Azure.",
      "Mentor engineers and guide architecture decisions, best practices, and code quality.",
    ],
  },
  {
    company: "loanDepot",
    role: "Software Engineer",
    period: "Feb 2017 — Sep 2019",
    duration: "2 yrs 8 mos",
    location: "Lake Forest, CA",
    highlights: [
      "Contributed to customer-facing web applications focused on marketing and lead-capture experiences supporting core product workflows.",
      "Built responsive, performant UIs in close partnership with design and marketing teams.",
      "Implemented analytics, experimentation, and A/B testing to measure user behavior and drive UI improvements that increased conversion and engagement.",
    ],
  },
];

export const education = [
  {
    school: "San Francisco State University",
    degree: "B.S., Information Systems",
  },
];

export const certifications = [
  "Design Prompts for Everyday Work Tasks",
  "Speed Up Data Analysis and Presentation Building",
  "Use AI as a Creative or Expert Partner",
];
