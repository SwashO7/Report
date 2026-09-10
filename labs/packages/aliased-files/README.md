# Aliased Files - Static Vault

- **Category:** web-security
- **Difficulty:** beginner
- **Estimated time:** 25 minutes
- **XP:** 150

## Mission briefing

**Static Vault** is Acme's internal file-drop, running at:

```
http://localhost:8084
```

It serves a handful of downloadable files from one folder, mapped onto the
`/files/` address on the site. The team is confident that folder is the only
thing reachable through that address - but confidence is not a security
control.

> **Objective:** Recover the reference token from a file that the downloads
> area should never be able to serve.

## Getting started

1. Make sure Docker is installed and running.
2. From this folder, start the lab:

   ```
   docker compose up -d
   ```

3. Open <http://localhost:8084> in your browser. You'll see a short list of
   downloadable files, each linked as `/files/<name>`.

## Suggested approach

Start by downloading a couple of the listed files normally, and look closely
at the URL shape:

```
curl -s http://localhost:8084/files/readme.txt
```

Notice that everything after `/files/` is just a filename that gets appended
onto wherever the server keeps its downloads. Filenames are usually plain
words - but a URL path can contain other things too. What happens if the
"filename" you ask for tells the server to step back a folder instead of
staying put?

If your first attempt is rejected or ignored, remember that a browser or
`curl` may normalize a path like `..` for you before it ever reaches the
server. Sending the *encoded* form of those two dots, byte for byte, sometimes
gets through where the plain form does not. Tools like `curl --path-as-is`,
Burp Suite, or your browser's devtools let you send a request exactly as
typed.

The token you're after lives one folder above the downloads directory.

## Submitting your flag

Somewhere outside the downloads folder sits a file containing a token of the
form `SURAKSHA{...}`. Copy it exactly and paste it into the **flag submission
box** for this challenge on the Suraksha Labs platform to earn your XP.

## Cleanup

Stop and remove the lab when you are done:

```
docker compose down
```

## Rules of engagement

This lab is intentionally vulnerable software that runs **locally on your own
machine** inside an isolated container. Do not point these techniques at systems
you do not own or have explicit permission to test.
