# What does request 82 say an accepted answer releases, given that the tag `v13.5.0` already exists and was made before any request for its bundle?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior.md, 261114-1554-which-commit-is-the-candidate-of-request-82-built-from-now-that-main-differs-from-the-tag-in-install-tree-files.md, 261114-1608-which-commit-request-82-candidate-built-from.md, 261113-1320-does-the-tag-v13-4-4-stand-as-covered-by-priors-accepted-answer-to-request-79-given-two-days-after-it.md

---

## Question

Every bundle request since 77 has a section `### What fusion does with the answer`, and each of them tied the tag and the marketplace bump to an accepted answer. Request 82 cannot say that in the same words. The candidate is built from the tag `v13.5.0`, which already exists: annotated (`48fe207c…`), naming `6063934602b39d7445219006757bf415e3bef144`, created 2026-11-11 12:49:57 +0100 in the same second as `v13.4.4`, and on the remote (`codec/fixtures/prior/REQUESTS.md`, ``### The tag `v13.4.4`, ruled to stand on the answer to 79``, `#### What the ruling does not cover`, which measured all four facts and adds: "The ruling does not name `v13.5.0`, and nothing here says on what that tag stands"). The session summary of 2026-11-11 quoted there says the marketplace was bumped the same day; the marketplace entry itself has not been read. The user's ruling of 2026-11-13 on `v13.4.4` covered that tag after the fact by Prior's accepted answer to 79, and named no rule for the next tag. So request 82's answer section needs one sentence only the user can write: what an accepted answer does for a tag that precedes the request, and what a refused or corrected one does to it. The request text is prepared now and filed after Prior's pin commit; this answer has to exist before it is filed, and it does not block the preparation.

## Options

1. **The tag stands as the Claude Code release, and the answer releases nothing.** Request 82 states that `v13.5.0` and its marketplace entry are the Claude Code distribution's release, made before this request, and that an answer to 82 is Prior's verdict on the bundle on its host. Accepted: recorded, nothing else follows. Corrected or refused: a new patch version, 13.5.1, with its own bundle and request; the tag `v13.5.0` is not touched.
   - Pros: it says what happened (the tag is a Claude Code release that never waited for Prior); no after-the-fact covering is needed; the rule fits every later release whose tag precedes the bundle.
   - Cons: it drops the gate that requests 77 to 79 set, that a tag follows an accepted answer, without a decision record replacing that rule beyond this request.
2. **The tag stands now and is covered after the fact by an accepted answer, as ruled for `v13.4.4`.** Request 82 states the order as it is, the tag first, and says that an accepted answer is ruled in advance to be the answer covering the tag, with its limits named beside it. Corrected or refused: a new patch version, and the user rules on what becomes of the tag.
   - Pros: it keeps the form the user chose for `v13.4.4` on 2026-11-13, so requests 79 and 82 read alike; the gate stays in force in name.
   - Cons: a gate ruled to be met in advance by whatever answer comes no longer gates anything; a refusal leaves a released, tagged version that Prior refused, and the request cannot say beforehand what follows.
3. **The request states the tag and says nothing on what an answer releases.** It records the tag's existence, its commit and its date, and leaves the release question to a ruling after Prior answers.
   - Pros: nothing is promised that a later ruling would have to undo.
   - Cons: request 82's answer section then has no clause for the tag at all, which is the gap Prior named for 79 (its `## Not determined`: "What an accepted answer releases at fusion now that the tag `v13.4.4` exists. Fusion's text does not say").

## Constraints

- `codec/fixtures/prior/REQUESTS.md` is append-only, so request 82's answer section is written once and corrected only by a later passage.
- A new tag or a marketplace bump is put to the user before either is done (request 79, `### What fusion does with the answer`).
- The tag `v13.5.0` already exists and is pushed; no option moves or deletes it.
- The candidate is the tree of `v13.5.0`, by the answered decision `261114-1554-…` (option 1).

## Recommendation

We recommend option 1, contingent on the marketplace entry reading `13.5.0` when request 82 is filed. The tag was cut as a Claude Code release on the day the campaign landed, two days before Prior had answered 79, and request 82 cannot gate an act that has already happened. Option 1 states that and gives a correction one route, a new patch version. Option 2 matches the wording of the `v13.4.4` ruling, but there the answer already existed when the user ruled; here the ruling would be made before the answer, which turns the gate into a formality. If the user wants the gate to survive as a rule for future releases, that is a separate decision beyond this request.

Answered: this record, option 1 — the tag `v13.5.0` and its marketplace entry stand as the Claude Code release, made before request 82; an answer to 82 is Prior's verdict on the bundle on its host and releases nothing; a correction or refusal is a new patch version 13.5.1 with its own bundle and request, and `v13.5.0` is not touched; the user answered "1" in chat on 2026-11-14; ruled by user, Kai Stalmann <ks@qantr.com>
