# App Privacy and Google Play Data Safety Draft

This draft must be checked against the production database, privacy policy and final release build immediately before submission.

## Data linked to the user

- Contact information: email address; optional name, mobile number and address.
- User content: trip details, invitations, booking documents, photos, videos, chat messages, polls and responses.
- Identifiers: Supabase account ID and trip/member identifiers.
- Purchases: Full Trip entitlement and Stripe purchase reference held by the backend; no card data is stored in the app.
- Financial information: trip costs and member payment status entered by users; these are planning records, not bank or card credentials.

## Purposes

- App functionality and account authentication.
- Private trip collaboration and invited-member access.
- Customer support, security, abuse response and legal compliance.
- Purchase entitlement verification.

## Practices

- Data is encrypted in transit.
- Private trip access is controlled by Supabase authentication and row-level security.
- The app does not contain a Supabase service-role key or Stripe secret.
- No cross-app advertising tracking is implemented.
- No IDFA/advertising identifier collection is implemented.
- Photos, videos, camera and microphone are accessed only when the user chooses the relevant upload/capture action.
- Full Trip media follows the stated 20 GB / 12-month product period.
- Users can initiate account deletion from My details; Google Play also requires an external deletion web resource.

## Apple declarations - expected

- Contact Info: collected, linked to identity, app functionality.
- User Content: collected, linked to identity, app functionality.
- Identifiers: user ID collected, linked to identity, app functionality/security.
- Purchases: purchase history collected, linked to identity, app functionality.
- Diagnostics: declare only if crash/log tooling is added before release.
- Tracking: No.

## Google Play declarations - expected

- Personal info, messages, photos/videos, files/documents and purchase history are collected for app functionality.
- Financial planning entries may be declared as financial information if Play's form classifies member-entered trip costs that way.
- Data is not sold.
- Data is shared only with contracted processors required to provide the service, currently including Supabase, Stripe and email delivery infrastructure as described by the privacy policy.
- Deletion requests are available in-app and through the designated web URL.
