#!/usr/bin/env bash
set -euo pipefail

FILE="backend/src/services/delivery.service.ts"

if [[ ! -f "$FILE" ]]; then
  echo "ERROR: $FILE not found."
  echo "Run this script from the RouteWell project root."
  exit 1
fi

cp "$FILE" "${FILE}.before-delivery-status-fix"

python3 - <<'PY'
from pathlib import Path

path = Path("backend/src/services/delivery.service.ts")
text = path.read_text()

old = '''    if (![DeliveryStatus.PENDING, DeliveryStatus.CANCELLED].includes(current.status)) {
      throw new ApiError(
        409,
        "Only pending or cancelled deliveries can be deleted",
        "DELIVERY_DELETE_BLOCKED"
      );
    }'''

new = '''    const canDelete =
      current.status === DeliveryStatus.PENDING ||
      current.status === DeliveryStatus.CANCELLED;

    if (!canDelete) {
      throw new ApiError(
        409,
        "Only pending or cancelled deliveries can be deleted",
        "DELIVERY_DELETE_BLOCKED"
      );
    }'''

if new in text:
    print("Delivery status fix is already applied.")
elif old in text:
    path.write_text(text.replace(old, new, 1))
    print("Patched backend/src/services/delivery.service.ts successfully.")
else:
    raise SystemExit(
        "Expected code block was not found. "
        "Your local file differs from the RouteWell build being patched."
    )
PY

echo
echo "Verification:"
grep -n -A12 -B3 "const canDelete" "$FILE"

echo
echo "Next command:"
echo "docker compose --progress=plain build backend"
