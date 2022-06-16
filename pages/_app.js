import "../styles/globals.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        document.body.classList.add("antialiased");
        document.body.classList.add("bg-slate-900");
        document.body.id = "home";
    }, []);

    return <Component {...pageProps} />
}

export default MyApp
