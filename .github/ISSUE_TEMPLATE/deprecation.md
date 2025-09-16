---
name: "Deprecation: Legacy Feature Cleanup"
about: Track deprecations with target date, telemetry and removal plan
title: "Deprecate <feature> & remove fallback"
labels: ["chore","deprecation"]
assignees: []
---

**Target date:** YYYY-MM-DD  
**Status:** Planned  
**Owners:** @<owner>  
**Labels:** deprecation, chore

## Background
<why>

## Goal
<what “done” means>

## Plan
1) Observation (now → <date>) – monitor telemetry/warnings
2) Removal – delete code paths + styles
3) Hard validation – QA desktop/mobile

## Telemetry
- Dev: <console/message>
- Prod: <event name / endpoint>
- Exit criteria: 0 hits during observation window

## Acceptance Criteria
- <list>

## Test Plan
- <scenarios>

## Risks & Rollback
- Risk:
- Mitigation:
- Rollback:

## Checklist
- [ ] 0 telemetry hits by <date>
- [ ] Remove legacy code path(s)
- [ ] Remove legacy styles/selectors
- [ ] Search & purge legacy hooks
- [ ] QA & deploy
