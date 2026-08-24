#!/usr/bin/env bash
# Auth checks for the write paths. Run against a dev server:
#   ADMIN_KEY=test-key npm run dev
#   ./scripts/check-auth.sh http://localhost:3000 test-key
#
# Deliberately never sends a valid payload while a real service role key is
# configured, so it cannot write to a live database.
set -uo pipefail

BASE="${1:-http://localhost:3000}"
KEY="${2:-test-key-abc123}"
PAYLOAD='{"name":"Webhook","analogy":"a","description":"b","category_id":"backend"}'
fails=0

check() {
  local label="$1" expected="$2" got="$3"
  if [ "$expected" = "$got" ]; then
    printf 'ok   %-40s %s\n' "$label" "$got"
  else
    printf 'FAIL %-40s expected %s, got %s\n' "$label" "$expected" "$got"
    fails=$((fails + 1))
  fi
}

post() {
  local path="$1" body="$2"
  shift 2
  curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE$path" \
    -H 'Content-Type: application/json' "$@" -d "$body"
}

del() {
  local query="$1"
  shift
  curl -s -o /dev/null -w '%{http_code}' -X DELETE "$BASE/api/terms$query" "$@"
}

check "terms rejects no key"        401 "$(post /api/terms "$PAYLOAD")"
check "terms rejects wrong key"     401 "$(post /api/terms "$PAYLOAD" -H 'x-admin-key: wrong')"
check "terms rejects empty payload" 400 "$(post /api/terms '{"name":""}' -H "x-admin-key: $KEY")"
check "terms rejects bad category"  400 "$(post /api/terms '{"name":"X","analogy":"a","description":"b","category_id":"Not Kebab!"}' -H "x-admin-key: $KEY")"
check "generate rejects no key"     401 "$(post /api/generate '{"term":"webhook","existingCategories":[]}')"
check "generate rejects wrong key"  401 "$(post /api/generate '{"term":"webhook","existingCategories":[]}' -H 'x-admin-key: wrong')"
check "delete rejects no key"       401 "$(del '?id=00000000-0000-0000-0000-000000000000')"
check "delete rejects wrong key"    401 "$(del '?id=00000000-0000-0000-0000-000000000000' -H 'x-admin-key: wrong')"
check "delete rejects missing id"   400 "$(del '' -H "x-admin-key: $KEY")"
check "delete rejects malformed id" 400 "$(del '?id=all' -H "x-admin-key: $KEY")"

echo
if [ "$fails" -eq 0 ]; then
  echo "all auth checks passed"
else
  echo "$fails auth check(s) failed"
fi
exit "$fails"
