export type LabSeed = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  difficultySlug: string;
  estimatedMinutes: number;
  xpReward: number;
  objectives: string[];
  skills: string[];
  hints: { content: string }[];
  setupInstructions: string;
  flag: string;
  flagCaseSensitive: boolean;
  runtimeType: 'docker';
  packageVersion: string;
  relatedLessonSlugs: string[];
};

const DOCKER_SETUP_PREAMBLE = [
  '1. Download the lab package from this page and unzip it.',
  '2. Open a terminal in the extracted folder (it contains docker-compose.yml).',
  '3. Start the lab:',
].join('\n');

function dockerSetup(targetPort: number, extra?: string): string {
  return [
    DOCKER_SETUP_PREAMBLE,
    '   docker compose up -d',
    '4. Verify the container is running: docker ps',
    `5. The target is reachable at http://localhost:${targetPort}`,
    '6. When finished, stop the lab: docker compose down',
    extra ?? '',
    'All traffic stays on your machine. Nothing here touches real systems.',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export const LAB_SEEDS: LabSeed[] = [
  {
    slug: 'port-discovery',
    title: 'Port Discovery',
    shortDescription:
      'A small server is hiding something on your localhost. Map its doors, find the one that does not belong, and claim your first flag.',
    description: [
      'MISSION BRIEFING',
      '',
      'A junior developer spun up “a tiny internal service” on this machine, then went on holiday. Nobody remembers what it was, which port it listens on, or what it exposes — only that it is still running inside a container on localhost.',
      '',
      'Your job is what any consultant would do: enumerate the open ports, identify each listening service, and investigate the one that looks out of place. Somewhere in that service’s responses you will find a flag of the form SURAKSHA{...}. Submitting it proves you completed the mission.',
      '',
      'You will practice exactly the workflow from the Nmap lesson: scan, read results, then interact manually with what you found. No exploitation tricks are required — curiosity and a couple of well-chosen commands are enough.',
    ].join('\n'),
    categorySlug: 'networking',
    difficultySlug: 'beginner',
    estimatedMinutes: 20,
    xpReward: 150,
    objectives: [
      'Identify the hidden service on the target',
      'Retrieve the flag from the exposed service',
    ],
    skills: ['Nmap', 'Ports', 'Services'],
    hints: [
      { content: 'Start wide: enumerate which TCP ports are actually accepting connections before you interact with anything.' },
      { content: 'Run nmap -sV against localhost and look for the service that has no business being there.' },
      { content: 'The odd one out is an HTTP service on port 8081 — request /flag from it once confirmed.' },
    ],
    setupInstructions: dockerSetup(8081),
    flag: 'SURAKSHA{p0rt_sc4nn1ng_101}',
    flagCaseSensitive: false,
    runtimeType: 'docker',
    packageVersion: '1.0.0',
    relatedLessonSlugs: ['ports', 'nmap-first-scan'],
  },
  {
    slug: 'http-investigation',
    title: 'HTTP Investigation',
    shortDescription:
      'An unassuming web app is leaking secrets where nobody usually looks. Read carefully — servers confess in their metadata.',
    description: [
      'MISSION BRIEFING',
      '',
      'A security-awareness team deployed a deliberately talkative web application so staff can learn to read raw HTTP. The app answers every request honestly — including some things it really should not admit in public.',
      '',
      'Inspect the full request/response cycle: status lines, headers, and everything the server volunteers before the body even starts. One response carries a header that names the flag outright; finding it requires looking past what browsers render to what they receive.',
      '',
      'curl -v (or your browser’s network tab) is all the tradecraft you need. This is reconnaissance of the politest kind: no injection, no auth bypass — just paying attention.',
    ].join('\n'),
    categorySlug: 'web-security',
    difficultySlug: 'beginner',
    estimatedMinutes: 20,
    xpReward: 150,
    objectives: [
      'Inspect complete HTTP exchanges, not just rendered pages',
      'Locate the secret disclosed via response headers',
    ],
    skills: ['HTTP', 'Headers', 'curl'],
    hints: [
      { content: 'Browsers hide most of the conversation. Use curl -v or devtools’ Network tab to see full headers.' },
      { content: 'Walk every endpoint the app offers and compare their response headers — one endpoint says more than the rest.' },
      { content: 'Request /debug-info and read every X- header on the response; the flag hides among them.' },
    ],
    setupInstructions: dockerSetup(8082),
    flag: 'SURAKSHA{h34d3rs_t3ll_st0r13s}',
    flagCaseSensitive: false,
    runtimeType: 'docker',
    packageVersion: '1.0.0',
    relatedLessonSlugs: ['http', 'headers'],
  },
  {
    slug: 'invoice-portal',
    title: 'Invoice Portal',
    shortDescription:
      'Meridian Logistics’ invoice portal serves documents to logged-in customers. Management suspects customers can see more than their own paperwork.',
    description: [
      'MISSION BRIEFING',
      '',
      'You are testing Meridian Logistics’ customer invoice portal before launch. Two test accounts have been provisioned for you (credentials are printed inside the running app’s home page): a regular customer account and a support demo account. Each customer should see strictly their own invoices — nothing else.',
      '',
      'Log in, browse around, and study how the portal decides WHICH document to show you. Then ask yourself the tester’s question: does the app verify that the record belongs to the caller, or does it simply trust whatever reference the browser sends?',
      '',
      'Find an invoice that does not belong to your account, extract the flag embedded in it, and submit. Report-style discipline matters here: note the exact request that crossed the line — your write-up will matter when we discuss this class of flaw later in the curriculum.',
    ].join('\n'),
    categorySlug: 'web-security',
    difficultySlug: 'intermediate',
    estimatedMinutes: 30,
    xpReward: 250,
    objectives: [
      'Log into the portal with the provided customer account',
      'Determine how the app selects which invoice to display',
      'Access an invoice belonging to another customer and capture its flag',
    ],
    skills: ['HTTP', 'Authentication', 'Authorization'],
    hints: [
      { content: 'Being logged in is not the same as being allowed. Distinguish “did the app know who I am” from “did it check whose record this is.”' },
      { content: 'Watch the URLs while clicking through your invoices. Identifiers that look sequential are invitations — try changing the identifier while staying logged in as your own user.' },
      { content: 'As customer A, request an invoice id belonging to customer B (ids start at 1001). If the document renders, the server never verified ownership — the flag is printed inside the invoice.' },
    ],
    setupInstructions: dockerSetup(8083),
    flag: 'SURAKSHA{id0r_blund3r_c4ught}',
    flagCaseSensitive: false,
    runtimeType: 'docker',
    packageVersion: '1.0.0',
    relatedLessonSlugs: ['cookies', 'sessions', 'authentication-vs-authorization'],
  },
  {
    slug: 'log-hunter',
    title: 'Log Hunter',
    shortDescription:
      'A compromised server’s logs hold the evidence — if you can find the needle. grep patiently and the truth falls out.',
    description: [
      'MISSION BRIEFING',
      '',
      'One of Acme Corp’s Linux boxes was behaving strangely last night. The forensics team imaged /var/log into a container for you. Thousands of lines of routine noise, they said — but somewhere in there is the story of what happened, and the incident responder who wrote the final report hid the case flag next to the smoking gun.',
      '',
      'Your tools are the classics: cd, cat, less, and above all grep. Filter by usernames, status codes, suspicious paths, and time windows. Read surrounding context with grep -B/-A once you spot something interesting. Logs reward patience — brute reading will lose; smart filtering wins.',
      '',
      'The flag follows the usual SURAKSHA{...} format and sits beside the single most incriminating entry. Find it, submit it, close the case.',
    ].join('\n'),
    categorySlug: 'linux',
    difficultySlug: 'beginner',
    estimatedMinutes: 25,
    xpReward: 150,
    objectives: [
      'Navigate a realistic log directory from the shell',
      'Use grep (with context flags) to isolate anomalous activity',
      'Recover the flag hidden beside the key log entry',
    ],
    skills: ['Linux', 'grep', 'Log Analysis'],
    hints: [
      { content: 'Do not read everything. Start by listing files with sizes, then target the ones that grew the most overnight.' },
      { content: 'grep -i "failed\\|error" is a decent opener; once you spot an unusual username or path, re-grep for THAT with -n to get line numbers.' },
      { content: 'When you land on the anomaly, add -B 2 -A 2 for context — the flag is written as a comment line immediately after the attacker’s successful request.' },
    ],
    setupInstructions: dockerSetup(
      8084,
      'This lab is filesystem-focused: after starting it, exec into the container with:\n   docker compose exec loghunter bash\nThe evidence waits in /var/log/.',
    ),
    flag: 'SURAKSHA{gr3p_1s_y0ur_fr13nd}',
    flagCaseSensitive: false,
    runtimeType: 'docker',
    packageVersion: '1.0.0',
    relatedLessonSlugs: ['terminal-basics', 'files-and-permissions', 'users-and-processes'],
  },
];
