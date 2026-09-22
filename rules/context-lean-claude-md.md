# The lean-`CLAUDE.md` convention

**Provenance:** 260718-1924-v5x-overhaul

> The companion to [`context-manifest.md`](./context-manifest.md). The manifest
> moves a consuming project's heavy rule bodies behind per-agent + per-topic
> loading; this doc says what the project's own `CLAUDE.md` keeps always-on and
> what it hands to the manifest. Together they take a project from
> "everything-always-loaded" to "a lean index plus on-demand units".

It is a convention, not machinery: nothing in the plugin
enforces a line count. The goal is a `CLAUDE.md` a reader can hold in their head.

---

## The problem it solves

A consuming project's `CLAUDE.md` is loaded into **every** agent on **every**
session, in full. When it grows to hold the whole project's dev rules, framework
knowledge, and domain guides — tens of kilobytes — every agent pays that cost
whether or not the work at hand touches those topics. The same content is often
duplicated again in `rules/` and `.claude/rules/`. The result is a large, mostly
irrelevant always-on context that crowds out the task.

The fix has two halves:

1. **The manifest** (`./rules/context-manifest.yaml`) makes heavy knowledge
   **topic-scoped and agent-scoped** — loaded only when the claimed work item's
   topic and the running agent match. Documented in `context-manifest.md`.
2. **A lean `CLAUDE.md`** keeps only what genuinely must be present every session,
   and **points at** the rest.

## What stays always-on in `CLAUDE.md`

Keep it to what every agent needs on every session, independent of the topic:

- **Project identity** — what this repo is, in a few sentences.
- **`**Language:** <lang>`, plus `**Artifact language:** <lang>` where the
  project declares one** — the lines `bin/fusion-rules` reads to resolve the
  stilwerk voice profiles. The first is load-bearing and must stay. The second
  is optional: only a project whose files are written in a different language
  than its chat carries it, and where it is absent the first line governs both.
  Defined in `rules/fusion-workbench-conventions.md` `## Project language`.
- **The handful of truly-every-session rules** — conventions that bind every
  edit regardless of topic (e.g. "never commit build artifacts", a release-bump
  discipline, a naming convention). If a rule only matters for one topic, it does
  not belong here — it belongs in a manifest unit tagged with that topic.
- **A pointer table** — a short index that names the topics and says where each
  one's detail lives (a `.claude/rules/*` file, or a Skill). The reader learns
  *that* the knowledge exists and *how it is loaded*, without carrying its body.

## What moves behind the manifest

Everything that is topic-specific:

- **Dev-rule bodies** (architecture rules, coding-hygiene detail, ontology
  engineering rules, LLM-pipeline doctrine) → `path` units in the manifest,
  tagged by the agents and topics they bind. Loaded when that topic is active.
- **Reference / body-of-knowledge material** (framework catalogues, glossaries,
  taxonomies) → `skill` units. Emitted as a `skill:<name>` pointer and invoked
  on demand — never loaded as always-on text. This is the Skill-packaging
  boundary from `context-manifest.md`.

## The canonical-home split (deduplicate while you convert)

A project that carried the same rule file in both `rules/` and `.claude/rules/`
resolves each file to **exactly one** home, because `bin/fusion-rules` reads both
roots and would otherwise emit it twice:

- **`.claude/rules/<file>.md`** — project-wide bindings every Claude session
  should respect (the dev-rule bodies, indices, policies). These are the same
  rules a developer running plain Claude Code in the repo would want.
- **`./rules/<file>.md`** — fusion-agent-specific rules that have no meaning
  outside a fusion-agent context (review priority overrides, and
  `context-manifest.yaml` itself).

Delete the redundant copy. The manifest then tags whichever home survives.

## Worked example (before → after)

**Before** — one large always-on file:

```md
# CLAUDE.md  (259 lines, ~43 kb, loaded into every agent every session)
## Architecture rules
  …40 lines of H1–H11…
## Ontology engineering rules
  …44 lines…
## LLM-pipeline doctrine
  …30 lines…
## Framework body-of-knowledge
  …60 lines the agents rarely need in full…
## Release process
  …
```

**After** — a lean index plus a manifest:

```md
# CLAUDE.md  (lean index)
This is the <project> repo: <one-paragraph identity>.
**Language:** en

## Always-on rules
- Never commit build artifacts; maintain .gitignore.
- Every release bumps plugin.json + marketplace.json and validates.

## Topic map (loaded on demand via ./rules/context-manifest.yaml)
| Topic | Where the detail lives | Loaded for |
|---|---|---|
| architecture   | .claude/rules/ARCHITECTURE-RULES.md | code agents |
| ontology       | .claude/rules/ONTO-ENG-RULES.md     | ontocoder, reviewer, planner |
| llm-pipeline   | .claude/rules/READER-ABSTRACTION-RULES.md | coder, planner |
| unite-framework| Skill: unite-bok-sc-skill (on demand) | all agents |
```

