/* Girls Trip Guide - authoritative server-side character/copy resolver.
   Sender, subject and copy MUST be resolved from the same character id. */

import { GRACE_SUBJECTS, GRACE_MESSAGES } from './girls-voice-grace.mjs';
import { AVA_SUBJECTS, AVA_MESSAGES } from './girls-voice-ava.mjs';
import { LOLA_SUBJECTS, LOLA_MESSAGES } from './girls-voice-lola.mjs';
import { SEB_SUBJECTS, SEB_MESSAGES } from './girls-voice-seb.mjs';

export const GIRLS_FIXED_CHARACTERS = ['grace','ava','lola','seb'];

export const GIRLS_AUTO_ROUTE = {
  T01:'grace',T02:'grace',T03:'grace',T04:'ava',T05:'ava',T06:'grace',T07:'ava',T08:'ava',T09:'ava',T10:'ava',
  T11:'grace',T12:'ava',T13:'ava',T14:'seb',T15:'grace',T16:'grace',T17:'ava',T18:'lola',T19:'lola',T20:'grace',
  T21:'lola',T22:'grace',T23:'grace',T24:'lola',T25:'lola',T26:'lola',T27:'lola',T28:'lola',T29:'lola',T30:'ava',
  T31:'lola',T32:'grace',T33:'lola',T34:'seb',T35:'lola',T36:'lola',T37:'grace',T38:'grace',T39:'grace'
};

export const GIRLS_SUBJECT_LIBRARY = {
  grace:GRACE_SUBJECTS, ava:AVA_SUBJECTS, lola:LOLA_SUBJECTS, seb:SEB_SUBJECTS
};

export const GIRLS_VOICE_LIBRARY = {
  grace:GRACE_MESSAGES, ava:AVA_MESSAGES, lola:LOLA_MESSAGES, seb:SEB_MESSAGES
};

export function resolveGirlsCharacter(triggerCode, mode='grace-auto') {
  const selected=String(mode||'grace-auto');
  if (GIRLS_FIXED_CHARACTERS.includes(selected)) return selected;
  return GIRLS_AUTO_ROUTE[String(triggerCode)] || 'grace';
}

export function fillGirlsVoiceTokens(message, tokens={}) {
  const defaults={payment:'A trip payment', dueDay:'now'};
  return String(message||'').replace(/\{\{(payment|dueDay)\}\}/g,(_,key)=>String(tokens[key] ?? defaults[key]));
}

function triggerIndex(triggerCode) {
  const match=/^T(\d{2})$/.exec(String(triggerCode));
  if(!match) return -1;
  const index=Number(match[1])-1;
  return index>=0&&index<=38 ? index : -1;
}

export function resolveGirlsVoiceMessage(triggerCode, character, tokens={}) {
  const index=triggerIndex(triggerCode);
  if(index<0) return '';
  const library=GIRLS_VOICE_LIBRARY[character] || GIRLS_VOICE_LIBRARY.grace;
  return fillGirlsVoiceTokens(library[index] || '', tokens);
}

export function resolveGirlsVoiceSubject(triggerCode, character) {
  const index=triggerIndex(triggerCode);
  if(index<0) return '';
  const library=GIRLS_SUBJECT_LIBRARY[character] || GIRLS_SUBJECT_LIBRARY.grace;
  return String(library[index] || '');
}

export function resolveGirlsCommunication(triggerCode, mode='grace-auto', tokens={}) {
  const character=resolveGirlsCharacter(triggerCode, mode);
  const message=resolveGirlsVoiceMessage(triggerCode, character, tokens);
  const subject=resolveGirlsVoiceSubject(triggerCode, character);
  return {character,message,subject};
}
