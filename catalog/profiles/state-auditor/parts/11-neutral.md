
Build a master list of the claimed statuses read.

### Step 2: Verify against ground truth

Apply the verification protocol named for the active domain (see Domain Parameter above). The bullets below describe the `code` protocol verbatim; the `data` notes follow it.

**`code` protocol** — for each plan phase and issue, verify the claimed state against reality:

- **Code changes:** Do the files exist? Do they contain the described changes? Use `grep`, `read`, `glob` — not assumptions.
- **Schema changes:** Check the schema/loader files named in CLAUDE.md or its equivalent (e.g. `types.<ext>`, `loader.<ext>`, plus their tests) for struct fields, type tags, and test coverage.
- **Script existence:** Check the project's scripts directory (see CLAUDE.md — common locations: `scripts/`, `tools/`, `bin/`, or under the source root) for claimed scripts.
- **Config/data files:** Check the project's data and configuration directories (see CLAUDE.md — common locations: `ontology/`, `data/`, `schemas/`, `manifests/`, `config/`, `normative/`) for claimed reorganizations, new files, format changes.
- **Tests:** Do tests exist? Do they pass? Run the project's test command (see CLAUDE.md) if scope warrants it.
- **Git history:** `git log --all --oneline --grep="keyword"` to find when changes landed (or didn't).

**`data` protocol** — schema and validator focus:

- Run the project's schema validators (named in CLAUDE.md). Note pass/fail per file.
- Check cross-file references in the ontology / data layer: term mappings, manifest cross-refs, inverse-relation pairs.
- Verify manifest consistency — required fields populated, schema authority cross-references resolve.
- For each plan claim about data shape, grep the data file and verify directly.
- No code-test runs are required unless a data change is gated by code validation.

### Step 2.5: Three-edge Coherence audit result

This step runs **regardless of domain**. The three-edge result is the Coherence Review check — layered on top of whichever ground-truth verification protocol the domain selected in Step 2.

