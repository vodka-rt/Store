import { supabase } from "./supabase.js";

function esc(s){ return (s ?? "").toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function money(cents){ return (cents/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

async function loadSettings(){
  const { data, error } = await supabase.from("site_settings").select("*").eq("id",1).single();
  if (error) throw error;
  return data;
}

async function loadKits(){
  const { data, error } = await supabase.from("kits").select("*").eq("is_active", true).order("sort_order",{ascending:true});
  if (error) throw error;
  return data ?? [];
}

(async () => {
  const root = document.getElementById("top");
  root.innerHTML = `
    <div class="animate-pulse text-sm opacity-70">Carregando...</div>
  `;

  try{
    const settings = await loadSettings();
    const kits = await loadKits();

    document.title = settings.site_name ?? "Loja";

    root.innerHTML = `
      <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <div class="relative">
          <div class="h-48 md:h-64 bg-white/10">
            ${settings.banner_url ? `<img src="${esc(settings.banner_url)}" class="w-full h-full object-cover" />` : ""}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-4 md:p-6">
            <h1 class="text-2xl md:text-4xl font-bold">${esc(settings.site_name)}</h1>
            <p class="opacity-80 mt-1">Bedrock • Semi anarquia</p>
            <div class="flex gap-2 mt-4">
              <a id="discordBtn" href="${esc(settings.discord_invite_url || "#")}" target="_blank"
                class="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:opacity-90">
                Entrar no Discord
              </a>
              <a href="./status.html" class="px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10">
                Ver pedido
              </a>
            </div>
          </div>
        </div>

        <div class="p-4 md:p-6">
          <h2 class="text-xl font-semibold">Avisos</h2>
          <div class="mt-2 rounded-xl border border-white/10 bg-black/40 p-4 whitespace-pre-line">${esc(settings.notices)}</div>
        </div>
      </div>

      <div class="mt-6">
        <div class="flex items-end justify-between gap-2">
          <h2 class="text-2xl font-bold">Kits</h2>
          <span class="text-sm opacity-70">Pagamento via Pix (aprovação manual)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          ${kits.map(k => `
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div class="flex gap-3">
                <div class="w-20 h-20 rounded-xl bg-white/10 overflow-hidden shrink-0">
                  ${k.image_url ? `<img src="${esc(k.image_url)}" class="w-full h-full object-cover">` : ""}
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="text-lg font-semibold">${esc(k.title)}</h3>
                    <div class="font-bold">${money(k.price_cents)}</div>
                  </div>
                  <p class="opacity-80 text-sm mt-1">${esc(k.description || "")}</p>
                  <div class="mt-3 flex gap-2">
                    <a class="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:opacity-90"
                      href="./buy.html?kit=${encodeURIComponent(k.id)}">
                      Comprar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <footer class="py-10 text-center opacity-60 text-sm">
        ${esc(settings.site_name)} • GitHub Pages + Supabase
      </footer>
    `;
  }catch(e){
    root.innerHTML = `<div class="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
      Erro ao carregar: ${esc(e.message || e)}
    </div>`;
  }
})();
