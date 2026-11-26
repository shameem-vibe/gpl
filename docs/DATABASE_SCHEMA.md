# Firestore schema (proposal, v1)

Dates are Firestore Timestamps in the database and ISO strings at the app boundary. Money is integer BDT.

| Path | Key fields | Public read |
|---|---|---|
| `users/{uid}` | email, displayName, role, active, createdAt, createdBy, updatedAt, updatedBy, lastLoginAt. Staff only; the doc id equals the Firebase Auth uid. | own doc only (writes: server only) |
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
| `auditLogs/{id}` | actorUid, actorEmail, actorRole, action, targetType, targetId, summary, changes{field:{from,to}}, createdAt (server timestamp). Append-only. | super admin |

## Indexes
See `firebase/firestore.indexes.json` (status+startsAt for fixtures, status+publishedAt for news/videos, innings+seq for balls, actorUid+createdAt for audit logs filtered by administrator).

## Migrations
Add a `schemaVersion` field to documents whose shape changes; migrate with a one-off Admin SDK script and document it here.

## Auth identity (not in Firestore)
Firebase Auth holds credentials (hashed by Firebase; no password is ever stored by this app). The role is a signed **custom claim** `{ role }` on the Auth user, mirrored in `users/{uid}.role`. Login succeeds only when the claim and the Firestore record agree and `active` is true. The `disabled` flag on the Auth user mirrors `active == false`.

## Audit actions
`auth.login`, `auth.login_denied`, `auth.logout`, `user.create`, `user.update`, `user.role_change`, `user.deactivate`, `user.reactivate`, `user.reset_link_issued`. `changes` never contains passwords, tokens or links.

## Migration note
Phase 1 documented the audit timestamp as `at`; Phase 2 uses `createdAt`. No audit data existed before Phase 2, so no migration is needed.
