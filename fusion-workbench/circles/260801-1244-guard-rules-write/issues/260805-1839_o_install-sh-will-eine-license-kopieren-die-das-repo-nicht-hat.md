install.sh will eine LICENSE kopieren, die das Repo nicht hat
---
`install.sh:81` führt `LICENSE` in der Kopierliste (`for item in .claude-plugin agents skills rules hooks bin stilwerk templates docs settings.json README.md README-agents.md README-hooks.md LICENSE`). Gemessen: `ls LICENSE` → „No such file or directory". Der `[ -e ]`-Guard in Z.82 schluckt das still — eine Installation bricht nicht, aber das Plugin wird ohne Lizenzdatei ausgeliefert, während der Installer eine erwartet.
---
Schweregrad: Low. Verifiziert. Entweder LICENSE ins Repo legen (dann stimmt die Liste) oder den Eintrag streichen (dann lügt die Liste nicht). Als öffentlich installierbares Projekt (`curl | bash` von GitHub) ist eine fehlende Lizenz zusätzlich ein Distributions-Thema, das der Nutzer entscheiden muss.
