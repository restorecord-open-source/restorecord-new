import Head from "next/head";
import { useEffect, useState } from "react";

export default function Home({users}) {
    return (
        <div>
            <Head>
                <title>RestoreCord</title>
            </Head>

            <main>
                <h1>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>
                <div>
                    {users.map((users, index) => (
                        <div key={index}>
                            <p>{users.username}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer>
                <p>
                    Copyright © {new Date().getFullYear()} RestoreCord
                </p>
            </footer>
        </div>
    );
}

Home.getInitialProps = async () => {
    const response = await fetch("http://localhost:3000/api/users");
    const data = await response.json();
    return { users: data };
}