C="${TMPDIR:-/tmp}/fusion-archive-$STAMP-$SLUG"; : > "$C.candidates"; rm -f "$C.survey"
# ${TMPDIR:-/tmp} is the container's scratch, outside the capture; kept between calls: request 76, question 5
