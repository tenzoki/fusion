Forty-eight commits stand behind the manifest version, so two `bin/` changes are unreleased and one helper is absent from every install

---

**Severity:** Medium. Nothing is broken in this repository, where the work-tree preference hides the gap. Every consuming project is running a plugin whose `bin/` is missing a helper the shipped text documents as present.
**Domain:** code
**Filed by:** orchestrator, from the commission in `260822-0010-measurement-briefing-does-the-rule-change-shorten-a-reply.md`, which names the symptom and asks for a record if none exists
**Affects:** `.claude-plugin/plugin.json`, `bin/fusion-prose-metric`, `bin/fusion-rules`

---

## What is wrong

`.claude-plugin/plugin.json` reads `10.4.0`. So does the installed copy at `~/.fusion`. The two trees are not the same tree.

```
$ git rev-list --count v10.4.0..HEAD
48
$ git diff --stat v10.4.0..HEAD -- bin/
 bin/fusion-prose-metric | 286 ++++++++++++++++++++++++++++++++++++++++++++++++
 bin/fusion-rules        |  22 +++-
$ git merge-base --is-ancestor fac97f4 v10.4.0 && echo in-release || echo after-release
after-release
$ ls ~/.fusion/bin/ | grep -c fusion-prose-metric
0
```

`bin/fusion-prose-metric` landed in `fac97f4`, after the `v10.4.0` tag. `CLAUDE.md` `## Layout` states the rule this breaks in four words: **Bump version on every change.** Forty-eight commits have landed without one, so the manifest names a version that does not contain them, and no install path can distinguish the released 10.4.0 from the current one.

## Why it matters, and where it does not

It does not matter in this repository. `bin/fusion-plugin-cwd` makes `bin/fusion-rules` and two siblings prefer the work tree here, so a session started at this root reads the current helpers regardless of what is installed.

It matters everywhere else. A consuming project resolves every `bin/` helper through `$FUSION_PLUGIN_ROOT`, which is the install copy and is pinned for the whole session. There, `bin/fusion-prose-metric` does not exist. `CLAUDE.md` `## Layout` documents it as a shipped surface with its own row, and the em-dash ceiling in `rules/user-facing-output.md` is stated as a rate that this program is the authoritative way to measure. The documentation ships; the program does not.

The 22 lines of `bin/fusion-rules` in the same range are the second half and are the more consequential one, because `fusion-rules` runs at every agent's Setup in every project.

## How it was found

A reviewer hit the absence on 2026-08-21 and worked around it with the work-tree copy. The briefing that commissioned this session's measurement recorded the workaround and asked for the record. The workaround is correct for a session running here and is unavailable to a consuming project.

## What to do

Cut a release: bump `.claude-plugin/plugin.json`, bump the fusion entry in the marketplace clone, commit and push both, tag, per `CLAUDE.md` `## Release process`. The four version surfaces that step names should be checked together, and so should the fifth thing it names as the one that slips, the two `description` fields that describe one product from two repositories.

**This record does not decide when.** A release cadence is a judgement about what else in those 48 commits is ready to ship, and the person cutting it holds that. What the record fixes is the belief that 10.4.0 is what the tree contains.

## What this is not

Not a defect in `bin/fusion-prose-metric`, which works. Not a call for a guarded call site: `CLAUDE.md` records that convention (decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`) and no prompt calls this helper at all today, so there is no call site to guard. The gap is between the tag and the tree.

---
Resolved: closed as the thinner of two independent filings of one fact, not as fixed. An analyst
running the commissioned measurement reached the same root at 00:35 and filed
`260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`,
which carries everything this record has and three things it does not: each of the four facts
checked individually rather than asserted together, the installer cleared by name
(`install.sh:82` copies `bin` wholesale, so a default-ref install is unaffected and only a
pinned user is exposed), and the consequence stated as the sharper claim, that the version
string cannot distinguish an installation carrying the program from one that does not.

**The defect is live and is tracked there.** One record, one location, per the Origin Rule's
second corollary. This one is closed to keep a single home, and the commit that filed it,
`c53a903`, cites this path.

**Correction, 260822: one thing was lost in the fold, and the sentence above claiming otherwise
was false when it was written.** The record this one was folded into is about `bin/fusion-prose-metric`
and does not carry the second half of what this record measured: the 22 unreleased lines of
`bin/fusion-rules` in the same range, which is the more consequential half, because `fusion-rules`
runs at every agent's Setup in every project while nothing calls the prose metric at all. The
installed copy is missing that file's stderr fallback notice, verified by `diff` against the work
tree. Found by the review at
`260822-0116-coderev-the-measurement-report-reproduces-and-its-after-run-does-not.md`
and filed as
`260822-0116_*_the-fold-of-the-version-gap-records-dropped-the-fusion-rules-half-and-the-closure-note-says-nothing-was-lost.md`.
The `fusion-rules` half is carried forward here rather than in the record this one points at, so the
fold no longer drops it.
