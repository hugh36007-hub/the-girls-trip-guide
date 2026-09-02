import { createClient } from 'npm:@supabase/supabase-js@2.112.4'

function env(name: string) {
  const value = Deno.env.get(name) || ''
  if (!value) throw new Error(`${name} missing`)
  return value
}

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>\"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
    "'": '&#39;',
  } as Record<string, string>)[character] || character)
}

const PEOPLE = {
  grace: { name: 'Grace', mailbox: 'grace', banner: 'grace-email-banner-v3.webp' },
  ava: { name: 'Ava', mailbox: 'ava', banner: 'ava-email-banner-v3.webp' },
  lola: { name: 'Lola', mailbox: 'lola', banner: 'lola-email-banner-v3.webp' },
  seb: { name: 'Seb', mailbox: 'seb', banner: 'seb-email-banner-v3.webp' },
  system: { name: 'The Girls Trip Guide', mailbox: 'trips', banner: 'system-email-banner-v3.webp' },
} as const

type Character = keyof typeof PEOPLE

function person(character: unknown) {
  return PEOPLE[(String(character || '').toLowerCase() in PEOPLE
    ? String(character).toLowerCase()
    : 'grace') as Character]
}

function render(input: any) {
  const selected = person(input.character)
  const banner = `https://thegirlstripguide.com/assets/email-banners/${selected.banner}`
  const label = esc(selected.name.toUpperCase())
  const title = esc(input.title)
  const message = esc(input.message)
  const tripName = esc(input.tripName)
  const cta = esc(input.cta)
  const url = esc(input.url)
  const preheader = esc(input.preheader || `${selected.name} · ${input.title}`)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <title>${title}</title>
</head>
<body bgcolor="#f4eef2" style="margin:0;padding:0;background-color:#f4eef2;font-family:Arial,Helvetica,sans-serif;color:#171217">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4eef2" style="width:100%;background-color:#f4eef2">
    <tr>
      <td align="center" style="padding:16px 8px 28px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="#fffafd" style="width:100%;max-width:560px;background-color:#fffafd;border:1px solid #e6bfd3;border-radius:18px;overflow:hidden">
          <tr>
            <td bgcolor="#150a12" style="padding:0;background-color:#150a12;border-top-left-radius:17px;border-top-right-radius:17px;overflow:hidden">
              <img src="${banner}" width="560" height="747" alt="${esc(selected.name)} · The Girls Trip Guide" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;text-decoration:none">
            </td>
          </tr>
          <tr>
            <td bgcolor="#fffafd" style="padding:28px 30px 26px;background-color:#fffafd;font-family:Arial,Helvetica,sans-serif;color:#171217">
              <p style="margin:0;font-size:12px;line-height:18px;letter-spacing:3px;color:#c72d78;font-weight:800;text-transform:uppercase">${label}</p>
              <h1 style="margin:10px 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:38px;line-height:42px;color:#171217;font-weight:800;letter-spacing:-0.5px">${title}</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:28px;color:#50464d">${message}</p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f8edf4" style="padding:24px 24px 30px;background-color:#f8edf4;border-top:1px solid #efcfdf;border-bottom-left-radius:17px;border-bottom-right-radius:17px;font-family:Arial,Helvetica,sans-serif">
              <p style="margin:0;font-size:11px;line-height:17px;letter-spacing:3px;text-transform:uppercase;color:#765d6b">THE TRIP</p>
              <h2 style="margin:7px 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:29px;line-height:35px;color:#9f1f60;font-weight:800">${tripName}</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" bgcolor="#c72d78" style="background-color:#c72d78;border-radius:10px">
                    <a href="${url}" style="display:block;padding:14px 25px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:21px;font-weight:800;color:#ffffff;text-decoration:none;white-space:nowrap">${cta} →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

Deno.serve(async request => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const suppliedSecret = request.headers.get('x-btg-cron-secret') || ''
  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const configuredSecret = Deno.env.get('BTG_CRON_SECRET') || ''
  let authorised = Boolean(configuredSecret && suppliedSecret === configuredSecret)
  if (!authorised && suppliedSecret) {
    const { data } = await db.rpc('verify_communications_cron_secret', { p_secret: suppliedSecret })
    authorised = data === true
  }

  if (!authorised) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const input = await request.json()
    const to = String(input.to || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('Invalid recipient')

    const { data: suppression, error: suppressionError } = await db.from('email_suppressions').select('reason').eq('email', to).maybeSingle()
    if (suppressionError) throw suppressionError
    if (suppression) {
      return new Response(JSON.stringify({ ok: true, id: null, suppressed: true, reason: suppression.reason }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const selected = person(input.character)
    const { data: key, error: keyError } = await db.rpc('girls_resend_api_key')
    if (keyError || !key) throw new Error('Girls email key unavailable')

    const html = render(input)
    const text = `${selected.name}: ${input.title}\n\n${input.message}\n\n${input.tripName}\n${input.url}`
    const senderName = selected.name === 'The Girls Trip Guide' ? selected.name : `${selected.name} from The Girls Trip Guide`
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${String(key)}`,
        ...(input.idempotencyKey ? { 'Idempotency-Key': String(input.idempotencyKey) } : {}),
      },
      body: JSON.stringify({
        from: `${senderName} <trip@thegirlstripguide.com>`,
        reply_to: 'hello@thegirlstripguide.com',
        to: [to],
        subject: String(input.subject || `${input.title} · ${input.tripName}`),
        text,
        html,
      }),
    })

    const output = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(output?.message || `Resend ${response.status}`)
    return new Response(JSON.stringify({ ok: true, id: output.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('girls-email-send failed', error)
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
