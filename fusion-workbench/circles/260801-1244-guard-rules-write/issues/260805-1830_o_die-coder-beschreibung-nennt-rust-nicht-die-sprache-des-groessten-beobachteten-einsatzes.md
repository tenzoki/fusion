Die coder-Beschreibung nennt Rust nicht, die Sprache des größten beobachteten Einsatzes

---

`agents/coder.md` und `README-agents.md` beschreiben den coder mit "(Go, TypeScript, React, Python)" und einer Besitzliste `.go`, `.ts`, `.tsx`, `.py`, `.js`. Rust kommt in beiden Dateien nicht vor (`grep -n "Rust" agents/coder.md README-agents.md` ist leer). Das aktivste beobachtete Konsumprojekt (krk) ist ein Rust/Cargo-Workspace, in dem der coder mit 37 von 80 Dispatches der meistgenutzte Agent ist.

---

Praktisch funktioniert der Einsatz, weil die Sprachliste beschreibend und nicht einschränkend wirkt. Eine Beschreibung, die die Hauptsprache des Haupteinsatzes auslässt, kann aber Dispatch-Entscheidungen des Orchestrators und die Selbstverortung des Agenten verzerren (etwa bei der Abgrenzung coder/ontocoder für `Cargo.toml`, das als TOML formal in ontocoders Besitzliste fällt, faktisch aber Build-Manifest des coders ist). Kleine Textänderung: Rust und `.rs` in Beschreibung und Besitzliste aufnehmen, die Manifest-Abgrenzung (`Cargo.toml` beim coder, analog zu Makefiles) klarstellen.

Quelle: Analyse `analyses/260805-1830-zweck-nutzung-und-stand-des-plugins.md`, Befund 1.
