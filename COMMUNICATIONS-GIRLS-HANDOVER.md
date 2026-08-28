# The Girls Trip Guide — Communications & Email Handover

## Purpose
This document records the conversion of The Boys Trip Guide communications system
into the Girls Trip Guide voice and character system. The Supabase queue and Girls
worker are now connected with Girls-only statuses. Production delivery remains
deliberately paused until `thegirlstripguide.com` is verified in Resend; see
`GIRLS-BACKEND-RELEASE-STATUS.md`.

## What was reviewed on the Boys build
The Boys implementation has four distinct layers:

1. **Journey / trigger system** — T01–T39, covering trip creation, invites, missing details, payments, bookings, countdowns, departure, gallery nudges, expenses, return home and closure.
2. **Voice system** — Coach, Freddy, Mickey and Charlie each have their own version of every T01–T39 message.
3. **Delivery controls** — essential vs optional messages, quiet hours, optional-message rate limiting, retries, idempotency and Free-vs-paid gating.
4. **Email presentation** — Resend delivery, named senders, character imagery, branded HTML, trip details and a single action CTA.

The Girls version should keep the operational logic because it is sound, while changing the personality, copy and visual identity.

---

## Character mapping

| Boys | Girls | Function |
|---|---|---|
| Coach | **Grace — The Boss** | Important organisation, authoritative updates, final briefing, departure, closure |
| Freddy | **Ava — The Organised One** | Missing details, bookings, passport checks, expense completeness, checklists |
| Charlie | **Lola — The Chaos Agent** | Countdowns, lighter nudges, gallery/media prompts, energy and post-trip uploads |
| Mickey | **Seb — The Hammer** | Payment escalation, ignored reminders, overdue tasks, outstanding balances |
| Leave it to Coach | **Leave it to Grace** | Recommended automatic routing to the right GALS character |

The system should default to **Leave it to Grace**. Users may later be allowed to pick one fixed voice, but the automatic mode is the product's strongest expression because the right character appears at the right moment.

---

## Tone rules

### Grace
Calm, controlled and authoritative. Dry rather than loud. She should sound like the person who has already decided what sensible looks like.

Avoid: aggression, shouting, faux gangster language.

### Ava
Specific, practical and lightly exasperated. She notices the missing field, the unchecked booking and the thing everybody assumed somebody else had done.

Useful recurring traits: “I checked”, lists, exactness, dislike of unnecessary voice notes.

### Lola
Playful and socially observant. Best for anticipation, photos, memories and lighter prompts. She makes the trip feel alive without making the product childish.

Avoid: random chaos for its own sake.

### Seb
Sharp, polished and amused. He handles money and ignored reminders. Firm but never threatening. His humour should make non-payment feel socially awkward rather than unsafe.

Avoid: intimidation, violence, coercive language.

---

## Free vs Full communications

### Free Trip
Free remains genuinely useful. It should receive neutral, product-branded operational email rather than character-led GALS messages.

Allowed neutral messages:
- T03 Trip invitation
- T06 Joined the trip
- T11 Payment request
- F01 Group still missing
- F02 Booking details missing
- F03 Payment due
- F04 Seven days to go
- F05 Final check
- F06 Expense incomplete
- F07 Money still unsettled

Sender: **The Girls Trip Guide <trips@thegirlstripguide.com>**

### Full Trip — £24.99 one-off
Adds the character-led communication layer plus the richer media experience. The trip's operational features remain the same; the communications become personality-led.

Recommended sender identities:
- **Grace <grace@thegirlstripguide.com>**
- **Ava <ava@thegirlstripguide.com>**
- **Lola <lola@thegirlstripguide.com>**
- **Seb <seb@thegirlstripguide.com>**

These aliases require domain/Resend configuration before they can send.

---

## Trigger routing — automatic mode

