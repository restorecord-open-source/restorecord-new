import "../public/styles/globals.css"
import Head from "next/head";

function MyApp({ Component, pageProps }: any) {
    return ( 
        <>
            <Head>
                <title>Restorecord</title>
            </Head>
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
