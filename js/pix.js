import { supabase } from "./supabase.js";

const orderId = new URLSearchParams(location.search).get("order");

(async () => {
  const app = document.getElementById("app");
  const { data: pix } = await supabase.from("payment_settings").select("*").eq("id",1).single();

  app.innerHTML = `
    <h1 class="text-2xl font-bold">Pagamento via Pix</h1>
    <p class="mt-3">Chave Pix:</p>
    <div class="bg-white/5 p-3 rounded mt-2 font-mono">${pix.pix_key}</div>
    <a href="./status.html?order=${orderId}"
      class="mt-4 inline-block bg-white text-black p-3 rounded-xl">
      Ver Status
    </a>
  `;
})();
