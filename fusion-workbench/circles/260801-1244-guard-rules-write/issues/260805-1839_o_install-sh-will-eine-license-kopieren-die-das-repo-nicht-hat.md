install.sh will eine LICENSE kopieren, die das Repo nicht hat
---
`install.sh:81` führt `LICENSE` in der Kopierliste (`for item in .claude-plugin agents skills rules hooks bin stilwerk templates docs settings.json README.md README-agents.md README-hooks.md LICENSE`). Gemessen: `ls LICENSE` → „No such file or directory". Der `[ -e ]`-Guard in Z.82 schluckt das still — eine Installation bricht nicht, aber das Plugin wird ohne Lizenzdatei ausgeliefert, während der Installer eine erwartet.
---
Schweregrad: Low. Verifiziert. Entweder LICENSE ins Repo legen (dann stimmt die Liste) oder den Eintrag streichen (dann lügt die Liste nicht). Als öffentlich installierbares Projekt (`curl | bash` von GitHub) ist eine fehlende Lizenz zusätzlich ein Distributions-Thema, das der Nutzer entscheiden muss.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03`, unchanged in both halves, and it has since been filed a second time.**

```
grep -n LICENSE install.sh
  83:            README.md README-agents.md README-hooks.md LICENSE; do
ls LICENSE
  → No such file or directory
```

The copy list still names `LICENSE`, the tree still has none, and the `[ -e ]` guard on the next line still swallows it silently. `install.sh` has been edited since (the copy loop lost `settings.json` on 2026-08-15 when the plugin's own permission file was deleted as inert), so this line has been read past at least once more.

**Filed twice, independently, and neither filing found the other.** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_*_the-installer-copy-list-names-a-license-file-the-tree-has-never-shipped.md` states the same defect from the same measurement, ten days later, in a different Circle. That is not a duplicate to merge away in a reconciliation pass — it is the second instance of the pattern `260817-1502` and `260816-0105` record between them, a defect cheap to rediscover and invisible to every gate. Both are cross-annotated and both stay open; whoever fixes the line closes both.

**The decision half is still the user's and is still not made.** Adding a `LICENSE` and dropping the entry are not equivalent: this is a project installed by `curl | bash` from a public GitHub tarball, so a missing licence is a distribution question and not only a stale list. No agent may answer it. What an agent may do is stop the list from claiming a file that does not exist.
