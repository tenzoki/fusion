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
