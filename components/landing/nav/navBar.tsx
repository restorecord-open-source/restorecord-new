import Link from "next/link";
import styles from "../../../public/styles/navBar.module.css";
import TextLogo from "./TextLogo";
import { useEffect, useState } from "react";
import functions from "../../../src/functions";
import router from "next/router";

export default function NavBar() {
    const [button, setButten] = useState({
        text: "Login",
        href: "/login"
    });

    const checkSession = async () => {
        await fetch(`/api/v1/user`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${localStorage.getItem("token")}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setButten({
                        text: "Login",
                        href: "/login"
                    });
                }
                else {
                    setButten({
                        text: "Dashboard",
                        href: "/dashboard"
                    });
                }
            })
    }

    useEffect(() => {
        window.addEventListener("storage", async function (e) {
            checkSession();
        });

        if (localStorage.getItem("token")) {
            checkSession();
        }
    }, []);

    return (
        <header className="header sticky top-0 z-10 flex w-full items-center justify-between py-5 border-b border-slate-800 backdrop-filter backdrop-blur-lg bg-opacity-30 transition-all">
            <div className="logo mx-12 xl:mx-32 hidden md:block cursor-pointer">
                <Link href="/">
                    <h2 className="text-gray-200 font-bold text-xl">Restore<span className="text-indigo-600">Cord</span></h2>
                </Link>
            </div>

            <div className="md:hidden mx-8">
                <div className="flow-root">
                    <TextLogo />
                    <div className={styles.mobileNavWrapper}>
                        <Link href={button.href}>
                            <button className={styles.mobileNavButton}>
                                {button.text}
                            </button>
                        </Link>
                    </div>
                </div>

                <div x-show="showMenu">
                    <nav className="navbar mb-0 flex flex-col" style={{ paddingInlineStart: "40px" }}>
                        <ul className="flex gap-1 space-x-0 sxl:space-x-6 sx:space-x-12 smx:space-x-20 mdx:space-x-32 transition-all">
                            <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                <Link href="/">Home</Link>
                            </li>
                            <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                <Link href="/#pricing">Pricing</Link>
                            </li>
                            <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                <Link href="/#stats">Statistics</Link>
                            </li>
                            <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                <a href="/api/support" target="_blank">Support</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <nav className="navbar hidden md:block" id="navbar">
                <TextLogo />
                <ul className="mb-6 md:mb-0 md:flex">
                    <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                        <Link href="/">Home</Link>
                    </li>
                    <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                        <Link href="/#pricing">Pricing</Link>
                    </li>
                    <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                        <Link href="/#stats">Statistics</Link>
                    </li>
                    <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                        <a href="/api/support" target="_blank">Support</a>
                    </li>
                </ul>
            </nav>
                
            <div className="hidden md:flex md:items-center text-gray-200 mx-12 xl:mx-32">
                <Link href={button.href}>
                    <button className={styles.desktopNavButton}>
                        {button.text}
                    </button>
                </Link>
            </div>

        </header>
    )
}