import Head from "next/head";
import Link from "next/link";


export default function Test() {
    return (
        <div>
            <Head>
                <title>RestoreCord</title>
            </Head>

            <main>
                <h1>
                    Test
                </h1>
                <li> 
                    <Link href="/">Home</Link>
                </li>
            </main>
            
            <footer>
                <p>Copyright © {new Date().getFullYear()} RestoreCord</p>
            </footer>
        </div>
    )
}