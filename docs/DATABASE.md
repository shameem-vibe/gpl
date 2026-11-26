# Firestore schema (proposal, v1)

Dates are Firestore Timestamps in the database and ISO strings at the app boundary. Money is integer BDT.

| Path | Key fields | Public read |
|---|---|---|
| `users/{uid}` | email, displayName, role, active, createdAt | own doc only |
| `seasons/{sid}` | name, year, status, isCurrent, startDate, endDate | yes |
| `seasons/{sid}/matches/{mid}` | stage, venue, startsAt, teamAId, teamBId, status, tossWinnerId, `liveState{innings,runs,wickets,legalBalls,strikerId,bowlerId,target}`, result | yes |
| `.../matches/{mid}/balls/{ballId}` | innings, seq, over, ball, batterId, bowlerId, runsOffBat, extras{type,runs}, wicket{type,playerOutId}, commentary, idempotencyKey. Append-only. | yes |
| `.../matches/{mid}/private/state` | scorer working state | no |
| `seasons/{sid}/squads/{teamId}` | playerIds, captainId, purseSpent | yes |
| `seasons/{sid}/registrations/{rid}` | player details incl. phone, status, reviewedBy | no (server only) |
| `seasons/{sid}/auctions/{aid}` | status, startsAt, basePrice, purse, squadMax, currentLotId | yes |
| `.../auctions/{aid}/lots/{lotId}` | playerId, basePrice, currentBid, leadingTeamId, status (open/sold/unsold), version | yes |
| `.../lots/{lotId}/bids/{bidId}` | teamId, amount, createdAt, by. Immutable. | yes |
| `.../auctions/{aid}/purses/{teamId}` | total, spent, remaining. Transaction-only writes. | yes |
| `teams/{tid}` | name, shortName, color, logo | yes |
| `players/{pid}` | name, role, photo, careerStats (cached). Safe fields only. | yes |
| `players/{pid}/private/profile` | phone, address, dob | no |
| `news`, `videos`, `pages` | title, body/youtubeId, status draft/published, publishedAt | published only |
| `sponsors` | name, tier, logo, url, order | yes |
| `streams/{id}` | youtubeId, matchId, isLive | yes |
| `settings/public`, `settings/private` | split so private values cannot leak | public only |
| `auditLogs/{id}` | actorUid, role, action, target, before/after summary, at | super admin |

## Indexes
See `firebase/firestore.indexes.json` (status+startsAt for fixtures, status+publishedAt for news/videos, innings+seq for balls).

## Migrations
Add a `schemaVersion` field to documents whose shape changes; migrate with a one-off Admin SDK script and document it here.
