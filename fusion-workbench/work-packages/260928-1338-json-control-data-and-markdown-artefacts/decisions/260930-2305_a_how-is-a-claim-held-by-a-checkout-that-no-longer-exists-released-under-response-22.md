# How is a claim held by a checkout that no longer exists released, under response 22?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md, 260929-0709_*_fj02-kernel-plan-and-three-open-choices.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

`rules/fusion-workbench-conventions.md` `## Work packages` says "A takeover overwrites the field": another checkout may take a claimed item at the user's word. Under JSON control three texts close that route. Response 22, as section 6 of the specification records it at Prior `930eb26`, makes claim ownership a host duty for `release` and every `transition` out of `claimed`, "ohne schwächeren Nebenweg". `codec/contract/transitions.json` says "a second claim on a claimed package is a conflict". And the kernel carries no takeover edge. So a package claimed by a checkout that was deleted, or by a machine that is gone, can be moved by nobody through the write client. FJ03c's client refuses a non-owner; the question is what the user does instead, and FJ03d has to know before it rewrites the conventions' sentence.

## Options

1. **No takeover.** The stale package stays `claimed`; the user files a new package that cites it, and the old one is left as it is.
   - Pros: nothing changes in the contract.
   - Cons: a claimed package stays live for ever: it is a node in the work order and a live citation target, and nothing can drop it.
2. **A takeover in the codec, bound to the user's provenance.** `claim` on a claimed package admitted only with a named previous holder and a source of the user's provenance, the way `set-mode` admits `autonomous`; the record keeps the previous holder.
   - Pros: explicit, recorded, under the same CAS and replay; no weaker host route.
   - Cons: a contract change, a digest move and a re-pin; Prior decides whether it meets response 22.
3. **A host-side override flag.** The client releases a foreign claim when the user confirms.
   - Pros: no contract change.
   - Cons: exactly the weaker route response 22 excludes.

## Constraints

- Response 22 (a) binds both hosts: ownership is decided from `show`, whose revision goes into the mutation.
- FJ03c does not wait for this answer: its client refuses a non-owner in every case.

## Recommendation

Option 2, asked of Prior as request 38 in the FJ03c plan's step 1. Until it is answered, FJ03d's text must not promise a takeover.

---
Answered: plan `260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md` — option 2 — a codec-owned takeover bound to the user's explicit consent, put to the Prior side as request 38; FJ03c does not wait for the answer; the user approved it with the FJ03c plan on 2026-09-30; ruled by user, Kai Stalmann <ks@qantr.com>
