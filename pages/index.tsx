import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import TextLogo from "../components/textLogo";

export default function Home() {
    return (
        <div>
            <Head>
                <title>RestoreCord</title>
            </Head>

            <header className="header sticky top-0 z-10 flex w-full items-center justify-between py-5 border-b border-slate-800 backdrop-filter backdrop-blur-lg bg-opacity-30 transition-all">
                <div className="logo mx-12 xl:mx-32 hidden md:block">
                    <h2 className="text-gray-200 font-bold text-xl">Restore<span className="text-indigo-600">Cord</span></h2>
                </div>

                <div className="md:hidden mx-8">
                    <div className="flow-root">
                        <TextLogo />
                        <div>
                            <Link href="/dashboard" className="float-right ml-1 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 hover:text-gray-100 transition-all hidden sxl:block">
                                Dashboard
                            </Link>
                            <Link href="/register" className="float-right mr-1 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 hover:text-gray-100 transition-all">
                                Signup
                            </Link>
                        </div>
                    </div>

                    <div x-show="showMenu">
                        <nav className="navbar mb-0 flex flex-col">
                            <ul className="flex gap-1 space-x-0 sxl:space-x-6 sx:space-x-12 smx:space-x-20 mdx:space-x-32">
                                <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                    <a href="#home">Home</a>
                                </li>
                                <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                    <a href="#features">Features</a>
                                </li>
                                <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                    <a href="#pricing">Pricing</a>
                                </li>
                                <li className="font-semibold text-slate-200 hover:text-gray-400 transition-all">
                                    <a href="#stats">Statistics</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <nav className="navbar hidden md:block" id="navbar">
                    <TextLogo />
                    <ul className="mb-6 md:mb-0 md:flex">
                        <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                            <a href="#home">Home</a>
                        </li>
                        <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                            <a href="#features">Features</a>
                        </li>
                        <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                            <a href="#pricing">Pricing</a>
                        </li>
                        <li className="mb-2 border-b border-gray-200 md:border-0 md:mx-2 font-semibold text-slate-200 hover:text-slate-400 transition-all">
                            <a href="#stats">Statistics</a>
                        </li>
                    </ul>
                </nav>

            </header>

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