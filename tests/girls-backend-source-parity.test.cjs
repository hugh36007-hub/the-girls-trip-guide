const fs=require('node:fs');
const assert=require('node:assert/strict');

const read=name=>fs.readFileSync(`supabase/functions/${name}/index.ts`,'utf8');
const scheduled=read('girls-process-communications');
const invite=read('girls-trip-email');
const sender=read('girls-email-send');
const stripe=read('girls-stripe-checkout');

for(const [name,source] of [['girls-process-communications',scheduled],['girls-trip-email',invite]]){
  assert(source.includes('/functions/v1/girls-email-send'),`${name} must route email through girls-email-send`);
  assert(source.includes("'x-btg-cron-secret':env('BTG_CRON_SECRET')"),`${name} must authenticate its girls-email-send call`);
  assert(!source.includes('api.resend.com/emails'),`${name} must not restore direct Resend rendering`);
  assert(!source.includes('girls_resend_api_key'),`${name} must not access the Resend key directly`);
}

assert(scheduled.includes("trip.product_key!=='girls'"),'Scheduled worker must reject non-Girls trips');
assert(scheduled.includes(".in('status',['girls_ready','girls_scheduled','girls_failed'])"),'Scheduled worker must process only Girls queue statuses');
assert(scheduled.includes("status:'girls_scheduled'"),'Girls quiet-hours rescheduling must remain isolated');
assert(scheduled.includes("idempotencyKey:`gtg-${row.id}-${r.id}`"),'Scheduled Girls email idempotency key changed');
assert(scheduled.includes("in('entitlement',['full_trip','full_comms'])"),'Girls Free/Full communications entitlement check changed');
assert(scheduled.includes('20*60*60*1000'),'Girls optional-message 20-hour rate limit missing');
assert(scheduled.includes("reason:'Held by optional-message rate limit'"),'Girls optional-message reschedule reason missing');
assert(scheduled.includes(".eq('essential',false).gte('sent_at',cutoff)"),'Girls optional-message rate-limit query changed');

assert(invite.includes("trip.product_key!=='girls'"),'Invitation sender must reject non-Girls trips');
assert(invite.includes("idempotencyKey:`gtg-invite-${commId}`"),'Invitation idempotency key changed');
assert(invite.includes("status:'girls_ready'"),'Failed invitation must return to the Girls queue');

for(const banner of ['grace-email-banner-v3.webp','ava-email-banner-v3.webp','lola-email-banner-v3.webp','seb-email-banner-v3.webp','system-email-banner-v3.webp']){
  assert(sender.includes(banner),`Approved v3 banner missing: ${banner}`);
}
assert(sender.includes('/assets/email-banners/'),'girls-email-send must remain the approved banner renderer');

assert(stripe.includes('&product_key=eq.girls&select=id,name,plan'),'Girls checkout product isolation changed');
assert(stripe.includes("session?.metadata?.product_key==='girls'"),'Girls Stripe verification product key changed');
assert(stripe.includes("const PRICE_ID='price_1U7JW9EUQ5rJLL4MdDH2x3qP'"),'Girls £24.99 Stripe mapping changed');

console.log('Girls backend source parity contract: PASS');
console.log('Scheduled and invitation email paths use girls-email-send');
console.log('Girls queue/product isolation, idempotency, entitlements, optional-message limiting and v3 banners preserved');
