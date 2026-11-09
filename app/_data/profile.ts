/**
 * Public-facing professional profile and digital-twin knowledge base.
 * Updated November 2026 from project work-history notes and AI engineering review.
 * Keep confidential repository details, internal URLs, and personal information out of public chatbot responses.
 */
export const profile = {
  name: 'Todd Hitzeman',
  firstName: 'Todd',
  lastName: 'Hitzeman',
  title: 'Senior Software Engineer',
  subtitle:
    'Frontend Architecture · AI-Assisted Engineering · Angular SSR · .NET · Azure',
  location: 'McKinney, TX · Dallas–Fort Worth Metroplex',
  email: 'hitzeman.todd@gmail.com',
  phone: '949.228.4758',
  linkedin: 'https://www.linkedin.com/in/todd-hitzeman',
  status:
    'Open to lead, staff, principal and senior-level opportunities with meaningful technical ownership',
  tagline:
    'Modernizing enterprise web platforms and making AI-assisted engineering repeatable, reliable, and useful.',
  about: [
    "I'm a senior software engineer with nearly a decade of experience at loanDepot, specializing in frontend architecture, large-scale Angular applications, and modernizing enterprise web platforms. I enjoy turning complex legacy systems into maintainable, performant applications.",
    "My recent work has centered on migrating Angular 12 and Scully-based websites to Angular 21 SSR/SSG, using Nx, signals, zoneless Angular, and modern testing practices. I've worked across customer-facing websites, lead-generation flows, joint-venture sites, headless CMS integrations, and shared UI platforms.",
    'In 2026, I expanded my focus into AI-assisted software engineering. I use tools such as Claude Code, Devin, Codex, and GitHub Copilot, and I build the agent instructions, reusable skills, research workflows, and verification processes that make these tools effective across real engineering projects. For me, AI is a way to improve how software is built—not a replacement for architecture, code review, or testing.',
    'Although frontend architecture is my strongest specialty, I work across the stack with .NET/C#, Node.js, APIs, Azure, and AWS. I like owning problems end-to-end, collaborating with product and design partners, and helping teams establish practical engineering standards.',
  ],
  stats: [
    { label: 'Engineering experience', value: '9+ years' },
    { label: 'Current role', value: 'Senior SWE' },
    { label: 'Core expertise', value: 'Angular · TypeScript' },
    { label: 'Cloud platforms', value: 'Azure · AWS' },
  ],
};

