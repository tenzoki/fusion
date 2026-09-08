`bin/fusion-forum` guards its sibling helper in `new` and calls it bare in `seen`; both branches contradict the header

---

`new` wraps `bin/fusion-cadence-anchor` in `[ -x ]` (`bin/fusion-forum:304`) and, on the miss, reports `mark=none` with **no** `note=` — the whole store re-reads as new and nothing says the mark could not be read. `seen` calls the same helper with no guard (`bin/fusion-forum:358`) and exits **1**, a code the header's own table reserves for `show` and states that "`new` and `seen` never produce it" (`bin/fusion-forum:76-77`).

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Measured. A stub directory holding only `fusion-forum`, `fusion-workbench-root` and `fusion-identity`, run against a tracked two-checkout fixture:

```
$ /tmp/ffstub/bin/fusion-forum seen 392c6bd4…
/tmp/ffstub/bin/fusion-forum: line 358: …/bin/fusion-cadence-anchor: No such file or directory
rc=1

$ /tmp/ffstub/bin/fusion-forum new shared/forum | grep -c '^note='
0
```

Two separate defects with one cause, the missing sibling:

1. **`new` degrades without reporting.** The design rule this file states repeatedly is that a degradation which changed the answer is named rather than hidden (`bin/fusion-forum:54-58`, `bin/fusion-forum:177-185`). An unreadable mark changes the answer from "one new entry" to "the whole store", and `mark=none` is indistinguishable from a genuine first run. The three-note vocabulary needs a fourth line, or the guard needs to become a reported miss.

2. **`seen` is the one call site in this file with no `[ -x ]` guard**, against the standing convention (`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`, cited in this file's own header at `bin/fusion-forum:196`), and it leaks an exit code the header says it cannot produce. A caller branching on the number reads it as `show`'s blob failure.

`bin/fusion-cadence-anchor` predates `bin/fusion-forum`, so the miss is not reachable from a normal install today. It is reachable from a partial copy, and the exit table is a contract either way.

**Acceptance test:** with the sibling absent, `new` prints a `note=` naming the unreadable mark, and `seen` exits with a code its own table defines. With the sibling present, `hooks/lib/__tests__/fusion-forum.test.ts` is unchanged and green.
