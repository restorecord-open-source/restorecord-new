import React from "react";
import Link from "next/link";

export default function TextLogo() {
    return (
        <div className="cursor-pointer">
            <Link href="/">
                <h2 className="text-gray-200 font-bold text-xl md:hidden">Restore<span className="text-indigo-600">Cord</span></h2>
            </Link>
        </div>
    )
}