Die coder-Beschreibung nennt Rust nicht, die Sprache des größten beobachteten Einsatzes

---

`agents/coder.md` und `README-agents.md` beschreiben den coder mit "(Go, TypeScript, React, Python)" und einer Besitzliste `.go`, `.ts`, `.tsx`, `.py`, `.js`. Rust kommt in beiden Dateien nicht vor (`grep -n "Rust" agents/coder.md README-agents.md` ist leer). Das aktivste beobachtete Konsumprojekt (krk) ist ein Rust/Cargo-Workspace, in dem der coder mit 37 von 80 Dispatches der meistgenutzte Agent ist.

---

Praktisch funktioniert der Einsatz, weil die Sprachliste beschreibend und nicht einschränkend wirkt. Eine Beschreibung, die die Hauptsprache des Haupteinsatzes auslässt, kann aber Dispatch-Entscheidungen des Orchestrators und die Selbstverortung des Agenten verzerren (etwa bei der Abgrenzung coder/ontocoder für `Cargo.toml`, das als TOML formal in ontocoders Besitzliste fällt, faktisch aber Build-Manifest des coders ist). Kleine Textänderung: Rust und `.rs` in Beschreibung und Besitzliste aufnehmen, die Manifest-Abgrenzung (`Cargo.toml` beim coder, analog zu Makefiles) klarstellen.

Quelle: Analyse `analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 1.

---
Resolved: Rust is in the routing metadata now, and the `Cargo.toml` boundary is settled explicitly (260811). This note is written in English because the artifact language declared in `CLAUDE.md` is `en`; the record above predates that and is not translated.

`agents/coder.md:2` names Go, Rust, TypeScript, React, Python and Java, owns `.go`, `.rs`, `.ts`, `.tsx`, `.py`, `.js`, `.java` plus the build manifests `Makefile`, `go.mod`, `package.json` and `Cargo.toml`, and excludes from the ontocoder's share only those `.toml` files that are not build manifests. The description and the Scope list at `:19-20` therefore agree inside the one file, which is what the record said they no longer did.

`agents/coder.md` `## Scope` carries the boundary in plain words: `Cargo.toml` is the coder's for the same reason `Makefile`, `go.mod` and `package.json` are, decided by the file's role in the build rather than by its extension, exactly as `tsconfig.json` was already decided in `agents/orchestrator.md` `## Agent Routing Table`. A `.toml` under an ontology, manifest or schema directory stays the ontocoder's.

`README-agents.md:27` lists `.rs`, `.java` and the build manifests including `Cargo.toml`. The ontocoder row at `:28` had to be qualified in the same edit, because it claimed `.toml` unconditionally and the two rows would otherwise have contradicted each other.

Verified: `claude plugin validate .` passes with only the pre-existing CLAUDE.md warning, the frontmatter parses with the keys `name` and `description`, and the description value contains no `: ` sequence, so the plain scalar is safe.

Left open and filed separately: the routing table at `agents/orchestrator.md:346` lists the build manifests without `Cargo.toml`. That is a gap rather than a contradiction, because the ontocoder row restricts its `.toml` to ontology, manifest and schema directories and the table's tiebreaker points at the coder. The file was outside this task's file set, so the proposal lives in `shared/issues/260811-1301_o_the-orchestrators-routing-table-omits-cargo-toml-from-the-build-manifests.md`.
