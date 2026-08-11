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
