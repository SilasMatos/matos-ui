"use client";

import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import { Framer } from "@/components/icons/framer-motion";
import { ShadcnUI } from "@/components/icons/shadcn";
import { TailwindCSS } from "@/components/icons/tailwind";

const icons = [
  {
    id: 1,
    Icon: TailwindCSS,
    orbit: 60,
    duration: 12,
    reverse: false,
  },
  {
    id: 2,
    Icon: ShadcnUI,
    orbit: 95,
    duration: 18,
    reverse: true,
  },
  {
    id: 3,
    Icon: Framer,
    orbit: 130,
    duration: 25,
    reverse: false,
  },
] as const satisfies ReadonlyArray<{
  id: number;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  orbit: number;
  duration: number;
  reverse: boolean;
}>;

export function OrbitIcons() {
  return (
    <div className="relative flex items-center justify-center w-[150px] h-[150px]">
      {/* Centro */}
      <div className="absolute z-20 px-2 py-0.5 bg-white/80 backdrop-blur-md rounded-full shadow border text-[10px]">
        <span className="font-semibold text-gray-800">Matos UI</span>
      </div>

      {/* Glow */}
      <div className="absolute w-[50px] h-[50px] bg-blue-500/10 blur-2xl rounded-full" />

      {icons.map((icon) => (
        <div
          key={icon.id}
          className="absolute rounded-full border border-gray-200/40"
          style={{
            width: icon.orbit * 2,
            height: icon.orbit * 2,
          }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotate: icon.reverse ? -360 : 360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: icon.duration,
            }}
          >
            <div
              className="absolute"
              style={{
                top: "60%",
                left: "50%",
                transform: `translate(-50%, -50%) translateX(${icon.orbit}px)`,
              }}
            >
              <div className="flex items-center justify-center bg-white rounded-md shadow w-6 h-6 text-black">
                <icon.Icon className="size-4" />
              </div>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
