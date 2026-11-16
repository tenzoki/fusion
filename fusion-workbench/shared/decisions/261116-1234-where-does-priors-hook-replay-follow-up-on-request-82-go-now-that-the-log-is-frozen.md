# Where does Prior's hook-replay follow-up on request 82 go, now that `REQUESTS.md` is frozen and request 82 has no file of its own?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261115-2310-how-does-the-prior-request-log-stop-growing-once-request-82-is-answered.md`; `codec/fixtures/prior/REQUESTS.md` `## The log frozen after request 82`, `### Request 82, settled here`

---

## Question

Prior answered request 82 at its commit `90b5758` and deferred the hook replay on bundle `sha256:2ba70dbeba8662212ef8312801da1c8103e90bfe42cf6a1ac8e34b71352ad643` to its plan steps 107 to 110 and 76, to be reported in a follow-up naming that digest (Prior's plan step 111). `REQUESTS.md` was frozen at `40f3f32f`, and its last passage names where such a follow-up's passage goes as unruled: decision `261115-2310-…` gives a request file to each request from 83 on, and a passage spanning several requests to the newest one's file, but no file to request 82 alone. Prior has made its step 111 conditional on this answer (relayed by the user on 2026-11-16), so it is ruled now rather than when the follow-up arrives.

## Options

1. **A file of its own, `codec/fixtures/prior/requests/082-<slug>.md`, holding the follow-up alone.** Row 82 of `STATUS.md` points at it. If the follow-up arrives together with the answer to 83, rule 1c of `261115-2310-…` applies unchanged: it goes into 83's file and row 82 points there.
   - Pros: one file per request holds; the frozen log stays closed; no new rule beyond 1c.
   - Cons: request 82's history is split between the frozen log and a file holding only its follow-up.
2. **A note in row 82 of `STATUS.md` only.**
   - Cons: `STATUS.md` is maintained in place and never pinned, so a recorded follow-up would have no stable, citable text.
3. **Reopen `REQUESTS.md` for this one passage.**
   - Cons: breaks the freeze and the final digest already reported to Prior.

## Constraints

- `REQUESTS.md` takes nothing after `## The log frozen after request 82`; its digest at `40f3f32f`, `sha256:0d9f2530f4e603bafaeb7e12f6726b511418893c369cd4eb10e86cda9b952d1a`, is final.
- `STATUS.md` is never pinned and never bundled (`261115-2310-…`, 1b).

## Recommendation

Option 1, as the user proposed it.

---
Answered: this record, option 1 — the follow-up goes to its own file `codec/fixtures/prior/requests/082-<slug>.md`, holding that follow-up alone, row 82 of `STATUS.md` points at it; arriving together with the answer to 83, it goes into 83's file under rule 1c and row 82 points there; the user answered "1" in chat on 2026-11-16; ruled by user, Kai Stalmann <ks@qantr.com>
