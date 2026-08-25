# Log Hunter - The Leaked Secret

- **Category:** linux
- **Difficulty:** beginner
- **Estimated time:** 25 minutes
- **XP:** 150

## Mission briefing

A junior admin once wrote a secret straight into a log file on server **srv01**.
The logs were archived and everyone forgot about it - until now.

The archive metadata service is available at:

```
http://localhost:8084
```

> **Objective:** This server's logs contain a secret that should not be there.
> Enter the container, search the logs, retrieve it.

## Getting started

1. Make sure Docker is installed and running.
2. From this folder, start the lab:

   ```
   docker compose up -d
   ```

   The container generates a realistic set of log files into
   `/var/log/suraksha` every time it starts.

3. Open <http://localhost:8084> to see what the archive contains.

### Entering the container

You do not attack the web service this time - you inspect the filesystem the
way an administrator (or an attacker who landed a shell) would:

```
docker compose exec target sh
```

This drops you into a shell *inside* the container. The logs live in
`/var/log/suraksha`:

```
ls -la /var/log/suraksha
cat /var/log/suraksha/auth.log | less
```

### Searching like a professional

Reading thousands of lines by hand is what `grep` is for. A few useful patterns:

```
grep -r 'Accepted password' /var/log/suraksha
grep -rn 'Failed password' /var/log/suraksha | head
grep -rl 'sudo' /var/log/suraksha
```

`-r` searches recursively through every file, `-n` prints line numbers, and
`-l` lists matching files only.

## Submitting your flag

When your search turns up a token of the form `SURAKSHA{...}`, copy it exactly
and paste it into the **flag submission box** for this challenge on the Suraksha
Labs platform to earn your XP.

## Cleanup

Exit the container shell (`exit`) and stop the lab when you are done:

```
docker compose down
```

## Rules of engagement

This lab is intentionally vulnerable software that runs **locally on your own
machine** inside an isolated container. Do not point these techniques at systems
you do not own or have explicit permission to test.
