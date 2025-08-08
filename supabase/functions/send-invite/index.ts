// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

Deno.serve(async (req) => {
  const { to, subject, html } = await req.json()
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      // 送信元メールアドレス
      // - Resendの設定でドメインを追加しておく必要がある
      // - ここでは仮のドメイン（komapepe.xyz）を使用しているが、
      // 実際には適切なドメインを設定しておくこと
      from: 'wakewake@mail.komapepe.xyz',
      to,
      subject,
      html,
    }),
  })
  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})