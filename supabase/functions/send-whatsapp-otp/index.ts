// ============================================================
// BolsoCheio - Edge Function: Enviar OTP via WhatsApp
// Dispara código de verificação via WhatsApp Cloud API (Meta)
// ============================================================
// Deploy: supabase functions deploy send-whatsapp-otp --no-verify-jwt
// ============================================================

import { createClient } from 'npm:@supabase/supabase-js@2'

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
}

// --- Enviar mensagem de texto via WhatsApp Cloud API ---
async function sendWhatsAppMessage(to: string, message: string) {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

  if (!token || !phoneId) {
    console.log('[DEV] WhatsApp credentials not configured. OTP code:', message)
    return { success: true, dev: true }
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace('+', ''), // Meta espera sem o +
        type: 'text',
        text: {
          body: message,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.text()
    console.error('WhatsApp API error:', errorData)
    throw new Error(`Falha ao enviar mensagem: ${response.status}`)
  }

  return { success: true, dev: false }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Extrair Authorization header para identificar o usuário
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json(
        { error: 'Token de autenticação necessário' },
        { status: 401, headers: corsHeaders }
      )
    }

    const supabase = getSupabaseAdmin()

    // Verificar token do usuário via Supabase Auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return Response.json(
        { error: 'Usuário não autenticado' },
        { status: 401, headers: corsHeaders }
      )
    }

    const { phone } = await req.json()

    if (!phone || phone.length < 12) {
      return Response.json(
        { error: 'Número de telefone inválido' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Gera código OTP de 6 dígitos
    const otpCode = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    // Salva no profile do usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        whatsapp_number: phone,
        is_whatsapp_verified: false,
        whatsapp_verification_code: otpCode,
        whatsapp_verification_expires_at: expiresAt,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao salvar OTP:', updateError)
      return Response.json(
        { error: 'Erro ao salvar código de verificação' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Envia o OTP via WhatsApp
    const otpMessage =
      `🔐 *BolsoCheio - Código de Verificação*\n\n` +
      `Seu código: *${otpCode}*\n\n` +
      `Este código expira em 10 minutos.\n` +
      `Se você não solicitou isso, ignore esta mensagem.`

    const sendResult = await sendWhatsAppMessage(phone, otpMessage)

    return Response.json(
      {
        success: true,
        message: 'Código enviado com sucesso',
        dev: sendResult.dev || false,
        // Em dev mode, retorna o código para facilitar testes
        ...(sendResult.dev ? { code: otpCode } : {}),
      },
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('send-whatsapp-otp error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders }
    )
  }
})
