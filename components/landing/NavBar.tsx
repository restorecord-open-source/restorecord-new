import Link from "next/link";
import styles from "../../public/styles/navBar.module.css";
import { useEffect, useState } from "react";

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

        try {
            if (localStorage.getItem("token")) {
                checkSession();
            }
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <header className="header sticky top-0 z-10 md:flex w-full items-center justify-between py-5 border-b border-slate-800 backdrop-filter backdrop-blur-lg bg-opacity-30 transition-all">
            <div className="logo mx-12 xl:mx-32 hidden md:block cursor-pointer">
                <Link href="/">
                    <h2 className="text-gray-200 font-bold text-xl">Restore<span className="text-indigo-600">Cord</span></h2>
                </Link>
            </div>

            <div className="md:hidden mx-8">
                <div className="flex flex-row">
                    <div className="cursor-pointer flex-1">
                        <Link href="/">
                            <h2 className="text-gray-200 font-bold text-xl md:hidden">Restore<span className="text-indigo-600">Cord</span></h2>
                        </Link>
                    </div>
                    <Link href={button.href}>
                        <a href={button.href}>
                            <button className="focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all">
                                {button.text}
                            </button>
                        </a>
                    </Link>
                </div>

                <div x-show="showMenu">
                    <nav className="flex flex-col navbar mb-0 items-center">
                        <ul className="flex gap-4 transition-all">
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
                                <a href="https://community.restorecord.com" target="_blank" rel="noreferrer">Support</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <nav className="navbar hidden md:block" id="navbar">
                <div className="cursor-pointer">
                    <Link href="/">
                        <h2 className="text-gray-200 font-bold text-xl md:hidden">Restore<span className="text-indigo-600">Cord</span></h2>
                    </Link>
                </div>
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
                        <a href="https://community.restorecord.com" target="_blank" rel="noreferrer">Support</a>
                    </li>
                </ul>
            </nav>
                
            <div className="hidden md:flex md:items-center text-gray-200 mx-12 xl:mx-32">
                <Link href={button.href}>
                    <a href={button.href}>
                        <button className={styles.desktopNavButton}>
                            {button.text}
                        </button>
                    </a>
                </Link>
            </div>

        </header>
    )
}