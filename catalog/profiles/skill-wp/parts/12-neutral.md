
Only where the user's own words ask for `autonomous`, and after `exit=0`: keep their sentence verbatim in the directive, since the mode cites the record as their word, then:

```bash
H="$(shasum -a 256 "$WORKBENCH/$N" | cut -d' ' -f1)"
