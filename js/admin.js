import { supabase } from "./supabase.js";

function esc(s){ return (s ?? "").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function money(cents){ return (cents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

async function notify(type, content){
  await fetch(`${supabase.supabaseUrl}/functions/v1/notify-discord`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ type, content })
  }).catch(()=>{});
}

function uiLogin(){
  return `
    <h1 class="text-2xl font-bold">Admin Panel</h1>
    <div class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 max-w-md">
      <label class="text-sm opacity-80">Email</label>
      <input id="email" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
      <label class="text-sm opacity-80 mt-3 block">Senha</label>
      <input id="pass" type="password" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
      <button id="login" class="mt-4 w-full px-4 py-3 rounded-xl bg-white text-black font-semibold">Entrar</button>
      <div id="msg" class="text-sm mt-3 opacity-80"></div>
    </div>
  `;
}

function uiAdmin({settings, payment, kits, orders}){
  return `
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-2xl font-bold">Admin Panel</h1>
      <button id="logout" class="px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10">Sair</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 class="text-xl font-semibold">Config do site</h2>

        <label class="text-sm opacity-80 mt-3 block">Nome</label>
        <input id="site_name" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.site_name)}" />

        <label class="text-sm opacity-80 mt-3 block">Banner URL</label>
        <input id="banner_url" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.banner_url || "")}" />

        <label class="text-sm opacity-80 mt-3 block">Link do Discord</label>
        <input id="discord_invite_url" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.discord_invite_url || "")}" />

        <label class="text-sm opacity-80 mt-3 block">Link de Ticket</label>
        <input id="ticket_url" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.ticket_url || "")}" />

        <label class="text-sm opacity-80 mt-3 block">Avisos</label>
        <textarea id="notices" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" rows="4">${esc(settings.notices || "")}</textarea>

        <div class="grid grid-cols-3 gap-2 mt-3">
          <div>
            <label class="text-sm opacity-80">Primária</label>
            <input id="theme_primary" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.theme_primary)}" />
          </div>
          <div>
            <label class="text-sm opacity-80">Fundo</label>
            <input id="theme_bg" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.theme_bg)}" />
          </div>
          <div>
            <label class="text-sm opacity-80">Texto</label>
            <input id="theme_text" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(settings.theme_text)}" />
          </div>
        </div>

        <button id="saveSettings" class="mt-4 w-full px-4 py-3 rounded-xl bg-white text-black font-semibold">
          Salvar configurações
        </button>
        <div id="settingsMsg" class="text-sm mt-3 opacity-80"></div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 class="text-xl font-semibold">Pix</h2>
        <label class="text-sm opacity-80 mt-3 block">Chave Pix</label>
        <input id="pix_key" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" value="${esc(payment.pix_key)}" />
        <button id="savePix" class="mt-4 w-full px-4 py-3 rounded-xl bg-white text-black font-semibold">
          Salvar Pix
        </button>
        <div id="pixMsg" class="text-sm mt-3 opacity-80"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 class="text-xl font-semibold">Kits</h2>

        <div class="mt-3 grid grid-cols-1 gap-2">
          ${kits.map(k => `
            <div class="rounded-xl border border-white/10 bg-black/30 p-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <b>${esc(k.title)}</b> • <span class="opacity-80">${money(k.price_cents)}</span>
                  <div class="text-xs opacity-70 mt-1">${esc(k.description || "")}</div>
                </div>
                <button class="delKit px-3 py-1 rounded-lg border border-white/15 hover:bg-white/10" data-id="${esc(k.id)}">Excluir</button>
              </div>
            </div>
          `).join("")}
        </div>

        <hr class="my-4 border-white/10" />

        <h3 class="font-semibold">Adicionar kit</h3>
        <label class="text-sm opacity-80 mt-2 block">Título</label>
        <input id="k_title" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
        <label class="text-sm opacity-80 mt-2 block">Descrição</label>
        <input id="k_desc" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
        <label class="text-sm opacity-80 mt-2 block">Preço (R$)</label>
        <input id="k_price" type="number" step="0.01" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" placeholder="10.00" />
        <label class="text-sm opacity-80 mt-2 block">Imagem URL (opcional)</label>
        <input id="k_img" class="mt-1 w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10" />
        <button id="addKit" class="mt-3 w-full px-4 py-3 rounded-xl bg-white text-black font-semibold">Adicionar</button>
        <div id="kitMsg" class="text-sm mt-3 opacity-80"></div>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 class="text-xl font-semibold">Pedidos pendentes</h2>
        <div class="mt-3 grid grid-cols-1 gap-2">
          ${orders.length ? orders.map(o => `
            <div class="rounded-xl border border-white/10 bg-black/30 p-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div><b>${esc(o.kit_title)}</b> • <span class="opacity-80">${money(o.final_amount_cents)}</span></div>
                  <div class="text-xs opacity-70 mt-1">MC: ${esc(o.mc_nick)} • Discord: ${esc(o.discord_handle)}</div>
                  <div class="text-xs opacity-50 mt-1 font-mono">${esc(o.id)}</div>
                </div>
                <div class="flex flex-col gap-2">
                  <button class="approve px-3 py-2 rounded-xl bg-white text-black font-semibold" data-id="${esc(o.id)}">Aprovar</button>
                  <button class="deny px-3 py-2 rounded-xl border border-white/15 hover:bg-white/10" data-id="${esc(o.id)}">Negar</button>
                </div>
              </div>
            </div>
          `).join("") : `<div class="opacity-70">Nenhum pendente.</div>`}
        </div>
        <div id="orderMsg" class="text-sm mt-3 opacity-80"></div>
      </div>
    </div>
  `;
}

