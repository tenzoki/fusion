# Bound how long an executor runs before returning to the orchestrator

**Domain:** code
**Filed by:** user (hand-written, 260811-0826_*_observations.md), split out by playmaker 260814-1733
**Related:** `260812-0303-simplify-speed-and-why-rules-do-not-hold.md`, `260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`

The user's own proposed fix, written in the original dump as the one line marked off with arrows:
"Memory muss bei jedem Request mitgesendet werden. Die Agenten dürfen keine langen Operationen
ausführen ohne zu Fusion zurückzukehren." It was proposed against a diagnosis stated beside it —
that the orchestrator's instructions to sub-agents are often wrong because rules and Circle goals are
loaded once and a sub-agent then works for 30 to 200 minutes and forgets them — and against the
closing question of the same dump, how to make the loops running inside the models shorter so agents
do not derail.

The idea has two halves and the analysis on disk splits them. The bounded-dispatch half is adopted
on cost grounds, at roughly a fourfold saving in re-sent tokens. The re-injection half is refuted by
the same analysis, which finds that the rules did not decay over a long dispatch but were never in
force in the first place. Shaping this therefore means putting a Directive narrower than the filed
wording to the user and getting agreement on the narrowing.

Split from `260811-0826_*_observations.md`.
