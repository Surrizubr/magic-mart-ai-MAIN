import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function respond(ok: boolean, payload: Record<string, unknown>) {
  return new Response(JSON.stringify({ ok, ...payload }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    // Manual Auth Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return respond(false, { error: "Sem cabeçalho de autorização" });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
       return respond(false, { error: "Usuário não autenticado" });
    }

    const body = await req.json();
    const { image, geminiApiKey } = body;

    if (!image) return respond(false, { error: "Image not provided" });
    if (!geminiApiKey) return respond(false, { error: "Gemini API Key missing" });

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    const apiHeaders = {
      Authorization: `Bearer ${geminiApiKey}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({
        model: "gemini-1.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Você é um assistente de compras. Analise a imagem e identifique o nome do produto e sua categoria (Frutas, Verduras, Carnes, Laticínios, Padaria, Bebidas, Limpeza, Higiene, Grãos, Temperos, Outros). Retorne apenas um JSON: { \"product_name\": \"...\", \"category\": \"...\" }" 
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Que produto é este?" },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return respond(false, { error: `Gemini API error: ${err}` });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");

    return respond(true, { data: result });
  } catch (e) {
    return respond(false, { error: e.message });
  }
});
