import localFont from "next/font/local";

export const satoshi = localFont({
  src: [
    {
      path: "./Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
