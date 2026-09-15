# LOCKED — Boys parity port: currency + member expense entry

Status: **LOCKED reference behaviour**
Source product: **The Girls Trip Guide**
Target later: **The Boys Trip Guide**
Date locked: 2026-09-15

This document records the approved Girls behaviour to reproduce later in Boys. Do not change the Boys product as part of this lock. When Boys is updated, preserve Boys branding/tone and adapt product-specific names/guards rather than blindly copying Girls identifiers.

## 1. Local-currency expense flow — LOCKED

Approved behaviour:

- Destination suggests the likely local spending currency.
- Organiser can override the trip spending currency.
- Expense entry accepts the amount in the currency actually paid.
- UI shows a GBP conversion preview before save.
- FX rate is obtained server-side/authenticated, not trusted from arbitrary client input.
- On save, the conversion is **locked** for that expense.
- Core trip accounting, balances and settlement calculations remain in GBP.
- Preserve the original transaction information for audit/display:
  - `original_amount`
  - `original_currency`
  - `gbp_rate`
  - `fx_rate_date`
  - `fx_source`
- Existing expenses retain their saved rate; they are not silently re-priced later.
- GBP expenses use rate 1.
- Current Girls runtime supports a broad currency list and destination-based suggestions.

Girls reference implementation:

- Frontend runtime: `girls-fx-expenses-fixed.js`
- Main schema/RPC migration: `supabase/migrations/20260914203500_girls_local_currency_expenses.sql`
- FX endpoint: Girls `girls-fx-rate` edge function / equivalent authenticated service
- Expense save RPC: Girls `save_girls_expense_fx`

Important implementation history to preserve:

- Use `globalThis.URL` / avoid naming a local constant `URL` because that previously shadowed the browser URL constructor.
- Do not chain `.catch()` directly onto a Supabase query builder before awaiting it.
- Currency selector should close/blur after selection.
- Participant UI must not duplicate visible people controls.

## 2. Organiser-controlled member expense entry — LOCKED

Approved organiser control in Money:

**Members can add expenses — On / Off**

Default: **ON**.

When ON, a confirmed member may:

- see **Add expense**;
- add an expense they personally paid;
- use the same local-currency flow and GBP conversion;
- choose which trip members share the expense;
- create the expense only with themselves as payer.

When OFF:

- member expense entry is hidden/read-only;
- backend enforcement must also reject member-created expenses.

Member restrictions remain locked regardless of toggle:

- member cannot set another person as payer;
- member cannot edit/delete another member's expense;
- member does not gain organiser-only payment-request, debt-management or settlement controls;
- organiser retains full Money controls.

Girls reference implementation:

- Frontend: `girls-member-expense-permissions.js`
- Trip flag: `trips.members_can_add_expenses`
- Organiser settings RPC: `set_girls_member_expense_permission`
- Permission/schema migration: `supabase/migrations/20260915120000_girls_member_expense_permission.sql`
- RPC/backend hardening: `supabase/migrations/20260915120500_girls_member_expense_rpc_hardening.sql`

## 3. Boys port rules

When this is later implemented in Boys:

1. Audit the then-current Boys Money implementation first; do not overwrite approved Boys-specific UX.
2. Match Girls **behaviour and security**, not Girls-specific naming or styling.
3. Use Boys product isolation (`product_key='boys'` or the then-current Boys equivalent).
4. Add Boys-specific RPC/function names only where required by the architecture.
5. Preserve RLS and server-side authorisation; client hiding alone is insufficient.
6. Regression-test organiser and member accounts separately.
7. Verify GBP totals, splits, debt, settlement, edit/delete permissions and historical FX values after porting.
8. Test one GBP expense, one EUR expense, one non-EUR foreign currency expense, organiser toggle ON/OFF, and a malicious/member attempt to submit another payer.

## 4. Acceptance standard for Boys

The Boys version is not considered parity-complete until all of the following pass:

- local currency suggested from destination;
- manual currency override works;
- GBP preview is correct;
- saved expense retains original currency and locked rate metadata;
- GBP ledger totals remain correct;
- organiser can turn member expense entry on/off;
- confirmed member can add only their own paid expense when enabled;
- same member is blocked when disabled;
- member cannot impersonate another payer;
- member cannot gain organiser-only Money controls;
- no regression to existing Boys organiser/member role isolation.

This document is the authoritative parity note for these two features unless Hugh explicitly changes the product decision later.
