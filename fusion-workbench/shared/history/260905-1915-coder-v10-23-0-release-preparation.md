# coder — v10.23.0 prepared: three version surfaces, the upgrade note rewritten, and every release check recorded

**Status:** Complete
**Date:** 2026-09-05
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Task:** prepare the release of v10.23.0. Prepare, not make: no tag, no push, no commit, and the marketplace repository named as outstanding rather than touched.

## The version reasoning, read off the range rather than taken from the dispatch

`git log --oneline v10.22.0..HEAD` returns **40** commits, not the 39 the dispatch named. The dispatch's count is off by one and nothing else follows from it; the range is the same range.

Minor, because nothing was removed. `git diff --name-status v10.22.0..HEAD` outside the workbench lists seven additions (`bin/fusion-checkout-name`, `hooks/identity-notice.ts` with its two compiled outputs, two new test files, and the upgrade note) and **no deletion and no rename** of a shipped file. The three things that would have made it major were each checked against the diff and each fails to hold:

- **No exit code was removed.** `bin/fusion-identity`'s table is unchanged; the diff to its header restates what exit 1 rests on and adds a section on what the identifier keys. `bin/fusion-events` gains a roster read and changes no code.
- **No signature was dropped.** The `party=` line of `bin/fusion-events presence` goes from five TAB-separated fields to six, and the sixth is **appended**, which that script's own header states so a consumer written against five is unaffected.
- **No file a consumer relies on was renamed.** The one rename in the release is the four personal logs, and it is not a shipped file: `memos-<login>.md` and its three siblings become `<prefix>-<checkout>.md`, and the skill that writes each one adopts an existing file on its next run when this checkout's login is the suffix and nothing stands at the new name. That is the closest call in the range and it stays minor, because nothing is deleted, nothing is merged, and a file that is not adopted is left in place and named in the run's report.

The reconciler losing its `_o_` → `_a_` transition is a behavioural removal inside fusion, not an interface one: no consumer calls it, the marker vocabulary is unchanged, and what replaces the transition is an appended `Answer located:` line plus the orchestrator's listing.

## The four version surfaces

| Surface | Value now | Touched |
|---|---|---|
| `.claude-plugin/plugin.json` `version` | `10.23.0` | yes, from `10.22.0` |
| `install.sh` header `FUSION_REF=tags/v<version>` example | `tags/v10.23.0` | yes, from `tags/v10.22.0` |
| `README.md` `## Install` pin example | `tags/v10.23.0` | yes, from `tags/v10.22.0` |
| marketplace `marketplace.json`, fusion entry | `10.20.0` | **no**, per the dispatch |

The marketplace clone at `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins` reads **`10.20.0`**, so it is behind by three releases and not one: v10.21.0, v10.21.1 and v10.22.0 all shipped from the other checkout without it being bumped. Whoever pushes has three bumps' worth of drift to close in one edit, not the usual one.

## The two descriptions

Compared byte for byte, not by eye: `plugin.json`'s `description` and the marketplace fusion entry's `description` are **identical**, 716 bytes each. They still describe one product.

What they do not describe is this release. Neither mentions the checkout registry, the personal-log rekeying or the resolution-line change, and `plugin.json`'s text was already written before v10.21. Editing only the manifest half would have *created* the drift the release process warns about, so both were left alone and the pair is named as outstanding: rewrite them together, in the same release, and read them side by side before pushing.

## The upgrade note

`docs/upgrading-to-v10-21.md` was renamed with `git mv` to `docs/upgrading-to-v10-23.md` and rewritten. It was wrong in name (v10.21.0 already existed upstream with other content) and wrong in scope (it described the checkout registry alone). The new note is written from the 40 commits and from every `_c_` issue and `_i_` decision stamped 260904 and 260905 in `shared/` and in the Circle `260904-1619-tracked-checkout-registry-names-each-instance`. It keeps the short form `docs/upgrading-to-v10-20.md` established: a head that names the span, a `## What you will notice` list, a "if you do not want it" section, and a `## Verify after updating` block.

Nine things a consuming project sees, in the reader's terms:

1. One file appears at `fusion-workbench/shared/checkouts/<8hex>.md` on the next Setup, and Setup asks once for the person and a name; declining still writes the entry.
2. The name is an attribute and the eight hex characters stay the key, so no record and no event line is rewritten; four sites render the name.
3. `bin/fusion-events presence` joins two git identities of one person into one, so `other_people` can go down.
4. Four personal logs are rekeyed from the login to the checkout identifier.
5. An existing file under the old name is adopted by the skill that writes it, on its next run, with `/fusion:cadence` named as the one reader that cannot adopt the activity log it only reads.
6. A resolution line cites a heading anchor, and `Answered:` and `Deferred:` name who ruled; existing records are not rewritten and no gate checks the field.
7. A store-prefixed citation inside a fenced code block is now reported, so a `verdict=` can move from clean to violations on a corpus nobody edited.
8. The reconciler reports a located answer instead of moving the marker, and the session's listing of open decisions names where the answer is.
9. Setup says how far behind its upstream the checkout stands, with the age of the view beside the count.

Plus the standing one-release-behind cost of the new `bin/` helper, and the chat-rule change under its own bullet.

`README.md`'s pointer paragraph was rewritten with it. It headed "Upgrading from v10.20?" and described v10.21 as the checkout-registry release, which upstream v10.21 is not. It now heads "Upgrading from v10.20, v10.21 or v10.22?", summarises the release, points at `docs/upgrading-to-v10-23.md`, and states that 10.21 and 10.22 have no note of their own with `git log v10.20.0..v10.22.0` as the record for those. The note's own head says the same, following the precedent `docs/upgrading-to-v10-20.md` set for 10.15 through 10.19.

