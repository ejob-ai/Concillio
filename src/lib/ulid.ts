// src/lib/ulid.ts – ULID via monotonicFactory (stable, well-tested)
import { monotonicFactory } from 'ulid'
export const ulid = monotonicFactory()
