# HTTP Investigation - The Daily Packet

- **Category:** web-security
- **Difficulty:** beginner
- **Estimated time:** 20 minutes
- **XP:** 150

## Mission briefing

**The Daily Packet** is a small online newspaper running at:

```
http://localhost:8082
```

Its developers left pieces of a secret token scattered across the site's HTTP
traffic instead of its pages.

> **Objective:** Reassemble the token hidden across the site's HTTP responses.

The token comes in three pieces. Read every response carefully - status line,
headers, body, and cookies.

## Getting started

1. Make sure Docker is installed and running.
2. From this folder, start the lab:

   ```
   docker compose up -d
   ```

3. Open <http://localhost:8082> in your browser or with `curl`.

## Suggested approach

A browser hides most of what a server sends back. To see everything, use tools
that show raw responses:

```
curl -i http://localhost:8082/
curl -i http://localhost:8082/robots.txt
curl -i http://localhost:8082/login
```

Browser devtools (Network tab) or proxy tools like Burp Suite / mitmproxy work
just as well. Visit the site's corners: the front page, `robots.txt`, the login
page... and if you get stuck there is always a `/debug` route that developers
forgot about.

Pieces may arrive in any order. When joined in the right sequence they form one
token starting with `SURAKSHA{`.

## Submitting your flag

Concatenate the three pieces into a single token of the form `SURAKSHA{...}`
and paste it into the **flag submission box** for this challenge on the Suraksha
Labs platform to earn your XP.

## Cleanup

Stop and remove the lab when you are done:

```
docker compose down
```

## Rules of engagement

This lab is intentionally vulnerable software that runs **locally on your own
machine** inside an isolated container. Do not point these techniques at systems
you do not own or have explicit permission to test.
