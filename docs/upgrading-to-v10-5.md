# Upgrading to v10.5

**Nothing in your project is rewritten by this release, and there is no migration step.** One new
Setup step will ask you a question the first time it finds a difference; everything else is text
your agents read.

## The one thing that will speak to you: Setup compares your stylometric profiles

`/fusion:setup` gains **Step 0e**. It compares the four voice profiles in your workbench —
`fusion-workbench/stilwerk/{default,chat}-voice-{en,de}.yaml` — against the ones this version ships,
and asks once, in a single question covering every file that differs, whether to replace them or
keep yours.

Until now those files were copied on first setup and never looked at again. A project that had been
set up months earlier was running profiles from that month, and nothing said so.

**Why it asks rather than overwriting.** A difference has two causes and the two files alone cannot
tell them apart: the plugin moved, or you adapted the profile. So Setup now records a third input,
`fusion-workbench/.asset-provenance`, holding the checksum of each asset at the moment it was
copied. With that, "stale" and "adapted" become distinguishable.

**What to expect on your first v10.5 setup.** Your existing profiles carry no provenance line,
because nothing stamped them when they were written. Setup will notice they differ from the shipped
ones and ask. **If you have edited them, answer "keep mine".** Either answer stamps the file, which
is what stops the question coming back every session: the record says "this divergence was seen and
kept", and you are asked again only when the plugin's own copy moves.

## New: `bin/fusion-prose-metric`

Counts a file's em-dashes in its own prose voice and reports the rate against a ceiling of one per
1000 prose words. It excludes fenced blocks, inline code spans, block quotes, and the `examples:`
subtrees of a YAML profile from both the count and the word total, so a file is never charged for
the faults it exhibits on purpose.

It reports and never gates. No exit code carries a prose verdict and nothing wires it into a test
run. Read its header for usage; it is the authoritative documentation.

## The voice-profile language fallback now announces itself

When `bin/fusion-rules` cannot find the profile variant for your declared language, it falls back to
the `-en` variant. It always did. It now says so on standard error, naming the family, the variant
requested and the one resolved.

Standard output is unchanged, byte for byte. The fallback was previously indistinguishable from a
project that had declared `en` in the first place, so an agent told to record the event could not
detect it. This makes it detectable. It does not make the recording happen.

## What changed in the rules your agents read

`rules/user-facing-output.md` was rewritten in three places, and the direction is the same in all
three: a reply is bounded **as a whole**.

- **Material that will not fit is dropped, not relocated.** The section previously told a writer over
  a cap to move the excess into a trailing "Details" block, which satisfies a count without changing
  what the reader receives. Four such routes were closed.
- **The reply answers the question that was asked.** What the agent noticed alongside it is filed as
  a record, under the filing rule that already existed, and named in the reply in one line rather
  than carried in it.
- **A session summary has a total cap**, not only a cap on its header.

The two chat voice profiles gained no new entries. Two existing ones were renamed to cover what their
instructions had grown to say, one sentence moved to the entry that owns its subject, and the
pointers inside them were respelled so they resolve in a consuming project rather than only inside
the plugin's own tree.

**None of this is enforced, and no gate was added.** Whether it changes what an agent writes is
unmeasured. The before-state is on record in the plugin's own workbench: agent replies were running
at ten prose em-dashes per 1000 words against a stated ceiling of one, with 17.9 per cent of replies
over a cap loaded into the agent writing them. The after-measurement is defined and deliberately not
run, because it needs about twenty sessions whose transcripts are not primed on the subject.

## Two fixes you may have been bitten by

**The monitor's "Dismiss All" now works.** The dismissal key was interpolated into an HTML attribute
through an escaper that does not escape double quotes. Any warning whose text carried one — a JSON
fragment, a `SyntaxError`, a quoted path — truncated the key, so the dismissal was stored against a
prefix and the row returned on the next poll. The key no longer touches the markup at all.

Note what dismissal is: a per-browser "I have seen this" marker. The guard event log is append-only
evidence and is never deleted. What removes historical rows is the archive step of `/fusion:cleanup`.

**The config template no longer documents an invalid example.** `fusion.json` documents its own
setting in the file you edit, and two of its three worked shapes were not valid JSON — one used a
bare `N`, which reads like a value and produces `Unexpected token 'N'` when copied. All shipped
spellings are now either a real number, in the files you edit, or `<n>`, in prose, which no reader
mistakes for a literal.

## Nothing to do

No file in your workbench is rewritten, no marker moves, no configuration key changes meaning, and
no gate was added that can fail in your project. If you never edited your voice profiles, answer
"replace" at the one question and nothing else about this release will reach you.
