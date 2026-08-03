import localFont from "next/font/local";

export const neueHaas = localFont({
  variable: "--font-neue-haas",
  display: "swap",
  src: [
    { path: "../../public/fonts/NeueHaasDisplayLight.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/NeueHaasDisplayRoman.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/NeueHaasDisplayMediu.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/NeueHaasDisplayBold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/NeueHaasDisplayBlack.ttf", weight: "900", style: "normal" },
  ],
});
