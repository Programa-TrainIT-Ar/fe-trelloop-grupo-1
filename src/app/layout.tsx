import type { Metadata } from "next";
import "../styles/globals.css";
import "@/styles/globals.css";

import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import { LayoutProviders } from "@/components/LayoutProviders";

const poppins = Poppins({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});



export const metadata: Metadata = {
  title: "TrainIT",
  description: "Organiza tus proyectos con un tablero Kanban intuitivo. Ideal para equipos ágiles y gestión de tareas colaborativas.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <LayoutProviders>
          {children}
        </LayoutProviders>
      </body>
    </html>
  );
}
