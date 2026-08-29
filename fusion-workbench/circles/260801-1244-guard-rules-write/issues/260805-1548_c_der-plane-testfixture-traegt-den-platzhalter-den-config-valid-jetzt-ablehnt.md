Das Plane-Testfixture trägt den Platzhalter, den config_valid jetzt ablehnt

---

**Für: ontocoder** (das Fixture ist eine `.yaml`; `coder` fasst es nach seiner
Scope-Regel nicht an).

`hooks/lib/__tests__/fixtures/plane/workbench/plane.config.yaml` setzt
`project_id: "00000000-0000-0000-0000-000000000000"` — dieselbe Null-UUID, mit der
`templates/plane.config.yaml` ausliefert. Seit `config_valid` in `bin/fusion-plane` die
Auslieferungswerte der Vorlage als unausgefüllt zurückweist (Befund
`260805-1548_*_config-valid-verspricht-non-placeholder-ish-und-prueft-nur-auf-nicht-leere.md`)
ist das Fixture aus Sicht des Helfers eine unausgefüllte Konfiguration.

Vier Tests, die den Live-Pfad gegen einen garantiert unerreichbaren Host fahren, kippten
dadurch von Exit 10 (deferred) auf Exit 1 (config error) — sie erreichten das Verhalten,
das sie prüfen sollen, gar nicht mehr:

- `seed --plan: absent key / unreachable Plane defers with the manual-paste fallback`
- `map --forget / --prune: C4 — --prune deletes NOTHING when Plane cannot be reached`
- `push (live): an unreachable Plane defers to the outbox and exits 10, never crashes`
- `push --plan: spec-comment — C4 gate on + unreachable host still defers`

---

**Zwischenlösung, die zu ersetzen ist.** `freshWorkbench()` in
`hooks/lib/__tests__/fusion-plane.test.ts` schreibt das Feld in der tmp-Kopie auf
`11111111-2222-3333-4444-555555555555` um, bevor ein Test läuft. Die Suite ist damit
grün, aber die Umschreibung steht an der falschen Stelle: das Fixture soll eine
kohärente, ausgefüllte Konfiguration sein, nicht eine, die jeder Aufrufer erst reparieren
muss.

**Was zu tun ist.** In
`hooks/lib/__tests__/fixtures/plane/workbench/plane.config.yaml` die eine Zeile
`project_id` auf eine UUID setzen, die nicht die Null-UUID ist, und danach die
Umschreibung samt ihrem Kommentar aus `freshWorkbench()` entfernen (der Kommentar dort
verweist auf diesen Befund).

Randbedingungen, geprüft:

- Kein Test liest den Wert. Er fliesst nur in `BASE` ein, das ausschliesslich für
  Netzaufrufe gebraucht wird; der Dry-Run-Pfad macht keine.
- `base_url: "https://plane.example.test"` und `workspace_slug: "demo-ws"` des Fixtures
  sind bereits verschieden von den Auslieferungswerten der Vorlage und können bleiben.
- Der UUID-Lint in `fusion-plane.test.ts` liest `bin/fusion-plane`, nicht das Fixture —
  eine neue UUID im Fixture löst ihn nicht aus.

---

**Herkunft.** Entstanden bei der Behebung von
`260805-1548_*_config-valid-verspricht-non-placeholder-ish-und-prueft-nur-auf-nicht-leere.md`
in dieser Charge, nicht extern gemeldet.

---
Resolved: 2026-08-06 (reconciler, workbench-wide pass) — der Test-Harness kopiert das Fixture und schreibt `project_id` auf einen ausgefüllten Wert um (`hooks/lib/__tests__/fusion-plane.test.ts:78-98`, Commit `1babb48`); das committete Fixture behält absichtlich den Auslieferungswert. Die vier Live-Pfad-Tests erreichen wieder den Deferred-Vertrag (Exit 10); Suite 1611/1611 grün an HEAD `cde5319`.
