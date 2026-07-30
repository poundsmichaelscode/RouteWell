import { openapi } from "../docs/openapi";

const requiredFields = ["openapi", "info", "paths"] as const;
for (const field of requiredFields) {
  if (!(field in openapi)) {
    throw new Error(`OpenAPI document is missing required field: ${field}`);
  }
}

if (Object.keys(openapi.paths ?? {}).length === 0) {
  throw new Error("OpenAPI document must expose at least one API path");
}

console.log(`OpenAPI document is valid enough for publication (${Object.keys(openapi.paths ?? {}).length} paths).`);
