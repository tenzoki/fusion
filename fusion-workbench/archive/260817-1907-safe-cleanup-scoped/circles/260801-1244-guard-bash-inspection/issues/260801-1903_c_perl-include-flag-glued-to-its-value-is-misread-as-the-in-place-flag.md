`perl -Ilib` is misread as the in-place flag, contradicting the comment three lines above it

---

**Severity: Low.** A narrow false positive, and a docstring that says the case is handled when it
is not.

`isPerlInPlaceFlag` (`hooks/lib/bash-mutation-guard.ts:184-188`):

```ts
/** `perl -i` / `-i.bak` / `-pi`. `-I` (include path) is a different flag. */
function isPerlInPlaceFlag(flag: string): boolean {
  if (flag.startsWith("--")) return false;
  return shortFlagLetters(flag).includes("i");
}
```

`shortFlagLetters` (`:191-194`) returns the whole leading letter run, so `-Ilib` yields `"Ilib"`,
which contains a lowercase `i`. The glued include form therefore turns `perl` into a mutation and
every positional into a written target:

```
allow | "perl -Ilib script.pl"            <- allowed only because script.pl is unprotected
DENY  | "perl -Ilib rules/gen.pl"         -> rules/gen.pl
allow | "perl -I lib rules/gen.pl"        <- separated form: letters are "I", no lowercase i
```

The separated form behaves as the comment promises; the glued form, which is the more common
spelling, does not. Any `perl -I<dir>` invocation whose script or data file sits under a protected
path denies, and a `perl -Ilib "$SCRIPT"` form denies fail-closed regardless of the path.

`sed`'s sibling (`isSedInPlaceFlag`, `:179-182`) does not have the equivalent problem: no `sed`
short flag takes a glued value whose letters contain `i`.

---

**Where the fix belongs.** `shortFlagLetters` should stop at the point a value begins. For perl the
value-taking short flags with glued forms are `-I<dir>`, `-m<module>`, `-M<module>`, `-x<dir>` and
`-D<flags>`; the narrow fix is to read only the letter run *before* the first such letter, or
simply to special-case `-I`:

```ts
if (/^-[A-Za-z]*I/.test(flag) && !/^-[A-Za-z]*i/.test(flag.replace(/I.*$/, ""))) return false;
```

— which is unpleasant enough that the cleaner route is to have `shortFlagLetters` take the set of
letters that consume the rest of the token and truncate there. `perl -pi -e` and `perl -i.bak`
must both still classify as in-place.

**Tests.** `bash-mutation-guard.test.ts` currently covers `sed -i`, `sed -i.bak`, `sed -ni`,
`sed --in-place`, `perl -i`, `perl -pi` and the no-flag allow side. Add `perl -Ilib
rules/gen.pl` (allow) and `perl -Ilib -i rules/gen.pl` (deny), so the two are distinguished.

**Found by** coderev on the `17730b8..e31c0f3` review, by reading `isPerlInPlaceFlag` against its
own docstring and confirming with the compiled classifier.

---
Resolved: `shortFlagLetters` now takes the per-verb set of letters that consume the rest of the token and truncates there, keeping the stopping letter — the issue's preferred route rather than the special case. `-Ilib` reads as `I`, `-i.bak` still reads as `i`, `-pi` as `pi`. The sed sibling turned out to have the same shape after all: `sed -fscript.sed` was read as in-place through the `i` in `script`, and is fixed by the same change. Given up on the deny side: nothing the tools would honour — in `-Ilib` the `lib` is the include directory, not `-l -i -b`, so the truncation matches perl's and sed's own parsing. Discriminating cases pinned both ways, including `perl -Ilib -i rules/gen.pl` and `sed -fscript.sed -i '' rules/x.md`, which still deny.

Correction (see `260801-1955_*_value-letter-truncation-loses-the-in-place-flag-for-perl-lpi.md`): the sentence above — "nothing the tools would honour ... the truncation matches perl's and sed's own parsing" — is false, and the fix it describes was a regression on the deny side. It matches perl's parsing for `-Ilib`, where the value is mandatory and glued. It does not for `-lpi`, where `-l` takes at most an optional digit run and perl reads three flags while the truncation read one, so the canonical `perl -lpi -e` one-liner allowed. The give-up was verified against the flags the fix was written for and not against the family it changed. Superseded by the two-class `ShortFlagGrammar`, which keeps every allow claimed here and restores the denies this note gave away without noticing.