```yaml
# ./rules/context-manifest.yaml
units:
  - path: .claude/rules/ARCHITECTURE-RULES.md
    agents: [coder, reviewer, planner]
    topics: [always]                      # architecture binds every code edit
  - path: .claude/rules/ONTO-ENG-RULES.md
    agents: [ontocoder, reviewer, planner]
    topics: [ontology]
  - path: .claude/rules/READER-ABSTRACTION-RULES.md
    agents: [coder, planner]
    topics: [llm-pipeline]
  - skill: unite-bok-sc-skill
    agents: ["*"]
    topics: [unite-framework]             # reference body — pointer, not body
```

The 60-line framework body is no longer always-on text — it is a `skill:` pointer
an agent follows only when the claimed item's topic is `unite-framework`. The ontology and
LLM-pipeline bodies load only for their agents when their topic is active. The
always-on surface is the identity, the language line, two rules, and a table the
reader can scan in seconds.

## How to tell "always-on" from "on-demand"

This is the test. A person applies it, one passage at a time, to one file. It is
written so that two people applying it to the same file reach the same answer,
and so that neither of them needs to open an agent prompt to do it.

### Step 1 — divide the file by heading, before judging anything

Split the file at its headings, by **one heading level, picked once for the
whole file**. Pick that level by counting, not by naming it:

1. Count the headings at each level — `# `, `## `, `### ` and deeper — ignoring
   any line inside a fenced code block, which is code and not a heading.
2. Take the **shallowest level that has at least two headings**. The whole file
   divides at that level.
3. Where no level has two, take the **shallowest level present at all**. A file
   whose every heading is unique then divides at its first heading and can come
   back as a single passage. That fallback is coarse by construction, and it
   still gives every reader the same division.
4. A file with no heading at any level is one passage, the preamble, and the
   level is 0. `bin/fusion-claude-md-weight` prints `heading-level=0` for it
   only where it prints rows at all, which is where some passage stands over
   the threshold; under the threshold it reports `headings=0` and no level
   line, having no rows to say the level of.

A heading at the chosen level, together with everything under it up to the next
heading of that same level, is **one passage**. Whatever stands above the first
heading of that level is a passage too — the file's **preamble** — so the
passages sum to the file with nothing left over.

Counting is what settles the two cases that naming "the file's top level" gets
wrong. A file opening with a single `# ` document title has no second `# `, so
as soon as any deeper level carries two headings the count passes that title
over — with no special case for document titles — and leaves it, and whatever
follows it, in the preamble. fusion's own `CLAUDE.md` is that file and divides
at `## `. A file carrying one `## ` and three `### ` divides at `### `, which
is the unit its reader actually works in, where "the top level" would hand back
one passage holding the whole file.

The passage is the unit you classify — not a sentence lifted out of one, and
not two sections merged because they read as related.

Fixing the unit first is what makes the answer repeatable. Two readers who
divide a file differently are not disagreeing about the criterion; they are
answering different questions, and their two answers cannot be compared at all.

**This section is where that division is authored, and what applies it restates
none of it.** `bin/fusion-claude-md-weight` implements exactly the rule above
and prints the level it picked as `heading-level=`, so a reader sees which level
the rows were cut at instead of inferring it; `agents/curator.md` classifies
placement per passage as divided here. Change the division in one of those and
it is a defect there, not a second answer.

**The heading settles the division. It does not settle the judgement.** Whether
a passage is bound to a topic is a property of the work a reader is doing, not a
property of the text. No command reads it off the file: the same section is
topic-bound for one reader and always-on for the next, and both can be right.
What a tool *can* measure is weight — which headings the file's bytes sit under,
so you know which passages are worth looking at first — and that measurement is
worth having. It renders no verdict. The verdict is a person's, and where the
pass runs through fusion's curator, a person confirms it at a gate before any
text moves.

That limit was established by measurement while this section was being written,
not assumed. Anyone tempted to automate the test should build the thing that
reports weight and names whose the judgement is, and should not build the thing
that answers the topic question.

### Step 2 — ask one question of each passage

- *Does every agent need this on every session, whatever the work?* → **always-on**.
  It stays where it is.
- *Does it matter only when the work is about topic T?* → **on-demand**. It
  leaves, as a manifest unit tagged `[T]`, for the agents that touch T.
- *Is it look-up reference an agent consults occasionally, rather than a
  constraint that shapes edits?* → **on-demand**, as a `skill` unit: a pointer,
  never a body.

