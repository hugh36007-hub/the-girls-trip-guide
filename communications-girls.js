/* The Girls Trip Guide — canonical communications specification.
   Converted from the proven Boys Trip Guide T01–T39 journey, but rewritten for Grace, Ava, Lola and Seb.
   This file is implementation-ready reference data. It is not yet wired into the static Girls front end. */

const GTG_GALS=[
  {id:'grace-auto',name:'Leave it to Grace',role:'Recommended',img:'./assets/images/grace.png',desc:'Grace watches the trip and brings in Ava, Lola or Seb when the moment calls for them.',example:'Everything is where it should be. Let’s not get creative now.'},
  {id:'grace',name:'Grace',role:'The Boss',img:'./assets/images/grace.png',desc:'Important organisation, final instructions and the moments that need one clear answer.',example:'Quick one. Something needs your attention. Then we can all move on.'},
  {id:'ava',name:'Ava',role:'The Organised One',img:'./assets/images/ava.png',desc:'Missing information, bookings, checklists and loose ends.',example:'Tiny admin thing. By tiny, I mean the hotel still needs your arrival time.'},
  {id:'lola',name:'Lola',role:'The Chaos Agent',img:'./assets/images/lola.png',desc:'Countdowns, lighter nudges, photo prompts and the energy around the trip.',example:'Three days. If you haven’t packed, perfect. We remain statistically on schedule.'},
  {id:'seb',name:'Seb',role:'The Hammer',img:'./assets/images/seb.png',desc:'Payments, ignored reminders, overdue tasks and excuses entering their third season.',example:'Lovely story. Still unpaid. I admire the confidence, though.'}
];

const GTG_TRIGGERS=[
['T01','Trip saved','grace','The trip exists. Excellent. Now invite the people who have been discussing it like a constitutional matter for three weeks.','Invite the girls'],
['T02','Nobody invited','grace','At the moment this is a solo holiday with witnesses in the group chat. Invite the girls.','Invite the girls'],
['T03','Invitation issued','grace','You’ve been invited. Confirm you’re in and have a look at the plan before adding another version of it to the group chat.','View the trip'],
['T04','Invitation unopened','ava','Your invitation is still sitting there. I checked. Obviously.','Respond'],
['T05','Invitation unanswered','ava','You opened it and disappeared. Yes or no is fine. A voice note is not required.','Confirm attendance'],
['T06','Member accepts','grace','You’re in. Have a look at the plan now so nobody has to reconstruct it for you later.','View the plan'],
['T07','Attendance overview','ava','The guest list is taking shape. Confirmed, declined and mysteriously undecided are now in their proper places.','Review the girls'],
['T08','Required detail missing','ava','One detail is missing. Give me the useful version and we can stop thinking about it.','Add detail'],
['T09','Passport confirmation missing','ava','Passport check. Confirm it is valid before the airport becomes the first activity.','Confirm passport'],
['T10','Booking incomplete','ava','The booking is nearly complete. Unfortunately, nearly does not get six people into a hotel.','Complete booking'],
['T11','Payment request','grace','Girls, {{payment}} is due {{dueDay}}. Let’s keep this boring.','View payment'],
['T12','Payment approaching','ava','Payment is due shortly. Amount, deadline and instructions are all exactly where I left them.','Review payment'],
['T13','Payment overdue','ava','The deadline has passed. The amount has not become more optional.','Update payment'],
['T14','Final payment escalation','seb','Grace asked. Ava itemised. I’m the third reminder. You know what this means.','Deal with payment'],
['T15','Booking published','grace','New booking added. Read it now. “Nobody told me” has already been removed from the available excuses.','View booking'],
['T16','Itinerary changed','grace','Change of plan. Use the new version before someone arrives at the old one with complete confidence.','View change'],
['T17','Partial-crew booking','ava','This one only concerns some of you. I have checked who. You should probably do the same.','View booking'],
['T18','30-day countdown','lola','Thirty days. Plenty of time to buy things you do not need and ignore the one thing you actually do.','Check the plan'],
['T19','14-day countdown','lola','Two weeks. The trip is now close enough to start becoming everyone’s personality.','View countdown'],
['T20','Seven-day readiness','grace','One week. Ava has checked the list. “Mostly ready” is doing quite a lot of work.','Review readiness'],
['T21','72-hour countdown','lola','Three days. If you haven’t packed, excellent. We remain statistically on schedule.','Check the plan'],
['T22','Final briefing','grace','Tomorrow. Passport. Travel details. Meeting point. We are not improvising this bit.','Open briefing'],
['T23','Departure day','grace','Today. Correct place, correct time, correct passport. Everything else can develop character later.','View departure'],
['T24','Arrival','lola','You made it. Cute. Take one useful photo before everyone starts looking like the journey happened.','Add photos or video'],
['T25','First evening','lola','First night. Phones out for one useful reason. Give the gallery something before standards decline.','Add photos or video'],
['T26','Quiet gallery','lola','The gallery is suspiciously quiet. Either you’re having an incredible time or nobody charged a phone.','Add photos or video'],
['T27','Morning after activity','lola','Last night happened. Allegedly. Evidence would help.','Add photos or video'],
['T28','Upload milestone','lola','The gallery is taking shape. Some of these photos may even support the same version of events.','View gallery'],
['T29','New destination','lola','New location. New photo opportunity. Try to get one before sunglasses become medically necessary.','Add photos or video'],
['T30','Incomplete expense','ava','This expense has money but no complete story. Payer, people, split. Give me the useful version.','Complete expense'],
['T31','Final night','lola','Final night. Get the good photos now. Tomorrow everyone becomes an unreliable witness.','Add photos or video'],
['T32','Return home','grace','You’re home. Now we deal with the receipts, balances and several competing versions of events.','Review what remains'],
['T33','Final uploads','lola','Before normal life wins, get the good photos and videos into the trip. Especially the ones being held as evidence.','Add uploads'],
['T34','Outstanding expenses','seb','The numbers are in. Some of you may wish they were fiction.','View balances'],
['T35','Three-day upload reminder','lola','Three days home and somebody is still sitting on the good photos. Unacceptable editing.','Add uploads'],
['T36','Seven-day final call','lola','Final call for uploads. Anything still on your phone is now a conscious curatorial choice.','Add uploads'],
['T37','Completion summary','grace','Nearly done. A few loose ends remain before the trip becomes everybody’s favourite story and nobody’s admin problem.','Review completion'],
['T38','Ready to close','grace','Everything is settled. You may close the trip. I’ll allow a small moment of pride.','Close trip'],
['T39','Formal closure','grace','Trip closed. The official version is complete. The group chat may now invent the rest.','Manage trip']
];

