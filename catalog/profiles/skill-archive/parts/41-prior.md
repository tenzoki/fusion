C="${TMPDIR:-/tmp}/fusion-archive-$STAMP-$SLUG"; : > "$C.candidates"; node -e 'require("fs").rmSync(process.argv[1],{force:true})' "$C.survey"
# ${TMPDIR:-/tmp} is the container's scratch, outside what the host integrates: it persists between this run's calls and is gone at its end (Prior 08c57fb; request 76, question 5)
