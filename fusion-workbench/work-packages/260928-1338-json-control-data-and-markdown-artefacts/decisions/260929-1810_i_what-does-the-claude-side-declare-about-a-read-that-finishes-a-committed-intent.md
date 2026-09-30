# What does the Claude side declare about a read that finishes a committed intent?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260928-2251_*_does-the-kernel-take-one-workbench-wide-write-lock-or-keep-a-lock-per-record-under-the-journal.md, 260929-1810_*_where-do-the-claude-side-consumers-of-the-codec-live-and-how-do-they-reach-it.md

---

## Question

A read through the codec is not a promise of zero writes: when the first listing of `.json-state/journal/` finds an intent whose files are all at their pre- or post-bytes, the reader takes the write lock and rolls the intent forward (`codec/README.md` `## The kernel and the journal`). Prior's FJ02 response (Prior `e3bc25b`, `docs/design/fusion-fj02-prior-response.md` `## Recovery and rollout consequences`) makes that the host's to authorise, apart from a read-only role, and asks the standalone adapter to apply a declared policy. FJ03a puts the first Claude-side readers on that route: `bin/fusion-claimed-package` and `bin/fusion-work-order`, the first of which runs at every agent's Setup. The Claude side has no technical role separation: no agent declares a `tools:` line, and every agent that reads the workbench also writes records into it. Surveyed at fusion `b4c8f7ca`: none of the four event hooks (`hooks/guard.ts`, `hooks/tracker.ts`, `hooks/session-start.ts`, `hooks/subagent-stop.ts`) reads a record's state from a head field; `hooks/tracker.ts` reads the Markdown file a tool call wrote, for citation form and review coverage, and resolves citations by file name. None of them calls the codec, and they are observation-only. What the Claude side declares must be settled before the first reader ships, which is FJ03a's first step.

## Options

1. **Declared, and bounded by who may ask.** Every request to the codec is a helper call a session made; such a read may finish a committed intent, and the documentation says so. The event hooks never call the codec, now or later, so nothing that runs unasked can write a record.
   - Pros: true of the code as it stands; no protocol change; the observation-only property of the hooks is kept by a rule about what they call, which a test can pin.
   - Cons: a reviewer's or an analyst's Setup can write a record file, which the word "read-only" in their prompts does not suggest; the documentation has to say it plainly.
2. **A read that never recovers, asked of Prior.** An additive request field makes a read answer a pending intent as a refusal and never take the lock; every Claude-side reader sends it, and recovery is left to the next mutation.
   - Pros: a read is physically write-free, whoever sends it.
   - Cons: a protocol addition, a new digest and a re-pin; a committed intent then blocks every reader of the paths it names until some writer comes along.
3. **The client looks at the journal first and declines to read when an intent is pending.**
   - Pros: no protocol change.
   - Cons: an intent can be committed between the look and the read, so it predicts what it cannot decide; rejected for that reason and listed only so that nobody proposes it again.

## Constraints

- Recovery writes only what a writer already committed: the post-bytes staged in the intent, under the write lock, and never over a diverged file.
- `recovery-blocked` stops the consumer for the paths it names and is reported, never worked around.
- The hooks stay observation-only.

## Recommendation

Option 1. It states what is the case and draws the one line that can be held mechanically: the programs that run without being asked do not call the codec. Option 2 stays available as a request to Prior if a reader ever appears that must not write.

---
Answered: Prior `docs/design/fusion-fj03a-prior-plan-response.md` `## C. Explicit recovery policy; automatic hooks do not invoke the codec` at Prior `b2a931b` — option 1: a helper that was called explicitly may finish a committed intent, and the automatic hooks never call the codec, indirect subprocess calls included; the user gave the Prior side's acceptance as the answer on 2026-09-29; ruled by user, Kai Stalmann <ks@qantr.com>

---
Implemented: 16a6387e — the declaration landed in the header of `hooks/lib/record-client.ts` and in `README-hooks.md` `## Concept`, with `hooks/lib/__tests__/hook-route-exclusion.test.ts` pinning that no automatic hook reaches the codec; the Prior side confirmed the landed text as the accepted policy in `Prior: docs/design/fusion-fj03a-prior-response.md` `## 30 Landed recovery declaration confirmed` at Prior `ad21e58`, noting that Prior's own authorisation callback must still cover recovery effects.
