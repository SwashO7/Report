import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'cloud',
    title: 'Cloud',
    description: 'Spot the misconfigurations that leak data at internet scale - buckets, IAM and metadata.',
    lessons: [
      {
        slug: 'cloud-basics-for-hackers',
        title: 'Cloud Basics for Hackers',
        summary: 'The cloud is just someone else\'s computer, rented by the hour. Here is the map.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Cloud explained for hackers - AWS, Azure and GCP in 6 minutes'),
          {
            type: 'image',
            src: '/api/v1/diagrams/cloud-shared-responsibility',
            alt: 'Customer responsibilities beside provider responsibilities',
            caption: 'The provider secures the building. You still secure your flat.',
          },
          {
            type: 'paragraph',
            text:
              'The cloud is not magic. It is someone else\'s data centre that you rent by the hour. Instead of buying a server, you click a button and one appears. The big three are AWS, Azure and GCP.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like renting a flat instead of building a house. The landlord (the cloud provider) secures the building. What you leave unlocked inside your flat is on you. Most cloud breaches are unlocked flats, not broken buildings.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Compute** - the rented servers (EC2, VMs)',
              '**Storage** - the file dumps (S3 buckets, blobs)',
              '**IAM** - who is allowed to do what',
              '**Metadata service** - a secret internal URL every cloud box can hit',
              '**Managed services** - databases, queues and functions you never patch',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Shared responsibility',
            text:
              'The provider secures the cloud. You secure what you put *in* it. That single line explains why almost every cloud finding is a customer mistake, not a provider bug.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can name the main cloud building blocks and know where the customer\'s mistakes tend to hide.',
          },
          {
            type: 'quiz',
            question: 'Under the shared responsibility model, who secures the data you upload to a storage bucket?',
            options: ['The cloud provider', 'You, the customer', 'Nobody, it is automatic', 'The government'],
            correctIndex: 1,
            explanation: 'The provider secures the infrastructure. Configuring and locking down your own data is your job - which is exactly why open buckets are so common.',
          },
        ],
      },
      {
        slug: 's3-and-storage-misconfigs',
        title: 'Storage Buckets Left Open',
        summary: 'A storage bucket set to public is a filing cabinet left on the pavement. People find them.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Open S3 buckets - how a single wrong setting leaks a whole company'),
          {
            type: 'paragraph',
            text:
              'Cloud storage buckets (AWS S3, Azure Blobs, GCP Storage) hold files - backups, invoices, user uploads. By default they are private. But one wrong toggle and the whole thing is readable by the entire internet.',
          },
          {
            type: 'paragraph',
            text:
              'People find these constantly: predictable names like `companyname-backups`, links leaking in old pages, or plain guessing. Once open, anyone can list and download every file inside.',
          },
          {
            type: 'command',
            description: 'List a public bucket without any credentials (only on buckets you are authorised to test):',
            commands: [
              'aws s3 ls s3://example-bucket --no-sign-request',
              'curl https://example-bucket.s3.amazonaws.com/',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Listable is not the only risk',
            text:
              'Even a bucket you cannot *list* may let you read a file if you guess its name. And write access is worse - an attacker who can upload can plant a malicious file others will trust.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only access buckets on targets you own or are explicitly authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know why open buckets happen, how people find them, and the difference between read and write exposure.',
          },
          {
            type: 'quiz',
            question: 'A bucket blocks listing but you can still download `secret.pdf` if you know the exact name. What does this mean?',
            options: [
              'The bucket is fully secure',
              'Object-level permissions are still open even though listing is off',
              'You need admin credentials',
              'The file does not really exist',
            ],
            correctIndex: 1,
            explanation: 'Listing and per-object read are separate permissions. Blocking the index does not help if the objects themselves are still world-readable.',
          },
        ],
      },
      {
        slug: 'iam-and-privilege-issues',
        title: 'IAM and Privilege Issues',
        summary: 'IAM decides who can do what in the cloud. Get it too generous and one leaked key owns everything.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Cloud IAM explained - how one over-permissioned key takes over an account'),
          {
            type: 'image',
            src: '/api/v1/diagrams/iam-privilege-chain',
            alt: 'A read-only key escalating step by step to full admin',
            caption: 'Every link looks minor. The chain is critical.',
          },
          {
            type: 'paragraph',
            text:
              'IAM (Identity and Access Management) is the cloud\'s permission system. Every user, service and machine gets a role that says what it is allowed to touch. Done right, a leaked key can only do one small thing.',
          },
          {
            type: 'paragraph',
            text:
              'The problem: people grant `*` (everything) because it is easier than figuring out the exact permissions. So the key that was only meant to read one bucket can suddenly delete servers and create admin users.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Least privilege** - give exactly the access needed, nothing more',
              '**Over-permissioned roles** - the `AdministratorAccess`-on-everything trap',
              '**Privilege escalation** - a weak permission that lets you grant yourself a stronger one',
              '**Leaked keys** - hardcoded in code, commits or config files',
            ],
          },
          {
            type: 'command',
            description: 'Check what a set of credentials can actually do (authorised accounts only):',
            commands: ['aws sts get-caller-identity', 'aws iam list-attached-user-policies --user-name someuser'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The real danger is chaining',
            text:
              'A tiny permission like "can update a role policy" is enough. You use it to attach admin rights to your own role, and now you own the account. Small door, big room behind it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand least privilege and why an over-permissioned role turns one leaked key into full account takeover.',
          },
          {
            type: 'quiz',
            question: 'Why is a role with a permission to "modify IAM policies" so dangerous?',
            options: [
              'It lets you read logs',
              'It can be used to grant yourself full admin rights',
              'It slows the system down',
              'It only affects billing',
            ],
            correctIndex: 1,
            explanation: 'If you can edit permissions, you can give yourself more permissions - the classic privilege escalation path to full control.',
          },
        ],
      },
      {
        slug: 'metadata-service-ssrf',
        title: 'SSRF to Cloud Metadata',
        summary: 'Every cloud box has a secret internal URL that hands out credentials. SSRF is how attackers reach it.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('SSRF to cloud metadata - stealing AWS keys through one vulnerable request'),
          {
            type: 'image',
            src: '/api/v1/diagrams/metadata-ssrf',
            alt: 'An app tricked into fetching the cloud metadata address and returning credentials',
            caption: 'The server has access you do not - so you make it fetch for you.',
          },
          {
            type: 'paragraph',
            text:
              'Every cloud server can ask a special internal address for information about itself - including temporary credentials. On AWS that address is `169.254.169.254`. It is only reachable from inside the box, which feels safe.',
          },
          {
            type: 'paragraph',
            text:
              'It is not safe if the app has an SSRF bug. SSRF makes the *server* fetch a URL you control. Point it at the metadata address and the server reads its own credentials back to you.',
          },
          {
            type: 'command',
            description: 'What the vulnerable server ends up requesting (authorised testing only):',
            commands: [
              'curl http://169.254.169.254/latest/meta-data/',
              'curl http://169.254.169.254/latest/meta-data/iam/security-credentials/',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'IMDSv2 is the fix',
            text:
              'Newer AWS metadata (IMDSv2) requires a token step first, which blocks most simple SSRF grabs. If a target still allows the plain v1 request, that is a finding on its own.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only chase metadata credentials on systems you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain how an SSRF bug turns into stolen cloud credentials, and why IMDSv2 matters.',
          },
          {
            type: 'quiz',
            question: 'Why does SSRF turn the cloud metadata service into a credential leak?',
            options: [
              'The metadata address is public to everyone',
              'SSRF makes the server itself request the internal metadata URL and return the result',
              'Metadata is stored in the database',
              'It brute-forces the password',
            ],
            correctIndex: 1,
            explanation: 'The metadata endpoint only trusts requests from the box. SSRF makes the box send the request, so its credentials come back to the attacker.',
          },
        ],
      },
      {
        slug: 'serverless-security',
        title: 'Serverless Security',
        summary: 'No server to patch does not mean no attack surface. Functions have their own soft spots.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Serverless security - what breaks when there is no server to hack'),
          {
            type: 'paragraph',
            text:
              'Serverless (AWS Lambda, Cloud Functions) runs your code only when it is triggered, and you never manage a server. Great for cost. But the bugs do not vanish - they move.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Over-permissioned functions** - the same IAM `*` trap, per function',
              '**Event injection** - untrusted data in the event that triggers the function',
              '**Leaked env vars** - secrets stashed in function environment variables',
              '**Dependency risk** - one bad package in a function you never audit',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Each function is a tiny app',
            text:
              'It still takes input, still has permissions, still trusts its dependencies. Test it like you would any endpoint - just remember it may hold its own cloud credentials.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know serverless removes the server, not the risk - and where a function\'s real weak points sit.',
          },
          {
            type: 'quiz',
            question: 'What is a common serverless-specific weakness?',
            options: [
              'The physical server rack',
              'Over-permissioned function roles and secrets in environment variables',
              'The keyboard layout',
              'The monitor resolution',
            ],
            correctIndex: 1,
            explanation: 'Functions still get IAM roles and env vars. Too many permissions or a leaked secret makes a single function a way in.',
          },
        ],
      },
    ],
  },
  {
    slug: 'containers-and-cicd',
    title: 'Containers and CI/CD',
    description: 'Treat the build pipeline and the containers it ships as part of the attack surface, not a black box.',
    lessons: [
      {
        slug: 'docker-basics-for-hackers',
        title: 'Docker Basics for Hackers',
        summary: 'A container is an app packed with everything it needs, in a box. Here is what a hacker looks for.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('Docker in 6 minutes for hackers - images, containers and what leaks'),
          {
            type: 'paragraph',
            text:
              'A container packs an app plus everything it needs into one portable box that runs the same everywhere. Docker is the most common tool for this. An *image* is the frozen box; a *container* is a running copy.',
          },
          {
            type: 'paragraph',
            text:
              'Think of it like a tiffin box - the meal and its little compartments travel together, ready to eat anywhere. For a hacker, the interesting bit is what got packed by accident: secrets, source code, old vulnerable software.',
          },
          {
            type: 'command',
            description: 'Poke at images and running containers on a box you control:',
            commands: ['docker ps', 'docker images', 'docker history some-image'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Images leak history',
            text:
              'Every layer of an image is kept. A secret that was added and then "deleted" in a later step is often still sitting in an earlier layer, waiting for `docker history` to find it.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell an image from a container and know that image layers quietly remember everything they were ever handed.',
          },
          {
            type: 'quiz',
            question: 'Why can a secret "removed" from a Docker image still be recoverable?',
            options: [
              'Docker encrypts nothing',
              'Each build step is a saved layer, so the secret survives in an earlier layer',
              'Containers never delete files',
              'The secret is emailed to you',
            ],
            correctIndex: 1,
            explanation: 'Images are built in layers and every layer is retained. Deleting a file in a later layer does not erase it from the one that added it.',
          },
        ],
      },
      {
        slug: 'cicd-pipeline-attacks',
        title: 'CI/CD Pipeline Attacks',
        summary: 'The pipeline that builds and ships code runs with powerful keys. Compromise it and you ship the exploit for them.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('CI/CD pipeline attacks - poisoning the build to own production'),
          {
            type: 'paragraph',
            text:
              'CI/CD is the assembly line: code gets pushed, tests run, and the app auto-deploys. This line runs with strong credentials - deploy keys, cloud access, signing secrets. That makes it a juicy target.',
          },
          {
            type: 'paragraph',
            text:
              'If you can influence what the pipeline runs, you inherit its power. A malicious pull request, a poisoned build script, or a leaked pipeline secret can turn "run the tests" into "deploy my backdoor".',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Poisoned pull requests** - a PR that runs attacker code during CI',
              '**Leaked pipeline secrets** - tokens printed in build logs',
              '**Insecure build scripts** - unpinned steps that fetch and run remote code',
              '**Over-trusted runners** - a build machine with production access',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Logs are a goldmine',
            text:
              'Build logs are often public or widely readable, and pipelines love to echo variables. A secret accidentally printed once lives in the log forever.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You see why the build pipeline is part of the attack surface, and where its secrets tend to leak.',
          },
          {
            type: 'quiz',
            question: 'Why is a CI/CD pipeline such a high-value target?',
            options: [
              'It has no permissions at all',
              'It runs with powerful deploy and cloud credentials, so controlling it can push code to production',
              'It only runs on weekends',
              'It stores nothing useful',
            ],
            correctIndex: 1,
            explanation: 'Pipelines hold deploy keys and cloud access. Influencing what one runs can mean shipping your own code straight to production.',
          },
        ],
      },
      {
        slug: 'dependency-and-supply-chain-risks',
        title: 'Dependencies and Supply Chain',
        summary: 'Your app is mostly other people\'s code. One bad package and you inherited their bug - or their backdoor.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Supply chain attacks explained - the one bad npm package problem'),
          {
            type: 'paragraph',
            text:
              'Modern apps are built on hundreds of third-party packages. You wrote maybe 5% of the code that ships. The other 95% came from `npm`, `pip` and friends - and you trust all of it without reading it.',
          },
          {
            type: 'paragraph',
            text:
              'That trust is the attack. A package with a known vulnerability, a package that got hijacked, or a fake package with a typo-squatted name (`reqeusts` instead of `requests`) can all run inside your app.',
          },
          {
            type: 'command',
            description: 'Audit the dependency tree of a project you own:',
            commands: ['npm audit', 'pip list --outdated'],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Typosquatting is real',
            text:
              'Attackers publish packages named one letter off from popular ones. A single typo in `install` and you have handed your app someone else\'s code.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand why dependencies are an attack surface and can name three ways a bad package gets in.',
          },
          {
            type: 'quiz',
            question: 'What is typosquatting in the context of packages?',
            options: [
              'Fixing typos in your code',
              'Publishing a malicious package with a name one letter off from a popular one',
              'A faster way to type commands',
              'A kind of firewall',
            ],
            correctIndex: 1,
            explanation: 'Attackers register near-identical names hoping a developer mistypes the real one and installs the malicious copy.',
          },
        ],
      },
      {
        slug: 'container-escape-concepts',
        title: 'Container Escape Concepts',
        summary: 'Containers feel like separate boxes. Sometimes they are thin walls you can climb over to the host.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Container escape explained - when the box is not really a box'),
          {
            type: 'paragraph',
            text:
              'A container is supposed to be isolated from the host machine it runs on. But a container shares the host\'s kernel, so the wall between them is thinner than a real virtual machine. Break the wall and you land on the host.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Privileged containers** - run with `--privileged`, and the wall is basically gone',
              '**Mounted host paths** - a container that can read the host\'s `/` filesystem',
              '**Exposed Docker socket** - `/var/run/docker.sock` inside a container is game over',
              '**Kernel exploits** - shared kernel means a kernel bug can break out',
            ],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The Docker socket is the classic',
            text:
              'If a container can reach the Docker socket, it can create a new privileged container mounting the whole host - and now it owns the machine.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only attempt container escapes on hosts you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know a container is not a true security boundary and can name the misconfigurations that let one escape.',
          },
          {
            type: 'quiz',
            question: 'Why is exposing the Docker socket inside a container so dangerous?',
            options: [
              'It slows the container down',
              'The container can spawn a privileged container that mounts and controls the host',
              'It logs too much data',
              'It changes the container name',
            ],
            correctIndex: 1,
            explanation: 'Access to the Docker socket lets a container launch other containers with host access, effectively escaping to and controlling the host.',
          },
        ],
      },
    ],
  },
  {
    slug: 'mobile-peek',
    title: 'Mobile Peek',
    description: 'Realise mobile apps are just APIs with extra steps, then intercept and inspect what they send.',
    lessons: [
      {
        slug: 'how-mobile-apps-talk-to-servers',
        title: 'How Mobile Apps Talk to Servers',
        summary: 'That shiny app is a thin shell around API calls. Test the API and half the mystery is gone.',
        estimatedMinutes: 6,
        importance: 'core',
        blocks: [
          videoSlot('How mobile apps really work - it is just an API behind a pretty screen'),
          {
            type: 'paragraph',
            text:
              'A mobile app looks different from a website, but under the hood it is doing the same thing: sending HTTP requests to a backend API and drawing the responses on your screen. The app is the client; the real logic lives on the server.',
          },
          {
            type: 'paragraph',
            text:
              'Which means the golden rule still holds: never trust the client. Anything the app checks - "you cannot buy this", "you are not an admin" - can be bypassed if the server does not check it too, because you can talk to the API directly.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'The app makes the same **REST or GraphQL** calls a website would',
              'Auth is usually a **token** stored on the device',
              'The screens are just a wrapper around **API responses**',
              'Skip the app entirely and hit the **API by hand**',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The app is optional',
            text:
              'Once you know the API, you rarely need the app. Send requests straight to the backend and test it like any other web API.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You see mobile apps as API clients, so the whole web-hacking toolkit you already have applies.',
          },
          {
            type: 'quiz',
            question: 'A mobile app hides the "delete user" button unless you are an admin. Why might this not protect anything?',
            options: [
              'Buttons cannot be hidden',
              'The check is client-side; you can call the API directly and skip the button',
              'Admins do not exist on mobile',
              'The server always blocks it automatically',
            ],
            correctIndex: 1,
            explanation: 'Hiding a button is a client-side decision. If the server does not enforce the check, calling the API directly bypasses it.',
          },
        ],
      },
      {
        slug: 'intercepting-mobile-traffic',
        title: 'Intercepting Mobile Traffic',
        summary: 'To test a mobile app you need to see what it sends. Here is how to sit in the middle.',
        estimatedMinutes: 7,
        importance: 'core',
        blocks: [
          videoSlot('Intercepting mobile app traffic - proxy setup, CA certs and pinning'),
          {
            type: 'paragraph',
            text:
              'You cannot test what you cannot see. Intercepting means routing the phone\'s traffic through a proxy on your laptop (Burp or mitmproxy) so every request and response passes through you first.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Set the phone\'s Wi-Fi proxy to your laptop\'s IP and port',
              'Install the proxy\'s CA certificate on the phone so HTTPS can be read',
              'Trust that certificate at the system level (newer Android makes this harder)',
              'Open the app and watch the requests flow through your proxy',
            ],
          },
          {
            type: 'command',
            description: 'Start a local intercepting proxy on a device and network you control:',
            commands: ['mitmproxy --listen-port 8080'],
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Certificate pinning fights back',
            text:
              'Some apps only trust their own baked-in certificate, so your proxy cert gets rejected and traffic goes dark. Beating that (Frida, patching) is a whole topic on its own.',
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only intercept traffic from apps and devices you own or are authorised to test.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can route a phone through a proxy, read its HTTPS traffic, and recognise when pinning is blocking you.',
          },
          {
            type: 'quiz',
            question: 'Why do you install the proxy\'s CA certificate on the phone before intercepting?',
            options: [
              'To make the phone faster',
              'So the phone trusts the proxy and its HTTPS traffic can be decrypted and read',
              'To hide your IP address',
              'To charge the battery',
            ],
            correctIndex: 1,
            explanation: 'Without trusting the proxy\'s certificate, HTTPS would fail or stay encrypted. The cert lets the proxy sit in the middle and read the traffic.',
          },
        ],
      },
      {
        slug: 'mobile-app-storage-issues',
        title: 'Mobile Storage Issues',
        summary: 'Apps love to stash secrets on the device. Attackers love that the device is in their hand.',
        estimatedMinutes: 6,
        importance: 'optional',
        blocks: [
          videoSlot('Mobile app storage secrets - what apps leave on your phone'),
          {
            type: 'paragraph',
            text:
              'Apps store data locally to feel fast - your login token, cached responses, settings. The problem is that anyone with access to the device (or a backup of it) can go digging through that stored data.',
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Tokens in plain files** - the login token sitting in a readable file',
              '**Secrets in shared preferences** - passwords or keys saved as plain settings',
              '**Sensitive data in logs** - the app logging things it should not',
              '**Hardcoded keys in the app** - secrets baked right into the code',
            ],
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The device is not a safe',
            text:
              'Treat anything stored on a phone as reachable by an attacker who has the phone. If it must be secret, it should not sit in plain text on the device.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the common places mobile apps stash secrets and why local storage is not a hiding spot.',
          },
          {
            type: 'quiz',
            question: 'Why is storing a login token in a plain local file a problem?',
            options: [
              'It uses too much space',
              'Anyone with access to the device or its backup can read and reuse the token',
              'Tokens cannot be stored on phones',
              'It makes the app crash',
            ],
            correctIndex: 1,
            explanation: 'Plain-text tokens on a device can be lifted by anyone with the phone or a backup, then replayed to impersonate the user.',
          },
        ],
      },
    ],
  },
];

