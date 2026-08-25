# Invoice Portal - Acme Corp Billing

- **Category:** web-security
- **Difficulty:** intermediate
- **Estimated time:** 30 minutes
- **XP:** 250

## Mission briefing

You have been given a demo account for the **Acme Corp invoice portal**, running at:

```
http://localhost:8083
```

The security team suspects invoices are not served correctly. Investigate what
an account can reach.

> **Objective:** Find the document a demo account should never be able to open,
> and recover the reference token stored inside it.

## Getting started

1. Make sure Docker is installed and running.
2. From this folder, start the lab:

   ```
   docker compose up -d
   ```

3. Open <http://localhost:8083>. Any username and password signs you in as the
   `guest` user.
4. Browse around: your dashboard lists the invoices assigned to you, and each
   one opens from a link.

## Suggested approach

Spend a few minutes as an ordinary user first. Watch how the application refers
to your documents when you click through the dashboard, and pay attention to
the exact shape of every URL.

Once you understand the pattern, ask yourself what other documents the same
system probably holds - and whether the server ever checks *who* is asking.

## Submitting your flag

Somewhere in the portal you will find a token of the form `SURAKSHA{...}`.
Copy it exactly and paste it into the **flag submission box** for this challenge
on the Suraksha Labs platform to earn your XP.

## Cleanup

Stop and remove the lab when you are done:

```
docker compose down
```

## Rules of engagement

This lab is intentionally vulnerable software that runs **locally on your own
machine** inside an isolated container. Do not point these techniques at systems
you do not own or have explicit permission to test.
