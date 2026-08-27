The German blacklist forbids an ordinary connective where the English forbids a discourse marker

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-de.yaml:98`, `:62`, and `fusion-workbench/stilwerk/chat-voice-de.yaml` at the same lines
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2205_c_the-german-ai04-clause-reads-as-a-calque-of-the-english-one.md` (the same class, closed); `shared/issues/260822-0115_o_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` (a third instance, filed alongside this one)

---

## What is wrong

Two German entries carry wording that reads as tracked from the English rather than written as
German. The first is a substantive defect; the second is register.

### AI01's fourth example is a mistranslation that bans a working word

The two lists are positionally parallel, six items each:

    en (:92-97)                    de (:95-100)
    It's important to note         Es ist wichtig zu beachten
    Let's dive in                  Lass uns eintauchen
    The reality is                 Die Realität ist
    That said,                     Das heißt,
    In short,                      Kurz gesagt
    Essentially,                   Im Wesentlichen

`Das heißt,` is not `That said,`. It is `that is to say`, an appositive connective, and it is
one of the ordinary joints of German expository prose. The blacklist tells every agent writing
German chat to remove it. `That said,` is a discourse-shift marker whose German equivalents are
`Allerdings` or `Trotzdem`, and neither appears anywhere in the file.

So the German list drops a genuine stock phrase and adds a prohibition on a word the agents
need. It also overlaps AI05 two entries down, whose own example is `Das bedeutet, dass...`
(`:109`) and which is near-synonymous with `Das heißt` in this position. One phrase, two entries,
two different stated reasons.

**Calibration.** That `Das heißt` does not translate `That said` is checkable and checked. That
banning it costs more than it saves is this record's judgement about German register, not a
measurement, and the fixer may reasonably disagree with it while still correcting the pairing.

### C06's superlative

`stilwerk/chat-voice-de.yaml:62` reads "Den signifikantesten, präzisesten Namen wählen", against
the English "Pick the most significant, precise name" (`chat-voice-en.yaml:60`). German
`signifikant` carries the statistical sense first; for a name, German reaches for
`aussagekräftig` or `treffend`. `Den treffendsten, präzisesten Namen wählen` is the same length
and is German.

This is register, not a mistranslation, and it is lower-value than the AI01 half. It is filed in
the same record because a fixer opening the German profile for one should see the other.

## Why it matters

The chat profile is the surface that conditions every German reply fusion produces. A blacklist
entry it does not need is a sentence pattern removed from the output for no reason, and unlike a
missing entry it is invisible: nothing shows what was not written.

## What to do

For AI01, replace `Das heißt,` with a German stock phrase that is actually one. Candidates this
record does not choose between: `Allerdings,` or `Trotzdem,` if the intent is to keep the
positional pairing with `That said,`; or drop the pairing and pick the German AI tells the two
lists need not share, which is what the profile family is for. Byte-neutral either way.

For C06, `signifikantesten` to `treffendsten` is minus three bytes.

## Provenance

Both predate this Turn's range. `dce8894` edited C06's instruction and did not touch this
sentence; neither commit touched AI01. Found while reading every German entry as German prose,
which is the check `260821-2205` established for this Circle.

---
Resolved: fixed — AI01's fourth German example is Allerdings, (the discourse marker That said, pairs with) and C06 reads treffendsten; stilwerk/chat-voice-de.yaml:98, stilwerk/chat-voice-de.yaml:62, mirrored to fusion-workbench/stilwerk/
Corrected: 260824-2125 by coder — the `Resolved:` line above cites `stilwerk/chat-voice-de.yaml:98` for `Allerdings,`; at `43cdde6` and at HEAD the line is 99 (the AI02 instruction above it grew by one line in the same commit). Issue `circles/260824-1853-close-every-open-defect/issues/260824-2059_*_two-stilwerk-closure-notes-cite-a-line-one-above-the-text-they-name.md`.
