import { supabase } from "./supabase.js";

function qs(name){ return new URLSearchParams(location.search).get(name); }
function esc(s){ return (s ?? "").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function money(cents){ return (cents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

async function getKit(id){
  const { data, error } = await supabase.from("kits").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

async function getCoupon(code){
  const { data, error } = await supabase.from("coupons").select("*").eq("code", code).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data;
}

(async () => {
  const app = document.getElementById("app");
  const kitId = qs("kit");
  if (!kitId){
    app.innerHTML = `<div class="p-4 rounded-xl border border-white/10 bg-white/5">Kit inválido.</div>`;
    return;
  }

  app.innerHTML = `<div class="animate-pulse opacity-70">Carregando kit...</div>`;

  try{
    const kit = await getKit(kitId);

    app.innerHTML = `
      <a href="./index.html" class="opacity-70 hover:opacity-100">← voltar</a>
      <h1 class="text-2xl font-bold mt-3">Comprar: ${esc(kit.title)}</h1>
      <p class="opacity-80 mt-1">${esc(kit.description || "")}</p>

      <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center justify-between">
          <span class="opacity-80">Preço</span>
          <span class="font-bold" id="price">${money(kit.price_cents)}</span>
        </div>

        <div class="mt-3">
          <label class="text-sm opacity-80">Cupom (opcional)</label>
          <input id="coupon" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" placeholder="EX: VODKA10" />
          <div id="couponMsg" class="text-sm mt-2 opacity-80"></div>
        </div>

        <hr class="my-4 border-white/10" />

        <label class="text-sm opacity-80">Nick no Minecraft</label>
        <input id="mc" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" placeholder="SeuNick" />

        <label class="text-sm opacity-80 mt-3 block">Nome real</label>
        <input id="real" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" placeholder="Seu nome" />

        <label class="text-sm opacity-80 mt-3 block">@ do Discord</label>
        <input id="disc" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" placeholder="@vodka ou vodka#0000" />

        <button id="confirm" class="mt-4 w-full px-4 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90">
          Confirmar e ir pro Pix
        </button>

        <p class="text-xs opacity-60 mt-3">
          Ao confirmar, seu pedido vai ficar como <b>PENDENTE</b> até um admin aprovar.
        </p>
      </div>
    `;

    let appliedCoupon = null;

    document.getElementById("coupon").addEventListener("blur", async () => {
      const code = document.getElementById("coupon").value.trim();
      const msg = document.getElementById("couponMsg");
      appliedCoupon = null;
      msg.textContent = "";
      document.getElementById("price").textContent = money(kit.price_cents);

      if (!code) return;

      const c = await getCoupon(code);
      if (!c || (c.expires_at && new Date(c.expires_at) < new Date())){
        msg.innerHTML = `<span class="text-red-400">Cupom inválido ou expirado.</span>`;
        return;
      }

      appliedCoupon = c;
      const final = Math.max(0, Math.round(kit.price_cents * (1 - c.discount_percent/100)));
      document.getElementById("price").textContent = money(final);
      msg.innerHTML = `<span class="text-green-400">Cupom aplicado: -${c.discount_percent}%</span>`;
    });

    document.getElementById("confirm").addEventListener("click", async () => {
      const mc = document.getElementById("mc").value.trim();
      const real = document.getElementById("real").value.trim();
      const disc = document.getElementById("disc").value.trim();

      if (!mc || !real || !disc){
        alert("Preencha nick, nome real e @ do Discord.");
        return;
      }

      const discount = appliedCoupon?.discount_percent ?? null;
      const final = discount ? Math.max(0, Math.round(kit.price_cents * (1 - discount/100))) : kit.price_cents;

      const { data, error } = await supabase.from("orders").insert({
        kit_id: kit.id,
        kit_title: kit.title,
        amount_cents: kit.price_cents,
        coupon_code: appliedCoupon?.code ?? null,
        discount_percent: discount,
        final_amount_cents: final,
        mc_nick: mc,
        real_name: real,
        discord_handle: disc,
        status: "pending"
      }).select("id").single();

      if (error){
        alert("Erro ao criar pedido: " + error.message);
        return;
      }

      // chama Edge Function para notificar canal privado (pendente)
      await fetch(`${supabase.supabaseUrl}/functions/v1/notify-discord`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          type: "private",
          content: `🕒 **Compra PENDENTE**\nKit: **${kit.title}**\nValor: **${(final/100).toFixed(2)}**\nMC: **${mc}**\nDiscord: **${disc}**\nPedido: **${data.id}**`
        })
      }).catch(()=>{});

      location.href = `./pix.html?order=${encodeURIComponent(data.id)}`;
    });

  }catch(e){
    app.innerHTML = `<div class="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
      Erro: ${esc(e.message || e)}
    </div>`;
  }
})();
