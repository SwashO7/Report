# Port Discovery - The Silent Admin Service

- **Category:** networking
- **Difficulty:** beginner
- **Estimated time:** 20 minutes
- **XP:** 150

## Mission briefing

You have been dropped onto a machine running the **Nexatech Industries** employee
intranet. The IT department insists their internal admin service is perfectly
safe because "nobody knows where it runs".

> **Objective:** A service on this host is hiding something. Discover it and
> retrieve what it protects.

The intranet application is available at:

```
http://localhost:8081
```

That is the *only* address documented. Anything else that is listening on this
host is for you to find.

## Getting started

1. Make sure Docker is installed and running.
2. From this folder, start the lab:

   ```
   docker compose up -d
   ```

3. Open <http://localhost:8081> in your browser or with `curl`.

## Suggested approach

Recon first, exploit second. Services must *listen* on a port before anyone can
talk to them - advertising is optional. Once you locate something unexpected,
interact with it directly: hidden services often expose more than they should.

Tools you may find useful (all run against your own machine only):

- `nmap` (`nmap -p- localhost`, or scan common ranges)
- `curl` for talking to whatever you find

## Submitting your flag

When you retrieve the protected data, you will find a token of the form
`SURAKSHA{...}`. Copy it exactly and paste it into the **flag submission box**
for this challenge on the Suraksha Labs platform to earn your XP.

## Cleanup

Stop and remove the lab when you are done:

```
docker compose down
```

## Rules of engagement

This lab is intentionally vulnerable software that runs **locally on your own
machine** inside an isolated container. Do not point these techniques at systems
you do not own or have explicit permission to test.
