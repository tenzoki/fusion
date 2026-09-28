Zwei Fehlalarme des Klassifizierers in der Sitzung, die ihn abschafft
---
Der Guard hat am 260807 zwei Befehle des Orchestrators blockiert, beide harmlos, beide auf
Buchführungspfaden innerhalb von `fusion-workbench/`. Sie sind hier festgehalten, weil sie die
Fehlalarm-Zählung des beobachteten Konsumprojekts (17 in vier Tagen, 0 echte Treffer) um zwei
Fälle aus einer anderen Ursache-Klasse ergänzen und damit die Directive dieses Circles stützen.
---
**Fall 1: Zeilenumbrüche eines Heredoc-Körpers als Segmenttrenner.**

Der Befehl hängte per `cat >> datei <<'EOF'` einen Textblock an einen Circle-Datensatz und
benannte die Datei anschließend um. Der Heredoc-Delimiter war einfach gequotet, der Körper also
inerte Daten. Der Klassifizierer las die Zeilenumbrüche im Körper dennoch als Segmenttrenner,
verlor dadurch das vorangegangene `cd` und verweigerte das `mv` fail-closed mit der Begründung,
es könne den relativen Pfad nicht verorten.

**Fall 2: Ein Pfeil in einem JSON-String als Ausgabeumleitung.**

Der Befehl schrieb vier Ereigniszeilen per `echo` in
`fusion-workbench/orchestrator-events.jsonl`. Eine der Zeilen enthielt im JSON-Wert die
Zeichenfolge `_t_->_s_` als Beschreibung eines Markerwechsels. Der Klassifizierer las das
Größer-Zeichen als Redirection und meldete, das Segment schreibe eine Datei namens `_s_`. Der
Span stand in doppelten Anführungszeichen, enthielt aber eine Variablenexpansion, und nach der
geltenden Regel bleibt ein solcher Span Code statt Text.

**Warum beide hierher gehören und nicht in den abgelösten Circle.**

Die 17 gemessenen Fehlalarme des Konsumprojekts gehören sämtlich zur Klasse des unauflösbaren
Operanden, die der abgelöste Circle ausdrücklich nicht anfasste. Diese zwei gehören zu zwei
weiteren Klassen: Datenregionen, die als Code gelesen werden, und Text, der als Syntax gelesen
wird. Sie zeigen, dass die Fehlalarm-Fläche breiter ist als die eine dokumentierte Klasse, und
sie sind unabhängig von der Erreichbarkeits-Frage, an der der Vorgänger-Circle arbeitete.

**Erledigung.** Beide erlöschen mit dem Rückbau, weil es dann kein Vorher-Urteil mehr gibt. Sie
sind kein eigener Arbeitsschritt. Wenn der Rückbau steht, wird dieser Befund geschlossen und
zitiert dabei den Commit, der den Klassifizierer entfernt.

**Umgehung während der Sitzung:** absolute Pfade statt `cd` plus relativem Pfad, und der Verzicht
auf den Pfeil im Beschreibungstext. Beides sind die Auswege, die die Verweigerungsmeldung selbst
nennt, kein Umgehen der Policy.

---
Resolved: Der beschriebene Code existiert nicht mehr, und mit ihm das Vorher-Urteil, das fehlalarmieren konnte. `ba7ccda` hat `hooks/lib/bash-mutation-guard.ts` und `hooks/lib/shell-reach.ts` gelöscht, den `classifyBashMutation`-Aufruf samt beider Rückrufe aus `hooks/guard.ts` entfernt und `hooks/lib/shell-parse.ts` auf das zurückgeschnitten, was die Branch-Politik braucht; `436d78c` hat die zugehörige Testsuite und die Textschicht nachgezogen. Am Baum nachgeprüft am 260807-1202: `classifyBashMutation` und `parseCommand` sind in `hooks/lib/shell-parse.ts` und `hooks/lib/command-word.ts` nicht mehr vorhanden, `hooks/dist/guard.js` importiert den Klassifizierer nicht mehr, und der PreToolUse-Hook fällt auf der Shell kein Schreiburteil mehr.

Beide Fallklassen des Befunds sind damit gegenstandslos, nicht nur behoben: Fall 1 (Zeilenumbrüche eines gequoteten Heredoc-Körpers als Segmenttrenner) und Fall 2 (ein Pfeil in einem JSON-String als Ausgabeumleitung) waren Lesefehler an der Frage "welche Datei schreibt dieser Befehl gleich". Diese Frage wird nicht mehr gestellt. Die Messung vergleicht zwei Fingerabdrücke der geschützten Pfade und fragt den Befehlstext gar nicht mehr, weshalb weder ein Heredoc-Körper noch ein Größer-Zeichen in einem String sie erreichen kann. Die in der Sitzung genutzten Auswege (absolute Pfade statt `cd`, Verzicht auf den Pfeil im Beschreibungstext) werden nicht mehr gebraucht.
