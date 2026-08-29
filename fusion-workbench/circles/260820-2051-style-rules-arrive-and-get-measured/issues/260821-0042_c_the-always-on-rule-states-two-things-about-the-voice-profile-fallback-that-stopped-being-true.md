The always-on rule states two things about the voice-profile fallback that stopped being true

---
`rules/fusion-workbench-conventions.md` `## Project language` carries one paragraph about the
voice-profile fallback, and after step 4 of this Circle both of its claims are false. It says
`bin/fusion-rules` "emits only the resolved path, so an agent cannot today tell a fallback from a
project that declared `en`", which the standard-error line now contradicts. And it refers to "the
history line this rule asks for", where the rule asks for no history line at all.

---

**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `260814-1332_*_the-voice-profile-fallback-is-performed-by-the-helper-so-the-agent-cannot-record-it.md`

## How it surfaced

Step 4 made the fallback detectable. The coder implementing it checked whether that closed the record
the step was meant to close, found it did not, and left the record open with its reasoning. This is
the other half of what it found: the record's own subject moved, and the shipped rule text describing
it did not.

Verified at HEAD: `rules/fusion-workbench-conventions.md:250` carries both sentences.

## Why it is filed separately

The record this cites is about an obligation the bound party could not discharge. This is about a rule
file stating a fact that is no longer true, in the always-on set every agent loads on every dispatch.
The two have different fixes. The first waits on someone deciding whether an agent should record a
fallback at all. The second is a correction to shipped text and does not wait on anything.

## The second fault is the load-bearing one

The missing obligation is not a wording slip. Commit `1a36fe4` replaced the sentence that asked an
agent to record the fallback with a description of the defect, and the surrounding prose kept referring
to the obligation that sentence used to carry. So an agent can now detect the fallback and is
instructed by nothing to record it. Whether it should be instructed to is exactly the question the
cited record leaves open, which is why this record proposes no wording for it.

## Acceptance

- The paragraph states what the helper does today, which is that it names the fallback on standard
  error.
- It does not refer to an obligation no surface states. Either the obligation is restored in the same
  edit, which is the cited record's question and not this one's, or the reference goes.
- The always-on byte cost of the correction is reported against the head-room, like every other change
  to this corpus in this Circle.

---
Resolved: fixed — with 260814-1332: the sentence claiming the helper emits only the resolved path is gone, and the history-line obligation is stated rather than referred to; rules/fusion-workbench-conventions.md:253