export const EXERCISES: ExerciseSeed[] = [
  {
    lessonSlug: 'metadata-service-ssrf',
    slug: 'cloud-quiz',
    title: 'Cloud check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'In the shared responsibility model, who secures the data you put in the cloud?',
        options: ['The provider', 'You, the customer', 'No one', 'The internet'],
        correctIndex: 1,
        explanation: 'The provider secures the infrastructure; you secure what you upload and how you configure it.',
      },
      {
        prompt: 'A storage bucket is set to public read. What is the risk?',
        options: [
          'Nothing, buckets are always safe',
          'Anyone on the internet can list and download the files',
          'Only admins can see it',
          'It slows the site down',
        ],
        correctIndex: 1,
        explanation: 'A public bucket is readable by the whole internet - a classic cloud data leak.',
      },
      {
        prompt: 'What does "least privilege" mean in IAM?',
        options: [
          'Give everyone admin',
          'Grant exactly the access needed and nothing more',
          'Remove all access',
          'Only use one password',
        ],
        correctIndex: 1,
        explanation: 'Least privilege limits each identity to the minimum it needs, so a leaked key does limited damage.',
      },
      {
        prompt: 'What is the cloud metadata service abused via SSRF?',
        options: [
          'A public website',
          'An internal address that returns the box\'s own credentials',
          'A database backup',
          'A logging tool',
        ],
        correctIndex: 1,
        explanation: 'The metadata endpoint hands out temporary credentials to the instance; SSRF makes the instance fetch them for the attacker.',
      },
      {
        prompt: 'Serverless functions remove the server. What stays a risk?',
        options: [
          'Nothing at all',
          'Over-permissioned roles, event injection and leaked env vars',
          'The keyboard',
          'The monitor',
        ],
        correctIndex: 1,
        explanation: 'A function still has permissions, inputs and secrets, so the usual weaknesses just move to the function.',
      },
    ],
  },
  {
    lessonSlug: 'dependency-and-supply-chain-risks',
    slug: 'containers-and-cicd-quiz',
    title: 'Containers and CI/CD check',
    instructions: 'Five quick ones. Get four right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'Why can a secret removed from a Docker image still be found?',
        options: [
          'Docker emails it',
          'Image layers are retained, so it survives in an earlier layer',
          'It never really existed',
          'Containers cannot hold secrets',
        ],
        correctIndex: 1,
        explanation: 'Every build step is a saved layer; deleting a file later does not remove it from the layer that added it.',
      },
      {
        prompt: 'Why is a CI/CD pipeline a high-value target?',
        options: [
          'It has no access',
          'It runs with deploy and cloud credentials and can push code to production',
          'It only runs tests',
          'It is offline',
        ],
        correctIndex: 1,
        explanation: 'Pipelines hold powerful credentials, so controlling one can mean shipping attacker code to production.',
      },
      {
        prompt: 'What is typosquatting?',
        options: [
          'Fixing code typos',
          'A malicious package named one letter off from a popular one',
          'A firewall rule',
          'A faster shell',
        ],
        correctIndex: 1,
        explanation: 'Attackers publish near-identical names hoping developers mistype and install the malicious copy.',
      },
      {
        prompt: 'Roughly how much of a modern app is third-party code?',
        options: ['None', 'About half', 'The large majority', 'Exactly 10%'],
        correctIndex: 2,
        explanation: 'Most shipped code comes from dependencies, which is why the supply chain is such a big attack surface.',
      },
      {
        prompt: 'Why is an exposed Docker socket inside a container dangerous?',
        options: [
          'It logs too much',
          'The container can launch a privileged container and take over the host',
          'It renames the container',
          'It slows builds',
        ],
        correctIndex: 1,
        explanation: 'Docker socket access lets a container spawn host-controlling containers, effectively escaping to the host.',
      },
    ],
  },
  {
    lessonSlug: 'intercepting-mobile-traffic',
    slug: 'mobile-peek-quiz',
    title: 'Mobile Peek check',
    instructions: 'Four quick ones. Get three right and the module is yours.',
    kind: 'quiz',
    xpReward: 25,
    questions: [
      {
        prompt: 'A mobile app is best understood as what?',
        options: [
          'A standalone program with no server',
          'A client that makes API calls to a backend',
          'A website with no logic',
          'A database',
        ],
        correctIndex: 1,
        explanation: 'Mobile apps send the same kind of API requests a website would; the real logic lives on the server.',
      },
      {
        prompt: 'Why install the proxy CA certificate on the phone before intercepting?',
        options: [
          'To speed up Wi-Fi',
          'So the phone trusts the proxy and its HTTPS can be read',
          'To hide the phone',
          'To back up photos',
        ],
        correctIndex: 1,
        explanation: 'Trusting the proxy cert lets it sit in the middle and decrypt the HTTPS traffic.',
      },
      {
        prompt: 'What is certificate pinning?',
        options: [
          'Saving certs to disk',
          'An app trusting only its own baked-in certificate, blocking proxy interception',
          'A type of malware',
          'A faster TLS handshake',
        ],
        correctIndex: 1,
        explanation: 'Pinning makes the app reject any certificate but its own, so a proxy cert is refused and traffic goes dark.',
      },
      {
        prompt: 'Why is storing a login token in a plain local file risky?',
        options: [
          'It uses space',
          'Anyone with the device or a backup can read and reuse it',
          'Tokens cannot be stored',
          'It crashes the app',
        ],
        correctIndex: 1,
        explanation: 'Plain-text tokens can be lifted from the device or its backup and replayed to impersonate the user.',
      },
    ],
  },
];
