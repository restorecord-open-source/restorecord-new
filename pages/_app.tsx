import "../public/styles/globals.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { QueryClientProvider, QueryClient } from "react-query";
import { TokenProvider } from "../src/token";
import ProgressBar from "@badrap/bar-of-progress";
import Script from "next/script";

const progress = new ProgressBar({
    size: 2,
    color: "#4f46e5",
    className: "loading-bar",
    delay: 50,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: any) {
    const router = useRouter();

    useEffect(() => {
        router.events.on("routeChangeStart", progress.start);
        router.events.on("routeChangeComplete", progress.finish);
        router.events.on("routeChangeError", progress.finish);

        return () => {
            router.events.off("routeChangeStart", progress.start);
            router.events.off("routeChangeComplete", progress.finish);
            router.events.off("routeChangeError", progress.finish);
        };
    }, [router]);

    return (
        <>
            <Head>
                <title>Restorecord</title>
                <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                <meta name="keywords" content="restorecord, discord, backup, restore, backup service, savecord, letoa, restorebot" />
                <meta property="og:title" content="RestoreCord - The Recovery Service" />
                <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                <meta property="og:url" content="https://restorecord.com" />
                <meta name="theme-color" content="#4f46e5" />
                <meta name="apple-mobile-web-app-status-bar-style" content="#4f46e5" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="Restorecord" />
                <meta name="application-name" content="Restorecord" />
            </Head>
            <QueryClientProvider client={queryClient}>
                <TokenProvider>
                    <Component {...pageProps} />
                </TokenProvider>
            </QueryClientProvider>
        </>
    );
}

export default MyApp;
