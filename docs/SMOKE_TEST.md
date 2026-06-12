# Smoke test checklist

Run after major changes or before deploy.

## Test selection

- [ ] Random test starts with expected question count
- [ ] Recommended training starts and varies between runs
- [ ] Topic training respects topic/filter
- [ ] Exam simulation starts with timer and navigator
- [ ] Excluded questions (`is_active = false`) never appear in new tests

## Scoring and submit

- [ ] Correct answer scores +1 net
- [ ] Wrong answer scores −⅓ net
- [ ] Blank scores 0
- [ ] Double-click submit does not duplicate attempts
- [ ] Reloading results page after submit shows same scores

## Resume and drafts

- [ ] In-progress test resumes with saved answers
- [ ] Discard removes in-progress session
- [ ] Autosave survives brief navigation away
- [ ] Offline banner appears when network is disabled

## User filtering

- [ ] Profile A history does not show Profile B sessions
- [ ] Dashboard metrics change per profile
- [ ] Export Markdown reflects current profile only

## History and export

- [ ] History paginates beyond 20 sessions
- [ ] Weekly report export downloads `.md`
- [ ] Errors-by-topic export includes answer text and source metadata
- [ ] Export preview contains no UUIDs or internal ids

## Data quality (admin)

- [ ] Audit lists issues without deleting content
- [ ] Mark reviewed persists
- [ ] Exclude from tests sets `is_active = false`

## Automated tests

```bash
npm test
```

Covers normalization, similarity, scoring, and bucket selection helpers.
