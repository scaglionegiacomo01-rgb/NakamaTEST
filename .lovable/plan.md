## Scope

Large multi-feature extension. I'll group into 4 migration-backed feature blocks + UX polish, all additive (no breaking changes to current Trips/Profile/Passport/Community/Admin).

## 1. Database migration (single migration)

**New tables**
- `trip_cars` — `id, event_id, driver_user_id, departure_area, meeting_point, available_seats int, notes, timestamps`. UNIQUE(event_id, driver_user_id).
- `seat_requests` — `id, event_id, car_id (nullable for open requests), passenger_user_id, status enum(pending/accepted/rejected/cancelled), notes, timestamps`.
- `seat_seekers` — `id, event_id, user_id UNIQUE, departure_area, can_reach_meeting_point bool, notes, timestamps` (lets us show the "needs seat" list cleanly).
- `trip_chat_messages` — `id, event_id, user_id, message (1–500), created_at`. Realtime enabled.
- `crew_posts` — Looking-for-Crew posts: `id, user_id, title, destination, when_text, activity, level, departure_area, has_car bool, needs_car bool, message, status enum(open/closed), timestamps`.
- `crew_post_comments` — `id, post_id, user_id, message, created_at`.
- `trip_checkins` — `id, event_id, user_id UNIQUE per event, meeting_point_checked_in bool, destination_checked_in bool, return_checked_in bool, timestamps`.
- `notifications` — `id, user_id, type, title, message, related_event_id, read bool default false, created_at`.

**Schema additions**
- `events.tags text[] default '{}'` (First Time Friendly, Beginner Friendly, etc.).
- `events.safety_meeting_point_ok / safety_destination_ok / safety_return_ok bool default false` (organizer safety checklist).
- `event_registrations.transport_status enum('have_car_will_drive','have_car_no_drive','no_car_can_drive','no_car_need_seat')` nullable (additive to existing booleans).

**RLS (key policies)**
- `trip_cars`: SELECT for trip participants + admins; INSERT/UPDATE/DELETE own row; admins all.
- `seat_requests`: SELECT for passenger, the car's driver, and admins; INSERT by passenger (own user_id); UPDATE by passenger (cancel) / driver (accept/reject) / admins; DELETE own/admin.
- `seat_seekers`: SELECT for trip participants + admins; INSERT/UPDATE/DELETE own.
- `trip_chat_messages`: SELECT/INSERT only if user has registration row for event (pending/confirmed) OR admin. DELETE own or admin.
- `crew_posts`: SELECT all authenticated; INSERT/UPDATE/DELETE own + admin delete.
- `crew_post_comments`: SELECT all authenticated; INSERT own; DELETE own + admin.
- `trip_checkins`: SELECT for self + admins; INSERT/UPDATE own; admins can update any (manual mark).
- `notifications`: SELECT/UPDATE/DELETE own only; INSERT via SECURITY DEFINER triggers.

**Triggers**
- On `seat_requests` INSERT → notify driver. On status change → notify passenger.
- On `event_registrations` status change → notify user (extends existing admin notify).
- Reuse existing `notify_admins_on_registration`.

**Realtime**
- Add `trip_chat_messages`, `seat_requests`, `trip_cars`, `notifications` to `supabase_realtime` publication.

## 2. New routes & components

- `src/routes/crew.tsx` — Looking for Crew list + create.
- `src/routes/crew_.$id.tsx` — single post + comments.
- `src/lib/levels.ts` — detailed level descriptions (snowboard + mountain) used in profile + event create.
- `src/lib/event-tags.ts` — tag constants + styling.
- `src/components/EventTag.tsx`, `src/components/TransportStatusBadge.tsx`, `src/components/NotificationBell.tsx`.
- `src/components/trip/TripTabs.tsx` + sub-panels:
  - `OverviewPanel` (description, safety message, tags, sticky join)
  - `WhosGoingPanel` (avatars/rank/level/transport)
  - `CarpoolPanel` (drivers, requests, seekers, totals)
  - `TripChatPanel` (realtime chat)
  - `SafetyPanel` (admin-only checklist + mark completed; public safety message visible to all)

## 3. Edited routes

- `src/routes/trips_.$id.tsx` — refactor into tabbed layout using new components; keep existing join flow but extend join dialog with transport-status radio + conditional car/seeker fields and the "seats include gear" disclaimer.
- `src/routes/passport.tsx` — add Seasonal Wrapped block (current season stats: trips, unique destinations, most visited, first/latest, primary activity, rank progress already there).
- `src/routes/profile.tsx` — show detailed level descriptions + honesty disclaimer in level selectors.
- `src/routes/admin.events.$id.tsx` — add carpool admin view (assign passengers, see unassigned), safety checklist, checkins overview, tags editor.
- `src/routes/admin.tsx` — keep notifications; tag editing happens in event detail.
- `src/components/Layout.tsx` — add "Crew" nav link + `NotificationBell` for logged-in users.
- `src/components/EventCard.tsx` — render tags.

## 4. Notifications

- `NotificationBell` polls `notifications` table (10s) + realtime subscribe; dropdown with unread badge, mark-as-read on click, "mark all read".
- Email scaffolding: out of scope (no SMTP wired); types and table support future delivery.

## 5. Trip-page structure (per UX requirement)

```text
[Hero: title, destination, date, tags]
[Sticky Join button on mobile]
Tabs: Overview | Who's Going | Carpool | Trip Chat | Safety
```

Each tab is a self-contained panel; mobile renders as a horizontal scroll tab bar.

## 6. Explicitly out of scope

- Real email sending.
- External sharing of Wrapped image.
- Push notifications.
- Map tiles (Passport keeps current placeholder map).
- Complex matching algorithm.

## 7. Test order after ship

1. Create an event as admin, add tags.
2. Sign in as 2 users — one joins as driver (offers seats), one as seeker.
3. Seeker requests seat → driver accepts → both see notifications.
4. Both post in Trip Chat (verify only registered users can see).
5. Post in Looking for Crew, comment.
6. Admin runs safety checklist → mark trip completed → Passport updates for confirmed users.
7. Verify Community + existing Profile/Passport untouched.
