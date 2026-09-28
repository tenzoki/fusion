# P-9: the `stilwerk/` profiles, shipped and workbench copies

**Agent:** ontocoder
**Source:** `260824-1905_*_plan-close-every-open-defect.md`, step 9; triage rows 94, 97, 98, 100, 187, 188
**Status:** Complete

## What changed

Eight files: the four shipped profiles under `stilwerk/` and their four copies under `fusion-workbench/stilwerk/`, each pair byte-identical (`diff -q` prints nothing for all four).

- **94** (German files name an en dash): both German AI02 instructions now read `Gedankenstriche (Geviertstrich, U+2014)`; every AI02 example in both German files exhibits U+2014. No U+2013 remains anywhere in either German file.
- **97** (three German names for the referent): C02 is `Bezugswort statt nacktem Kürzel`, its instruction says `mit ihrem Bezugswort nennen`, AI05 already said `Bezugswort`. One term.
- **98** (AI04 denotes two rules): the tricolon rule in `default-voice-en.yaml` and `default-voice-de.yaml` is `AI12`, the first id free across all four files. `AI04` now names the chat enumeration rule alone. No file outside `stilwerk/` cites the long-form id; the records that cite `AI04` name their file, so none is broken.
- **100** (calque in the German blacklist): AI01's fourth example is `Allerdings,` (the pairing with `That said,` kept); C06 reads `treffendsten`.
- **187** (ungated citation): the C04 cap pointer in both chat profiles names "the rule on user-facing output, section Length" in prose, with no `.md` path and no `##` heading token. The two pre-existing bare `user-facing-output.md` mentions (header comment, C05) were not the record's subject and stand.
- **188** (the sketch lost its demonstration): both AI02 sketches use the `rules/user-facing-output.md:29` form, naming the mark: `(a clause, an em-dash, a jargon aside, another em-dash, a compressed reason)`.

## One deviation from the triage note, and why

Row 94 reads "U+2014 at the instruction, the sketch and the second example". Printing `(—)` in a German instruction line would be a counted prose em-dash, and both German files sit under 1000 prose words (599 and 977, permit 0), so `bin/fusion-prose-metric` would go red and the step's own acceptance would fail. The character is therefore *named* (`Geviertstrich, U+2014`), and the sketch names the mark rather than using it, which is what row 188 asks for anyway. The examples carry the literal U+2014, since `examples:` subtrees are outside the count.

## Records closed

Six `_o_` to `_c_`, each with a `Resolved: fixed` note citing the profile lines: `shared/issues/260821-2206_c_*`, `260822-0115_c_*`, `260822-0118_c_*`, `260822-0120_c_*`, and `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0146_c_*`, `260821-0147_c_*`.

## Verification

- `cd hooks && npx vitest run lib/__tests__/rules-voice-profile.test.ts`: exit 0, 18 tests.
- `ruby -ryaml -e 'YAML.safe_load(File.read(ARGV[0]))'` over all eight files: each parses.
- `bin/fusion-prose-metric stilwerk/*.yaml`: exit 0, every row `ok` (default-voice-en keeps its one permitted em-dash at `(—)`, 1014 words).
- `grep -c '–'` over the two German files: 0 and 0.
- `diff -q` for the four pairs: nothing printed.

Not committed; the orchestrator stages the fourteen paths.
