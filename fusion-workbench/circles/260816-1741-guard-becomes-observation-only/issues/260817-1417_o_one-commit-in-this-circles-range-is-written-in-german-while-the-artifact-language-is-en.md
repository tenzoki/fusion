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

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN and now unfixable in place.** `9ae7974`
is still the only German commit message in `3d41d4a..d0f13fa`; the six commits added since the first
pass (`dbbad70`, `bee46e7`, `01932d6`, `70f17da`, `dcb0784`, `d0f13fa`) are all English, so the
count stays one of twenty-seven. The commit is on `origin/main` and carries a published tag range,
so rewriting it is off the table — what stays open is the convention question, not a repair.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`, and this record should be read as two items with different fates.**

**The repair half is closed by construction and will never reopen.** `9ae7974` is still the only German commit message in the range, and all 38 commits added since (`d0f13fa..e435f03`, spanning v10.0.2 through v10.3.0) are English. The commit is published on `origin/main` under three tags; nothing will rewrite it. There is no repair to perform and no lapse recurring.

**The convention half is a decision misfiled as a defect, and it is what keeps the marker on.** The record's own `## What to do` says so in as many words: *"Nothing to this commit. What is worth deciding is whether anything should catch the next one"* — and then names the two candidate answers without choosing (a one-line commit-message check, or the honest position that the rule in `rules/fusion-workbench-conventions.md` `## Project language` is enough and this was a single lapse). That is `decide and record`, not `go fix it`, which is the exact test `rules/fusion-workbench-conventions.md` `## Issues vs Decisions` applies.

Surfaced under *Misfiled — should be a decision* in `shared/history/260819-1400-reconciliation-circles.md`. **Not moved by this pass**, per the reconciliation rule that a relocation between stores is the user's `mv`: the marker vocabulary changes with the store (`_o_/_p_/_c_/_d_` → `_o_/_a_/_i_/_d_/_s_`), and this Circle's decision store is where it would land under the Origin Rule, since the question arose from this Directive's own commit range.

**One correction to this record's own bookkeeping, and it is the reason a reader misses this item entirely.** Two records in this store carry the stamp `260817-1417`. This one is open; `260817-1417_c_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md` is closed. The Circle record's `## Turn log` writes *"Filed as `260817-1417`, closed in Turn 4"*, naming the stamp alone — so a reader resolving that citation lands on the closed record and concludes the stamp is disposed of. The `_b_` record is terminal and is not edited; the ambiguity is recorded here instead, and in the reconciliation log.
