import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {Navbar} from "../components/Navbar";
import {Footer} from "../components/Footer";


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
        <Navbar />
        <Component {...pageProps} />
        <Footer/>
    </>
  );
}