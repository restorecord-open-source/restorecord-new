import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Home() {
    return (
        <div>
            <Head>
                <title>RestoreCord</title>
            </Head>

            <main>
                <h1>
                    Home
                </h1>
                <li> 
                    <Link href="/test">Test</Link>
                </li>
            </main>

            <footer>
                <p>Copyright © {new Date().getFullYear()} RestoreCord</p>
            </footer>
        </div>
    );
}