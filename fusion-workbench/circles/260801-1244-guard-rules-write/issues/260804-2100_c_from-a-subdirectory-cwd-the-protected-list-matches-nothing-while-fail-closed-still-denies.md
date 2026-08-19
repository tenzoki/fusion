# From a subdirectory working directory the protected list matches nothing, while the fail-closed rule still denies

---

**Severity:** Low
**Domain:** code
**Filed by:** coder, during Step 5 of the C5b remediation plan
**Affects:** `hooks/lib/project-relative.ts` (`projectRelative`), `hooks/guard.ts` (the `!isFusionPluginCwd()` gate on the Bash mutation policy), `rules/protected-path-discipline.md`
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1604_c_the-self-protection-floor-is-matched-cwd-relative-while-the-file-is-read-root-relative.md` (closed; states this degradation for `rules/**` and calls it arguably correct, and labels its own reachability *inference, not measured*),
`circles/260801-1244-guard-rules-write/planning/260804-1633_o_plan-c5b-remediation-and-ship.md` Step 1

---

## What is wrong

Two things, and the second is the one worth fixing.

**The measurement `260804-1604` did not have.** That record's reachability section says: *"Inference, not measured against a real Claude Code session: the trigger is a session whose working directory is a subdirectory of a fusion-set-up project. I did not verify how Claude Code sets the hook's working directory beyond the harness."* This session is that measurement. Its working directory is `<project>/fusion-workbench`, one level below the project root, and from there the whole relative half of `guard.protectedPaths` matches nothing in the real project. The trigger is not hypothetical and it is not exotic: it is where this session was started.

**The asymmetry that is not in any record.** From that same working directory, a literal write to a genuinely protected path is *allowed*, while an operand the classifier cannot resolve is *denied* fail-closed. The two halves of one policy disagree about whether the policy applies at all. An agent meets a deny whose reason ends "STOP and ask the user" for a scratch-file copy, one command after a `mv` into the project's real `rules/` went through unremarked.

## Measured

Three calls, this session, through the real hook (`hooks/dist/guard.js`, the artifact `hooks/hooks.json` executes), cwd `/Users/k1/Projects/productive/fusion/fusion-workbench`:

```
cd <project> && cp bin/monitor "$SP/monitor.orig"     DENIED  fail-closed, unresolvable operand
cd <project> && mv rules/no-such-file-zzz-probe.md /tmp/   ALLOWED (ran; failed ENOENT)
cd <project> && mv /tmp/no-such-zzz-probe rules/           ALLOWED (ran; failed ENOENT)
Edit bin/monitor                                       ALLOWED
```

Rows 2 and 3 name a protected pattern (`rules/**`) and a protected-ancestor destination; row 4 names `bin/monitor`, which is on the list literally. Both `mv` rows executed rather than being denied, which is the guard's verdict and not the shell's — a denied command never runs at all, and these reported the shell's own `ENOENT`.

## The chain, stated as reasoning rather than as a second measurement

The Bash mutation policy is gated on `!isFusionPluginCwd()`, which reads `process.cwd()`. Row 1 was denied *by that policy's own fail-closed branch*, so the classifier ran, so the gate was open, so the guard does not consider itself in the plugin's repository — correct, because its working directory is `fusion-workbench/`, which holds no `.claude-plugin/plugin.json`. The policy is therefore fully active. `projectRelative(filePath, cwd)` then anchors every pattern at that same working directory, so `/…/fusion/rules/x` lands outside it and comes back as an absolute path, which no relative pattern can match. Rows 2, 3 and 4 follow. **This is inference from the four measured verdicts plus the code, not an instrumented read of the hook's working directory.**

## Why this is not simply `260804-1604` again

`260804-1604` closed the floor's half and argued the rest away in one sentence: *"`rules/**` degrades the same way from a subdirectory, and for `rules/**` that is arguably correct: `sub/rules/` genuinely is a different directory from `project/rules/`, and the protected list is documented as project-relative."* That argument stands on its own terms, and this record does not reopen it.

What the argument does not cover is fail-closed. Fail-closed is not project-relative — it fires on the *shape* of an operand, before any question of which directory it names. So in exactly the configuration where the list protects nothing, the policy is at its most obstructive. An agent that meets that deny reads the rule file, finds "the whole check stands down in the fusion plugin's own repository", sees its own project untouched by the list, and has no account of what it just met. `rules/protected-path-discipline.md` names precisely that outcome as the failure it exists to prevent.

## Suggested direction

Not "widen the matching to the project root" — that is a security-policy change, it would newly deny, and the spec authorises one floor entry rather than a re-anchoring. Two smaller shapes, both cheap:

1. **Scope fail-closed to the coordinate space the list can reach.** When an operand resolves outside the working directory and the effective list holds no absolute pattern that could match it, the unresolved-operand deny is protecting nothing and could allow. This narrows a deny and so needs the same "nothing newly allows" measurement in the other direction.
2. **Say it in the deny reason and in the residual list.** Cheapest, and it discharges the agent-facing half on its own: the rule file's `## Where this check does not reach` gains an entry stating that the patterns are matched against the session's working directory, so a session started below the project root protects only what the floor names, and that fail-closed still applies there.

Option 2 is the one to take if only one is taken. The defect that costs is an agent working around an unexplained deny, not the deny itself.

---

**Step 3 disposition (coder, 2026-08-05) — branches A and B TOGETHER. STAYS `_o_`.**

This is the finding the plan's first falsification test was written for, and it does not
fit one branch. It is A and B at once: a delivered sentence is false **because** the
classifier's coordinate space is not the one the sentence claims, so correcting the
sentence and writing the residual are one act. Reported as a gap in the rule rather than
pressed into either branch.

**Verified independently before being classified**, as the dispatch required. This record's
measurement was taken through the live hook in one session; I re-measured through the
classifier itself, with the shipped protected list and two working directories, and hit one
trap worth recording: **`hooks/dist` is stale at this commit**, and against it every row
below allows, including the controls. Measured against the TypeScript source built fresh
into a scratch directory, cwd `<project>/fusion-workbench`:

```
rm <project>/rules/x.md                  allow    (DENY from the project root)
mv <project>/rules/x.md /tmp/            allow    (DENY from the project root)
cd <project> && mv /tmp/y rules/         allow    (DENY from the project root)
cd <project> && cp bin/monitor "$SP/x"   DENY     fail-closed, from BOTH directories
rm rules/x.md                            DENY     → a `rules/` under the SESSION's cwd
```

`projectRelative("<project>/rules/x.md", "<project>/fusion-workbench")` returns the
absolute path, and no relative pattern can match one. The last row is the shape of the
whole finding: the guard protects a `rules/` that need not exist and does not protect the
one that does. Confirmed as filed, including the asymmetry.

**Branch A, done.** `rules/protected-path-discipline.md` said "The patterns are
**project-relative**: in a consuming project `rules/**` means that project's own `rules/`
directory, not the plugin's." That is false whenever the session did not start at the root.
The paragraph now says the patterns are matched against the session's working directory,
describes both configurations, carries the measured pair, and closes with the sentence that
discharges the agent-facing half: an allow in that configuration is not a permission, and
writing a protected path because the guard happened to let you is the thing this rule
forbids.

**Branch B, done.** The forensics catalogue gains an entry — one of the two new ones that
open it — carrying the measurement, the `260804-1604` argument this record explicitly does
not reopen, and why that argument does not cover fail-closed.

**Why it stays `_o_`.** Both directions in § Suggested direction are behaviour: scoping
fail-closed to the coordinate space the list can reach, and saying it in the deny reason.
Neither is this step's, and the second is the one this record calls cheapest and most
valuable. What is discharged is the documentation half, in the file every agent loads. The
deny an agent actually meets still does not explain itself.

---

**Reconciliation 260807-1515 (reconciler, Domain `code`) — bleibt `_o_`, und die verbleibende Hälfte wiegt jetzt schwerer als vorher.**

Der Befund hatte zwei Hälften. Die zweite ist verschwunden, die erste ist geblieben und trägt seit v6.0.0 den gesamten Schutz.

**Verschwunden:** „while the fail-closed rule still denies". Die Fail-Closed-Regel war Teil des Erkenners in `hooks/lib/bash-mutation-guard.ts`, gelöscht mit `ba7ccda`. Auf der Shell verweigert vor der Ausführung nichts mehr. Der `!isFusionPluginCwd()`-Gate auf der Bash-Mutations-Politik, den der Kopf unter `**Affects:**` nennt, ist mit derselben Politik entfallen.

**Geblieben, und am Baum nachgeprüft gegen HEAD `e684eae`:** die Schutzliste wird weiterhin gegen cwd aufgelöst, und jetzt an der Stelle, an der der Schutz tatsächlich stattfindet.

- `hooks/guard.ts:501` — `saveSnapshot(takeSnapshot(process.cwd(), config.guard.protectedPaths))`.
- `hooks/tracker.ts:272-275` — `const root = process.cwd(); takeSnapshot(root, config.guard.protectedPaths)`.
- `enumerateProtected` (`hooks/lib/protected-snapshot.ts:198-223`) läuft von genau dieser Wurzel und prüft die Muster gegen wurzel-relative Pfade.

Das heißt: läuft der Hook mit cwd in einem Unterverzeichnis, findet die Aufzählung unter `rules/**` nichts, der Fingerabdruck ist leer, die Differenz ist leer, und es wird nichts zurückgeschrieben. Vorher fiel dieselbe Schwäche wenigstens noch auf die Fail-Closed-Seite zurück und verweigerte; jetzt fällt sie auf gar nichts zurück.

**Die Konfiguration läuft dabei aufwärts, die Messung nicht.** `hooks/lib/escalation.ts` und `hooks/lib/events.ts` importieren beide `findWorkbenchRoot` und finden die Workbench durch Aufwärtslaufen; `guard.ts` und `tracker.ts` benutzen für die Messwurzel `process.cwd()` ohne Aufwärtslauf. Die Asymmetrie ist die eigentliche Ursache und sie ist an einer Stelle behebbar.

**Ehrlich zum Beweisstand:** dass die Aufzählung aus einem Unterverzeichnis leer bleibt, ist aus dem Quelltext **abgeleitet** und nicht gemessen. Der Befund selbst hat seine Erreichbarkeit schon als „inference, not measured" ausgewiesen, und das gilt unverändert. Gesucht und nicht gefunden: kein Fall unter `hooks/lib/__tests__/protected-snapshot*.ts` startet aus einem Unterverzeichnis. Der einzige Unterverzeichnis-Block der Suite, `guard-rules-write-integration.test.ts:1389` („the self-protection floor reached from a subdirectory"), prüft die Konfigurationsauflösung über `findWorkbenchRoot` und ausdrücklich nicht die Messung.

**Zu tun wäre**, in dieser Reihenfolge: den Fall einmal messen (Hook aus `sub/` gegen ein Projekt mit `rules/**` in der Schutzliste), und dann entscheiden, ob die Messwurzel auf `findWorkbenchRoot` umzieht.

---

**Messung 260807-1601 (coder) — beides erledigt, der Befund bleibt `_o_` mit deutlich engerem Rest.**

Beide Schritte der obigen Reihenfolge sind gegangen. Die Ableitung stimmte.

**Gemessen, vor jeder Korrektur**, durch die echten Hooks als Unterprozesse gegen ein echtes
Fremdprojekt, cwd `<projekt>/sub`, mit der ausgelieferten Schutzliste
(`hooks/lib/__tests__/protected-snapshot-subdirectory.test.ts`, in seiner ersten Fassung):

```
/bin/sh schreibt <projekt>/rules/x.md      Datei bleibt verändert. Kein Rollback,
                                           kein Halt, kein guard_block, kein Satz
                                           an das Modell.
Fingerabdruck vor dem Aufruf               cwd: <projekt>/sub, kein Eintrag für
                                           rules/x.md; settings.json und
                                           .claude-plugin/plugin.json beide ABSENT.
Zustandsschreibung                         landete in <projekt>/fusion-workbench/,
                                           nicht in sub/ — die Konfiguration lief
                                           also aufwärts, die Messung nicht.

/bin/sh schreibt <projekt>/sub/rules/y.md  ZURÜCKGESCHRIEBEN und Halt, obwohl der
                                           Pfad auf der Schutzliste des Projekts
                                           unter keiner Schreibweise steht.
```

Das ist **Ausgang 2**, und die zweite Zeile ist die eigentliche Pointe: es fehlt nicht nur
etwas, es geschieht auch etwas Falsches an seiner Stelle. Der Guard schützte ein `rules/`, das
es nicht geben muss, und ließ das ungeschützt, das es gibt — genau die Form, die die Disposition
vom 2026-08-05 schon aus dem gelöschten Klassifizierer kannte.

**Korrigiert.** Die Messwurzel ist `measurementRoot()` in `hooks/lib/protected-snapshot.ts`, und
das ist `findWorkbenchRoot()` — dieselbe Wurzel, die die Konfiguration schon benutzte. `guard.ts`
und `tracker.ts` lesen beide von dort statt von `process.cwd()`.

**Die Stilllegung musste mitziehen, und das war kein Nebenaspekt.** `isFusionPluginCwd()` prüft
cwd ohne Aufwärtslauf und antwortet aus `<fusion-repo>/fusion-workbench` mit *nein* — dem
Verzeichnis, in dem eine fusion-Sitzung gewöhnlich startet. Wäre nur die Messwurzel
aufwärtsgezogen worden, hätte der Guard ab sofort die `rules/`- und `agents/`-Bearbeitungen
eines fusion-Entwicklers zurückgeschrieben: ein neuer Defekt im Tausch gegen den geschlossenen.
`isFusionPluginRoot(dir)` ist die parametrisierte Form, `measurementRoot()` wertet sie an der
Messwurzel aus, und der dritte Fall der Testdatei misst das statt es anzunehmen.

**Warum der Befund `_o_` bleibt.** Der Rest ist echt, gemessen, und steht in derselben Datei,
die dieser Kopf unter `**Affects:**` nennt. `hooks/lib/project-relative.ts` (`projectRelative`)
löst die Pfade der **Vorab-Verweigerung** der Schreibwerkzeuge weiterhin gegen `process.cwd()`
auf. Gemessen:

```
Edit <projekt>/rules/x.md aus <projekt>/sub    pre: {} — erlaubt, die Sperre sieht ihn nicht
                                               danach: zurückgeschrieben + Halt durch die Messung
```

Der Schutz ist also gleich, die Warnung kommt später: aus der Wurzel bekommt ein Agent ein
sauberes „verweigert" *vor* dem Schreiben, aus einem Unterverzeichnis schreibt er, es wird
zurückgerollt und der Guard hält an. Bewusst nicht angefasst — das wäre eine Änderung auf der
Verweigerungsseite, und die Datei ist ohnehin gedeckt. Als vierter Fall der Testdatei
festgehalten, damit der Satz gemessen ist und nicht geraten.

Beide Klauseln des Titels sind damit falsch geworden — Fail-Closed gibt es nicht mehr, und die
Schutzliste greift wieder. Was den Befund offen hält, ist einzig die verbliebene
Koordinaten-Asymmetrie auf der Vorab-Sperre.

**Textschicht nachgezogen:** `rules/protected-path-discipline.md` benannte das Koordinatensystem
gar nicht und trug seine Vollständigkeitsaussage damit auf einer stillschweigenden Annahme.
Der Abschnitt `## The rule` sagt jetzt, dass die Muster gegen die Projektwurzel gelesen werden,
in beide Richtungen, und dass das gemessen ist.

---

**Sichtbarkeit 260807-1626 (coder) — der Rest ist unverändert, aber nicht mehr still. BLEIBT `_o_`.**

Der Auslöser war eine Nutzeranforderung im Chat, nicht dieser Befund: „aus einem
Unterverzeichnis zu starten macht keinen Sinn, eine deutliche Warnung wäre hilfreich."

`hooks/session-start.ts` warnt seit heute bei SessionStart als `systemMessage`, sobald
`findWorkbenchRoot()` eine Wurzel **oberhalb** des Arbeitsverzeichnisses findet statt an ihm,
und nennt beide Verzeichnisse. Kein Workbench oberhalb, oder Start an der Wurzel: still.
Sechs Fälle in `hooks/lib/__tests__/session-start-subdirectory.test.ts`, jeder ein echter
Unterprozess; falsifiziert.

**Was das an diesem Befund ändert: nichts am Verhalten.** `hooks/lib/project-relative.ts`
löst die Pfade der Vorab-Verweigerung weiterhin gegen `process.cwd()` auf, genau wie in der
Messung vom 260807-1601 festgehalten. Der Befund bleibt offen und behält seinen Rest.

**Was es ändert: die Erreichbarkeit der Bedingung für den Menschen.** Die Auslösebedingung
dieses Befunds — Sitzung unterhalb der Projektwurzel — war bisher von außen nicht erkennbar;
diese Sitzung selbst lief in `<repo>/fusion-workbench` und hätte es nur durch Nachrechnen
gemerkt. Jetzt steht sie auf dem ersten Bildschirm.

**Warum eine Warnung und nicht die Reparatur.** Dieselbe Annahme tragen mindestens vier
Stellen (die Vorab-Sperre hier, `isFusionPluginCwd()`, `bin/fusion-plugin-cwd` und darüber
`bin/fusion-rules`/`bin/fusion-paths`). Vier getrennte Aufwärtsläufe wären vier Sonderfälle
mit vier Gelegenheiten, sich zu widersprechen. Die Warnung ersetzt keinen davon; sie macht
die geteilte Annahme an der einen Stelle hörbar, an der das Arbeitsverzeichnis noch billig zu
ändern ist. Die Entscheidung, ob die Vorab-Sperre selbst aufwärtsläuft, steht weiterhin aus
und ist das, was diesen Befund offen hält.

Sitzungsprotokoll:
`circles/260807-0923-guard-misst-statt-orakelt/history/260807-1626-sessionstart-warnt-bei-start-unterhalb-der-projektwurzel.md`

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED. The subject is gone, and every one of the three surfaces this record kept alive was deleted rather than corrected.**

Measured at HEAD `e435f03` (v10.3.0), not read off the record:

```
ls hooks/lib/bash-mutation-guard.ts   → No such file or directory
ls hooks/lib/project-relative.ts      → No such file or directory
ls hooks/lib/protected-snapshot.ts    → No such file or directory
```

The record's title names two clauses and both were already false at the last pass; what kept it `_o_` was the residual named in the 260807-1626 note — *`hooks/lib/project-relative.ts` (`projectRelative`) still resolves the write tools' pre-deny paths against `process.cwd()`*. That file no longer exists. There is no pre-deny: `hooks/guard.ts` is 223 lines, holds no `permissionDecision`, no `"deny"` and no `hookSpecificOutput`, and every path through it writes `{}`.

Three removals took it, in this order, and none of them was aimed at this record:

1. **2026-08-12** — the protected-path half of the guard: the write-tool deny, the before/after fingerprint, the write-back, `guard.protectedPaths` and `rules/protected-path-discipline.md`. That took `protected-snapshot.ts` and the measurement root this record's 260807-1601 note had just moved to `findWorkbenchRoot()`. Plan: `shared/planning/260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`.
2. **2026-08-16** — the guard's last verdict, the halt, the escalation module, and with them `isFusionPluginCwd()`, the second of the four cwd-anchored resolutions this record's 260807-1626 note enumerated. Circle: `circles/260816-1741-guard-becomes-observation-only`.
3. The same release deleted `hooks/lib/project-relative.ts`, the residual itself.

**What survives, and it is not this record's.** `bin/fusion-plugin-cwd` is the one cwd-anchored implementation left, and the SessionStart warning added on 2026-08-05 by the 260807-1626 note is still there and still fires — `hooks/session-start.ts` warns whenever a workbench root is found above the working directory. The warning outlived every mechanism it was a warning about. That is a fact about the tree, not an open defect, and `CLAUDE.md` `## Where to look when something breaks` carries it under the *"SessionStart prints restart this session at the project root"* row.

**Closed as moot rather than as fixed, and the distinction is recorded because it matters to a reader.** Nobody decided the coordinate-space asymmetry; the code that could exhibit it was removed for other reasons. `CLAUDE.md` states exactly this of this record by name — *"The issue that tracked the first, `260804-2100_*_…`, is moot rather than fixed."* If a future change reintroduces a path check that resolves against `process.cwd()`, this record is the measurement to read first: the asymmetry was never argued away, only outlived.

---
Resolved: the subject was deleted in three steps — the protected-path half of the guard on 2026-08-12 (`hooks/lib/protected-snapshot.ts`), the guard's last verdict and `isFusionPluginCwd()` on 2026-08-16, and `hooks/lib/project-relative.ts` with them. At HEAD `e435f03` none of the three files exists, `hooks/guard.ts` reaches no verdict on any path, and neither clause of the title nor the residual that kept the record open has anything left to hold. Moot rather than fixed.
