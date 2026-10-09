The version-boundary test needs full git history at two fixed objects
---
`codec/src/__tests__/round-trip-cli-takeover.test.ts` reads the old bundle and the old manifest out of git by fixed object names. In a shallow clone, or in a tree from `git archive`, the codec suite therefore fails. It is the only codec test that does this.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** low
**Found by:** review G-B, `261009-1448-reviewer-g-b-closing-review-of-the-13-0-0-takeover-revision.md`

**Evidence.**
- `round-trip-cli-takeover.test.ts` line 589: `OLD_BUNDLE_BLOB = "6ecde063…"`.
- Line 592: `ADDENDUM_BASE = "031645d2"`.
- Line 612: `git(["cat-file", "blob", OLD_BUNDLE_BLOB])` in `beforeAll`.
- Line 664: `git(["show", \`${ADDENDUM_BASE}:codec/fixtures/manifest.json\`])` and the per-fixture `git show`.

`grep -ln 'cat-file\|git(\["show"' codec/src/__tests__/*.ts` names this file alone. A `--depth 1` clone of the tag, or a CI checkout with default shallow depth, lacks both objects, so the `describe` fails in `beforeAll` rather than reporting a skip. Inference: not run. The FJ05 plan's own runs (steps 13 and 21) use full clones and are not affected.

**Fix direction, or a question.** Either commit the old bundle's digest-checked bytes and the 86 manifest entries as a fixture, which costs about 690 KB for the bundle, or fail with a named precondition message ("needs full history: object 6ecde063 absent"). Step 13 requires "0 skipped", so do not turn it into a silent skip. Which of the two is the user's call, if size matters.

**Acceptance.** In a `git clone --depth 1` of the branch head, `cd codec && CODEC_REQUIRE_GOLDENS=1 npm test` either passes, or fails with one message naming the missing history.