- T01 Grace — Trip saved
- T02 Grace — Nobody invited
- T03 Grace — Invitation issued
- T04 Ava — Invitation unopened
- T05 Ava — Invitation unanswered
- T06 Grace — Member accepts
- T07 Ava — Attendance overview
- T08 Ava — Required detail missing
- T09 Ava — Passport confirmation missing
- T10 Ava — Booking incomplete
- T11 Grace — Payment request
- T12 Ava — Payment approaching
- T13 Ava — Payment overdue
- T14 **Seb** — Final payment escalation
- T15 Grace — Booking published
- T16 Grace — Itinerary changed
- T17 **Ava** — Partial-group booking
- T18 Lola — 30-day countdown
- T19 Lola — 14-day countdown
- T20 Grace — Seven-day readiness
- T21 Lola — 72-hour countdown
- T22 Grace — Final briefing
- T23 Grace — Departure day
- T24 Lola — Arrival
- T25 Lola — First evening
- T26 Lola — Quiet gallery
- T27 Lola — Morning-after prompt
- T28 Lola — Upload milestone
- T29 Lola — New destination
- T30 Ava — Incomplete expense
- T31 Lola — Final night
- T32 Grace — Return home
- T33 Lola — Final uploads
- T34 **Seb** — Outstanding expenses
- T35 Lola — Three-day upload reminder
- T36 Lola — Seven-day final call
- T37 Grace — Completion summary
- T38 Grace — Ready to close
- T39 Grace — Formal closure

Two deliberate consistency decisions differ from inconsistencies found in the Boys code:
- **T17 belongs to Ava** because partial-group booking detail is an organisation/detail problem.
- **T34 belongs to Seb** because outstanding balances are explicitly his role.

---

## Delivery rules to preserve

These are good product safeguards in the Boys implementation and should be retained:

- Optional quiet hours: **22:00–09:00 in the trip timezone**.
- Essential operational emails may still be sent when necessary.
- Optional communications: maximum roughly **one every 20 hours**.
- If rate-limited, hold and reschedule rather than discard.
- Duplicate trigger cooldown: **48 hours**.
- Maximum delivery attempts: **3** before manual attention / failure state.
- Use idempotency keys for provider sends.
- Free trips must cancel/not enqueue paid-only GALS communications.
- Optional categories may be muted: countdowns, gallery/media nudges, post-trip uploads, upload celebrations, expense nudges.
- Important operational messages stay enabled.

---

## Timing model to retain

- T18 — 30 days before departure, 10:00
- T19 — 14 days before departure, 10:00
- T20 — 7 days before departure, 10:00
- T21 — 3 days before departure, 10:00
- T22 — 1 day before departure, 10:00
- T23 — departure day, 07:00
- T24 — arrival day, 15:00
- T25 — arrival day, 19:00
- T27 — next day, 10:00
- T31 — final day, 18:00
- T32 — day after return, 10:00
- T33 — day after return, 17:00
- T35 — 3 days after return, 17:00
- T36 — 7 days after return, 17:00
- T37 — 7 days after return, 10:00
- T39 — 14 days after return, 10:00

Dynamic triggers still fire from real events: invites, responses, missing information, booking changes, payment deadlines, passport state, gallery inactivity, media milestones and incomplete expenses.

---

## Email design conversion

### Boys pattern worth keeping
The Boys email is structurally sound:
1. branded header
2. character image on paid communication
3. character name + large trigger title
4. recipient greeting
5. short message
6. trip name, dates and destination
7. one obvious CTA
8. privacy/trip footer

### Girls styling
- Background: near black `#070507` / `#0b070a`
- Main accent: hot pink `#ff4fa3`
- Secondary pink: `#ff82c0`
- White/off-white text
- Use the approved Girls Trip Guide logo
- Avoid cream/gold Boys styling
- Character image should feel editorial and confident, not like a pasted-on avatar
- One CTA only per operational email
- Subject format can remain: **`{trigger title} · {trip name}`**

Logo URL:
`https://thegirlstripguide.com/assets/images/girls-trip-guide-logo.png`

