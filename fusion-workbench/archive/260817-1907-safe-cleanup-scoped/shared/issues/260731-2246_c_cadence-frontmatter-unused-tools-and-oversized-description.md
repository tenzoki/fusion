# `/fusion:cadence` frontmatter: two tools the body never uses, and a description 2.5x the next-longest

**Filed by:** coderev (incremental review, Turn 1, v5.7.0 release session)
**Scope:** `skills/cadence/SKILL.md:2-4`
**Severity:** Low — hygiene, no functional failure

---

## 1. `allowed-tools` lists `Glob` and `Grep`; the body prescribes neither

`skills/cadence/SKILL.md:4`:

```yaml
allowed-tools: [Bash, Read, Glob, Grep, Write]
```

The body performs file discovery with `find` (`:88`, and the comment at `:86-87` argues
explicitly for `find` over globbing because it survives a missing directory under zsh),
reads log units with Read (`:112`, `:114`), and writes the digest with Write (`:144`).
`Glob` and `Grep` are never named.

Honest qualification: they are not *impossible* — an agent could reasonably reach for Grep
to find the `## YYYY-MM-DD` day-sections in the activity log (`:106`). So this is a
permissive allowlist rather than a wrong one. It was inherited unchanged from flight's
original (`.../F05-flight/.../skills/cadence/SKILL.md:3`), which is the actual reason both
are there. Either drop them, or name the read they authorise at step 4.2 so the allowlist
stays checkable against the body.

Nothing is missing in the other direction: every tool the body uses (Bash for
`fusion-workbench-root` / `fusion-paths` / `date` / `find` / `git log` / `mkdir`, Read for
the log units and the chat-voice profile, Write for the digest) is listed.

## 2. The description is 904 characters — 2.5x the next-longest skill

Measured across all 15 skills:

| chars | skill |
|---|---|
| **904** | `skills/cadence/SKILL.md` |
| 359 | `skills/migrate/SKILL.md` |
| 299 | `skills/circle-stash/SKILL.md` |
| 277 | `skills/seed-from-plane/SKILL.md` |

A skill description is not documentation — it is routing metadata, and it sits in the
context of **every** session in a project with the plugin enabled, whether or not the skill
is ever invoked. Roughly 220 tokens of standing cost for one skill, against a plugin that
otherwise keeps them at 60-90. This cuts against fusion's own lean-context convention
(`rules/context-lean-claude-md.md`, `rules/context-manifest.md`), which is about exactly
this kind of always-loaded weight.

Most of the length is body material that does not aid routing: the three lists are
described in full ("List 1 is… list 2 is… list 3 is…"), as is the source inventory and the
resolution mechanism ("via bin/fusion-paths"). None of that helps the model decide
*whether to invoke*; all of it is already in the body at `:9-13` and `:76-83`.

Recommended: cut to the two things routing needs — what the skill produces, and the
trigger phrasings — in the 150-250 char band the other skills use. Keep the "what have I
been working on" / "what did I do yesterday" / "show my cadence" triggers; drop the list
enumeration, the source enumeration and the resolver mention.

## Verified non-issues (checked, no action)

- **The frontmatter parses.** No `: ` sequence occurs inside the description value, so the
  unquoted YAML plain scalar is safe — the failure mode documented in `CLAUDE.md`
  ("an unquoted `:` in a `description` makes the whole frontmatter fail to parse") does not
  apply here. Confirmed by parsing the block: exactly three keys, `description`,
  `argument-hint`, `allowed-tools`. `claude plugin validate .` passes (one pre-existing
  unrelated warning about `CLAUDE.md` at the plugin root).
- **The em-dashes and en-dashes in the description are harmless** — plain-scalar YAML, no
  escaping needed.
- `argument-hint: ""` is the empty-argument form; `skills/log-activity/SKILL.md` omits the
  key entirely for the same situation. Cosmetic inconsistency only, not worth an edit.

---
Reconciliation 260731-2324-reconciliation.md (reconciler, domain `code`) — **confirmed, stays `_o_`.** `skills/cadence/SKILL.md:4` still lists `[Bash, Read, Glob, Grep, Write]`; neither `Glob` nor `Grep` is named in the body. Description length re-measured across all 16 skills: cadence 891 chars of value, next-longest `skills/migrate/SKILL.md` at 346, then `circle-stash` 286 and `seed-from-plane`/`cleanup` at 264. The issue's table reports 904/359/299/277 — those figures count the whole `description:` line including the 13-character key, so every row is 13 higher. The finding is unaffected: the ratio is 2.6x, and cadence is the outlier by a wide margin either way.

Skill count note: the issue says "measured across all 15 skills"; there are 16 with cadence itself included. Arithmetic detail only, no bearing on the finding.

---
Resolved: `skills/cadence/SKILL.md` frontmatter trimmed to what routing needs (260811). `allowed-tools` is now `[Bash, Read, Write]` — `Glob` and `Grep` dropped, since the body prescribes `find` for discovery (and argues for it at `:109-113`), `Read` for the log units and `Write` for the digest; shell `grep` remains available under `Bash`, so nothing the body might reach for is lost. The `description` value went from 891 characters to 250, inside the 150-250 band the other skills use, keeping what routing needs (what the skill produces, and the four trigger phrasings including the three this record named). `claude plugin validate .` still passes with only the pre-existing CLAUDE.md warning; the value carries no `: ` sequence, so the plain scalar stays safe.