## The pinned inventory that went stale, and its share

`hooks/lib/__tests__/reference-resolution-lint.test.ts` failed on `paths 1619 -> 1622`. Re-approved in this change, with the share measured rather than asserted.

Measurement, by single-file revert against the HEAD tree, which reads **1619 green**:

| Configuration | paths |
|---|---|
| both files at HEAD | 1619 |
| `README.md` at HEAD, note new | 1621 |
| `README.md` new, note at HEAD | 1618 |
| both new (the shipped state) | 1622 |

Each mixed configuration loses one resolved path for a reason that is not a share: the README pointer names the note by filename, so reverting either half makes the other's citation dangle. The two reconcile against the full tree exactly (1619 − 1 + 3 and 1619 − 1 + 0), so the whole **+3 is `docs/upgrading-to-v10-23.md`** and **`README.md` contributes 0** — its one pointer resolved before the rename and resolves after it. The three are the plugin paths the old note did not cite: `bin/fusion-citation-check`, `bin/fusion-citation-sweep` and `docs/upgrading-to-v10-20.md`. `install.sh` and `.claude-plugin/plugin.json` carry version strings only and move nothing. The entry was written inline on the constant and the previous inline entry pushed down a line, which is the log's own shape; nothing was dropped.

`hooks/lib/__tests__/fixtures/surface-growth.golden` moved with it, by the one line the re-approval entry added: `reference-resolution-lint.test.ts 1004 -> 1005`, `total 20882 -> 20883`. Regenerated with `UPDATE_SURFACE_GOLDEN=1`, which moves no baseline and clears no bound, and the diff is those two lines and nothing else.

## Validation, recorded verbatim

**1. `claude plugin validate .`**

```
Validating plugin manifest: /Users/k1/Projects/productive/fusion/.claude-plugin/plugin.json
Validating plugin: /Users/k1/Projects/productive/fusion/CLAUDE.md
⚠ Found 1 warning:
  ❯ root: CLAUDE.md at the plugin root is not loaded as project context. To ship context with your plugin, use a skill (skills/<name>/SKILL.md) instead.
✔ Validation passed with warnings
```
Exit 0. Passed; the one warning is the standing `CLAUDE.md`-at-root notice and is fine.

**2. `claude --plugin-dir . --agent fusion:orchestrator -p "reply SMOKE-OK"`**

Exit 0, and the reply began `SMOKE-OK`. The agent resolves. The run added a sentence of its own saying it recognised the check and ran no Setup, so it left nothing in the tree.

**3. `bin/fusion-review-coverage --since v10.22.0`**

```
anchor=workbench-root
since=v10.22.0
head=HEAD
commits=40
reviews=89
unusable=24
uncovered=21
verdict=uncovered
```
Exit 0. **21 of the 40 commits in the range were opened by no reviewer.** The uncovered set is the whole checkout-registry line from `add89e9e` forward plus everything after the merge: the merge commit `420b022b` itself, the two growth-bound repairs, the rule and reconciler changes (`ff52dd4a`, `9101ecdb`, `9f08fa58`, `505ac4df`), the identity work (`e1e72f77`, `99843ef3`, `24f2e472`) and Setup Step 0k (`3a642910`). One review covers part of the line, `260905-0933-coderev-the-checkout-registry-and-the-presence-join.md`, and the range's later half never reached a pass. The helper reports and does not gate: a release may go out over an uncovered range with the gap named (`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`). It is named here, and the release process's requirement is that the result is stated before the tag, which this entry does.

**4. `cd hooks && npm run build && npm test`**

Build exit 0, and it produced no change under `hooks/dist/`: the committed build was already the compilation of the committed source, and `git status` shows no `dist` path.

```
Test Files  50 passed (50)
     Tests  864 passed (864)
```
Exit **0**.

**5. `bin/fusion-citation-check`**

```
anchor=workbench-root
files=2519  edited-files=194
tokens=23141  judged=18844  resolved=17937
dangling=301  store-prefixed=395
edited-violations=0  unedited-violations=696
undecidable=3082  exempt=1426
verdict=clean
```
Exit 0. `verdict=clean`, because the 696 violations all sit in files nobody still edits (`archive/` in the main).

**6. `bin/fusion-staging-drift`**

```
anchor=workbench-root
head=3a64291
rows=1
unstaged=0
verdict=clean
  in-flight       M orchestrator-events.jsonl  (append-only — written by every event emission, in flight all session)
```
Exit 0. `verdict=clean`; the one row is the machine-written event log, which is never a fault class.

**Not in the dispatch's list, run anyway:** `bin/fusion-prose-metric docs/upgrading-to-v10-23.md` read 9 em-dashes over 1605 prose words against a permit of 1, which is `over`. Seven were rewritten into full stops, colons and parentheses; the file now reads `1 / 1605 / ok`. `README.md` was `over` at HEAD (34) and is `over` at the same 34 after the edit, so the paragraph added none and the pre-existing verdict is untouched by this change.

## What was deliberately not done

No commit, no tag, no push, and no whole-tree git command at any point. The marketplace `marketplace.json` was read and not edited. Neither `description` was rewritten, for the reason given above.

---

**Files changed**

- `/Users/k1/Projects/productive/fusion/.claude-plugin/plugin.json`
- `/Users/k1/Projects/productive/fusion/install.sh`
- `/Users/k1/Projects/productive/fusion/README.md`
- `/Users/k1/Projects/productive/fusion/docs/upgrading-to-v10-23.md` (renamed from `docs/upgrading-to-v10-21.md` and rewritten)
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`

**Verification:** `cd hooks && npm test` — exit 0.
