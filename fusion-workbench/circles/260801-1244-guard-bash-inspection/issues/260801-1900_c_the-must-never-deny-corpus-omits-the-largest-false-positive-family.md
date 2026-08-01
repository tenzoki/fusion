The must-never-deny corpus omits the largest false-positive family, and a third of it cannot deny under any protected list

---

**Severity: Medium.** The corpus is the only regression guard against blocking legitimate agent
work everywhere. It does not cover the shape that actually trips.

`ORDINARY_AGENT_COMMANDS` (`hooks/lib/__tests__/bash-mutation-guard.test.ts:990-1082`, 72
commands, one `it()` each at :1088-1093) carries the contract stated in its own header: "IF A
CHANGE TRIPS THIS BLOCK, that change denies ordinary agent work."

Two measurements against it.

**1. Twenty-two of the 72 cannot produce a deny under any `protectedPaths` value.** They contain
no write the classifier detects anywhere — `npm test`, `git status --short`, `git log --oneline
-10`, `date +%y%m%d-%H%M`, `git push origin main`, `cd ~/Downloads && ls -la`. They are free to
add and they hold nothing down. Of the remaining 50, 22 exercise a detected write whose path
comparison saves it (the genuinely load-bearing half) and 28 name a protected path in a read
position, which does guard against a substring-matching classifier and is worth having.

**2. Not one of the 72 puts a variable or a substitution in a written-operand position** — the
single largest false-positive family in the classifier. Confirmed denies, none of them in the
corpus:

```
npm test > "$TMPDIR/test.log"                   -> "$TMPDIR/test.log"
npm test 2>&1 | tee "$LOG"                      -> "$LOG"
rm -f "$TMPDIR/probe.txt"                       -> "$TMPDIR/probe.txt"
rm -rf "$BUILD_DIR"                             -> "$BUILD_DIR"
mv "$f" /tmp/                                   -> "$f"
cp build/out.js "$DEST"                         -> "$DEST"
for f in build/*.js; do rm "$f"; done           -> "$f"
while read -r f; do rm -f "$f"; done < /tmp/list -> "$f"
cd "$TMPDIR" && rm -rf work                     -> work
cd "$(git rev-parse --show-toplevel)" && rm -rf hooks/dist  -> hooks/dist
cat report.md > ~/backup.md                     -> ~/backup.md
```

The three corpus entries filed under "substitution idioms" (:1043-1046) each place the
substitution somewhere harmless: `echo "$(date) done" >> /tmp/session.log` has a literal redirect
target, `cd "$(dirname "$0")" && npm test` has no mutation, and `for f in rules/*.md; do wc -l
"$f"; done` puts the variable next to `wc`. The one shape agents write — the variable as the thing
being written — is absent from the block that exists to catch it.

**The authors knew the mechanism.** `describe("fail-closed — an unresolvable operand of a
recognised verb")` asserts `mv $A $B`, `rm "$OUT"`, `sed -i "s/$OLD/$NEW/" /tmp/notes.txt` and
`rm -rf ~/.cache/fusion` as denies, and one case is even titled "denies the two known-and-accepted
false positives, so a change is visible". So the family is documented and pinned — just not on the
side of the suite that would notice it *widening*, and not with a count anyone reads.

---

**Where the fix belongs.** Not in the classifier. Two changes to the suite:

1. **Add a `KNOWN_FALSE_POSITIVES` block** next to `ORDINARY_AGENT_COMMANDS`, holding the commands
   above and asserting the current (denying) behaviour with a comment saying they are accepted
   rather than intended. The file already uses exactly this technique for the backslash-continuation
   gap (section 12b). A later narrowing then shows up as a test flip instead of as nothing.
2. **Retire or replace the count floor.** `expect(ORDINARY_AGENT_COMMANDS.length)
   .toBeGreaterThanOrEqual(42)` (:1084-1086) asserts on the test's own fixture and passes however
   the fixture is composed; twenty hard commands could be swapped for twenty trivial ones without
   a failure. If a floor is wanted, make it a floor on commands that contain a detected write.

**Scope note.** Every false positive listed above lands in consuming projects only — the whole
check stands down in this repository (`guard-bash-integration.test.ts:389` asserts it). That is
also where nobody is positioned to notice a pattern and file it, which is the argument for the
corpus carrying the weight rather than field reports.

**Related.** `260801-1859_o_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`
is the same family seen from the behaviour side.

**Found by** coderev on the `17730b8..e31c0f3` review, by reclassifying every corpus entry against
a catch-all protected list and probing ~78 real agent command shapes against the compiled
classifier.

---
Resolved: both halves of the family are now in the suite. `ORDINARY_AGENT_COMMANDS` grew from 72 to 102 with the shapes that must allow — a variable or `~` as a redirect target on a program outside the table, prose carrying `->`, the new git subcommand forms, `perl -Ilib` — and a new `KNOWN_FALSE_POSITIVES` block holds the eleven that still deny (`rm -f "$TMPDIR/probe.txt"`, `mv "$f" /tmp/`, `tee "$LOG"`, `cd "$TMPDIR" && rm -rf work`, …), asserted at their current behaviour with a companion test proving each denies for the fail-closed reason. The count floor was replaced: instead of `length >= 42` it now filters the corpus against a catch-all protected list and asserts a floor on the entries that exercise a DETECTED write — 29 of the 102 today, floor at 27. A trivial-for-hard substitution now fails.
