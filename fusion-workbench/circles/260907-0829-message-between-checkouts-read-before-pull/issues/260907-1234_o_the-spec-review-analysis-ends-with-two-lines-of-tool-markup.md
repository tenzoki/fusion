The spec-review analysis ends with two lines of tool markup that are not part of the report

---

`260907-0840-spec-review-message-between-checkouts.md` ends with `</content>` on its
second-to-last line and `</invoke>` on its last. Both are fragments of the write call that
produced the file, not content the report intends. The report's own last real line is the
final unticked item under `## Open Questions`.

---
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>

Found while reading the analysis during the pre-activation correction of this Circle's record.
Nothing downstream breaks: no gate parses the file, and the tokens carry no citation, so
`bin/fusion-citation-check` is silent on them. The cost is that the file reads as truncated,
and a later reader cannot tell from the file itself whether the report ended where it meant to
or whether the write was cut short.

Acceptance test: the file's last line is the last line of `## Open Questions`, and no line of
the file matches `^</[a-z]+>$`.

---
Reconciled 260908-0027 (reconciler, HEAD `9d99b19d`): still open, verified rather than assumed. The
last two lines of `260907-0840-spec-review-message-between-checkouts.md` are still the two closing
tool-markup tags, so the acceptance test's second half fails as written. Nothing in this session's
range touched that file.
