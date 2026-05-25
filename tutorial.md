# Building a Modern Portfolio Site with AI Chat: A Beginner's Tutorial

> A walk-through of everything that was built in this project — the file structure, the technology choices, and how each piece of code actually works. Written for someone brand new to frontend development.

---

## Table of contents

1. [What we built](#1-what-we-built)
2. [The technology stack, explained](#2-the-technology-stack-explained)
3. [How it all fits together](#3-how-it-all-fits-together)
4. [Detailed code review](#4-detailed-code-review)
   - [The data layer: `profile.ts`](#41-the-data-layer-profilets)
   - [Global design system: `globals.css`](#42-global-design-system-globalscss)
   - [The root layout: `layout.tsx`](#43-the-root-layout-layouttsx)
   - [The home page: `page.tsx`](#44-the-home-page-pagetsx)
   - [A server component: `Hero.tsx`](#45-a-server-component-herotsx)
   - [A client component: `Nav.tsx`](#46-a-client-component-navtsx)
   - [A reusable utility: `Reveal.tsx`](#47-a-reusable-utility-revealtsx)
   - [The Digital Twin chat UI: `DigitalTwin.tsx`](#48-the-digital-twin-chat-ui-digitaltwintsx)
   - [The chat API: `api/chat/route.ts`](#49-the-chat-api-apichatroutets)
5. [Five ways this could be improved](#5-five-ways-this-could-be-improved)

---

## 1. What we built

A single-page personal portfolio website for Todd Hitzeman, plus an AI chatbot ("Digital Twin") that visitors can ask about Todd's career. The site runs locally on `http://localhost:3000` and is pushed to GitHub at `github.com/hitzeman/portfolio`.

It has these visible pieces:

| Section       | What it shows                                                       |
|---------------|---------------------------------------------------------------------|
| Hero          | Big name, title, status badge, call-to-action buttons, stat strip   |
| About         | Three-paragraph bio + a "Currently" info card                       |
| Skills        | Four discipline cards + a scrolling marquee of every skill          |
| Career        | Vertical timeline of jobs with bulleted highlights                  |
| Work          | Four placeholder cards for future case studies                      |
| Contact       | Big call-to-action with email, LinkedIn, phone                      |
| Digital Twin  | Floating button that opens an AI chat panel                         |

Visually the theme is "enterprise meets edgy" — a dark background, electric cyan/violet accents, subtle grid patterns, glowing "aurora" blobs, and smooth scroll-triggered animations.

---

## 2. The technology stack, explained

The site uses several tools that work together. Here's what each one does in plain language.

### Next.js

**Next.js is a framework for building websites with React.** A framework is a set of tools and conventions that solve the boring problems (routing pages, bundling code, optimizing images, handling forms) so you can focus on what's unique to your site.

Think of it like buying a car instead of building one from parts. React gives you the engine; Next.js gives you the rest of the car — wheels, dashboard, doors.

Specifically, Next.js gives you:
- **Routing**: A URL like `/about` maps automatically to a file at `app/about/page.tsx`. No router config.
- **Server rendering**: The HTML can be built on the server before the user's browser sees it. This makes the site fast and SEO-friendly.
- **API routes**: A file at `app/api/chat/route.ts` becomes a backend endpoint at `/api/chat`. You don't need a separate backend server.

This project uses **Next.js 16** with the "App Router" (the modern routing system).

### React

**React is a library for building user interfaces out of components.** A component is a reusable piece of UI — a button, a card, a navigation bar.

Components in React are written in **JSX**, which looks like HTML mixed with JavaScript:

```tsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

That `Greeting` is a component. You can use it like an HTML tag: `<Greeting name="World" />`. The `{name}` is a placeholder that gets replaced with the value passed in.

The whole site is just one component (`<Home />`) made of smaller components (`<Hero />`, `<About />`, ...), each made of even smaller pieces.

### TypeScript

**TypeScript is JavaScript with type checking.** It lets you annotate what kind of data your code expects, and catches mistakes before you run the code.

```ts
// JavaScript — easy to make mistakes
function greet(user) {
  return "Hello, " + user.nmae; // typo, but no error until you run it
}

// TypeScript — the compiler catches the typo
function greet(user: { name: string }) {
  return "Hello, " + user.nmae; // Error: 'nmae' doesn't exist on this type
}
```

You'll see things like `useState<string>(...)` and `: ReactNode` sprinkled around — those are type annotations.

### Tailwind CSS

**Tailwind is a way to style elements by writing class names instead of CSS files.**

Traditional CSS:
```css
.my-button {
  background: blue;
  padding: 12px 24px;
  border-radius: 8px;
}
```
```html
<button class="my-button">Click</button>
```

Tailwind:
```html
<button class="bg-blue-500 px-6 py-3 rounded-lg">Click</button>
```

Each class does one tiny thing. It feels chaotic at first but ends up being faster because you never have to invent class names or jump between files.

This project uses **Tailwind v4**, which lets you define your color system in CSS variables (`--accent`, `--bg`) and reference them as classes (`bg-accent`, `text-fg`).

### OpenAI API

**OpenAI provides a service where you send a question, they return an AI-generated answer.** The "Digital Twin" feature talks to this service from the server.

You pay per request (very small amounts — fractions of a cent for short answers). Your API key (a secret password) lives in `.env.local` and never gets sent to the browser.

### Other small pieces

- **Turbopack**: Next.js's bundler — it takes all your code files and combines them into something the browser can load quickly.
- **Geist & Geist Mono**: The two fonts the site uses (Vercel's open-source font family).
- **IntersectionObserver**: A built-in browser feature that tells you when an element scrolls into view. We use it to animate sections as they appear.

---

## 3. How it all fits together

### The file structure

```
portfolio/
├── app/
│   ├── _components/        ← reusable UI pieces (Hero, Nav, etc.)
│   ├── _data/              ← Todd's profile content
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    ← backend endpoint for the AI chat
│   ├── globals.css         ← design system + custom CSS
│   ├── layout.tsx          ← wraps every page (HTML, body, fonts)
│   └── page.tsx            ← the home page itself
├── public/                 ← static files (images, favicon)
├── .env.local              ← secrets like OPENAI_API_KEY (not in git)
├── package.json            ← list of dependencies
└── tsconfig.json           ← TypeScript settings
```

A few conventions worth knowing:

- Folders starting with `_` (like `_components`) are **private** — Next.js won't turn them into URLs.
- `layout.tsx` wraps `page.tsx`. The layout renders once and stays put; only the page contents change when you navigate.
- `app/api/<name>/route.ts` becomes a server endpoint at `/api/<name>`.

### The request lifecycle

When someone visits `http://localhost:3000`:

1. The browser asks the Next.js server for the page.
2. The server runs `layout.tsx` and `page.tsx` on the server (this is called **server-side rendering**).
3. Next.js sends back finished HTML — so the user sees content immediately, even before JavaScript loads.
4. JavaScript loads in the background and "**hydrates**" the page — making interactive bits (like the chat button) actually clickable.
5. If the user opens the chat and asks a question, the browser sends a POST request to `/api/chat`. The server talks to OpenAI, streams the response back, and the chat UI displays each word as it arrives.

### Server vs Client Components

This is the most important concept in modern React/Next.js. Every component is one of two kinds:

| Type             | Runs on        | Use when                                           |
|------------------|----------------|----------------------------------------------------|
| Server Component | Server only    | Static content, data fetching, no interactivity    |
| Client Component | Server *and* browser | You need state, events (clicks), or browser APIs |

By default everything is a **Server Component** — faster, no JavaScript shipped to the browser. You opt into a Client Component by writing `"use client"` at the top of the file.

In this project:
- `Hero`, `About`, `Skills`, `Timeline`, `Portfolio`, `Contact`, `Footer`, `SectionLabel` → **Server**
- `Nav` (needs scroll listener), `Reveal` (needs IntersectionObserver), `DigitalTwin` (needs state + fetch) → **Client**

---

## 4. Detailed code review

Let's walk through the actual files, in roughly the order they'd run.

### 4.1 The data layer: `profile.ts`

**File**: `app/_data/profile.ts`

This file is the single source of truth for everything Todd-specific on the site. Want to add a new job, change the tagline, update skills? Edit this file and the whole site updates.

```ts
export const profile = {
  name: "Todd Hitzeman",
  title: "Senior Software Engineer",
  location: "Dallas–Fort Worth, TX",
  email: "hitzeman.todd@gmail.com",
  // ...
  about: [
    "I'm a senior software engineer with a strong focus on frontend architecture...",
    "I enjoy owning frontend platforms end-to-end...",
    "While frontend is my primary focus, I have strong experience working across the stack...",
  ],
  stats: [
    { label: "Years in engineering", value: "9+" },
    // ...
  ],
};

export const timeline = [
  {
    company: "loanDepot",
    role: "Sr. Software Engineer",
    period: "Sep 2019 — Present",
    highlights: [
      "Lead frontend development for high-traffic Angular apps...",
      // ...
    ],
  },
  // ...
];
```

**What's happening here:**

- `export const profile = {...}` declares a constant called `profile` and exports it so other files can import it.
- The data is just a regular JavaScript object — keys (`name`, `title`) and values.
- `timeline` is an array of objects, each representing a job.

Other files use it like this:
```ts
import { profile, timeline } from "../_data/profile";
```

**Why centralize data this way?** Two reasons:
1. **No duplication.** Todd's email appears in the Hero, the Contact section, the chat system prompt, and the footer. If it lived in each component, changing it would mean editing four files.
2. **Easy to swap later.** This file could be replaced by a fetch from a CMS or database without touching any of the UI components.

### 4.2 Global design system: `globals.css`

**File**: `app/globals.css`

CSS that applies to the whole site. The most interesting parts are the design tokens.

```css
:root {
  --bg: #050507;        /* page background */
  --fg: #e8e9f0;        /* main text color */
  --fg-muted: #8b8c99;  /* secondary text */
  --accent: #7cf9ff;    /* cyan */
  --accent-2: #b388ff;  /* violet */
  --accent-3: #ff4d9d;  /* pink */
  --border: rgba(255, 255, 255, 0.08);
}
```

These **CSS custom properties** (the `--name` syntax) define a color palette in one place. Everywhere else in the CSS uses `var(--accent)` instead of hardcoding `#7cf9ff`. Change the value here and the whole site updates.

Tailwind v4 picks these up so you can write `bg-bg` or `text-fg-muted` as classes:

```css
@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  /* ... */
}
```

A few custom utility classes are defined here too:

**Aurora glow** — the soft colored blobs in the hero background:
```css
.aurora::before {
  content: "";
  position: absolute;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  filter: blur(120px);          /* the soft-glow effect */
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  animation: drift 22s ease-in-out infinite;
}
```

**Marquee** — the infinitely scrolling skill strip:
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee 38s linear infinite;
}
```

The trick: we render the list of skills **twice** inside a wide track. The animation slides it left by 50% (one full copy's width), then loops — visually seamless.

**Reveal** — fade-up animation triggered when an element scrolls into view:
```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s, transform 0.9s;
}
.reveal.in-view {
  opacity: 1;
  transform: translateY(0);
}
```

JavaScript (in `Reveal.tsx`) adds the `in-view` class when the element is visible — CSS handles the animation.

### 4.3 The root layout: `layout.tsx`

**File**: `app/layout.tsx`

Every page in the app passes through here. It defines the `<html>`, `<head>`, and `<body>` tags.

```tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Todd Hitzeman — Senior Software Engineer",
  description: "Senior software engineer specializing in...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-bg text-fg">
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
```

**What's happening:**

- `import "./globals.css"` — pulls in the design system. This is the only file that needs to import the CSS; everything else inherits it.
- `Geist(...)` — Next.js's font helper. It downloads the font, hosts it locally, and assigns it to a CSS variable. No `<link>` tags or external font loaders needed.
- `metadata` — Next.js reads this and generates `<title>` and `<meta>` tags for SEO and social previews.
- `{children}` — wherever this appears, the active page's content gets injected.
- The `<div className="noise">` adds a subtle film-grain overlay everywhere on the site.

### 4.4 The home page: `page.tsx`

**File**: `app/page.tsx`

The whole site is one page, composed of section components stacked vertically.

```tsx
import Nav from "./_components/Nav";
import Hero from "./_components/Hero";
import About from "./_components/About";
import Skills from "./_components/Skills";
import Timeline from "./_components/Timeline";
import Portfolio from "./_components/Portfolio";
import Contact from "./_components/Contact";
import Footer from "./_components/Footer";
import DigitalTwin from "./_components/DigitalTwin";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <About />
        <Skills />
        <Timeline />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <DigitalTwin />
    </>
  );
}
```

That's it. The page is essentially a table of contents. The hard work happens inside each component.

The `<>` and `</>` are a **React Fragment** — it lets you return multiple elements without wrapping them in a `<div>`.

### 4.5 A server component: `Hero.tsx`

**File**: `app/_components/Hero.tsx`

This renders the big "Todd Hitzeman" banner. It's a Server Component (no `"use client"` at the top), so all the rendering happens on the server.

```tsx
import { profile } from "../_data/profile";

export default function Hero() {
  const first = profile.firstName;
  const last = profile.lastName;

  return (
    <section id="top" className="relative min-h-screen ...">
      <div className="aurora" aria-hidden />
      <div className="absolute inset-0 bg-grid" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* status badge */}
        <span className="inline-flex items-center gap-2 ...">
          <span className="pulse-dot" />
          {profile.status}
        </span>

        {/* the giant name */}
        <h1 className="text-[clamp(3.4rem,12vw,11rem)]">
          <span className="block text-gradient-soft">
            {first.split("").map((c, i) => (
              <span key={i} className="letter">{c}</span>
            ))}
          </span>
          <span className="block text-gradient">
            {last.split("").map((c, i) => (
              <span key={i} className="letter">{c}</span>
            ))}
          </span>
        </h1>
        {/* ...stats, CTAs... */}
      </div>
    </section>
  );
}
```

**Worth noticing:**

- **`clamp(3.4rem, 12vw, 11rem)`** is CSS that says: the font size is normally 12% of the viewport width, but never smaller than 3.4rem (mobile) or larger than 11rem (huge screens). This is how the hero scales gracefully.
- **`first.split("").map(...)`** splits the name into individual characters and wraps each in a `<span className="letter">`. That's so each letter can have its own hover animation defined in `globals.css`:
  ```css
  .letter:hover {
    transform: translateY(-6px);
    color: var(--accent);
  }
  ```
- **`aria-hidden`** on decorative elements tells screen readers to ignore them.
- The hero reads from `profile.stats` to render the four-tile stat strip — so adding a new stat is just editing the data file.

### 4.6 A client component: `Nav.tsx`

**File**: `app/_components/Nav.tsx`

The sticky navigation. It listens to scroll events and highlights the section currently in view. That requires browser APIs, so it has to be a Client Component.

```tsx
"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  // ...
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("about");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header className={scrolled ? "backdrop-blur-xl bg-black/40" : ""}>
      {/* ... links ... */}
    </header>
  );
}
```

**What's happening:**

- `"use client"` at the top marks this as a Client Component.
- `useState(false)` creates a piece of state. `scrolled` is the current value; `setScrolled` is how you change it. When state changes, React re-renders the component.
- `useEffect(() => {...}, [])` runs once when the component first appears (the empty `[]` means "no dependencies, just run once").
- Inside the effect, we set up two things:
  1. A scroll listener that flips `scrolled` true after the user scrolls 24px.
  2. An `IntersectionObserver` that watches each section. When a section is 40-45% into the viewport, it becomes the "active" one (highlighted in the nav).
- The `return () => {...}` is a **cleanup function** — when the component goes away, React calls it. Here we remove the listeners so they don't leak memory.

The active section gets a highlighted pill behind it:
```tsx
<a className={active === s.id ? "text-fg" : "text-fg-muted"}>
  {active === s.id && <span className="absolute inset-0 bg-white/[0.06]" />}
  {s.label}
</a>
```

### 4.7 A reusable utility: `Reveal.tsx`

**File**: `app/_components/Reveal.tsx`

A wrapper that fades in its children when they scroll into view. Used throughout the site.

```tsx
"use client";

import { useEffect, useRef } from "react";

export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
```

**Why this is interesting:**

- **`useRef(null)`** gives you a way to get a direct reference to a DOM element — like saying "remember this `<div>` for me".
- We pass that ref into the JSX: `<div ref={ref}>`. After React renders, `ref.current` holds the actual `<div>` element.
- The IntersectionObserver watches the element. When 12% of it becomes visible, we add the `in-view` class — which (per the CSS we saw earlier) triggers the fade-up animation.
- `observer.unobserve(el)` after firing once means the animation only plays the first time. Re-scrolling doesn't reset it.

Used like this:
```tsx
<Reveal delay={120}>
  <p>This text fades in when you scroll to it.</p>
</Reveal>
```

This is a great example of a **higher-order component pattern**: wrap any content in `<Reveal>` and it gets the animation. Composability is one of React's strengths.

### 4.8 The Digital Twin chat UI: `DigitalTwin.tsx`

**File**: `app/_components/DigitalTwin.tsx`

This is the biggest and most complex file. It renders the floating "Ask my digital twin" button and the slide-in chat panel.

The full file is ~280 lines. Let me walk through the important parts.

**State management:**
```tsx
const [open, setOpen] = useState(false);          // is the panel open?
const [input, setInput] = useState("");           // text in the textarea
const [messages, setMessages] = useState([GREETING]); // chat history
const [sending, setSending] = useState(false);    // currently waiting for AI?
```

Four pieces of state. React re-renders the component any time one of them changes.

**Sending a message** — the most important function:
```tsx
const send = useCallback(async (text) => {
  const trimmed = text.trim();
  if (!trimmed || sending) return;

  const userMsg = { id: uid(), role: "user", content: trimmed };
  const assistantId = uid();
  const assistantMsg = { id: assistantId, role: "assistant", content: "", pending: true };

  const next = [...messages, userMsg, assistantMsg];
  setMessages(next);
  setInput("");
  setSending(true);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: next.filter(m => m.id !== assistantId && m.id !== "greeting")
                    .map(m => ({ role: m.role, content: m.content })),
    }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    setMessages(prev => prev.map(m =>
      m.id === assistantId ? { ...m, content: acc, pending: false } : m
    ));
  }
  setSending(false);
}, [messages, sending]);
```

This is the **streaming chat pattern**. Let me unpack it:

1. We immediately add **two** new messages to the chat: the user's message, and an empty assistant message with `pending: true` (which renders as bouncing dots — the "typing..." indicator).
2. We send a POST request to our own `/api/chat` endpoint with the full conversation history.
3. The response body is a **stream** — not one big chunk, but data arriving piece by piece as the AI generates it.
4. `res.body.getReader()` gives us a way to read those pieces. We loop: read a chunk, decode it from bytes to text, append it to `acc`, and update the assistant message with the running total.
5. Each update triggers React to re-render — so the user sees the AI's words appearing in real time.

**The Server vs Client pattern for the request:**
- The browser sends the request to `/api/chat` on **our** server (not directly to OpenAI).
- Our server holds the secret API key and talks to OpenAI on the browser's behalf.
- This way the secret never leaves the server.

**The UI structure** — a launcher button + a sliding panel:
```tsx
return (
  <>
    {/* Launcher (always visible) */}
    <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 ...">
      Ask my digital twin
    </button>

    {/* Backdrop + Panel (slides in when open) */}
    <div className={open ? "opacity-100" : "opacity-0 pointer-events-none"}>
      <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55" />
      <div className={`absolute right-0 top-0 h-full w-[480px] ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* header, messages, composer */}
      </div>
    </div>
  </>
);
```

CSS transitions on `opacity` and `translate-x` create the smooth slide-in.

### 4.9 The chat API: `api/chat/route.ts`

**File**: `app/api/chat/route.ts`

This is the **server-side endpoint** that the chat UI calls. Lives in Next.js's `api` folder, so it's automatically exposed at `/api/chat`.

```ts
import OpenAI from "openai";
import { profile, skills, timeline, education, certifications } from "../../_data/profile";

const MODEL = "gpt-5.4-mini";
const MAX_USER_TURNS = 12;
const MAX_USER_CHARS = 2000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

- `import OpenAI from "openai"` loads the official OpenAI client library.
- `process.env.OPENAI_API_KEY` reads the secret from `.env.local`. Because this file only runs on the server, the key is never sent to the browser.
- `MAX_USER_TURNS` and `MAX_USER_CHARS` are safety limits — even if someone tries to send a 50,000-character question, we'll trim it.

**Building the system prompt:**
```ts
function buildSystemPrompt() {
  return `You are Todd Hitzeman's "Digital Twin"...

# Who I am
${profile.name} — ${profile.title}.
${profile.about.join("\n\n")}

# Skills
${Object.entries(skills).map(([k, v]) => `- ${k}: ${v.join(", ")}`).join("\n")}

# Career
${timeline.map(t => `${t.role} @ ${t.company} (${t.period})...`).join("\n\n")}

# How I respond
- Speak as Todd in first person...
- Keep answers tight...
`;
}
```

The system prompt is the instructions the AI sees **before** the user's first message. It's the difference between a generic chatbot and one that speaks specifically as Todd.

Notice how it's built from the same `profile.ts` data the rest of the site uses. **Update one file, both the website and the AI know.**

**The POST handler — the actual endpoint:**
```ts
export async function POST(req: Request) {
  const body = await req.json();
  const sanitized = (body.messages || [])
    .filter(m => m.role === "user" || m.role === "assistant")
    .slice(-MAX_USER_TURNS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_USER_CHARS) }));

  const stream = new ReadableStream({
    async start(controller) {
      const completion = await client.chat.completions.create({
        model: MODEL,
        stream: true,
        max_completion_tokens: 800,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...sanitized,
        ],
      });

      const encoder = new TextEncoder();
      for await (const chunk of completion) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

This is the other side of the streaming pattern from `DigitalTwin.tsx`. Steps:

1. Read the conversation from the incoming POST body.
2. **Sanitize**: only keep valid roles, only the last 12 turns, max 2000 chars each. Defensive programming.
3. Open a streaming chat completion against OpenAI. `stream: true` is the key — without it, we'd wait for the whole response before sending anything.
4. Wrap it in a `ReadableStream` — the browser-standard way to send data piece by piece.
5. As each chunk arrives from OpenAI, encode it to bytes and push it into the stream.
6. Return that stream as the HTTP response.

The browser's `getReader()` (in `DigitalTwin.tsx`) is reading exactly what this server is writing.

---

## 5. Five ways this could be improved

A self-review. The code works and looks polished, but here's what I'd tackle next.

### 1. Rate limiting and cost protection on `/api/chat`

**The problem.** Right now anyone can hit `/api/chat` as fast as they want. Each request costs real money on the OpenAI bill. A bot or malicious user could rack up a $500 charge overnight.

**The fix.** Add rate limiting per IP address. Two common approaches:
- **In-memory**: a `Map<ip, timestamps[]>` that allows e.g. 10 requests per minute per IP. Simple but resets when the server restarts and doesn't work across multiple server instances.
- **Production**: use [Upstash Redis](https://upstash.com/) with `@upstash/ratelimit` — free tier handles thousands of users, persists across restarts.

Sketch:
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) return Response.json({ error: "Slow down." }, { status: 429 });
  // ... rest of the handler
}
```

Also worth adding: a daily budget cap (stop serving when the day's token total exceeds N) and basic abuse detection (refuse messages over a length threshold).

### 2. Accessibility gaps in the chat dialog

**The problem.** The chat panel works fine with a mouse but has a few rough edges for keyboard and screen-reader users:
- Focus isn't trapped inside the dialog when open — pressing Tab can land you on hidden elements behind the backdrop.
- When focus returns after closing, it doesn't go back to the launcher button.
- The streaming assistant text isn't announced to screen readers. Someone using a screen reader hears nothing as the answer arrives.

**The fix.**
- Use a focus-trap library like [`focus-trap-react`](https://www.npmjs.com/package/focus-trap-react) or hand-roll one with `tabindex` management.
- Store the previously-focused element when opening, restore it on close: `const trigger = document.activeElement; ... trigger.focus()`.
- Wrap the streaming message in `<div aria-live="polite" aria-atomic="false">` so screen readers announce updates.
- Add `aria-label` to the icon-only buttons (reset, close — already done, but worth auditing the rest).

### 3. No automated tests

**The problem.** Everything works today. But the next change — say, swapping the OpenAI model — could quietly break something with no warning until a user reports it.

**The fix.** Add at minimum:
- **A smoke test for `/api/chat`** with [Vitest](https://vitest.dev/): mock the OpenAI SDK, POST a sample request, assert the response streams. Catches breakage when the route signature changes.
- **A render test for `<DigitalTwin />`** with [Testing Library](https://testing-library.com/docs/react-testing-library/intro): mount the component, click the launcher, type a message, assert the API was called with the right body.
- **An end-to-end test** with [Playwright](https://playwright.dev/): launch a real browser, click through the page, take screenshots. Catches CSS regressions.

Even three or four of these would dramatically reduce the risk of future changes.

### 4. Content lives in code

**The problem.** Updating Todd's bio means editing `profile.ts` and pushing a commit. If Todd hires a copywriter or wants to A/B-test taglines, that's a bottleneck. It also means non-developers can't help maintain the site.

**The fix.** Two options depending on how dynamic you want it:
- **MDX files** — write each section as Markdown with embedded React (`app/_content/about.mdx`). Still in git but reads like prose, not code. Cheap and version-controlled.
- **Headless CMS** like [Sanity](https://www.sanity.io/), [Contentful](https://www.contentful.com/), or [Payload](https://payloadcms.com/) — Todd edits in a friendly UI, the site fetches the latest data at build or request time. Adds a dependency but makes editing trivial.

For a portfolio with infrequent changes, MDX is probably the sweet spot.

### 5. No SEO or social-share polish

**The problem.** The site has a `<title>` and `<description>`, but:
- There's no Open Graph image — when someone shares the URL in Slack or LinkedIn, the preview is a blank box instead of a branded card.
- There's no `sitemap.xml` or `robots.txt`, so search engines have to guess.
- The single-page layout is great for users but means Google sees just one URL, so all your career achievements live on one page Google scans together.

**The fix.**
- Generate a dynamic Open Graph image with [`next/og`](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image): a `app/opengraph-image.tsx` file that renders a JSX template into a PNG at build time. Could show "Todd Hitzeman · Senior Software Engineer · Available" over the same dark aurora background.
- Add `app/sitemap.ts` and `app/robots.ts` (Next.js conventions that emit the right files).
- Optionally promote each Portfolio case study into its own route once they exist — better SEO and the AI twin would have richer content to draw on.

---

## Closing thoughts

The site you have today is genuinely good — clean architecture, modern stack, thoughtful design. The improvements above are all the kind of thing you tackle as the project matures, not now. If you only do one of them in the short term, do **#1 (rate limiting)** — that's the only one with a real-world risk (your wallet).

Everything else can wait until you have real visitors telling you what's broken.

Happy shipping.
