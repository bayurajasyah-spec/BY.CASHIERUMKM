import { useMemo, useState } from "react";
import { Check, ChefHat, Clock3, RefreshCw } from "lucide-react";
import { Transaction } from "../../types";

type Props = { transactions: Transaction[]; onRefresh: () => void };

export function KitchenDisplay({ transactions, onRefresh }: Props) {
  const [done, setDone] = useState<string[]>([]);
  const orders = useMemo(() => transactions.filter(order => order.status !== "Cancelled" && !done.includes(order.id)), [transactions, done]);
  return <div className="min-h-screen bg-[#12063d] p-4 text-white lg:p-8">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-[#ffe51c] text-[#1c075c]"><ChefHat size={25}/></span><div><p className="text-xs font-semibold uppercase tracking-widest text-white/50">Kitchen Display System</p><h1 className="font-['Space_Grotesk'] text-2xl font-bold">Antrean dapur</h1></div></div>
      <button onClick={onRefresh} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15"><RefreshCw size={16}/> Segarkan</button>
    </header>
    <div className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
      {orders.length ? orders.map(order => <article key={order.id} className="rounded-3xl bg-white p-5 text-[#1c075c] shadow-xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#7c5cbf]">{order.orderType || "Dine In"}</p><h2 className="mt-1 font-['Space_Grotesk'] text-xl font-bold">{order.invoice}</h2></div><span className="flex items-center gap-1 rounded-full bg-[#fff7d6] px-3 py-1.5 text-xs font-bold text-[#8b6800]"><Clock3 size={13}/> Baru</span></div><div className="mt-5 space-y-3 border-t border-gray-100 pt-4">{order.items.map((item, index) => <div key={`${order.id}-${index}`} className="flex justify-between gap-3 text-sm"><span>{item.name}</span><strong>×{item.qty}</strong></div>)}</div><button onClick={() => setDone(current => [...current, order.id])} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c075c] py-3 text-sm font-bold text-white"><Check size={16}/> Tandai siap</button></article>) : <div className="col-span-full rounded-3xl border border-dashed border-white/20 p-12 text-center text-white/55">Belum ada order di antrean dapur.</div>}
    </div>
  </div>;
}

export default KitchenDisplay;