export const skills = {
  Frontend: [
    'Angular (v12–21)',
    'TypeScript',
    'JavaScript',
    'RxJS',
    'Angular Signals',
    'Zoneless Angular',
    'Server-Side Rendering (SSR)',
    'Static-Site Generation (SSG)',
    'Nx Monorepos',
    'Scully',
    'Shared Component Libraries',
    'Design Systems',
    'Web Performance',
    'SEO',
    'Accessibility',
    'HTML / CSS',
    'Responsive UI',
    'Tailwind CSS',
    'D3.js',
  ],
  Backend: [
    '.NET',
    'C#',
    'ASP.NET MVC',
    'Razor',
    'Node.js',
    'REST APIs',
    'GraphQL',
    'Headless CMS',
    'Kontent AI',
    'Sitecore',
    'Builder.io',
    'API-Driven Architecture',
    'Puppeteer',
    'Authentication / MSAL',
  ],
  Cloud: [
    'Microsoft Azure',
    'Azure API Management',
    'Azure Front Door',
    'Azure Storage',
    'Azure CDN',
    'AWS Lambda',
    'Amazon S3',
    'Amazon SQS',
    'Amazon CloudWatch',
    'CI/CD Pipelines',
    'Docker',
    'Application Deployments',
    'Observability',
  ],
  AIEngineering: [
    'Claude Code',
    'Devin',
    'OpenAI Codex',
    'GitHub Copilot',
    'Agent Instructions (AGENTS.md / CLAUDE.md)',
    'Agent Skills and Workflows',
    'Model Context Protocol (MCP)',
    'AI-Assisted Migration Planning',
    'Specification-Driven Development',
    'Agent Verification and Handoffs',
    'AI-Assisted Code Review',
    'Figma MCP',
  ],
  Practice: [
    'Frontend Architecture',
    'Technical Leadership',
    'Mentorship',
    'Code Review',
    'Legacy Modernization',
    'Performance Optimization',
    'A/B Testing',
    'Analytics & Experimentation',
    'Unit Testing',
    'Playwright E2E Testing',
    'Vitest',
    'Jest',
    'Regression Verification',
    'Cross-Functional Collaboration',
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
    company: 'loanDepot',
    role: 'Senior Software Engineer',
    period: 'Sep 2019 — Present',
    location: 'Plano, TX',
    badge: 'Current',
    highlights: [
      'Help lead frontend modernization across enterprise customer-facing websites, marketing experiences, and joint-venture properties.',
      'Migrated Angular 12 and Scully-generated sites toward Angular 21 SSR/SSG using Nx, signals, and zoneless Angular, with attention to SEO, rendering, and maintainability.',
      'Helped evolve a web portfolio spanning the main website, marketing pages, and joint-venture sites, integrating headless CMS content through GraphQL and Azure services.',
      'Established reusable AI-agent context, project-specific rules, migration research, verification, reflection, and handoff workflows for joint-venture applications.',
      'Developed AI-assisted new-brand onboarding tooling with dry-run behavior, configuration validation, overwrite protection, and automated tests.',
      'Used AI-assisted engineering across website migrations, customer acquisition flows, accessibility and SEO fixes, and regression testing, while retaining human review.',
      'Helped improve campaign attribution reliability across customer lead flows by correcting asynchronous query-parameter handling and adding targeted tests.',
      'Introduced or expanded Playwright browser smoke tests and unit-test infrastructure to support safer modernization.',
      'Partnered with engineering, product, marketing, and design stakeholders on shared components, integrations, and production-oriented architecture decisions.',
    ],
  },
  {
    company: 'CMHWorks',
    role: 'Contract Software Engineer',
    period: '2023 — Present',
    location: 'Remote',
    badge: 'Concurrent contract',
    highlights: [
      'Maintain and enhance existing client applications, including defect fixes, .NET backend migrations, reports, and product features.',
      'Built an HTML-to-PDF reporting service with Node.js and Puppeteer, deployed to AWS Lambda for large HTML reports.',
      'Work across backend services and AWS infrastructure alongside a primary enterprise frontend engineering role.',
      'Developing an AI-powered FAQ chatbot to replace a hardcoded FAQ experience (in progress as of October 2026).',
    ],
  },
  {
    company: 'loanDepot',
    role: 'Software Engineer',
    period: 'Feb 2017 — Sep 2019',
    location: 'Lake Forest, CA',
    highlights: [
      'Built marketing websites, campaign landing pages, and lead-capture forms with HTML, CSS, JavaScript, Sitecore, .NET MVC, Razor, and AngularJS.',
      'Contributed to individualized recruiting candidate pages featuring market rankings and D3 visualizations, supporting approximately 50,000 pages refreshed monthly.',
      'Partnered with marketing and design teams on responsive experiences, analytics, and experimentation.',
    ],
  },
];

export type ProjectEntry = {
  name: string;
  context: string;
  technologies: string[];
  summary: string;
  contributions: string[];
  status?: string;
};

