The fold of the two version-gap records dropped the `bin/fusion-rules` half, and the closure note says nothing was lost

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing `084c626..dbf259a`
**Affects:** `fusion-workbench/shared/issues/260822-0035_o_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`, the surviving record; `fusion-workbench/shared/issues/260822-0026_c_forty-eight-commits-stand-behind-the-manifest-version-so-two-bin-helpers-are-unreleased-and-one-is-absent-from-every-install.md`, the closure note
**Cross-references:** commit `c53a903`, whose message carries the dropped fact; commit `4c7aae6`, which performed the fold

---

## What is wrong

Two records of one fact were folded into one. The closure note on the thinner record states:

> Nothing from it is lost; its remedy was the same, to cut a release under `CLAUDE.md`
> `## Release process` [...]

**One substantive fact was lost.** The closed record `260822-0026` names a second half of the
version gap and calls it the more consequential one:

> The 22 lines of `bin/fusion-rules` in the same range are the second half and are the more
> consequential one, because `fusion-rules` runs at every agent's Setup in every project.

The surviving record `260822-0035` reduces this to a clause inside fact 3, "`git log --oneline
v10.4.0..HEAD | wc -l` returns 48, two of which touch `bin/`". It never names `bin/fusion-rules`.
Its title, its severity line, its "why it matters" section and all three of its remedy routes are
about `bin/fusion-prose-metric` alone.

**The dropped half is real and it is functional, not cosmetic.** Verified at HEAD `dbf259a`:

```
$ diff ~/.fusion/bin/fusion-rules /Users/k1/Projects/productive/fusion/bin/fusion-rules
314a315,330 ... (16 lines of comment)
325c341,345
<     [ -f "$fallback" ] && printf '%s\n' "$fallback"
---
>     if [ -f "$fallback" ]; then
>       printf '%s\n' "$fallback"
>       printf 'fusion-rules: voice profile %s: requested variant %s is absent, resolved to en\n' \
>         "$stem" "$lang_code" >&2
>     fi
$ git log --format='%h %s' v10.4.0..084c626 -- bin/
1c1178d feat(rules): the voice-profile fallback says so on stderr, ...
fac97f4 feat(bin): the prose em-dash counting rule becomes a program, ...
```

Every consuming project is running a `fusion-rules` whose voice-profile fallback is silent. That
is the exact condition `1c1178d` was written to end, and the record that tracks it is now closed
while the record that replaced it does not mention it. The fact survives in the message of commit
`c53a903`, which is not a surface anybody searches for open work.

## A second, smaller inaccuracy in the same record

`260822-0035` states:

> the only mentions outside `bin/` are `CLAUDE.md`, which the installer never copies, and a
> comment in `hooks/lib/__tests__/reference-resolution-lint.test.ts`.

There are three, not two. `grep -rln 'fusion-prose-metric' --exclude-dir=fusion-workbench
--exclude-dir=.git .` returns `.gitignore`, `CLAUDE.md`, `bin/fusion-prose-metric` and that test
file. `.gitignore:41` carries `!bin/fusion-prose-metric`. The record's conclusion is unaffected,
since the installer never copies `.gitignore` either, but a list offered as exhaustive in a record
whose frame is "four facts, each checked" should be exhaustive.

## What to do

One of two, and the first is cheaper.

1. **Add the `fusion-rules` half to `260822-0035`**: name the helper, state that the installed copy
   lacks the stderr fallback notice from `1c1178d`, and say that this one runs at every agent's
   Setup in every consuming project while the other has no call site at all. Correct the
   two-item list to three. Then the closure note on `260822-0026` becomes true.
2. **Reopen `260822-0026` for that half only**, leaving `260822-0035` as the `fusion-prose-metric`
   record. This gives two records again and is what the fold was performed to avoid.

Route 1 is recommended. The fold was the right call and the surviving record only needs the half
it dropped.

**Verified at HEAD `dbf259a`** by the `diff`, the `git log`, and the `grep` above, and by reading
both records end to end.

---
Resolved: both halves repaired by the orchestrator, which wrote the false sentence. The live record
`shared/issues/260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`
now carries the `bin/fusion-rules` half as a section of its own, naming the 22 lines, the missing
stderr fallback notice, and that `fusion-rules` runs at every agent's Setup while nothing calls the
prose metric. The closed record's note no longer claims nothing was lost: it states what was lost,
where it now lives, and that the claim was false when written.

The finding was right about the thing that matters most here. The dropped half was the more
consequential of the two, so the fold made the surviving record understate the defect while
asserting completeness, which is worse than either error alone.
