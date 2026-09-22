import { useEffect, useState } from "react";
import { Check, ChefHat, Clock3, Printer, X } from "lucide-react";
import { KitchenOrder } from "../../types";

const money = (value: number) => `Rp ${Math.round(value).toLocaleString("id-ID")}`;

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const channel = new BroadcastChannel("bycashier-kds");
    channel.onmessage = (event) => {
      const message = event.data as { type?: string; order?: KitchenOrder; invoice?: string };
      if (message.type === "order-created" && message.order) {
        setOrders((current) => [message.order!, ...current.filter((item) => item.id !== message.order?.id)]);
        setLastUpdate(new Date());
      }
      if (message.type === "order-cancelled" && message.invoice) {
        setOrders((current) => current.map((item) => item.invoice === message.invoice ? { ...item, status: "Cancelled" } : item));
        setLastUpdate(new Date());
      }
    };
    return () => channel.close();
  }, []);

  const update = (id: string, status: KitchenOrder["status"]) => {
    setOrders((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    const order = orders.find((item) => item.id === id);
    if (order) {
      const channel = new BroadcastChannel("bycashier-kds");
      channel.postMessage({ type: "order-status", order: { ...order, status } });
      channel.close();
    }
  };

  const print = (order: KitchenOrder) => {
    const popup = window.open("", "_blank", "width=420,height=640");
    if (!popup) return;
    popup.document.write(`<html><head><title>${order.invoice}</title><style>body{font-family:monospace;padding:24px}h1{font-size:18px}p{margin:8px 0}.line{border-top:1px dashed #111;margin:14px 0}</style></head><body><h1>BY.CASHIER UMKM</h1><p>${order.invoice}</p><p>${new Date(order.createdAt).toLocaleString("id-ID")}</p><div class="line"></div>${order.items.map((item) => `<p>${item.qty} x ${item.name}${item.note ? ` — ${item.note}` : ""}</p>`).join("")}<div class="line"></div><p>${order.status}</p><script>window.print();window.close();</script></body></html>`);
    popup.document.close();
  };

  const active = orders.filter((order) => order.status !== "Cancelled");
  return <main className="min-h-screen bg-[#f5f6fa] px-5 py-6 text-[#1c075c] lg:px-10">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7c5cbf]"><ChefHat data-icon="inline-start" /> Kitchen Display System</p><h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold">Pesanan masuk realtime</h1><p className="mt-1 text-sm text-gray-500">Sinkron otomatis dari kasir · terakhir diperbarui {lastUpdate.toLocaleTimeString("id-ID")}</p></div>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm ring-1 ring-gray-100">{active.length} pesanan aktif</div>
      </div>
      {!active.length ? <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><ChefHat className="mx-auto text-gray-300" /><p className="mt-3 font-semibold">Belum ada pesanan masuk</p><p className="mt-1 text-sm text-gray-400">Order dari POS akan tampil di sini secara realtime.</p></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{active.map((order) => <article key={order.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><div className="flex items-start justify-between"><div><p className="font-mono text-sm font-bold">{order.invoice}</p><p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><Clock3 /> {new Date(order.createdAt).toLocaleTimeString("id-ID")}</p></div><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${order.status === "Ready" ? "bg-[#e7f5ec] text-[#287347]" : order.status === "Preparing" ? "bg-[#fff3cd] text-[#8a6300]" : "bg-[#f0ebff] text-[#6d49a4]"}`}>{order.status}</span></div><div className="my-4 border-t border-dashed border-gray-200 pt-4">{order.items.map((item, index) => <div key={`${item.name}-${index}`} className="flex justify-between gap-3 py-1.5 text-sm"><span>{item.qty} × {item.name}{item.note && <small className="block text-xs text-gray-400">Catatan: {item.note}</small>}</span></div>)}</div><div className="grid grid-cols-2 gap-2"><button onClick={() => update(order.id, order.status === "New" ? "Preparing" : "Ready")} className="flex items-center justify-center gap-2 rounded-xl bg-[#1c075c] px-3 py-2.5 text-xs font-bold text-white">{order.status === "Ready" ? <Check /> : <ChefHat />}{order.status === "New" ? "Mulai masak" : order.status === "Preparing" ? "Tandai siap" : "Selesai"}</button><button onClick={() => print(order)} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold"><Printer /> Print</button></div><button onClick={() => update(order.id, "Cancelled")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600"><X /> Batalkan</button></article>)}</div>}
    </div>
  </main>;
}
export { money };

// KitchenDisplay is intentionally browser-channel based until the Neon API endpoint is connected.
// The event contract is shared with POS so replacing transport later does not change the UI.
