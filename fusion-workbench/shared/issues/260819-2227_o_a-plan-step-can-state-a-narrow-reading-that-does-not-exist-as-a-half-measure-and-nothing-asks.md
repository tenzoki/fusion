A plan step can state a narrow reading that does not exist as a half-measure, and nothing asks whether it does

---

**Reported from a consuming project, not measured here.** An orchestrator in another project relayed
this to fusion's author on 2026-08-19; the quotation below is that report. Nothing in it was verified
against that project's tree by this workbench, and it is filed as a defect in **fusion's planner
contract** rather than as a defect in the consumer's code.

---

## What was reported

A plan carried an entry whose stated reading was deliberately narrow: a board view would simply show
the placements the store already holds. The coder did not implement it, and its reasoning is the
finding:

> Diese Lesart gibt es nicht als Halbmaß. Eine Kachel, deren Element-Id der Plan nicht führt, wird von
> jeder dahinterliegenden Fläche abgewiesen. Der Berater bekäme also 28 Kacheln, die er sieht und weder
> öffnen noch füllen noch verschieben noch löschen kann — und Eintrag 17 verlangt ausdrücklich, dass der
> Inhalt erreichbar ist. Erreichbar wird er nur durch einen Schreibvorgang, und welcher das sein soll,
> ist genau die ungeklärte Frage.

The executor filed a decision record with three options and a recommendation, and **did not act on it**.
The reporting orchestrator's own comment on that: *"Das ist die Stelle, an der heute schon zweimal
jemand stillschweigend entschieden hat und es beide Male falsch war."*

## What is fusion's defect in this

**`agents/planner.md` asks a plan whether its load-bearing question is decidable. It does not ask
whether the step's stated reading exists as an implementable half-measure.** Those are different
questions, and the second one has no home:

- The `**Decidability:**` line (`rules/critical-stance.md` §4) asks whether a *mechanism* can answer the
  question it is built on. Here the mechanism was fine; what did not exist was the intermediate state
  the step described.
- `## Where this Circle stops` states where work ends. It says nothing about whether each step's own
  endpoint is a state the artifact can occupy.
- Nothing else in the plan output format touches it.

A step that names a narrow reading is normally a good thing — it is how scope gets bounded. The failure
mode is narrower than "the plan was wrong": the reading satisfies the step's own words, and the state it
produces is one the product cannot be in. Twenty-eight tiles that are visible and inert satisfy "show the
placements the store holds" exactly.

The cost is asymmetric, which is why it is worth a record. A step whose narrow reading is impossible is
caught at implementation, by an executor willing to stop — and this one was. A step whose narrow reading
is merely *bad* ships.

## What is not being claimed

That the executor was wrong to stop. It was right, and the report says so; this record exists because
being right required an executor to notice something the plan format never asked about.

That fusion should add a checker. Whether a described intermediate state is occupiable is not decidable
from a plan's text — it depends on what every surface behind the change rejects — and this repository has
deleted two mechanisms that tried to decide such questions from text. The candidate remedy is a question
in the plan format, answered by whoever writes the plan and read by whoever approves it, in the shape the
`**Decidability:**` line already uses: put the question where somebody looks rather than build a checker
for it.

## A second observation from the same report, recorded but not filed separately

The executor ran **seven mutations, each observed individually** — including an invented tier value and
swapping the two title sources — and put the evidence in its report rather than asserting that its tests
were sound. Its stated reason: *"In diesem Baum sind Zusicherungen wiederholt aus dem falschen Grund grün
gewesen."*

That is the same practice this Circle applied to its own work today, twice, and both times it changed what
was known: a gate demonstrated failing on the assertion it should, and a test case demonstrated failing at
the expected line rather than by crashing. No agent prompt asks for it. Whether it should be asked for is a
decision, not a defect, and it is not filed here.

---

**Filed by** the orchestrator of session `260819-2006`, from a user-relayed consumer report. No Circle
caused it — the active Circle's Directive is about unobserved failure in fusion's own mechanisms, not about
the planner contract — so it goes to the shared store under the Origin Rule.
