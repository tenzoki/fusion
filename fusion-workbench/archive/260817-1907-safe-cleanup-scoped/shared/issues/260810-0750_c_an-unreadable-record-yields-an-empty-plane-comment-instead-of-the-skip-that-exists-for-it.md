# An unreadable record yields an empty Plane comment instead of the skip that exists for it

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `ff70d3a..HEAD` (session `260810-0241-orchestrator-session.md`, Turn 2)
**Affects:** `bin/fusion-plane:961`, `:471-476`, `:1080-1081`
**Cross-references:** commit `ea492e6` (named this site in its own message and left it unfiled); `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY`

---

## The defect

The spec-comment body is built through a pipe whose first stage's status is discarded:

```bash
comment_html="$(build_comment_body "$file" "$nk" | jq -r '.comment_html')"
```

`build_comment_body` is `jq -Rs … "$file"`. When `$file` cannot be read, that `jq` fails, the
second `jq` receives nothing, and `comment_html` is the empty string. The op is then composed
and, on the live path (`:1080-1081`), pushed. The result is an empty comment attached to the
Plane issue in place of the Circle record body.

`comment_skip` (`:478-486`) exists for exactly this outcome — "say it out loud once, count it,
and let the caller carry on WITHOUT the comment" — and this path does not reach it. The shell
has no `pipefail` set (`set -eu` at `:150`), so the masking is invisible on reading, which is the
same trap the file's sibling `bin/fusion-count-sources` documents at length after being caught by
it (`260810-0459_*_fusion-count-sources-reports-a-measured-zero-when-git-fails-which-its-own-header-forbids.md`).

## How it comes to be filed now

`ea492e6`'s message names it: *"Three structural siblings found and reported rather than swept:
`fusion-plane:847`, where an unreadable file yields an empty comment pushed in place of the skip
that exists for it, and two `[ -f ]`-guarded pointer reads. The first has no record yet."*

It still has none. `rules/fusion-workbench-conventions.md` is unambiguous that a defect found
during work is written as a separate file with no exceptions, so a defect named in a commit
message and nowhere else is the case that rule forbids. Reporting the gap in the message is
better than swallowing it and is not a substitute for the record.

The other two siblings the message mentions are not described precisely enough to file from the
message alone; whoever picks this up should name them at the same time.

## Suggested fix direction

Split the pipe so the first stage's status survives, and route a failure to `comment_skip`:

```bash
if body="$(build_comment_body "$file" "$nk")"; then
  comment_html="$(printf '%s' "$body" | jq -r '.comment_html')"
else
  comment_skip "record unreadable: $file"
fi
```

The gate is at `:959`, before the op is composed, so the skip costs the state transition nothing —
which is what the `comment_skip` header already promises.

---
Resolved: both spec-comment sites read `build_comment_body`'s status now, and the live one had the same hole a level up.

Folded into the discarded-write-status pass (`260810-0743_*_map-put-reports-success-on-a-failed-write-so-map-write-s-error-branch-never-fires.md`) because it is the same class: a fallible operation whose status is dropped, so a failure reaches the API as a success.

**One correction to this record, measured rather than reasoned.** It predicts `comment_html: ""`. Against `c923935` the operation actually carried `<!-- fusion-spec-comment:… -->\n<pre></pre>` — the marker intact and the record body gone. The mechanism is exactly the one this record names; the surviving string is not. That matters for anyone searching Plane for the damage: they should look for an empty `<pre>` under a valid marker, not for an empty comment.

**One request in this record was not met, and not silently.** It also asks for the two `[ -f ]`-guarded pointer reads that the `fusion-count-sources` executor mentioned to be named. `bin/fusion-plane` has eleven `[ -f ]` guards and none of them reads a pointer file — checked, not assumed. The likeliest site is `bin/fusion-paths:227-229`, outside the file list of the task that closed this.

Session: `260810-0241-orchestrator-session.md` (Turn 3, task R4). Executor log: `260810-0805-coder-plane-discarded-write-status.md`.
