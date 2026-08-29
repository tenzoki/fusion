Three skill bodies embed German user-facing text while skill bodies are an English surface

---
`rules/fusion-workbench-conventions.md` `## Project language` lists skill bodies under
**Exempt surfaces — English in every project, whatever either line says**, because they ship to
consuming projects of every language. `skills/next/SKILL.md`, `skills/direct/SKILL.md` and
`skills/seed-from-plane/SKILL.md` each embed German user-facing prose directly as the text to print.

---
**The distinction the rule turns on.** A skill body may *specify* what a prompt says and leave the
rendering to the project's chat language. What it may not do is ship one project's language as the
literal. The three bodies above do the second: a consuming project whose chat language is `en` gets
German gate prompts out of the box.

**Found while writing `skills/curate/SKILL.md`** (plan step 3 of Circle `260801-1244-curator`, on
2026-08-14). That body specifies its prompts in English and states that they render in the project's
chat language. The three older bodies read as the house convention until the rule is opened, which
is how the inconsistency propagates: the next skill author copies the nearest example.

**Not fixed here**, because all three files are outside the step's scope and the change is editorial
across three bodies rather than mechanical.

**Worth deciding rather than assuming.** Whether the German is a violation or a deliberate exception
for skills only this project runs is not recorded anywhere. If it is deliberate, the exempt-surfaces
list should say so; if it is not, the three bodies need the treatment `skills/curate/SKILL.md` got.
Either way the current state teaches the wrong pattern.

**Filed in the shared store** rather than in the Circle, per the Origin Rule: found next to this
Circle's work, not caused by its Directive.

**Filed by:** orchestrator, session `260813-2345-orchestrator-session.md`.

---
**Resolved:** 2026-08-16. It is a violation, not a deliberate exception — the exempt-surfaces
list stands unchanged and the bodies were brought to it. Five files carried German
user-facing literals, not three: the record's `next` and `direct` were right,
`seed-from-plane` has since left the plugin with the Plane mirror, and the survey added
`migrate` (~26 operator strings and four counter names), `setup` (three operator strings
and the pre-v4 refusal) and `archive` (three option labels sitting under a line that
already said to render in the project's language). Each now specifies its prompts in
English and states that they render in the project's chat language, per the shape
`skills/curate/SKILL.md` set. The two specimens labelled "German shape:" were converted
rather than kept under criterion 1's illustration clause, so the rule is now checkable by
grep over `skills/*/SKILL.md`. `skills/memo/SKILL.md`'s German strings stay: they are input
patterns the skill recognises, never text it prints. History:
`260816-0031-coder-german-literals-out-of-skill-bodies.md`.
