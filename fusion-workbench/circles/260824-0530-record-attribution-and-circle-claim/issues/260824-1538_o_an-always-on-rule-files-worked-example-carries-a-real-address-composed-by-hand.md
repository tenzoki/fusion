An always-on rule file's worked example carries a real address, composed by hand
---
`rules/decision-record-examples.md:20` now reads `**Filed by:** shaper, Kai Stalmann <kai@qantr.com>`. That file is emitted to all fifteen agents on every dispatch and ships in the plugin tarball to every consuming project. Its sibling example in `rules/circle-records.md:199` uses `ada@example.com` and `alan@example.com`. And the address is not the one `bin/fusion-identity` prints in this repository, so the value was composed rather than read, which is the one thing the rule it illustrates forbids.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range. Landed at `2b055a0` (plan step 6).

Three separate things are wrong with the one value, and each stands on its own.

**It is a real address on a shipped surface.** `bin/fusion-rules <any-agent>` emits `decision-record-examples.md` unconditionally — it is one of the five always-on files — so the maintainer's mail address is loaded into the context of every agent run of every project that installs fusion, and sits in the tarball `install.sh` downloads. Nothing in the file marks it as an example rather than as data.

**It disagrees with its own sibling.** The claim field's worked example, written four commits later in the same Circle (`rules/circle-records.md:199`), uses two fictional people at `example.com`. Two worked examples of the same new field, in two always-on rule files, take opposite conventions.

**It was composed, and the rule it demonstrates forbids composing.** Measured: `./bin/fusion-identity` in this checkout prints `PERSON=Kai Stalmann <ks@qantr.com>`, and every commit in this range is authored by `ks@qantr.com`. The example says `kai@qantr.com`. `rules/fusion-workbench-conventions.md:494` — the rule this example exists to illustrate — says of the person half: "Read it from there and nowhere else: compose no value and substitute none." So the exhibit is an instance of the fault the rule states, which is the same shape as the measurement that produced `bin/fusion-prose-metric`: a file failing the rule it teaches.

**Why the third point raises the severity of the first two.** An example is what a model copies when it cannot obtain the real thing, and it cannot obtain the real thing on any install that predates this Circle (see the sibling record filed today on `### Who filed it`). A resolvable, real-looking identity sitting in an always-on file is the value most likely to be copied into somebody else's record.

Fix direction: replace with a fictional identity at `example.com`, matching `rules/circle-records.md:199`. One line, no behaviour, no citation moves.

Adjacent: `shared/issues/260818-0715_*_four-shipped-surfaces-use-a-real-fusion-circle-directory-name-as-the-format-example.md` is the same class — a real value from this project standing as a shipped format example — on a different kind of value.
