export type Block = { h2: string } | { p: string } | { ul: string[] }

export interface Post {
    slug: string
    title: string
    resource: string
    date: string
    excerpt: string
    cover: string
    body: Block[]
}

export const posts: Post[] = [
    {
        slug: "why-this-blog-exists",
        title: "Why this blog exists",
        resource: "Pherus",
        date: "2026-08-30",
        excerpt:
            "Most of what gets learned here is written up as it happens, not cleaned up afterward. Here's the rule this blog runs on.",
        cover: "bg-neutral-200 dark:bg-neutral-800",
        body: [
            {
                p: "Every company says it's building something. Fewer show the part where they figured out how. This blog is that part, published as it happens rather than cleaned up afterward.",
            },
            { h2: "The rule" },
            {
                p: "Most of what gets learned here gets written up: why a formula, a resource category, or a piece of infrastructure ended up the way it did, including the version that didn't work first. That's the same principle behind everything on this site, made explicit. Understand the problem, then share what was learned along the way, not just the finished result.",
            },
            { h2: "What that means in practice" },
            {
                ul: [
                    "A cosmetics product publishes its actual ingredient list and the reasoning behind it, not a marketing description of it.",
                    "A community platform explains how it chose its first categories by asking people directly, not by assuming.",
                    "An infrastructure team writes up the exact bug it found in its own authentication layer, including the part where the bug was already live before anyone noticed.",
                ],
            },
            {
                p: "None of these posts are announcements. They're the notes, published instead of thrown away.",
            },
            { h2: "What to expect here" },
            {
                p: "Posts are attributed by resource, not by author, because the point is the work, not the byline. New posts show up when a resource has something real to report, not on a schedule. If a post here turns out to be wrong or incomplete later, the correction gets published too, not quietly edited away.",
            },
        ],
    },
    {
        slug: "rate-limiting-auth-across-three-apps",
        title: "Rate-limiting auth across three apps without slowing anyone down",
        resource: "Infra",
        date: "2026-08-28",
        excerpt:
            "The tiered rate-limiter behind sign-in, sessions, and account changes, and the boundary we didn't know we were relying on until we read the source.",
        cover: "bg-teal-100 dark:bg-teal-950",
        body: [
            {
                p: "Infra is the authentication layer every Pherus product sits behind, which means one rate-limiter mistake affects everything at once. Here's what we actually found when we went looking for gaps.",
            },
            { h2: "The surprise: not everything is rate-limited" },
            {
                p: "The library we build on ships two separate code paths: one for direct in-process calls, one for real HTTP requests. Rate limiting only runs on the second path. That means an admin dashboard calling into auth directly, in the same process, was never touching the rate limiter at all, no matter how the limits were configured. Only genuine browser requests through the public API were ever covered.",
            },
            {
                p: "That's not a bug in the library, it's a boundary we didn't know we were relying on until we read the source directly instead of assuming.",
            },
            { h2: "What we changed" },
            {
                p: "The library also ships sensible defaults for the obvious targets, sign-in, sign-up, password resets, a few requests per short window. We added explicit limits for the paths that don't get a default: session checks, sign-out, profile updates, account deletion, scaled to how much damage a burst of each one could do. Account deletion got the tightest limit of the new set, close to sign-in's own default, on purpose.",
            },
            { h2: "Why this is worth writing down" },
            {
                p: "Every one of these numbers is a judgment call, not a formula. Publishing the reasoning here means the next person adjusting a limit is working from \"here's why this number\" instead of guessing at what a stranger meant six months ago, whether that next person is on this team or reading along.",
            },
        ],
    },
    {
        slug: "mapping-queer-resources-in-uganda",
        title: "Mapping queer resources in Uganda, one contributor at a time",
        resource: "Transspace",
        date: "2026-08-20",
        excerpt:
            "How the first resource categories got chosen, and what we learned asking people directly instead of guessing.",
        cover: "bg-rose-100 dark:bg-rose-950",
        body: [
            {
                p: "Transspace started from a personal problem: while navigating a transition in Uganda, reliable information about healthcare providers, safe spaces, and legal support existed, but only as word of mouth, scattered across private conversations and group chats that anyone new to the community had no way to find.",
            },
            { h2: "Choosing the first categories" },
            {
                p: "Rather than guess at a taxonomy, the first categories came from asking people directly what they'd searched for and failed to find:",
            },
            {
                ul: [
                    "Healthcare and transition support",
                    "Friendly spaces, businesses and venues",
                    "Jobs and mentorship",
                    "Legal and education support",
                    "Mutual aid",
                ],
            },
            {
                p: "That list will keep changing. It's a record of what people actually needed when we asked, not a fixed structure to defend later.",
            },
            { h2: "What surprised us" },
            {
                p: "The knowledge people were willing to share was almost always local and specific, a named clinic, a named landlord, a named person to talk to, rather than general advice. General advice was already everywhere. What was missing was the specific, verified, current version of it. That's the gap Transspace is actually trying to close.",
            },
            { h2: "Where this goes next" },
            {
                p: "Local knowledge, shared with people facing the same situation somewhere else. Someone in Kenya benefiting from something first documented in Uganda. That's the whole mechanism, and it only works if the first round of categories are honest about what people actually asked for.",
            },
        ],
    },
    {
        slug: "what-actually-goes-into-a-bar-of-soap",
        title: "What actually goes into a bar of soap",
        resource: "Seer",
        date: "2026-08-12",
        excerpt:
            "The first formula write-up: why shea nut oil, what we tested against it, and the full ingredient list before anything shipped.",
        cover: "bg-amber-100 dark:bg-amber-950",
        body: [
            {
                p: "Most cosmetics companies treat the ingredient list as a legal requirement, something to get past, not something to explain. Seer is starting from the opposite direction: the formula is the product page.",
            },
            { h2: "Why shea nut oil" },
            {
                p: "We picked shea nut oil as the base for the first line for three reasons: it's solid at room temperature without hydrogenation, it carries fragrance and essential oils without going rancid quickly, and it's a single ingredient doing the work three or four synthetic ones usually split between them in mass-market bars.",
            },
            {
                p: "That last point mattered more than it sounds. Every additional ingredient is another thing to source, another thing to disclose, another place for something to go wrong on someone's skin. Fewer ingredients, chosen deliberately, beats a longer list optimized for shelf life.",
            },
            { h2: "What we tested against it" },
            {
                ul: [
                    "Cold-process vs. melt-and-pour: cold-process won on texture, lost on batch consistency early on. Still tuning the cure time.",
                    "Essential oil load: too little and the scent doesn't survive the cure; too much and it irritates. Landed around 3% by weight for the first batch.",
                    "Additive-free hardness: shea alone is softer than a bar needs to be for a normal shower life. Still open, not solved yet.",
                ],
            },
            { h2: "The list, as it ships" },
            {
                p: "Saponified shea nut oil, essential oil blend, nothing else. If that changes before launch, this post gets updated, not quietly edited.",
            },
        ],
    },
]

