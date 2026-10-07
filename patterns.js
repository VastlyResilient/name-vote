// The six patterns that historic winning names share — the education layer.
// Each pattern: title, the rule in one line, the research/reasoning, and the brand evidence.
const PATTERNS=[
{id:'real',n:1,title:'Real word, borrowed — not built',
rule:'Lasting brands take a real word and borrow it; they rarely invent one from scratch.',
why:'A real word arrives pre-loaded with meaning, so the market teaches itself. Invented words (Kodak, Xerox, Google) can win, but each needed enormous marketing spend before the sound meant anything. The middle path — a real word that feels new to English ears — is the Tesla / Nvidia / Verizon sweet spot: Latin or Greek roots that are genuine words, unfamiliar enough to own.',
proof:['Apple (1976) — the most ordinary word in the fruit bowl, borrowed for computers','Oracle (1977) — "the source of answers," borrowed for databases','Amazon (1994) — biggest river, borrowed for the biggest store','Stripe (2010) — a word everyone already owns','Claude (2023) — a person\'s name, borrowed for an AI colleague','Counter-example: Google (1998) — invented, spent billions teaching the sound']},
{id:'syll',n:2,title:'Two syllables, one stress',
rule:'The majority of enduring brands are one or two syllables with a single clear stress.',
why:'Short names survive being said. They fit in a sentence without effort, they survive phone calls and podcasts, and they can be spoken at the speed of thought. Three syllables is the ceiling; four is where names start getting abbreviated by customers whether the company likes it or not (Federal Express → FedEx).',
proof:['Stripe, Slack, Claude, Beam — one syllable, impossible to misplace the stress','Apple, Google, Notion, Figma — two syllables, one stress','Amazon, Oracle — three, but trochaic (stress first), so they still fall out of the mouth easily','Counter-pattern: "Federal Express" shrank to FedEx because customers refused four syllables']},
{id:'above',n:3,title:'Meaning one level above the product',
rule:'The name should say what you get, not what it does — "capable help," not "SEO + agents."',
why:'Product-level names become ceilings. A name that describes the feature forces a rename the day the company outgrows the feature; a name that describes the benefit stretches for decades. Investors read this instantly: a name with no product in it reads as ambition, a name with the product in it reads as a feature.',
proof:['Oracle never said "database" — it said "the source of answers"','Amazon never said "books" — Bezos picked the biggest river so the store could sell anything','Nike — victory, not shoes','Apple — nothing to do with computers; that was the point','Counter-example: every "-ly" and "-ify" SaaS name that had to rebrand when it moved upmarket']},
{id:'visual',n:4,title:'A clean visual word',
rule:'Short, uncluttered letterforms — the name has to look good set in type at any size.',
why:'A name lives most of its life as a wordmark: on a website header, an app icon, an invoice, a conference badge. Descenders (g, j, p, q, y) and long ascenders add visual noise; short words with balanced letterforms survive being shrunk to favicon size and stretched across billboards. Symmetry and low letter count are quiet advantages that compound.',
proof:['Stripe — six letters, one descender, reads at 12px and 12 feet','Apple — five letters, two of them round, friendly in any typeface','Beam — four letters, no descenders, no clutter','Valor — five letters, no descenders, strong symmetry','Counter-example: long blends like "Servolution" fill a logo with noise and never compress']},
{id:'portable',n:5,title:'Portable across products',
rule:'The name has to survive becoming a holding company — "[Name] Research," "[Name] Ops," "[Name] Agents" all have to work.',
why:'Companies that last stop being one product. If the name only fits the first thing you sell, every new product either fights the name or forks the brand. The test is mechanical: say the name followed by Ops, Research, Agents, Labs, Capital. If all five sound natural, the name is a platform; if any sound wrong, the name is a product.',
proof:['Amazon.com → Amazon Web Services, Amazon Studios, Amazon Fresh — the river holds everything','Virgin — records, airlines, mobile, space; the name carries the attitude, not the product','Alphabet — created precisely because "Google" couldn\'t hold the portfolio','"Valor Research," "Valor Ops," "Valor Agents" — all sound like divisions of one firm','Counter-pattern: "Optitude Ops" — the name fights its own suffixes']},
{id:'colleague',n:6,title:'The colleague test (the AI-era twist)',
rule:'"We hired ___" has to sound natural — agent-era winners sound like a person you could hire, and avoid "AI" entirely.',
why:'The current generation of winners reached for words that imply mind, character, or a person — not technology. When the product is an agent, the name gets used as a noun for a worker: "ask Claude," "our Stripe integration," "we\'re a Notion shop." A name that can\'t be used as a verb or a possessive without feeling silly makes customers do grammar work every time they talk about you — and they\'ll talk about you less.',
proof:['Claude (2023) — a person\'s name; "ask Claude" is already how people talk','Harvey (legal AI, 2022) — sounds like the associate you just hired','Anthropic — "of humanity," no AI in the name at all','Perplexity — a real word about a mind state, long but spellable','Cognition — the mind itself, not the machine','Counter-pattern: names with "AI" or "bot" in them date the company to 2023-24 and cap the story']}
];
