import { supabase } from "./supabase.js";

(async () => {
  const app = document.getElementById("app");

  const { data: session } = await supabase.auth.getSession();

  if(!session.session){
    app.innerHTML=`
      <input id="email" placeholder="Email"
        class="p-2 bg-black/40 border border-white/10 rounded w-full">
      <input id="pass" type="password" placeholder="Senha"
        class="p-2 bg-black/40 border border-white/10 rounded w-full mt-2">
      <button id="login"
        class="mt-3 w-full bg-white text-black p-3 rounded">
        Entrar
      </button>
    `;

    document.getElementById("login").onclick=async()=>{
      const email=document.getElementById("email").value;
      const password=document.getElementById("pass").value;
      await supabase.auth.signInWithPassword({email,password});
      location.reload();
    };
    return;
  }

  const { data: orders } = await supabase.from("orders").select("*").eq("status","pending");

  app.innerHTML=`
    <h1 class="text-2xl font-bold">Pedidos Pendentes</h1>
    ${orders.map(o=>`
      <div class="bg-white/5 p-4 rounded mt-3">
        ${o.kit_title} • ${o.mc_nick}
        <button onclick="approve('${o.id}')"
          class="ml-3 bg-green-500 px-3 py-1 rounded">Aprovar</button>
        <button onclick="deny('${o.id}')"
          class="ml-2 bg-red-500 px-3 py-1 rounded">Negar</button>
      </div>
    `).join("")}
  `;

  window.approve=async(id)=>{
    await supabase.from("orders").update({status:"approved"}).eq("id",id);
    location.reload();
  };

  window.deny=async(id)=>{
    await supabase.from("orders").update({status:"denied"}).eq("id",id);
    location.reload();
  };
})();