export type ResourceTag = "active" | "in development" | "in planning"

export interface Resource {
    slug: string
    label: string
    tag: ResourceTag
    tagline: string
    body: Block[]
}

export const resources: Resource[] = [
    {
        slug: "infra",
        label: "Infra",
        tag: "active",
        tagline: "Centralized authentication infrastructure.",
        body: [
            {
                p: "Infra is the authentication layer every Pherus product sits behind: the real betterAuth() engine, the admin dashboard, and the only place session, role, and access logic lives. Nothing else in the company runs its own auth.",
            },
            { h2: "What it actually runs" },
            {
                p: "Sign-in, sign-up, two-factor, passkeys, session and role management, and the admin console used to manage users, applications, and API clients. Every other Pherus product that needs a signed-in user is a client of it, not a copy of it.",
            },
            { h2: "Why it's separate" },
            {
                p: "Infra is a pure auth/identity platform, the same split as Firebase Auth versus Firebase's own billing. Any product that needs payments wires its own integration rather than Infra shipping a shared one. That boundary is deliberate: one thing, done properly, rather than one thing that quietly grows into everything.",
            },
            {
                p: "It's the first thing on this site that's actually live, not a preview.",
            },
        ],
    },
    {
        slug: "accounts",
        label: "Accounts",
        tag: "active",
        tagline: "Centralized user accounts.",
        body: [
            {
                p: "Accounts is the end-user \"my account\" surface, the thing you'd actually sign into, not the engine running underneath it.",
            },
            { h2: "What you can do here" },
            {
                ul: [
                    "Sign in, create an account, reset a password",
                    "Turn on two-factor authentication or register a passkey",
                    "See every active session and sign a specific device out remotely",
                    "Manage a profile shared across every Pherus product",
                ],
            },
            { h2: "Built on Infra, not next to it" },
            {
                p: "Accounts runs no auth server of its own. It's a pure client of Infra, so a change to a security rule in one place applies everywhere at once, rather than needing to be copied into every product separately.",
            },
        ],
    },
    {
        slug: "seer",
        label: "Seer",
        tag: "in development",
        tagline:
            "Cosmetics built in the open, ingredient research and DIY formulas published alongside the products.",
        body: [
            {
                p: "Seer treats the ingredient list as the product page, not a legal footnote. The first line is built around shea nut oil, a single ingredient doing the work three or four synthetic ones usually split between them in mass-market bars.",
            },
            { h2: "Built in the open" },
            {
                p: "Every formula decision, why an ingredient was chosen, what was tested against it, what didn't work, gets written up on the blog as it happens, not cleaned up into marketing copy afterward. The current formula ships as saponified shea nut oil and an essential oil blend, nothing else.",
            },
            { h2: "Where it stands" },
            {
                p: "Launching first among everything still in progress on this site. Not for sale yet, still being formulated and tested batch by batch.",
            },
        ],
    },
    {
        slug: "transspace",
        label: "Transspace",
        tag: "in development",
        tagline: "Queer people helping queer people through shared knowledge and experience.",
        body: [
            {
                p: "Transspace started from a personal problem: navigating a transition in Uganda, with reliable information about healthcare, safe spaces, and legal support scattered across private conversations no newcomer could find.",
            },
            { h2: "Q2Q, queer-to-queer" },
            {
                p: "Knowledge shared directly between people who've navigated the same situation, rather than routed through institutions or centralized authorities deciding what's useful.",
            },
            { h2: "What people can discover" },
            {
                ul: [
                    "Healthcare and transition support",
                    "Friendly spaces, businesses and venues",
                    "Jobs and mentorship",
                    "Legal and education support",
                    "Mutual aid",
                ],
            },
            {
                p: "Launching second, right behind Seer, with categories chosen by asking people directly what they'd searched for and failed to find, not by guessing at a taxonomy in advance.",
            },
        ],
    },
    {
        slug: "pherus-scholar",
        label: "Pherus scholar",
        tag: "in planning",
        tagline: "A living archive of the world's cultures, starting in Africa.",
        body: [
            {
                p: "Culture leaders get a direct way to connect with people who want to experience their culture firsthand, alongside a route to funded donations.",
            },
            {
                p: "Starting in Africa, expanding worldwide, including microcultures, communities that built something of their own more recently, not just ancient tradition. Still in planning, no real page built yet beyond this one.",
            },
        ],
    },
    {
        slug: "pherus-health",
        label: "Pherus health",
        tag: "in planning",
        tagline: "A holistic healthcare platform built around the whole person.",
        body: [
            {
                p: "Getting healthcare can be surprisingly difficult even when it exists nearby. The problem usually isn't that care doesn't exist, it's navigating which kind of care, from whom, and staying on top of it afterward.",
            },
            {
                p: "Built around the whole person rather than a single illness, and built for underserved communities first, affordability and local providers as the starting point, not an afterthought bolted onto a model designed somewhere else.",
            },
            {
                p: "Early. The specifics of how people actually move through it are still being worked out, deliberately not published here yet.",
            },
        ],
    },
    {
        slug: "pherus-basic",
        label: "Pherus basic",
        tag: "in planning",
        tagline: "One small compute core, docked into whichever shell you need.",
        body: [
            {
                p: "One brain, many bodies: a single compute core that supplies the processing, storage, and memory, while whatever it's docked into, a phone shell, a TV, a laptop, supplies the battery and the display.",
            },
            {
                p: "An idea on paper right now, not a spec sheet. The operating system and ecosystem strategy are still being worked out.",
            },
        ],
    },
    {
        slug: "pherus-homes",
        label: "Pherus homes",
        tag: "in planning",
        tagline: "Shelter, food, and dignity, treated as engineering problems worth solving.",
        body: [
            {
                p: "The same rigor Pherus applies everywhere else, pointed at homelessness and hunger rather than left to charity alone.",
            },
            {
                p: "Honestly the least defined resource on this site. What it actually builds and how it reaches people is still an open question, worth real thought before this page gets built out further, not something to paper over with vague language.",
            },
        ],
    },
    {
        slug: "pherus-space",
        label: "Pherus space & robotics",
        tag: "in planning",
        tagline: "Vehicles designed to be lived in, not just launched.",
        body: [
            {
                p: "Most rockets look the way they do because of physics, not imagination. Exploring what becomes possible when the vehicle is designed to be lived in, alongside robotics work in the same effort.",
            },
            {
                p: "The furthest-out resource on this site, treated honestly as long-term vision rather than a near-term build.",
            },
        ],
    },
    {
        slug: "pherus-developers",
        label: "Pherus developers",
        tag: "in planning",
        tagline: "Every public repository, gathered into one structure.",
        body: [
            {
                p: "A GitHub-shaped home for Pherus's own code, and for outside developers and businesses who want the same thing: one place, not scattered repositories with no shared structure.",
            },
            {
                p: "Public repositories, gathered into one structure, open to anyone building alongside Pherus, not just Pherus's own engineers.",
            },
        ],
    },
    {
        slug: "pherus-assets",
        label: "Pherus assets",
        tag: "in planning",
        tagline: "Storage in your own Cloudflare account, you own the data and the bill.",
        body: [
            {
                p: "Storage like a better Google Drive, except the data never sits on Pherus's own infrastructure.",
            },
            {
                p: "You connect your own Cloudflare account, Pherus only hosts the web interface and the apps, which keeps it cheap by design, for individuals and companies alike, self-service rather than a managed contract.",
            },
        ],
    },
    {
        slug: "pherus-agriculture",
        label: "Pherus agriculture",
        tag: "in planning",
        tagline: "Permaculture-structured food sharing, aid and income together.",
        body: [
            {
                p: "Aid and income from the same system instead of competing with each other, helping people grow, share, and sometimes earn from what they grow.",
            },
            {
                p: "Permaculture principles applied to food sharing at a community scale, still early, still mostly a set of principles rather than a running system.",
            },
        ],
    },
]
