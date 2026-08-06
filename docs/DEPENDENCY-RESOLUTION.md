# Dependency resolution correction

This release corrects the first-run `make lock` failure reported with npm 11 on Node 24.

## Corrections

- Added `@testing-library/dom` because React Testing Library 16 declares it as a peer dependency.
- Added `react-is` at the exact React version because Recharts declares `react-is` as a peer and requires it to match React.
- Updated `typescript-eslint` to `8.65.0` for the TypeScript 5.9 backend toolchain.
- Improved `generate-lockfiles.sh` so backend and frontend resolution are reported independently.
- Partial lockfiles are deleted after a failed resolver run.
- Resolver output is saved temporarily as `<workspace>/npm-lock.log` and summarized on failure.

## Run

```bash
rm -f backend/package-lock.json frontend/package-lock.json
make lock
```

A successful run creates both lockfiles and deletes the temporary resolver logs.
