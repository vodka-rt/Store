import { supabase } from "./supabase.js";

function qs(name){ return new URLSearchParams(location.search).get(name); }
function esc(s){ return (s ?? "").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function money(cents){ return (cents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

(async () => {
  const app = document.getElementById("app");
  const orderId = qs("order");
  if (!orderId){
    app.innerHTML = `<div class="p-4 rounded-xl border border-white/10 bg-white/5">Pedido inválido.</div>`;
    return;
  }

  app.innerHTML = `<div class="animate-pulse opacity-70">Carregando Pix...</div>`;

  try{
    const { data: pay, error: pErr } = await supabase.from("payment_settings").select("*").eq("id",1).single();
    if (pErr) throw pErr;

    const { data: order, error: oErr } = await supabase.from("orders").select("*").eq("id",orderId).single();
    if (oErr) throw oErr;

    app.innerHTML = `
      <a href="./index.html" class="opacity-70 hover:opacity-100">← voltar</a>
      <h1 class="text-2xl font-bold mt-3">Pagamento via Pix</h1>

      <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center justify-between">
          <span class="opacity-80">Pedido</span>
          <span class="font-mono text-sm">${esc(order.id)}</span>
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="opacity-80">Kit</span>
          <span class="font-semibold">${esc(order.kit_title)}</span>
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="opacity-80">Valor</span>
          <span class="font-bold">${money(order.final_amount_cents)}</span>
        </div>

        <hr class="my-4 border-white/10" />

        <p class="opacity-80 text-sm">Pague usando a chave abaixo e aguarde um admin aprovar:</p>

        <div class="mt-3 rounded-xl bg-black/40 border border-white/10 p-3">
          <div class="text-xs opacity-60">Chave Pix</div>
          <div class="font-mono break-all mt-1" id="pixKey">${esc(pay.pix_key)}</div>
          <button id="copy" class="mt-3 px-4 py-2 rounded-xl bg-white text-black font-semibold hover:opacity-90">
            Copiar chave
          </button>
        </div>

        <p class="text-xs opacity-60 mt-4">
          Depois de pagar, clique em “Ver status” e espere aprovação.
        </p>

        <a href="./status.html?order=${encodeURIComponent(order.id)}"
          class="mt-4 block text-center px-4 py-3 rounded-xl border border-white/15 hover:bg-white/10">
          Ver status do pedido
        </a>
      </div>
    `;

    document.getElementById("copy").addEventListener("click", async () => {
      const key = document.getElementById("pixKey").innerText;
      await navigator.clipboard.writeText(key);
      alert("Chave Pix copiada!");
    });

  }catch(e){
    app.innerHTML = `<div class="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
      Erro: ${esc(e.message || e)}
    </div>`;
  }
})();
