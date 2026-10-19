# /fusion:migrate converts a legacy workbench that holds no record

## Directive

A legacy workbench that holds no record (its `.fusion-setup` or a fusion store present, no `workbench.json`, zero record pairs) reaches JSON control through `/fusion:migrate`: the migration converts nothing, writes its receipt and the manifest, and every agent then reads the workbench as `json-control`. Reached when such a workbench, measured on the user's Prior repository, migrates without the refusal `schema-invalid/proposal-invalid: … names no record; a migration converts at least one pair` (`codec/src/migration.ts`, the plan phase's proposal check), Setup and `bin/fusion-paths` then accept it, and the codec's shared contract and fixtures say so for both hosts.

## The user's words

The user reported, from the Prior repository (previously worked with Codex), being switched to fusion: "Setup war der Meinung, dass eine Migration nötig sei. Ich habe eine Migration gestartet", which was refused with the error above while Setup kept routing to `/fusion:migrate`; the two commands together leave such a workbench with no route to JSON control. Asked how fusion should fix it, the user chose: "Die Migration akzeptiert einen leeren alten Workbench-Ordner. Sie konvertiert nichts und schreibt nur das Abschlussprotokoll und die `workbench.json`", over Setup initialising the folder directly, and asked for this work to be filed and claimed by this checkout.
