import { supabase } from "./supabase.js";

const kitId = new URLSearchParams(location.search).get("kit");

(async () => {
  const app = document.getElementById("app");
  const { data: kit } = await supabase.from("kits").select("*").eq("id",kitId).single();

  app.innerHTML = `
    <h1 class="text-2xl font-bold">Comprar ${kit.title}</h1>

    <input id="mc" placeholder="Nick Minecraft"
      class="mt-3 w-full p-2 rounded bg-black/40 border border-white/10">
    <input id="real" placeholder="Nome real"
      class="mt-3 w-full p-2 rounded bg-black/40 border border-white/10">
    <input id="disc" placeholder="@Discord"
      class="mt-3 w-full p-2 rounded bg-black/40 border border-white/10">

    <button id="confirm"
      class="mt-4 w-full bg-white text-black p-3 rounded-xl">
      Ir para Pix
    </button>
  `;

  document.getElementById("confirm").onclick = async () => {
    const mc = document.getElementById("mc").value;
    const real = document.getElementById("real").value;
    const disc = document.getElementById("disc").value;

    const { data } = await supabase.from("orders").insert({
      kit_title: kit.title,
      final_amount_cents: kit.price_cents,
      mc_nick: mc,
      real_name: real,
      discord_handle: disc,
      status: "pending"
    }).select("id").single();

    location.href = `./pix.html?order=${data.id}`;
  };
})();
