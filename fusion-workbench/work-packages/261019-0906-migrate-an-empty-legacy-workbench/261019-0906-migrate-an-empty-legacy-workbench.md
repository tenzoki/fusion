# /fusion:migrate converts a legacy workbench that holds no record

## Directive

A legacy workbench that holds no record (its `.fusion-setup` or a fusion store present, no `workbench.json`, zero record pairs) reaches JSON control through `/fusion:migrate`: the migration converts nothing, writes its receipt and the manifest, and every agent then reads the workbench as `json-control`. Reached when such a workbench, measured on the user's Prior repository, migrates without the refusal `schema-invalid/proposal-invalid: … names no record; a migration converts at least one pair` (`codec/src/migration.ts`, the plan phase's proposal check), Setup and `bin/fusion-paths` then accept it, and the codec's shared contract and fixtures say so for both hosts.

## The user's words

The user reported, from the Prior repository (previously worked with Codex), being switched to fusion: "Setup war der Meinung, dass eine Migration nötig sei. Ich habe eine Migration gestartet", which was refused with the error above while Setup kept routing to `/fusion:migrate`; the two commands together leave such a workbench with no route to JSON control. Asked how fusion should fix it, the user chose: "Die Migration akzeptiert einen leeren alten Workbench-Ordner. Sie konvertiert nichts und schreibt nur das Abschlussprotokoll und die `workbench.json`", over Setup initialising the folder directly, and asked for this work to be filed and claimed by this checkout.

## Closure

Closed `done`, outcome `completed`, on 2026-10-20 by the user's word. Commit range `9409d998..0cc9be1b` (the package filed, plan steps 1 to 8, two repairs of tests red at HEAD, the closing review, its fixes, the follow-up review and its fix). Version 13.2.0, untagged; the tag waits on nothing more under the tag decision's option 2, Prior having accepted request 71 at its `8f59121`. Requests 72 and 73 (re-pin and re-qualification) are Prior's, after the tag.

The user answered all six stop conditions as holding. Recorded beside that answer: the closing reviewer found no `workbench.json` and no `archive/migrations/` in the Prior repository on the morning of 2026-10-20, so clause 5 (the fix run there, answering `json-control`) rests on the user's word alone.

Reviews: the closing review (verdict revise, three issues, all fixed and closed) and the follow-up review (verdict revise, one low issue, fixed and closed at `0cc9be1b` with no review over that commit). The evidence bound on finish is the follow-up's, verdict revise, so a `succeeded` edge on this item stays unmet. Coverage: `0cc9be1b` and the closure commit are not in any review's declared range.
