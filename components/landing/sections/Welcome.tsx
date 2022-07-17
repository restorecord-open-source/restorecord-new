import React from "react";
import Link from "next/link";

export default function WelcomeSection() {
    return (
        <section className="showcase py-20 px-10 flex flex-col items-center justify-center">
            <h1 className="text-gray-200 font-bold text-5xl mb-5 text-center lg:text-8xl">The <span className="text-indigo-600">only</span> Backup Bot</h1>
            <p className="text-gray-200 lg:text-xl text-center">RestoreCord helps you Backup your Discord Server, you can save your Server Channels, Roles, Settings and Members.</p>
                
            <div className="relative mt-10">
                <Link href="/register">
                    <button className="bg-indigo-600 p-3 rounded-full text-white block w-44 text-center shadow-lg transition-all border-2 border-indigo-600 hover:shadow-sm cursor-pointer hover:bg-transparent hover:text-indigo-600">
                        Purchase Now
                    </button>
                </Link>
                <p className="absolute -top-3 -right-2 bg-green-500 py-1 px-2 rounded-full text-white text-xs">only $9.99/year</p>
                <Link href="https://discord.gg/restorecordbot">
                    <button className="block w-44 text-indigo-600 text-center mt-4">
                        Support Server
                    </button>
                </Link>
            </div>
        </section>
    )
}