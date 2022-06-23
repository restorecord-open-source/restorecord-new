import Image from "next/image"

export default function Dashboard() {
    return (
        <>
            {/* tailwindcss sidebar */}
            <aside className="w-64" aria-label="Sidebar">
                <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800 h-screen">
                    <span className="flex items-center pl-2.5 mb-5">
                        <Image  height="64px" width="64px" className="mr-3 h-6 sm:h-7" alt="RestoreCord Logo" src="https://cdn.discordapp.com/attachments/976091957652770956/989333901954646056/restorecord_logo_only_r.png" />
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">RestoreCord</span>
                    </span>
                    <ul className="space-y-2">

                    </ul>
                </div>
            </aside>
        </>
    )
}