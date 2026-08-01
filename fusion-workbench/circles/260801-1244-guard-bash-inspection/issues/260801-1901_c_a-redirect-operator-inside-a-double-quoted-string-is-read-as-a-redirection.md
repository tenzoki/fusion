A `>` inside a double-quoted string is read as a redirection, so a commit message can be denied

---

**Severity: Medium.** A false positive on prose, with no verb involved and no residual covering it.

`stripData` copies a double-quoted span verbatim, quotes included
(`hooks/lib/shell-parse.ts:252-282`), because bash still expands `$(…)` and backticks there and
the git classifier must keep seeing a hidden command. `tokenize` then splits on whitespace, and
`scanSegment` (`bash-mutation-guard.ts:434-482`) scans every resulting token for a redirect
operator with no knowledge of which of them came from inside quotes. A `>` in ordinary text is
therefore treated as an operator and the following word as its target.

Verified against the shipped `hooks/dist/` with the shipped `protectedPaths`:

```
DENY  | "git commit -m \"docs: rules/a.md -> rules/b.md\""   -> rules/b.md
DENY  | "echo \"moved rules/a.md -> rules/b.md\""            -> rules/b.md
DENY  | "echo \"$x > $y\""                                   -> $y"
DENY  | "ls -la # output > rules/x.md"                       -> rules/x.md
allow | "git commit -m 'docs: rules/a.md -> rules/b.md'"     <- single quotes are captured, so inert
allow | "echo \"a>b\""
```

The `#` case is the same defect from the other end: comments are not stripped either, so a
redirect operator in a trailing comment is scanned as code.

**Not covered by any residual.** `rules/protected-path-discipline.md:177-201` lists eight accepted
gaps; none is about quoted text being read as an operator. The rule's "What stays allowed" section
(:134-136) states the opposite intent — "Quoted text that is not a command: `echo 'rm -rf rules/'`
is inert" — and that sentence is true only for single quotes.

**How often it bites, measured.** All 257 commit subjects and 5370 body lines in this repository's
history were run through the classifier: 0 subjects and 4 body lines deny. The shape needs `> ` or
`-> ` immediately followed by something that resolves to a protected path. So this is latent rather
than currently painful — but it is a deny on `git commit`, the most-run write command in the
system, triggered by prose about the very directories fusion protects. A consuming project whose
convention is `git commit -m "move: a -> rules/b.md"` meets it on the first try, and the deny
reason will tell the agent its *commit message* writes a protected path, which is not a sentence
an agent can act on correctly.

---

**Where the fix belongs.**

`scanSegment` must not see operators that were inside double quotes. The cheapest correct route is
to let capture mode do for double-quoted spans what it already does for single-quoted ones — mint
a placeholder — but only for the spans that contain no `$` and no backtick, so a hidden `$(…)` is
still lifted and the git classifier's fail-closed property is untouched. `resolveWord` already
expands placeholders into their literal text, so `git commit -m "…"` would still resolve to the
message it is.

Two constraints on any fix:

1. **Blank mode must stay byte-identical.** `shell-parse.test.ts` pins `stripDataRegions` against
   the legacy segmenter; a capture-mode-only change does not touch it, and the change must be
   written that way rather than in `stripData`'s shared path.
2. **The fail-closed direction must not flip.** A double-quoted span containing `$` or a backtick
   must keep arriving as code. Getting this backwards would let `"$(git switch main)"` through the
   git classifier, which is a much worse trade than the false positive being fixed.

Comment stripping (`#` at a word boundary in code position) is a separate, smaller change and can
be decided independently.

**Tests.** Allow cases for `git commit -m "a -> rules/b.md"`, `echo "x > rules/y.md"` and
`gh pr create --body "moves a -> agents/b.md"`; deny cases retained for the real redirect forms
`echo x > rules/y.md` and `echo x >"rules/y.md"`, and for `echo "$(rm rules/x.md)"`, which must
stay denied.

**Found by** coderev on the `17730b8..e31c0f3` review, by probing prose-shaped arguments against
the compiled classifier.

---
Resolved: `stripData` (`hooks/lib/shell-parse.ts`) now mints a capture-mode placeholder for a double-quoted span that expands nothing, exactly as it already did for single-quoted ones — which is what bash does with it (no redirection, no word splitting, no segmentation). The two constraints held: blank mode is untouched, so `stripDataRegions` stays byte-identical for the git classifier, and a span carrying `$`, a backtick or a backslash escape still arrives as code, so `"$(rm rules/x.md)"` and `"`git switch main`"` are still lifted and classified. The backslash exclusion is the one addition to the issue's proposal — an escape pair is removed by `resolveWord`'s code branch only, so capturing would resolve `"a\"b"` to `a\"b` instead of `a"b`. Comment stripping was decided against and documented as a residual instead: it would have to change the segmenter that blank mode pins byte-for-byte, and it errs toward deny.
