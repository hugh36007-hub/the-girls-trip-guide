# Store Policy Decision - 31 August 2026

## Current safe release model

Ship the app as a free, stand-alone companion to The Girls Trip Guide web service:

- existing Free and Full Trip accounts can sign in;
- existing Full Trip entitlement is recognised from Supabase;
- no native Stripe checkout;
- no external purchase link or purchase call to action in the native build;
- the web checkout remains unchanged.

## Reason

Full Trip unlocks digital features and cloud/media functionality consumed in the app. Apple generally requires in-app purchase for these unlocks. Its multiplatform rule says externally acquired features may be accessed when those features are also available as in-app purchases; its free stand-alone companion exception allows no in-app purchase only when there is no purchase or outside-purchase call to action in the app.

Google Play likewise generally requires Play Billing for digital features and cloud services. Regional external-offers/payment programmes exist, but require formal enrolment, region gating, mandated APIs/disclosures, transaction reporting and applicable fees.

## Decision still requiring owner commercial approval

Choose one before native users are allowed to buy Full Trip:

1. Add a non-consumable Apple IAP and Google Play one-time product mapped to the existing Supabase entitlement; or
2. Enrol in each applicable regional external-payment/offers programme and implement its required APIs, disclosures and reporting.

The first public test build should use the safe companion model. This preserves the existing £24.99 web product without risking store rejection or silently changing the commercial system.

## Official sources checked

- Apple App Review Guidelines 3.1.1 and 3.1.3: https://developer.apple.com/app-store/review/guidelines/
- Google Play Payments policy: https://support.google.com/googleplay/android-developer/answer/9858738?hl=en-GB
- Google Play external offers programme: https://support.google.com/googleplay/android-developer/answer/14372887?hl=en-GB