export const projects: ProjectEntry[] = [
  {
    name: 'Enterprise Angular SSR Modernization',
    context: 'loanDepot',
    technologies: [
      'Angular 21',
      'TypeScript',
      'Nx',
      'SSR',
      'SSG',
      'Signals',
      'Azure',
      'Playwright',
    ],
    summary:
      'Modernizing legacy Angular/Scully websites into contemporary server-rendered and statically generated applications.',
    contributions: [
      'Migrated customer-facing routes and components with a focus on SEO, performance, and behavior parity.',
      'Used source-based migration research and browser regression checks to reduce the risk of missed routes or changed behavior.',
      'Worked with headless CMS content, GraphQL APIs, and Azure edge and delivery infrastructure.',
    ],
  },
  {
    name: 'AI-Assisted Engineering Workflows',
    context: 'loanDepot joint-venture web platform',
    technologies: [
      'Claude Code',
      'Devin',
      'Codex',
      'AGENTS.md',
      'Nx',
      'Playwright',
    ],
    summary:
      'Creating reusable guidance and verification processes so AI agents can contribute safely to real software projects.',
    contributions: [
      'Established project-specific agent rules, architecture references, research and migration workflows, and reflection/handoff practices.',
      'Built repeatable brand-onboarding scaffolding with validation and automated tests.',
      'Reduced an always-loaded agent rules document from 1,105 to 161 lines by moving deeper guidance into referenced materials; this is a documentation-size reduction, not a measured speedup.',
    ],
  },
  {
    name: 'Lead Attribution and Website Quality',
    context: 'loanDepot',
    technologies: ['Angular', 'TypeScript', 'Vitest', 'Playwright'],
    summary:
      'Improving correctness and regression coverage in customer acquisition experiences.',
    contributions: [
      'Helped fix asynchronous campaign-source parameter handling across seven customer-flow containers.',
      'Preserved initial landing-page and campaign context through relevant lead submission flows.',
      'Added targeted unit tests and browser smoke-test infrastructure.',
    ],
  },
  {
    name: 'HTML-to-PDF Reporting Service',
    context: 'CMHWorks',
    technologies: ['Node.js', 'Puppeteer', 'AWS Lambda'],
    summary: 'A backend service for generating PDFs from large HTML reports.',
    contributions: [
      'Implemented HTML rendering and PDF generation.',
      'Deployed the service using AWS Lambda.',
    ],
  },
  {
    name: 'AI FAQ Chatbot',
    context: 'CMHWorks',
    technologies: ['AI', 'Chatbot'],
    summary: 'An AI-powered replacement for a hardcoded FAQ experience.',
    contributions: ['Developing the chatbot as a client product enhancement.'],
    status:
      'In progress as of October 2026; architecture and production deployment not yet confirmed',
  },
  {
    name: 'ClosingUSA Static-Site Prototype',
    context: 'loanDepot',
    technologies: ['Angular', 'SSG', 'OpenSpec', 'Devin', 'SEO Verification'],
    summary:
      'A specification-driven prototype exploring conversion from runtime SSR to self-contained static output.',
    contributions: [
      'Defined route, content, offline, SEO, and operational verification criteria.',
      'Documented hosting tradeoffs such as caching, security headers, routing, and rollback requirements.',
    ],
    status:
      'Prototype on a development branch as of October 2026; not confirmed as deployed',
  },
];

export const aiEngineering = {
  philosophy:
    'AI agents are useful when grounded in the codebase, given explicit constraints, and held to verifiable results. Human engineering judgment, testing, and review remain essential.',
  tools: ['Claude Code', 'Devin', 'Codex', 'GitHub Copilot', 'MCP'],
  practices: [
    'Create project-specific instructions and architecture references rather than relying on generic prompts.',
    'Research legacy behavior, routes, content, and constraints before asking agents to migrate code.',
    'Require observable checks: tests, rendered HTML, route parity, SEO metadata, and browser behavior.',
    'Turn recurring mistakes and discoveries into reusable rules, skills, and handoff notes.',
    'Separate merged work, prototypes, and production outcomes instead of treating them as equivalent.',
  ],
  evidence: [
    'A review of the available January–October 2026 repository history identified 50 merged PRs from Devin-named branches across the web portfolio; Todd was recorded as merge author on 32. This does not mean he personally authored all 50 PRs.',
    'Joint-venture agent guidance included 11 documented workflows and a reusable new-brand onboarding skill.',
    'A rules refactor reduced one always-loaded document from 1,105 to 161 lines; time or cost savings were not measured.',
  ],
};

export const education = [
  {
    school: 'San Francisco State University',
    degree: 'B.S., Information Systems',
  },
];

export const certifications = [
  'Design Prompts for Everyday Work Tasks',
  'Speed Up Data Analysis and Presentation Building',
  'Use AI as a Creative or Expert Partner',
];

/** Optional guidance for an LLM using this module as its knowledge base. */
export const digitalTwin = {
  voice:
    'First-person, approachable, technically specific, and grounded. Prefer practical examples over buzzwords.',
  perspective:
    'Speak as a professional representation of Todd, but never pretend to be the real person in a live conversation.',
  focus: [
    'Frontend architecture and enterprise Angular modernization',
    'Repeatable AI-assisted engineering practices with human verification',
    'Full-stack ownership across frontend, APIs, and cloud deployments',
    'Lead-level technical ownership and cross-team collaboration',
  ],
  boundaries: [
    'Do not invent metrics, deployment status, credentials, employers, or project ownership.',
    'Distinguish prototypes and in-progress work from production deployments.',
    'Do not reveal private repository contents, internal links, proprietary implementation details, or personal information beyond intentionally published profile fields.',
    'When asked about skills not evidenced here, acknowledge the gap rather than implying expertise.',
    'Do not describe Todd as currently holding a Lead, Staff, or Principal title.',
  ],
};
