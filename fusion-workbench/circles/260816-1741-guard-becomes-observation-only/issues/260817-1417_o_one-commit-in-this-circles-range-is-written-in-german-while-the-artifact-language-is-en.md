One commit in this Circle's range is written in German while the project's artifact language is en

---
**Domain:** code
**Filed by:** reconciler
**Cross-references:** `rules/fusion-workbench-conventions.md` `## Project language`, `CLAUDE.md:3-4`

---

## What happens

`9ae7974`, the last commit of the session and current `HEAD`, is written entirely in German —
subject and all three body paragraphs:

```
docs(workbench): der Befund der Fremdprüfung und das Protokoll des Release-Gates

Der Datensatz zur Entschärfung der Monitor-Schaltflächen stammt aus Schritt 15
des Plans, der Prüfung gegen eine Projektwurzel außerhalb dieses Repositorys.
...
```

It is the only one of the 21 commits in `3d41d4a..HEAD` that is. The other twenty are English,
including the twenty this same session wrote.

## Why it is a defect and not a preference

`CLAUDE.md` declares `**Language:** de` and `**Artifact language:** en`, and
`rules/fusion-workbench-conventions.md` `## Project language` settles which of the two governs a
commit message, in a paragraph written for exactly this ambiguity:

> **Persisted surfaces that carry no profile still follow the artifact language.** Dashboard lines
> (`orchestrator-live.md`), commit messages and monitor strings are exempt from *both* stylometric
> profiles … but exemption from a style profile is not exemption from the language rule. They
> persist as files, so they take the artifact language.

The rule records that this reading was **settled by user decision rather than derived**, and names
commit messages as the case that decided it. So the surface is not merely uncovered — it is the
worked example the rule uses, and it is the one that went the other way.

`inference:` the likely cause is that the commit was written at the end of a session whose chat
had been running in German for hours, and the chat language leaked into the persisted surface.
That is the failure the four-way case split in the rule exists to prevent, arriving at the one
surface where the two candidate languages are both defensible in the moment.

## Scope and severity

**Severity:** Low. Nothing is broken; the message is accurate and the commit is correct. What is
lost is uniformity of the git history, which is a surface a consuming reader and every later
`git log` pass reads.

**Scope:** this repository's git history. Not shipped to consuming projects, and not rewritable —
`9ae7974` is pushed to `origin/main` and is an ancestor of nothing that could be rebased without
rewriting published history, which is not worth it for this.

## What to do

Nothing to this commit. What is worth deciding is whether anything should catch the next one:
there is no gate on commit-message language, and the two existing prose gates (the stylometric
profiles) explicitly do not cover this surface. A one-line check is possible and may not be worth
its own mechanism — the honest answer may be that the rule is enough and this was a single lapse.
Recorded so that a second instance has a first one to point at.
