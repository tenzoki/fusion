#!/bin/sh
# check-imports.sh: the adapter's import discipline, checked without Go.
#
# The sources under fusionmodule/ become packages of Prior's module under the
# prefix github.com/kai/prior/integrationbuild/fusionmodule/ (Prior answer
# 67.4). They may import github.com/kai/prior/moduleapi/v1, the standard
# library and their own packages, and nothing under Prior's internal/ or
# modules/. No go.mod, go.work, vendor directory or replace directive may exist
# anywhere under adapters/prior/. Exit 0 when every rule holds.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
src="$here/fusionmodule"
own_prefix="github.com/kai/prior/integrationbuild/fusionmodule/"
sdk="github.com/kai/prior/moduleapi/v1"
status=0

offenders=$(find "$here" \( -name go.mod -o -name go.work -o -name go.sum -o \( -type d -name vendor \) \) -print)
if [ -n "$offenders" ]; then
  echo "check-imports: forbidden module files:"
  echo "$offenders"
  status=1
fi

if grep -rn --include='*.go' -E 'github\.com/kai/prior/(internal|modules)(/|")' "$src"; then
  echo "check-imports: import under Prior's internal/ or modules/"
  status=1
fi

# Every import path of every Go file: the lines of an import block, and the
# one-line form. A path whose first segment carries a dot is not standard
# library and must be the SDK or an own package.
imports=$(find "$src" -name '*.go' -print | sort | while read -r file; do
  awk '
    /^import \(/ { block = 1; next }
    block && /^\)/ { block = 0; next }
    block && match($0, /"[^"]+"/) { print substr($0, RSTART + 1, RLENGTH - 2) }
    /^import "/ && match($0, /"[^"]+"/) { print substr($0, RSTART + 1, RLENGTH - 2) }
  ' "$file"
done | sort -u)

echo "check-imports: non-standard imports:"
for path in $imports; do
  first=${path%%/*}
  case "$first" in
    *.*) ;;
    *) continue ;;
  esac
  case "$path" in
    "$sdk") echo "  $path" ;;
    "$own_prefix"*) echo "  $path" ;;
    *) echo "  $path  <- forbidden"; status=1 ;;
  esac
done

if [ "$status" -eq 0 ]; then
  echo "check-imports: ok"
fi
exit "$status"