**A passage is judged whole, and part of it is enough.** The question is asked of
the passage, and it is answered yes when **any** part of the passage is needed
every session — not only when all of it is. So a passage can stay on the strength
of a couple of lines inside it, and everything else it holds stays with them. A
passage that stays therefore carries text no session needs, and that is a cost
the test accepts rather than a case to split further: the cut that would save
those bytes is a cut below the passage, and Step 1 fixed the passage as the unit
precisely so that two readers stop cutting in different places. The remainder is
what the unit costs, and it is cheaper than two answers that cannot be compared.

When in doubt, prefer on-demand: a rule that turns out to be needed more widely
is cheap to re-tag `[always]`; an always-on block that is rarely relevant is a
standing tax on every session.

### Step 3 — what a passage that fails the test becomes

It does not simply vanish from the file. What stands where it stood is **one
pointer line, naming the topic and the file that now holds the detail**:

```md
- **<topic>** — <what it covers, one clause>. Detail: `<path/to/file>` `<## Section>`.
```

All three parts carry weight. The **topic** is the word a reader searches for and
the word the manifest tags that unit with, so the same name has to appear in both
places. The **file** is where the passage is now readable in full; a pointer to a
file that does not yet carry the text is worse than the passage it replaced,
which is why the destination is written before the source is cut. The
**section** is optional, and earns its place only where the destination file is
big enough that naming it saves a search.

Where the cut emptied a section, collect its pointer line into the one table
described under *What stays always-on* above, rather than leaving it stranded
where its section used to be. The table is what a reader scans; a scatter of
orphan lines under emptied headings is the old file with the text removed.

**A pointer may stay where its passage stood when the section around it
survives with content of its own.** A passage is the text under one heading at
the chosen level, which is Step 1's own division, and that division is what
makes the condition decidable rather than a matter of taste. There the pointer
is no orphan: it sits in the passage a reader is already in, which is where they
look for it, and moving it into the table would cost that reader the search the
table exists to save. fusion's own `CLAUDE.md` is the case this condition is
written for. It carries pointer lines both inside its `## Layout` table and
under headings whose sections kept text, and the second group is right where it
stands.

### Two worked classifications

Both are real, taken from the `CLAUDE.md` of fusion's own repository — the first
as that file stands, the second as it stood before the move it describes was
carried out.

**It stays: the preamble.** Counted as Step 1 says, that file divides at `## `,
so its preamble — everything above the first `## ` — is one passage: seven lines
and the bytes the helper's `(preamble)` row prints (411 at `bb44a56f`), holding the document title, the two language declarations
`**Language:** de` and `**Artifact language:** en`, and one paragraph saying what
the repository is. The declarations are 43 of those bytes, and they are why the
passage stays, for a mechanical reason rather than a matter of taste: the
rule-discovery helper named under *What stays always-on* above reads both lines
out of `CLAUDE.md` at the start of **every** dispatch, to resolve which voice
profiles the agent it is setting up will write in. There is no work for which
that is irrelevant — a release, a defect fix and a documentation pass need it
identically. Step 2's first question is answered yes of the passage on the
strength of those two lines, the title and the identity paragraph stay with them,
and no pointer replaces any of it.

**It moved: the release procedure.** The same file carried a `## ` section on how
a release is cut — a passage in its own right at the level that file divided at,
then as now — bump the manifest version, bump the marketplace entry, tag the
commit, refresh the pinned example. Every line of it was correct and none of it
optional. But it binds only where the work at hand *is* a release: a session
fixing a defect in a hook loaded all 10 372 bytes of it, paid for them, and read
none. Step 2's second question is answered yes, with topic `releasing`, and the
passage duly went: commit `72911b86` lifted it into the file that already carried
this project's maintainer procedures, `README-agents.md` `## Releasing`, beside
the procedure for adding an agent. The heading stayed behind in `CLAUDE.md` with
one sentence under it naming that file and that section — Step 3's pointer, 261
bytes where 10 372 had been.

The difference between the two is not importance, and reading it as importance is
the commonest way to get this test wrong. The release procedure is not less
important than the language line. It is *bound to a topic*, and the language line
is not.

### A passage moves; it is not deleted

Relocation is the default and removal is not an option the test offers. A passage
that fails the test fails it about **placement**: what was established is that
the text is bound to a topic, not that the text is wrong. Deleting it answers a
question nobody asked, and it throws away the thing the file was best at —
somebody wrote that paragraph because a failure mode was not obvious, and moving
it behind a pointer keeps it while deleting it does not.

There is exactly one exception. A passage may be deleted rather than moved where
**a record in the project's workbench already carries the same account** — a
decision record, an issue, or a work-item record that states the same thing in at
least as much detail — and where **that record is named at the point the move is
recorded**: in the ledger entry, where the pass ran through `/fusion:curate`, or
in the commit message, where the cut was made by hand. A deletion whose record is
not named is not this exception. It is a loss, and no later reader can tell the
two apart.

Binding decision: `260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md`.
