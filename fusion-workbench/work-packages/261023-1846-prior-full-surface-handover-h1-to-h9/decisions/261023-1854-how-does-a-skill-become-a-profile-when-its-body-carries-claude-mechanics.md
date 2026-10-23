# How does a skill become a catalog profile, when its body carries Claude Code mechanics that a neutral part may not hold?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md; 261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md; 261023-1846-prior-full-surface-handover-h1-to-h9.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md

---

## Question

H4 and H5 of Prior's hand-over ask for a profile per skill whose `neutral` part "is the skill body read from `skills/<name>/SKILL.md`, never a copy, so that the Claude skill stays the one source", with acceptance "a render test proves each neutral part equals the committed `SKILL.md` body". Two things in fusion stand against that as written. First, `catalog/src/__tests__/render.test.ts` `HOST_TOKENS` forbids a neutral part to carry `$FUSION_PLUGIN_ROOT`, a `bin/fusion-*` path, an `$OUT_*`/`$SCAN_*` key, `Agent(`, `AskUserQuestion` or a slash command; every one of the sixteen skill bodies carries several. Second, the ruling `261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md` excludes Claude mechanics from Prior's role text, which is why `261010-1235` rejected its option 2 (agents stay the source, neutral sections by heading): "shipping Claude mechanics into Prior's role text, which the ruling excludes". The skills' 263 kB (`wc -c skills/*/SKILL.md`) need one mechanism before H4 can start, and the same question decides whether the eight agents of H2 and H3 follow `261010-1235` option 1 as the three converted roles did.

## Options

1. **Span parts for skills as for agents; `SKILL.md` becomes generated.** Each skill gets `catalog/profiles/skill-<name>/` with ordered parts tagged `neutral`, `claude`, `prior`; `npm run render -- claude` writes `skills/<name>/SKILL.md` byte for byte, as it writes `agents/<id>.md` for the converted roles. The eight agents of H2 and H3 are converted the same way, so all 27 entries rest on one mechanism.
   - Pros: one mechanism for every entry; the ruling and the host-token lint hold unchanged; the Claude distribution cannot move (byte equality, by test); no growth bound moves.
   - Cons: departs from H4's "never a copy … read from `SKILL.md`": the parts become the one source and `SKILL.md` is output. Every skill and every agent's editing route changes to "edit the part, render, test" (`catalog/README.md` `## Editing a converted prompt`), and with it every later release's `skills/help/SKILL.md` `### 4. Update` edit.
2. **Verbatim body plus a Prior overlay.** The skill's profile text is a `prior` overlay followed by `SKILL.md` read at render time; the overlay says what each Claude name means on Prior, as a `prior` part already does for an included rule file (`catalog/README.md` `## What the tests do not cover`). Skills are exempted from the host-token lint, and the user amends `261009-1024` for skill bodies.
   - Pros: `SKILL.md` stays hand-edited, H4 is met as written, no duplication.
   - Cons: Claude mechanics reach Prior's text, which the standing ruling excludes; a model on Prior reads `AskUserQuestion` and `Agent(` and has to follow an overlay that renames them, which is the weaker contract; two mechanisms then coexist, span parts for agents and overlays for skills.
3. **Span references into `SKILL.md`.** The profile lists byte ranges or heading-anchored spans of `SKILL.md` tagged `neutral` or `claude`, and `prior` parts in the catalog replace the `claude` spans. `SKILL.md` stays hand-edited and is never copied; a test asserts the spans tile the file exactly and that no neutral span carries a host token.
   - Pros: meets H4 as written and keeps the ruling; no generated skill.
   - Cons: a third mechanism beside span parts and overlays; every edit of a skill that moves a span boundary turns the catalog suite red until the span map is fixed, a coupling between two editing surfaces that option 1 does not have.

## Constraints

- The Claude distribution does not change: whatever is chosen, `skills/*/SKILL.md` and `agents/*.md` keep their committed bytes (`README-hooks.md` `### Growth bounds on the shipped text` is then unaffected).
- `261009-1024` stands unless the user amends it.
- Prior checks the request against H4 row by row; whichever option is chosen other than 2, the request reports H4 as deliberately different and states this record's reason.

## Recommendation

Option 1. It is the mechanism the user already ruled for the converted roles, it keeps the ruling and the lint as they are, and it gives all 27 entries one route rather than two or three. The cost is real and lands on fusion's own editing: twenty-four more files become render output. We recommend it because the alternative costs land on Prior's contract (option 2) or on every skill edit (option 3).

---
Answered: the user in chat, 2026-10-23, answer "1" to the plan approval (approve the plan and the split, decide all five questions as recommended) — option 1, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>
