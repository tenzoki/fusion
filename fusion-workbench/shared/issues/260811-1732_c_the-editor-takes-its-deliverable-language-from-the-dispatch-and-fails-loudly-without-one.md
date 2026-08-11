# The editor takes its deliverable language from the dispatch, and fails loudly without one

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752, realising an answered decision
**Affects:** `agents/editor.md:16,62`; `rules/fusion-workbench-conventions.md` `## Project language`
**Cross-references:** `shared/decisions/260807-2131_a_which-language-governs-a-customer-deliverable.md` — the answer this realises

---

Option 3 of the answered decision. A customer deliverable follows neither the chat nor the artifact
declaration: the dispatching task names the target language, and the `editor` **fails loudly** when
none is given.

**The loudness is the substance, not politeness.** Silently falling back to either declaration
reintroduces exactly the defect the answer rejects: a finished document in the wrong language,
discovered by the customer rather than by a stop. This project's deliverables are not reliably in
one language, so any project-wide default is wrong a large share of the time.

`## Project language` gains a customer-deliverable case naming the dispatch as the source. That
section currently presents a three-way split that is disjoint and complete; adding a fourth case
must keep it so — state where a deliverable sits relative to the persisted-file case it would
otherwise fall into.

**Acceptance:** `agents/editor.md` requires the language in the dispatch and halts without it, with
a message naming what to pass; the conventions file carries the case and stays disjoint and
complete; no fallback path exists; a gate pins the absence of a default if one can be written in
the shape of the existing prompt lints.

---
Resolved: the editor has no default and no fallback, and the boundary is four-way.

`agents/editor.md` — a new `## Deliverable language — named in the dispatch, or you halt`
section carries the operative contract: the language comes from the dispatching task and from
nothing else; without one the agent halts before producing anything and reports a fixed message
naming what to pass (`**Deliverable language:** de|en`). It forbids inferring the language from
the source document, the project's declarations, the customer's name, or the conversation's own
language, and it covers translations (an untargeted translation request is a halt, not a guess
at the direction). Setup step 3 no longer reads a declaration for this purpose; Production
Process step 2 reads the dispatch; Tool Discipline now says explicitly that the language is the
one decision never handed back as a recommendation, because it has no default to recommend.
Frontmatter untouched.

**The prompt now names neither declaration token anywhere**, which is what makes the absence of
a fallback checkable: a project-wide default can only be reintroduced by naming one of them.
`hooks/lib/__tests__/deliverable-language-lint.test.ts` (6 cases) asserts that, plus the
section's presence, its naming of the dispatch, its halt wording, its no-fallback statement, and
its citation of the authoring home rather than a competing definition — and over the conventions
file, that the split reads four-way and carries the case with its two persisted branches named.
Written in the shape of `executor-verification-report-lint.test.ts` and carrying the same
honesty preamble: it checks the contract is present in the prompt, not that any run obeyed it.

`rules/fusion-workbench-conventions.md` `## Project language` — the split is now four cases and
**stays disjoint and complete** by cutting the persisted-file case in two on *who the file is
for*: "persists as a file for the project's own use" takes the artifact language, "persists as a
file for a reader outside the project" takes the dispatch's language. The record asked where a
deliverable sits relative to the case it would otherwise fall into, and this states it rather
than leaving a reader to work it out. Three paragraphs follow: why the deliverable is carved out
of the persisted case, why the source is the dispatch rather than a third `CLAUDE.md` line, and
that a single-declaration project is unchanged in the other three cases and **not** exempt from
this one. The writing-profile paragraph gained the consequence that follows: a deliverable's
prose takes the profile of the language the dispatch named, not the artifact language.

Siblings brought along: `agents/orchestrator.md` (the routing table's `editor` row now carries
the dispatch obligation and says to ask the user rather than choose; the Phase-2 dispatch table
repeats the parameter), `CLAUDE.md` `## Conventions` (the dispatch-parameter bullet is now four
agents, with `editor` named as the one parameter with no default), `README-agents.md` (the
`editor` row).

Verification: `cd hooks && npm test` — exit 0, 1293 passed.
