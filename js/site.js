import { supabase } from "./supabase.js";

function money(c){return (c/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});}

(async () => {
  const app = document.getElementById("app");

  const { data: settings } = await supabase.from("site_settings").select("*").eq("id",1).single();
  const { data: kits } = await supabase.from("kits").select("*").eq("is_active",true);

  app.innerHTML = `
    <div class="rounded-2xl bg-white/5 p-6">
      <h1 class="text-3xl font-bold">${settings.site_name}</h1>
      <p class="opacity-70 mt-2">${settings.notices}</p>
      <a href="${settings.discord_invite_url}" target="_blank"
        class="mt-4 inline-block px-4 py-2 bg-white text-black rounded-xl">
        Discord
      </a>
    </div>

    <div class="grid md:grid-cols-2 gap-4 mt-6">
      ${kits.map(k=>`
        <div class="bg-white/5 p-4 rounded-2xl">
          <h2 class="text-xl font-semibold">${k.title}</h2>
          <p class="opacity-70">${k.description||""}</p>
          <div class="mt-2 font-bold">${money(k.price_cents)}</div>
          <a href="./buy.html?kit=${k.id}"
            class="mt-3 inline-block px-4 py-2 bg-white text-black rounded-xl">
            Comprar
          </a>
        </div>
      `).join("")}
    </div>
  `;
})();
