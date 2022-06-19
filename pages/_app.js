import "../public/styles/globals.css"
import Head from "next/head";

function MyApp({ Component, pageProps }) {
    return ( 
        <div>
            <Head>
                <title>Restorecord</title>
            </Head>
            <Component {...pageProps} />
        </div>
    )
}

export default MyApp
