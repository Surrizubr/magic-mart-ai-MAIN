import { supabase, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

export async function analyzeWithGemini(images: string[], prompt: string, providedApiKey?: string) {
  try {
    const geminiApiKey = providedApiKey || localStorage.getItem('gemini-api-key') || '';
    
    // The edge function expects 'images' and 'geminiApiKey'
    const { data, error } = await supabase.functions.invoke('analyze-receipt', {
      body: { 
        images, 
        geminiApiKey
      },
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY || ''
      }
    });

    if (error) throw error;
    
    if (!data.ok) {
      throw new Error(data.error || "Erro desconhecido na análise do cupom");
    }
    
    // The reference edge function returns { ok: true, data: receiptData }
    return data.data;
  } catch (error: any) {
    console.error("Edge Function 'analyze-receipt' Error:", error);
    throw error;
  }
}

export const RECEIPT_PROMPT = `Você é um scanner de cupons fiscais brasileiros altamente preciso.
Analise a imagem e extraia os dados exatamente no seguinte formato JSON:

{
  "store_name": "Nome da Loja",
  "store_address": "Endereço (opcional)",
  "date": "YYYY-MM-DD",
  "receipt_total": 0.00,
  "items": [
    {
      "product_name": "Nome do Produto",
      "quantity": 1.0,
      "unit": "un",
      "unit_price": 0.00,
      "total_price": 0.00,
      "discount_amount": 0.00,
      "discounted_price": 0.00,
      "category": "Categoria"
    }
  ]
}

REGRAS:
1. "items" DEVE ser um array. Se não houver itens, retorne array vazio.
2. "receipt_total" DEVE ser o valor final pago no cupom.
3. Categorias: Frutas, Verduras, Carnes, Laticínios, Padaria, Bebidas, Limpeza, Higiene, Grãos, Temperos, Outros.
4. Identifique itens duplicados e remova-os.
5. Retorne APENAS o JSON válido, sem qualquer texto adicional antes ou depois.`;

export const PRODUCT_PROMPT = `Você é um assistente de compras. Analise a imagem e identifique o nome do produto e sua categoria (Frutas, Verduras, Carnes, Laticínios, Padaria, Bebidas, Limpeza, Higiene, Grãos, Temperos, Outros). Retorne apenas um JSON: { "product_name": "...", "category": "..." }`;
