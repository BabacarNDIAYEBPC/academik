#!/bin/bash
set -e
pnpm install --frozen-lockfile
# This port reuses the existing database unchanged. Its historical tables are
# intentionally retained, including tables outside the active Drizzle schema.
# Do not run an automatic schema push that could propose dropping them.
