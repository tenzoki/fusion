# A fourth session_start emit template was created in this range and left out of the `<ID>` conversion

---
`753932b` replaced the two literal identity fields with one `<ID>` fragment in "all three emit
templates" and closed `260826-0136` on that basis. There are four. The fourth was created two
commits earlier, in `c2be6f8`, and still carries `\"person\":\"<PERSON>\",\"checkout\":\"<CHECKOUT>\"`
unconditionally — in `/fusion:setup`, which is the documented entry point for a session and therefore
the site that most often writes the line.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** High. The runtime consequence alone is Medium; what raises it is that a record was
closed as complete while a site the same range created stands unrepaired, and this is the second
time in one Circle that a count taken over `agents/orchestrator.md` missed the `/fusion:setup`
rendering of the same procedure.

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md`
(the record closed as covering all three);
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260825-2140_*_the-turn-count-defect-names-three-sites-and-a-fourth-carries-the-identical-whole-file-count.md`
(the same shape, same Circle: three sites counted in the prompt, a fourth standing in the skill body).

## What was measured

Read at `72a9561`.

| Site | Form |
|---|---|
| `agents/orchestrator.md:235` | `"event":"session_start"<ID>,"history_file":…` |
| `agents/orchestrator.md:1322` | `'{"ts":"...","event":"..."<ID>}'` |
| `agents/orchestrator.md:953` | prose, `session_end` "carrying `<ID>` as every line does" |
| `skills/setup/SKILL.md:483` | `"event":\"session_start\",\"person\":\"<PERSON>\",\"checkout\":\"<CHECKOUT>\",…` |

`c2be6f8` added the two literal fields to `skills/setup/SKILL.md:483`. `753932b`, two commits later,
converted the three orchestrator sites and did not touch it.

**No `<ID>` fragment is defined anywhere in `skills/setup/SKILL.md`.** The fragment is defined once,
at `agents/orchestrator.md:139`, and extended with `session_id` at `:140`. The skill body reads the
identity at Step 0i (`skills/setup/SKILL.md:346-355`) and its Step 5 prose (`:480`) cites
`agents/orchestrator.md` `### 2. Structured Event Log` for "the unresolved-half rule included" — a
pointer to a rule the template beside it cannot execute. That is the exact shape `260826-0136`
described: the rule is restated and not expressed.

## Why the skill body is the site that matters most

A skill body becomes the user prompt, which `CLAUDE.md` `## Conventions` calls the only reliable
enforcement, and `/fusion:setup` Step 5 is where a session's `session_start` line is actually
written on the skill path. An unresolved half there produces `"person":""` — which today's readers
tolerate, because `hooks/lib/events-query.ts:104` drops an empty-string field — or the literal
`<PERSON>` placeholder, which they do not: it parses as a real person value and would be counted as
a distinct party by `measurePresence`.

The unresolved half is not exotic. It is the ordinary state of an install one release behind the
tree that added the helper, measured in
`shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`,
where `bin/fusion-identity` is absent and the wrapper's sentinel is 127.

## Fix direction

Give the skill body the same fragment the orchestrator prompt defines, at the step that reads the
identity, and put `<ID>` in the template at `:483`. Do not restate the rule a second time: define
the fragment at Step 0i beside the `bin/fusion-identity` call and cite
`agents/orchestrator.md` `### 2. Structured Event Log` for the contract, exactly as `:480` already
does for everything else.

Second, and separately: the two renderings of one procedure have now diverged twice on the same
class of edit, each time invisibly. Whether that earns a gate is a question rather than a fix, and
the record above named it once already without one arriving.
