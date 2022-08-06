import Head from "next/head";
import { QueryClientProvider, QueryClient } from "react-query";
import { Router } from "next/router";
import { TokenProvider } from "../src/token";
import NProgress from "nprogress";
import "react-tippy/dist/tippy.css";
import "nprogress/nprogress.css";
import "../public/styles/globals.css";

NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: any) {
    return (
        <>
            <Head>
                <title>RestoreCord</title>
                <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                <meta name="keywords" content="restorecord, discord, backup, restore, backup service, savecord, letoa, restorebot" />
                <meta property="og:title" content="RestoreCord - The Recovery Service" />
                <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                <meta property="og:url" content="https://restorecord.com" />
                <meta name="theme-color" content="#4f46e5" />
                <meta name="apple-mobile-web-app-status-bar-style" content="#4f46e5" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="RestoreCord" />
                <meta name="application-name" content="RestoreCord" />
                <link rel="canonical" href="https://restorecord.com" />
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
