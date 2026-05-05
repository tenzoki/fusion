# Investigator Capture Layout — TEMPLATE

> **Copy this file** to `./rules/investigator-capture-layout.md` in your project, then fill in every `<bracketed placeholder>` and remove the parts that don't apply. The `investigator` agent loads it via `bin/fusion-rules investigator` (pattern `*investigator*.md` from `./rules/`).
>
> Without a filled-in copy, the investigator cannot know where your project's evidence captures live or how to read them. Its Setup will halt and ask you to create it from this template.

---

## 1. Capture root

**Capture root directory:** `<path, e.g. captures/, evidence/, runs/, failures/>`

**Subdirectory naming convention:** `<pattern, e.g. YYMMDD-NN-<short-tag>, run-<uuid>, YYYYMMDD-HHMMSS-<topic>>`

**How a capture is created:** `<one paragraph: who/what creates a capture, when, and what triggers archival. Examples: a failed CI run, a user-reported bad output, a timed-out agent run, a manual save from the UI.>`

**What "inadequate output" means in this project:** `<one paragraph: how does a human decide that a captured run is worth investigating? Wrong answer? Missing fields? Latency? Crash? UI rendering glitch? Be concrete.>`

---

## 2. Capture sub-structure

For each capture subdirectory, the investigator should expect to find these artifacts. List the ones that apply; remove the rest.

| Artifact kind | Path inside capture | Format | What it tells the investigator |
|---|---|---|---|
| Project metadata | `<path, e.g. .meta/run.yaml or project.json>` | `<format>` | `<which run config / framework / version drove this run>` |
| Inputs | `<path, e.g. inputs/, customer/, prompt-inputs/>` | `<format>` | `<what was the AI/system asked to work with>` |
| Outputs | `<path, e.g. outputs/, generated/, results/>` | `<format>` | `<what the run produced — the thing being judged>` |
| Process logs | `<path, e.g. logs/process/>` | `<format>` | `<chronological call sequence — start here>` |
| AI / LLM transcripts | `<path, e.g. logs/ai/>` | `<format>` | `<verbatim prompt + response per call — the model's ground truth>` |
| Exception / error logs | `<path, e.g. logs/exceptions/>` | `<format>` | `<frequently decisive — read every one>` |
| Screenshots / images | `<path, e.g. screenshots/, images/>` | `<png/jpg>` | `<what kind of UI state, errors, or annotations are typically captured>` |
| Other | `<path>` | `<format>` | `<purpose>` |

---

## 3. Source-of-truth locations (outside the capture)

To trace a failure across layers, the investigator steps out of the capture and reads the system that produced it. Point at the relevant source of truth in this project:

- **Application / orchestrator code:** `<path, e.g. src/, pkg/, server/, app/>`
- **Prompt templates:** `<path, e.g. prompts/, llm/templates/, config/prompts/>`
- **Ontology / structured data:** `<path, e.g. ontology/, schemas/, data/>`
- **Normative source material** (specs, RFP, regulations, design docs the output is judged against): `<path or pointer, may be external>`
- **Logging / tracing layout** (how to interpret `logs/*` inside a capture): `<one-line summary plus pointer to docs if any>`

---

## 4. Image / screenshot conventions

If your captures contain images, describe what the investigator should expect — specific kinds make vision analysis far more effective:

- `<screenshot kind 1, e.g. "graph view: nodes and dependencies; check for missing nodes or wrong edges">`
- `<screenshot kind 2, e.g. "error toast: read the toast text verbatim and match against logs/exceptions">`
- `<screenshot kind 3, e.g. "rendered output: cross-check against the underlying YAML/JSON in outputs/">`
- `<screenshot kind 4, e.g. "user-annotated screenshot: the user may have circled or highlighted the symptom">`

If no images are typically captured, state so explicitly.

---

## 5. Investigation report tweaks (optional)

If your project wants the investigation report to use specific section names, headings, or fields beyond the agent's default template, list them here. Otherwise leave this section out.

- `<custom field name>` — `<what to put in it>`

---

## 6. Examples

Provide one or two filled-in examples — capture name and a one-line summary of what the investigator would find:

- `<capture-id>`: `<one-line summary>`
- `<capture-id>`: `<one-line summary>`

---

**Last updated:** `<YYYY-MM-DD>`
**Maintainer:** `<name or team responsible for this layout document>`
