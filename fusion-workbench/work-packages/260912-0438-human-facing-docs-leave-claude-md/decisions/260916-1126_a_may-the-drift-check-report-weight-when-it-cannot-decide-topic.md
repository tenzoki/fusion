# May the drift check report a section's weight, when "is this bound to a topic" is not decidable from what it can read?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260916-1058_*_spec-human-facing-docs-leave-claude-md.md, 260916-1126_*_implementation-human-facing-docs-leave-claude-md.md, 260916-1006_*_how-does-a-consuming-project-bring-its-claude-md-to-the-lean-convention-when-the-curator-asks-a-different-question.md, 260912-0438-human-facing-docs-leave-claude-md.md

---

## Question

C4 of the approved spec asks for a `/fusion:check` selector that "names each topic-bound
section by its heading and gives its size", and C1 anchors the criterion to a heading
precisely so that the classification is repeatable. Planning the check found that the
anchoring settles how the file is **divided** and not how a division is **judged**.

Whether a section is bound to a topic is a property of the work a reader is doing, not of
the text. `## Release process` binds only a release; `## Layout` binds some sessions and
not others, and two readers anchored to the same heading will disagree with no command to
settle it. Nothing a program can read off the file or the tree decides it. That is
`rules/critical-stance.md` §4's third case — a question undecidable from the inputs the
mechanism has — where an approximation is not a solution and the mechanism changes instead.

The choice must be made now because C4's report wording is what the selector ships, and it
cannot be written until this is answered.

## Options

1. **The check reports weight and renders no verdict about topic.** It divides the file by
   heading, prints bytes and lines per section, the file total, and marks the sections above
   a stated **reporting threshold**. It names `/fusion:curate` as what acts on a finding and
   says in its own output that the topic judgement is the reader's.
   - Pros: every figure it prints is decided rather than guessed. Reproducible across runs
     and readers. Quiet on a clean file, which the spec's constraint requires. The criterion
     stays a human test applied with C1's worked examples, which is where it is decidable.
   - Cons: re-words C4's first acceptance criterion, which says "topic-bound". And a
     threshold is a magnitude, which sits close to the "no target size" decision in C1 —
     answered by scoping it as a **reporting cut-off** that decides what the report mentions,
     never what must move.
2. **The check classifies by delegation.** A section that cites at least one path resolving
   in the tree counts as delegating; one that cites nothing holds its topic's detail.
   - Pros: decidable from the file plus the tree, and closer to the convention's signature.
   - Cons: false-positives exactly the content the convention says to keep — a three-line
     always-on rule cites nothing. Needs a size term anyway to suppress those, so it is
     option 1 with an extra input and an extra failure mode.
3. **The check asks the model to classify.** The selector's body carries the criterion in
   prose and the running agent applies it per section.
   - Pros: matches C4's wording literally.
   - Cons: not a measurement. The same file classifies differently on two runs, which is the
     property a check exists to not have. It also costs the skill-body surface far more than
     the 612 bytes it has.
4. **Drop C4.** The curator alone covers the consuming project.
   - Pros: nothing ships that cannot answer its own question.
   - Cons: overturns the ruling in `260916-1006_*_...`, where the check is the trigger and
     the curator the tool, and leaves the recurring-drift half of the work item unmet.

## Constraints

- The answer must leave the selector quiet on a clean file. A measurement that fires on its
  commonest path is one a reader learns to skip.
- It must not become a byte target on a consuming project's `CLAUDE.md`: C1 decided against
  one, and `## Out of Scope` forbids enforcing a size on a project.
- The skill-body surface has 612 bytes at `92cd2491`, so whatever is chosen has to fit a
  helper call and a reporting rule.
- `CLAUDE.md` keeps exactly one writer. Whatever this is, it reports and never edits.

## Recommendation

Option 1. It is the §4 move rather than a concession: the question the mechanism can answer
is substituted for the one it cannot, and the purpose — a project learns where its always-on
file carries its weight, and acts through the curator — is served by the answerable one. The
threshold is stated in the report so a reader can see exactly what the answer turns on, and
the report says in its own words that it renders no verdict about topic.

If this is accepted, C4's first acceptance criterion reads: *the selector names each section
carrying weight above the stated reporting threshold, by its heading, and gives its size.*
Nothing else in the spec changes.

---
Answered: this record `## Recommendation` — option 1: the check divides by heading, reports bytes and lines per section against a stated reporting threshold, and renders no verdict about topic, naming the reader and `/fusion:curate` as where the topic judgement is made. C4's first acceptance criterion reads accordingly; nothing else in the spec changes; ruled by user, Kai Stalmann <ks@qantr.com>.
