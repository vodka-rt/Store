import { supabase } from "./supabase.js";

function qs(name){ return new URLSearchParams(location.search).get(name); }
function esc(s){ return (s ?? "").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

(async () => {
  const app = document.getElementById("app");
  const orderId = qs("order");

  app.innerHTML = `
    <a href="./index.html" class="opacity-70 hover:opacity-100">← voltar</a>
    <h1 class="text-2xl font-bold mt-3">Status do pedido</h1>

    <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <label class="text-sm opacity-80">ID do pedido</label>
      <input id="oid" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" placeholder="Cole o ID aqui" value="${esc(orderId || "")}" />
      <button id="check" class="mt-4 w-full px-4 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90">
        Verificar
      </button>
      <div id="out" class="mt-4"></div>
    </div>
  `;

  const out = document.getElementById("out");

  async function check(){
    const id = document.getElementById("oid").value.trim();
    if (!id) return;

    out.innerHTML = `<div class="opacity-70">Consultando...</div>`;

    const { data: settings } = await supabase.from("site_settings").select("*").eq("id",1).single();
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).single();

    if (error){
      out.innerHTML = `<div class="text-red-400">Pedido não encontrado.</div>`;
      return;
    }

    if (order.status === "pending"){
      out.innerHTML = `
        <div class="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
          <b>PENDENTE</b> — aguardando um admin aprovar.
          <div class="text-xs opacity-70 mt-1">Kit: ${esc(order.kit_title)}</div>
        </div>
      `;
      return;
    }

    if (order.status === "denied"){
      out.innerHTML = `
        <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <b>NEGADO</b> — seu pedido foi recusado.
          ${order.admin_note ? `<div class="text-xs opacity-70 mt-1">Motivo: ${esc(order.admin_note)}</div>` : ""}
        </div>
      `;
      return;
    }

    // approved
    out.innerHTML = `
      <div class="rounded-xl border border-green-500/30 bg-green-500/10 p-3">
        <b>APROVADO</b> — agora abra um ticket e entre no servidor para receber seus itens.
        <div class="mt-2 flex gap-2">
          ${settings?.ticket_url ? `<a class="px-4 py-2 rounded-xl bg-white text-black font-semibold" target="_blank" href="${esc(settings.ticket_url)}">Abrir ticket</a>` : ""}
          ${settings?.discord_invite_url ? `<a class="px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10" target="_blank" href="${esc(settings.discord_invite_url)}">Discord</a>` : ""}
        </div>
      </div>
    `;
  }

  document.getElementById("check").addEventListener("click", check);
  if (orderId) check();
})();
