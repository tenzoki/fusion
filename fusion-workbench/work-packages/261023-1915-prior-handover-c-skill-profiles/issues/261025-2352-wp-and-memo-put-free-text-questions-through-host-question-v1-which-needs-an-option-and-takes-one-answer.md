wp and memo put free-text questions through `host.question.v1`, which needs at least one option and takes one answer
---
wp's mode 3 asks for a title and a paragraph with one `host.question.v1` call and no options. memo's mode 3 asks "note or task, what topic, and what should be captured?" in one call. At the pin the question tool refuses a call without options, and a single-select call takes either one option or typed text, never both. Both contradict their own binding, which routes only fixed-option questions to the service. Severity: Medium. Fusion fixes this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-2352-reviewer-closing-review-of-prior-handover-c-skill-profiles.md; 261025-2218-skill-span-map-for-entry-profiles.md (Finding 5, row `wp`)

## Defect

fusion side, at `ec6c968e`:

- `catalog/profiles/skill-wp/parts/07-prior.md` item 3: "ask for the title and the paragraph with one `host.question.v1` call; the user's typed reply comes back as `text`". No option is named.
- `catalog/profiles/skill-memo/parts/15-prior.md` item 3 and `21-prior.md`: one call for kind, topic and content.
- Both profiles' `01-prior.md`: "Where this text puts a question with **fixed options**, it is one `host.question.v1` call", and "A question this text puts as plain chat text ends your turn". A question with no fixed options is, by that rule, chat text.

Prior side, at `08c57fb`:

- `internal/supervisor/question.go` `QuestionDescriptor`: "It is the AskUserQuestion form, so options are required"; `QuestionExecutor.Execute` sends channel `ask-user-question`, and `questionCall` refuses that channel with zero options (`api.ErrProtocol`).
- `moduleapi/v1/entry_wire.go` `DecodeResult`: when `multi_select` is false, exactly one answer counts, a selected option or the typed text.

So wp mode 3 is refused as written, and memo mode 3 can carry the kind or the content, not both.

This also bears on step 15. The span map gives `wp` `host.question.v1` because of this one question. Asked as chat text, wp names no question service, and its `requires` stays `host.exec.v1`, which is what `catalog.json` holds today.

## Fix direction

Put both as chat text, which ends the turn and comes back as the user's typed reply: the binding already covers it. Or split memo into a kind question with options followed by a chat question for the content. Then re-derive wp's and memo's `requires` from the parts.

## Acceptance

- No `prior` part asks a `host.question.v1` question that has no options, or one that needs both an option and typed content in a single-select call.
- With every skill entry set `supported` in a scratch copy of `catalog.json` and `requires` taken from the parts, `checkEntries` passes, and wp's set is the one the corrected parts name.
- `cd catalog && npm test` exits 0, and the Claude render diff stays empty.
