# Record Prior's answer to requests 76 and 77, and build the corrected candidate it asks for

## Directive

Filed on the user's words in chat on 2026-11-04 and 2026-11-05. Asked how the Prior integration stands, the user was told that Prior had answered at `52a2703` with "corrected", and was offered three moves. The first read: "Antwort und Fehler eintragen, dann die neue Version planen (empfohlen). Den Plan legst du vor der Umsetzung noch frei." The user answered "1", then: "führe das im automodus durch".

The work: file Prior's defect D-F1 in this workbench, record the answer in `codec/fixtures/prior/REQUESTS.md` with the Prior commit that holds it, plan the corrected candidate (module fix, v3 of the frozen entry assets, new patch version, rebuild, new digest, new request), and carry that plan out.

Reached when: the answer is recorded, D-F1 is fixed in a built bundle under a new digest, and the new request stands in `REQUESTS.md` for Prior to answer. Neither a tag nor a push belongs to this work: the tag waits for Prior's answer to the new request, and the user has not asked for a push.

Source of the answer: `docs/design/fusion-entry-v2-request76-77-prior-response.md` in the Prior repository at `52a2703`.
