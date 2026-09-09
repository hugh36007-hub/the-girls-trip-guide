const fs=require('node:fs')
const path=require('node:path')
const assert=require('node:assert/strict')

const source=fs.readFileSync(path.join(__dirname,'..','supabase','functions','girls-trip-email','index.ts'),'utf8')

assert.match(source,/voiceTrigger=accessCopy\?'T06':'T03'/,'confirmed access links must use T06; invitations and resends must use T03')
assert.match(source,/const accessCopy=wasConfirmed\b/,'resending an unconfirmed invitation must remain T03')
assert.doesNotMatch(source,/accessCopy=wasConfirmed\|\|resend/,'resend must not bypass the GALS invitation voice')
assert.match(source,/subject:emailSubject\b/,'email subject must be the exact resolver subject')
assert.doesNotMatch(source,/subject:\`\$\{[^}]*Subject\} · \$\{trip\.name\}\`/,'trip name must not be appended to the resolver subject')
assert.doesNotMatch(source,/subject:\`Your trip link ·/,'confirmed access links must not use stale hard-coded subjects')
assert.match(source,/url:join\.toString\(\)/,'secure one-time invitation link must be preserved')
assert.match(source,/functions\/v1\/girls-accept-invite/,'Girls invitations must keep the Girls acceptance endpoint')

console.log('Girls invitation GALS voice contract passed')