Current portrait URLs:
- `https://thegirlstripguide.com/assets/images/grace.png`
- `https://thegirlstripguide.com/assets/images/ava.png`
- `https://thegirlstripguide.com/assets/images/lola.png`
- `https://thegirlstripguide.com/assets/images/seb.png`

Recommended footer line:
**Private trip communication. No feeds. No followers. No archaeology through the group chat.**

---

## Full Trip invite email

The paid invitation should come from Grace. It should not simply replace “Coach” with “Grace”.

Recommended structure:

**Sender:** Grace <grace@thegirlstripguide.com>

**Subject:** You’re invited · {Trip Name}

**Eyebrow:** GRACE · THE BOSS

**Headline:** You’re in the group. Now make it official.

**Greeting:** Hey {First name},

**Body:**
You’ve been invited to the trip. Open it, confirm you’re in and have a look at the actual plan before the group chat develops another version of events.

**Trip panel:**
{Trip Name}
{Dates} · {Destination}
Private invite code

**CTA:** JOIN THE TRIP →

Alternative headline if a little more bite is wanted:
**You’ve been invited. Try not to overthink it.**

### Free invite
The Free version remains neutral and should come from The Girls Trip Guide rather than impersonating a GALS character.

---

## Important technical issue found in Boys — do not copy it

The Boys browser has a complete 39-message library for every character. However, the current server delivery layer can choose a different sender from `character_mode` while still using the base trigger's message copy.

That means a user can theoretically receive an email visually/from one character while the wording belongs to another character's default route.

**Girls implementation must resolve these as one atomic decision:**

```text
actualCharacter = selected fixed voice OR automatic route
message = VOICE_LIBRARY[actualCharacter][trigger]
sender = EMAIL_IDENTITIES[actualCharacter]
portrait = EMAIL_IDENTITIES[actualCharacter].portrait
```

Never resolve sender and copy independently.

This is why `communications-girls-voices.js` contains a full T01–T39 voice matrix for Grace, Ava, Lola and Seb.

---

## Files added in this conversion

### `communications-girls.js`
Canonical character profiles, automatic trigger routing, baseline Girls copy, Free messages, sender identities, essential/optional policy and timing reference.

### `communications-girls-voices.js`
Complete 39-trigger message set for **each** of Grace, Ava, Lola and Seb. This supports both automatic routing and a future fixed-character preference without voice mismatch.

---

## Backend work still required before emails are live

The current Girls repository is a static front-end and does not yet contain the Boys Supabase communications backend. Therefore this conversion is **prepared but not deployed as an email sender**.

To activate it later:
1. reuse/port the Boys communications tables and queue migrations;
2. change character-mode constraint to `grace-auto, grace, ava, lola, seb`;
3. port the scheduler and dynamic trigger functions;
4. port `process-communications` with the same quiet-hour/rate-limit logic;
5. port the Resend email function using the Girls domain and branding;
6. make server delivery resolve the selected voice from `GTG_VOICE_LIBRARY`;
7. configure sender aliases/domain authentication in Resend;
8. wire invitation links to the eventual Girls application route;
9. test Free and Full journeys separately;
10. run deliverability tests in Gmail, Outlook and Apple Mail before launch.

Do not point the current public static site at the Boys backend by accident. Backend reuse should be deliberate and isolated by project/environment.

---

## Recommended product wording for the communications screen

**Recommended option:** Leave it to Grace

**Hero:**
Pick your favourite, or leave it to Grace. She’ll bring in Ava, Lola or Seb when the situation calls for it — without turning the trip into another admin job.

**Heading:**
The right person. At the right moment.

**Grace has it covered:**
Grace watches the trip and brings in the right GALS character when something actually needs attention.

**What it covers:**
- Important trip changes
- Missing details and bookings
- Payment reminders and escalation
- Countdowns and final briefing
- Photo, video and post-trip nudges

**Settings note:**
Important trip messages stay on. Optional nudges can be muted whenever you want. We are organised, not clingy.

---

## Status
Copy conversion and communications architecture: **complete**.

Live Girls email/backend implementation: **not yet connected**.