const GTG_FREE_OPERATIONAL={
  F01:{title:'Group still missing',message:'Your trip is set up, but nobody else has joined yet. Invite the people who are coming so everyone can see the same plan.',cta:'Invite the group'},
  F02:{title:'Booking details missing',message:'A booking is missing information. Add the remaining detail so the plan stays useful for everyone.',cta:'Complete booking'},
  F03:{title:'Payment due',message:'A trip payment is due. Open the trip to review the amount, deadline and payment status.',cta:'Review payment'},
  F04:{title:'Seven days to go',message:'Your trip starts in one week. Check the plan, bookings and outstanding details while there is still time to fix them.',cta:'Review the plan'},
  F05:{title:'Final check',message:'Your trip starts tomorrow. Check the meeting point, travel times and anything the group still needs to know.',cta:'Open the plan'},
  F06:{title:'Expense incomplete',message:'An expense is missing information. Add the payer or split so the balance remains accurate.',cta:'Complete expense'},
  F07:{title:'Money still unsettled',message:'There is still money to settle for this trip. Review the outstanding balance and update anything already paid.',cta:'Review balances'}
};

const GTG_FREE_TRANSACTIONALS={
  T03:{title:'Trip invitation',message:'You have been invited to a trip. Confirm your email and open the shared plan.',cta:'View the trip'},
  T06:{title:'You have joined the trip',message:'You are confirmed. Open the trip to review the latest shared plan.',cta:'View the plan'},
  T11:{title:'Payment request',message:'A trip payment has been requested. Open the trip to review the amount and due date.',cta:'View payment'}
};

const GTG_COMMUNICATION_POLICY={
  freeAllowed:['T03','T06','T11','F01','F02','F03','F04','F05','F06','F07'],
  essential:['T01','T03','T06','T11','T14','T15','T16','T17','T20','T22','T23','T32','T34','T37','T38','T39'],
  optionalSettings:{
    T18:'countdowns',T19:'countdowns',T21:'countdowns',
    T24:'galleryNudges',T25:'galleryNudges',T26:'galleryNudges',T27:'galleryNudges',T29:'galleryNudges',T31:'galleryNudges',
    T28:'uploadCelebrations',T30:'expenseNudges',T33:'postTripUploads',T35:'postTripUploads',T36:'postTripUploads'
  },
  quietHours:{start:22,end:9,timezone:'trip'},
  optionalRateLimitHours:20,
  duplicateTriggerCooldownHours:48,
  maxDeliveryAttempts:3,
  defaultMode:'grace-auto'
};

const GTG_EMAIL_IDENTITIES={
  system:{name:'The Girls Trip Guide',localPart:'trips',portrait:null},
  grace:{name:'Grace',localPart:'grace',portrait:'https://thegirlstripguide.com/assets/images/grace.png'},
  ava:{name:'Ava',localPart:'ava',portrait:'https://thegirlstripguide.com/assets/images/ava.png'},
  lola:{name:'Lola',localPart:'lola',portrait:'https://thegirlstripguide.com/assets/images/lola.png'},
  seb:{name:'Seb',localPart:'seb',portrait:'https://thegirlstripguide.com/assets/images/seb.png'}
};

const GTG_SCHEDULE={
  T18:'start -30d 10:00',T19:'start -14d 10:00',T20:'start -7d 10:00',T21:'start -3d 10:00',
  T22:'start -1d 10:00',T23:'start 07:00',T24:'start 15:00',T25:'start 19:00',T27:'start +1d 10:00',
  T31:'end 18:00',T32:'end +1d 10:00',T33:'end +1d 17:00',T35:'end +3d 17:00',T36:'end +7d 17:00',
  T37:'end +7d 10:00',T39:'end +14d 10:00'
};

if(typeof window!=='undefined'){
  window.GTG_GALS=GTG_GALS;
  window.GTG_TRIGGERS=GTG_TRIGGERS;
  window.GTG_FREE_OPERATIONAL=GTG_FREE_OPERATIONAL;
  window.GTG_FREE_TRANSACTIONALS=GTG_FREE_TRANSACTIONALS;
  window.GTG_COMMUNICATION_POLICY=GTG_COMMUNICATION_POLICY;
  window.GTG_EMAIL_IDENTITIES=GTG_EMAIL_IDENTITIES;
  window.GTG_SCHEDULE=GTG_SCHEDULE;
}
