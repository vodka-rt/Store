import { supabase } from "./supabase.js";

const orderId = new URLSearchParams(location.search).get("order");

(async () => {
  const app = document.getElementById("app");
  const { data: order } = await supabase.from("orders").select("*").eq("id",orderId).single();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id",1).single();

  let content = "";

  if(order.status==="pending")
    content = `<div class="bg-yellow-500/10 p-4 rounded">PENDENTE</div>`;

  if(order.status==="approved")
    content = `
      <div class="bg-green-500/10 p-4 rounded">
        APROVADO<br>
        <a href="${settings.ticket_url}" target="_blank"
          class="mt-3 inline-block bg-white text-black p-2 rounded">
          Abrir Ticket
        </a>
      </div>
    `;

  if(order.status==="denied")
    content = `<div class="bg-red-500/10 p-4 rounded">NEGADO</div>`;

  app.innerHTML = content;
})();
