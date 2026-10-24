
| Operation | What it does |
|---|---|
| **File** | the narrative with the user's words as the brief, then `create --kind package --origin user-request --actor user`; the instruction is the confirmation, none is asked again |
| **Claim** | `claim`: `claimed`, the claim naming this checkout |
| **Release** | `release --reason`: back to `open`, nobody working on it |
| **Take over** | `claim --take-over-from <holder> --source <JSON>`, only on the user's explicit word in this conversation naming the package, its holder and this checkout's `CHECKOUT=` as the new one, once the user says the holder is gone or has stopped writing: that is procedure, not fencing, and stops no copied identity. First `create --kind decision` in the package's container, its narrative the user's words verbatim and those three names, then its `Answered:` line, ruled by user, and `transition --to answered`; `--answer-ref` and `--source` are both `{"workbench_id":…,"record_id":…}` of that record, whose resolving is evidence, not consent. Later lines append and never restate the approval. One word per transfer; a second asks again |
| **Pause** | `transition --to paused`, which clears the claim; the narrative says what it waits for |
| **Finish** | `transition --to done --outcome` class `completed`, the value's three fields as `rules/fusion-workbench-conventions.md` `## Work packages` spells them, and `--evidence <control path>` for the closing review's evidence record whenever one exists; the claim stays to name who did the work |
| **Drop** | `transition --to dropped --outcome`, then its bound plan (`active_documents`, role `plan`) `--to closed --reason` citing the drop; the narrative says why, citing the item that replaced it or the reason |
| **Split** | one item's several jobs filed as several items; the original dropped, citing its successors |
| **Merge** | several statements of one job become one item; the others dropped, citing the survivor |

**`autonomous` is set only when the user asked for it**, in the turn of the File or the Claim: their sentence verbatim in the narrative, then `set-mode --value autonomous --source` citing it, the value as that section spells it.

**Resuming a paused item is Claim**; a pause lifted with nobody taking the item up is `transition --to open`.

**Each is confirmed for that operation, on that item, before a byte moves**, a filing by the instruction that asked for it. Under `mode` `autonomous` the claim of that item, and its finish once its plan is complete, are confirmed by the field (**Human approval rules**); the pause of the item this checkout already holds, when the user instructs it to claim another, is confirmed by that instruction, the pause note naming what the item waits for; every other operation asks as before. A confirmation the user gave for one operation is not a confirmation for the next; ask again. None of them adds a job to the store on your own initiative, which is why the bound survives them: the text a merge writes consolidates items already filed.

