#!/bin/sh
# fusion-module: the launcher Prior starts as the bundle's `executable`,
# shipped at bin/fusion-module (Prior answer 67.9).
#
# Prior starts it with exactly two environment variables and no PATH, so
# nothing here is looked up through PATH: /usr/bin/uname is called by absolute
# path and everything else is a shell builtin (case, cd, pwd, test, exec).
# The host pair /usr/bin/uname -s -m reports is mapped to one of the three
# shipped binaries, resolved relative to this file's own absolute location,
# and exec'd with the environment preserved. Any other pair fails. Nothing is
# written to stdout, which is the protocol stream: the module handshake is the
# first byte the host reads.
#
# Exit 4: unsupported host, or the binary for it is missing from the payload.
unset CDPATH
case $0 in
  */*) dir=${0%/*} ;;
  *) dir=. ;;
esac
dir=$(cd "$dir" && pwd -P) || { echo "fusion-module: cannot resolve the launcher directory of $0" >&2; exit 4; }
host=$(/usr/bin/uname -s -m) || { echo "fusion-module: /usr/bin/uname -s -m failed" >&2; exit 4; }
case $host in
  "Darwin arm64") target=darwin-arm64 ;;
  "Linux x86_64") target=linux-amd64 ;;
  "Linux aarch64") target=linux-arm64 ;;
  *) echo "fusion-module: no binary for host '$host'" >&2; exit 4 ;;
esac
binary="$dir/$target/fusion-module"
[ -x "$binary" ] || { echo "fusion-module: $binary is missing or not executable" >&2; exit 4; }
exec "$binary"