async function loadAdminData(){
  const [{ data: settings }, { data: payment }, { data: kits }, { data: orders }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id",1).single(),
    supabase.from("payment_settings").select("*").eq("id",1).single(),
    supabase.from("kits").select("*").order("created_at",{ascending:false}),
    supabase.from("orders").select("*").eq("status","pending").order("created_at",{ascending:true})
  ]);
  return { settings, payment, kits: kits ?? [], orders: orders ?? [] };
}

async function render(){
  const app = document.getElementById("app");
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session){
    app.innerHTML = uiLogin();
    document.getElementById("login").onclick = async () => {
      const email = document.getElementById("email").value.trim();
      const pass = document.getElementById("pass").value.trim();
      const msg = document.getElementById("msg");
      msg.textContent = "Entrando...";
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) msg.innerHTML = `<span class="text-red-400">${esc(error.message)}</span>`;
      else render();
    };
    return;
  }

  const data = await loadAdminData();
  app.innerHTML = uiAdmin(data);

  document.getElementById("logout").onclick = async () => {
    await supabase.auth.signOut();
    render();
  };

  document.getElementById("saveSettings").onclick = async () => {
    const payload = {
      site_name: document.getElementById("site_name").value.trim(),
      banner_url: document.getElementById("banner_url").value.trim() || null,
      discord_invite_url: document.getElementById("discord_invite_url").value.trim() || null,
      ticket_url: document.getElementById("ticket_url").value.trim() || null,
      notices: document.getElementById("notices").value,
      theme_primary: document.getElementById("theme_primary").value.trim(),
      theme_bg: document.getElementById("theme_bg").value.trim(),
      theme_text: document.getElementById("theme_text").value.trim(),
      updated_at: new Date().toISOString()
    };
    const msg = document.getElementById("settingsMsg");
    msg.textContent = "Salvando...";
    const { error } = await supabase.from("site_settings").update(payload).eq("id",1);
    msg.innerHTML = error ? `<span class="text-red-400">${esc(error.message)}</span>` : `<span class="text-green-400">Salvo!</span>`;
  };

  document.getElementById("savePix").onclick = async () => {
    const msg = document.getElementById("pixMsg");
    msg.textContent = "Salvando...";
    const pix_key = document.getElementById("pix_key").value.trim();
    const { error } = await supabase.from("payment_settings").update({ pix_key, updated_at: new Date().toISOString() }).eq("id",1);
    msg.innerHTML = error ? `<span class="text-red-400">${esc(error.message)}</span>` : `<span class="text-green-400">Salvo!</span>`;
  };

  document.getElementById("addKit").onclick = async () => {
    const msg = document.getElementById("kitMsg");
    msg.textContent = "Adicionando...";
    const title = document.getElementById("k_title").value.trim();
    const description = document.getElementById("k_desc").value.trim();
    const price = parseFloat(document.getElementById("k_price").value || "0");
    const image_url = document.getElementById("k_img").value.trim() || null;

    if (!title || !(price >= 0)){
      msg.innerHTML = `<span class="text-red-400">Preencha título e preço.</span>`;
      return;
    }
    const price_cents = Math.round(price * 100);

    const { error } = await supabase.from("kits").insert({ title, description, price_cents, image_url, is_active:true });
    msg.innerHTML = error ? `<span class="text-red-400">${esc(error.message)}</span>` : `<span class="text-green-400">Kit criado!</span>`;
    if (!error) render();
  };

  document.querySelectorAll(".delKit").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute("data-id");
      if (!confirm("Excluir este kit?")) return;
      await supabase.from("kits").delete().eq("id", id);
      render();
    };
  });

  async function decide(orderId, decision){
    const note = decision === "denied" ? prompt("Motivo (opcional):") : null;

    // chama Edge Function segura (exige admin logado)
    const { data: sess } = await supabase.auth.getSession();
    const jwt = sess?.session?.access_token;
    const r = await fetch(`${supabase.supabaseUrl}/functions/v1/decide-order`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify({ order_id: orderId, decision, note })
    });

    if (!r.ok){
      alert("Falha ao decidir pedido.");
      return;
    }

    // notifica discord
    if (decision === "approved"){
      await notify("public", `✅ **Compra APROVADA**\nPedido: **${orderId}**\n(Confira no admin para detalhes)`);
    } else {
      await notify("private", `❌ **Compra NEGADA**\nPedido: **${orderId}**`);
    }

    render();
  }

  document.querySelectorAll(".approve").forEach(btn => btn.onclick = () => decide(btn.getAttribute("data-id"), "approved"));
  document.querySelectorAll(".deny").forEach(btn => btn.onclick = () => decide(btn.getAttribute("data-id"), "denied"));
}

render();
