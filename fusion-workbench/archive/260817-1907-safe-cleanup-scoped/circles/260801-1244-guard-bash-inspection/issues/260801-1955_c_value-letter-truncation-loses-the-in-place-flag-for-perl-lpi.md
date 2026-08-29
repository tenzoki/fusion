The value-letter truncation loses the in-place flag whenever a value letter precedes the `i` — `perl -lpi -e` is now allowed

---

**Severity: High.** A regression introduced by `18e2e4f`. `perl -lpi -e 's/…/…/' <protected>` is an
everyday spelling of an in-place rewrite, and it now allows where it denied at `e31c0f3`.

## What changed

`shortFlagLetters` (`hooks/lib/bash-mutation-guard.ts:253-261`) truncates the letter run at the
first letter listed in the verb's value-letter set, keeping that letter:

```ts
const SED_VALUE_LETTERS = "efil";                  // :234
const PERL_VALUE_LETTERS = "CDeEFiIlmMVx";         // :235

function shortFlagLetters(flag: string, valueLetters: string): string {
  const m = /^-([A-Za-z]*)/.exec(flag);
  if (m === null) return "";
  const letters = m[1];
  for (let i = 0; i < letters.length; i++) {
    if (valueLetters.includes(letters[i])) return letters.slice(0, i + 1);
  }
  return letters;
}
```

The truncation is correct for a letter whose value is **mandatory and glued** (`-I<dir>`,
`-e<script>`, `-f<file>`, `-m<module>`). It is wrong for a letter whose value is **optional** —
`-l`, `-C`, `-D`, `-x`, `-V` for perl, `-l` for sed. perl itself ends the run at the first
character that cannot be part of the value, so in `-lpi` the `p` and the `i` are separate flags.
The classifier instead stops at `l`, never sees the `i`, and `mutatesOnlyWhen` reports no mutation.

## Measured, HEAD against `e31c0f3`

Same protected list, same normaliser, both compiled from source:

```
was DENY, now allow | perl -lpi   -e 's/a/b/' rules/x.md
was DENY, now allow | perl -lni   -e 's/a/b/' rules/x.md
was DENY, now allow | perl -lpi.bak -e 's/a/b/' rules/x.md
was DENY, now allow | perl -xi    -e 's/a/b/' rules/x.md
was DENY, now allow | perl -Ci / -Di / -Fi / -Vi / -mi / -Mi
was DENY, now allow | sed  -li    's/a/b/' rules/x.md
```

`perl -pi`, `perl -ni`, `perl -i.bak`, `perl -Mstrict -pi` and `sed -i` are unaffected — the
regression needs a value letter *before* the `i` in the same token. `-lpi` is the one that matters:
it is the canonical perl one-liner form alongside `-pi`.

`-Fi`, `-mi` and `-Mi` are arguably right (those values are mandatory, so `i` really is part of the
value). `-l`, `-C`, `-D`, `-x`, `-V` are the wrong ones, and `-l` is the one people type.

## The closing note on `260801-1903_*_perl-include-flag-glued-to-its-value-is-misread-as-the-in-place-flag.md` is wrong on this point

> "Given up on the deny side: nothing the tools would honour — in `-Ilib` the `lib` is the include
> directory, not `-l -i -b`, so the truncation matches perl's and sed's own parsing."

It matches perl's parsing for `-Ilib`. It does not for `-lpi`, where perl reads three flags and the
classifier reads one. The give-up is larger than the note claims, and it is on the deny side.

## Where the fix belongs

`shortFlagLetters` needs two classes rather than one:

- **mandatory-value letters** — `e`, `f` (sed); `e`, `E`, `F`, `I`, `m`, `M` (perl) — consume the
  rest of the token, so truncate there as today;
- **optional-value letters** — `l`, `C`, `D`, `x`, `V` (perl); `l` (sed) — consume only their value
  characters (digits, for all the numeric ones) and the letter run continues after them.

`i` itself stays a truncating letter: its suffix is optional but it is the letter being looked for,
so stopping on it costs nothing.

**Tests.** Add to the deny side: `perl -lpi -e 's/a/b/' rules/x.md`, `perl -lpi.bak -e …
rules/x.md`. Keep `perl -Ilib rules/gen.pl` and `sed -fscript.sed rules/x.md` on the allow side —
the two false positives `18e2e4f` correctly fixed. The pair is the discriminator: one must allow and
the other must deny, and no single-set truncation can do both.

**Adjacent, pre-existing, not a regression:** `perl -0pi -e '…' rules/x.md` allows at `e31c0f3`
too. `/^-([A-Za-z]*)/` yields the empty string for `-0pi` because the digit stops the match at
position 1, so no letter is ever examined. A fix for the above should cover it; a leading digit run
is part of `-0`'s value, not the end of the flag token.

**Found by** coderev on the `e31c0f3..HEAD` review, by enumerating perl and sed short-flag clusters
and diffing each verdict against the pre-Turn-2 build.

---
Resolved: `shortFlagLetters` now takes a per-tool `ShortFlagGrammar` with two letter classes instead of one, and every letter's class was MEASURED against perl 5.34.1 and both seds rather than inferred. **Greedy** (the rest of the token is the value, so the letter run ends): perl `C D e E F I m M x`, sed `e f`, plus `i` in both — it is the letter being looked for and its suffix is free text. **Optional, restricted charset** (the value characters are skipped and the run CONTINUES): perl `l` and `0` take a digit run, `V` takes a `:configvar`; sed `l`. The discriminating pair passes in both directions: `perl -lpi -e 's/a/b/' rules/x.md` denies, `perl -Ilib script.pl` allows.

Where this issue was wrong, and it matters: it listed `C`, `D` and `x` as optional-value letters whose denies should be restored. All three are greedy — `perl -Cpi` errors with "Unknown Unicode option letter 'p'", `perl -xpi` takes `pi` as an extract directory, `perl -Dpi` takes a debug list, and none of them edits anything. Their pre-`18e2e4f` denies were false positives, not protection, so they are deliberately NOT restored. `V` was right, for a reason the issue did not give: `-V` without a colon takes no value, so `perl -Vpi` really does rewrite the file. The `-0pi` gap flagged here as pre-existing is fixed by the same change, since a leading digit run is now read as a flag value rather than as the end of the token.

`sed`'s `l` is the one letter the platforms disagree on and it is resolved toward deny: BSD `-l` takes no value, so `sed -li '' 's/a/b/' f` genuinely rewrites (measured); GNU `-l` swallows the `i` and rewrites nothing. Correct on BSD, a harmless false positive on GNU, no platform branch — the same reasoning `-i` itself already carried.

Also found, outside this issue: `perl -alib`, `-plib` and `-nlib` parse as `-a`/`-p`/`-n` plus `-l` plus `-i` with backup suffix `b`, and are real in-place rewrites that allowed in every build before this one (verified — each leaves a `.txtb` backup). They now deny.

Tests: the pair is its own named case, alongside the mandatory/optional split, the leading-digit forms, and four in-place-outside-the-tree entries added to the must-never-deny corpus so the change is pinned in the allow direction too. Docs: `rules/protected-path-discipline.md` gained "Clustered short flags are read letter by letter".
