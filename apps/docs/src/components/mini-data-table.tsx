"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const data = [
  {
    id: "reuniao-produto",
    name: "Reunião Produto",
    time: "09:00",
    type: "meeting",
    status: "Confirmado",
  },
  {
    id: "call-cliente",
    name: "Call Cliente",
    time: "11:30",
    type: "call",
    status: "Pendente",
  },
  {
    id: "design-review",
    name: "Design Review",
    time: "14:00",
    type: "review",
    status: "Em andamento",
  },
  {
    id: "sprint-sync",
    name: "Sprint Sync",
    time: "16:00",
    type: "sync",
    status: "Confirmado",
  },
];

export function MiniDataTable() {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="w-[150%] rounded-2xl border border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl"
    >
      {/* HEADER */}
      <div className="grid grid-cols-3 px-4 py-3 border-b border-border/40 text-[10px] text-muted-foreground">
        <span>Evento</span>
        <span>Hora</span>
        <span className="text-right">Status</span>
      </div>

      {/* LIST */}
      <div className="py-1">
        {data.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="grid grid-cols-3 items-center px-4 py-2 text-xs hover:bg-muted/40 transition"
          >
            {/* COL 1 */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  item.type === "meeting" && "bg-blue-400",
                  item.type === "call" && "bg-green-400",
                  item.type === "review" && "bg-purple-400",
                  item.type === "sync" && "bg-orange-400",
                )}
              />
              <span className="text-foreground/90">{item.name}</span>
            </div>

            {/* COL 2 */}
            <span className="text-muted-foreground">{item.time}</span>

            {/* COL 3 (STATUS) */}
            <span
              className={cn(
                "text-right text-[11px] px-2 py-0.5 rounded-md w-fit ml-auto",
                item.status === "Confirmado" &&
                  "bg-green-500/10 text-green-400",
                item.status === "Pendente" &&
                  "bg-yellow-500/10 text-yellow-400",
                item.status === "Em andamento" &&
                  "bg-blue-500/10 text-blue-400",
              )}
            >
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* FADE */}
      <div className="pointer-events-none h-12 bg-linear-to-t from-background to-transparent rounded-b-2xl" />
    </motion.div>
  );
}
