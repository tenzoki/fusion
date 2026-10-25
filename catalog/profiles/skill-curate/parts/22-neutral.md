
```
**Mode:** apply
**Ledger:** <the run file path, workbench-relative, exactly as the survey run reported it>
**Approved:** <all, or the approved entry ids comma-separated>
```

When the user passed `--placement`, add `**Placement:** on` after the three lines, so the apply pass reads the ledger's relocation entries as asked for; without it, add nothing.

`**Approved:**` carries either the word `all` or an explicit id list, and nothing else. Do not paraphrase an approval into a sentence, do not write "everything except", and do not translate a group selection into prose — resolve the chosen groups to the ids those groups hold and pass the ids. `agents/policy-curator.md` `## Dispatch parameters` defines the refusals on the agent's side: a ledger path that does not resolve is a halt, and an id the ledger does not carry is a halt naming that id.

The apply pass re-reads from disk before touching anything, so an entry whose file moved while the approval was open is stale rather than applied — the whole before-text for most entries, and for the two edge fields the record and three preconditions, the rest of that shared line being other entries'. It is the agent's check, not this workflow's — do not attempt a verification of your own here.

## Step 7 — Report what happened

