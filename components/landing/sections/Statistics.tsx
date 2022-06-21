import { faServer, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function StatisticsSection() {
    return (
        <section className="pt-20 pb-20 px-10" id="stats">
            <h2 className="font-bold text-4xl text-center text-gray-200">Statistics</h2>

            <div className="cards mt-10 sm:grid sm:grid-cols-1 sm:gap-5 lg:grid-cols-3 xl:px-32">
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="text-white bg-indigo-600 p-5 rounded-full mb-5" />
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Accounts</h4>
                    <div id="accounts" className="animate-pulse h-5 w-12 bg-slate-700 rounded flex mx-auto"></div>
                </div>

                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon icon={faServer} className="text-white bg-indigo-600 p-5 rounded-full mb-5 " />
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Servers</h4>
                    <div id="servers" className="animate-pulse h-5 w-12 bg-slate-700 rounded flex mx-auto"></div>
                </div>

                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon icon={faUserGroup} className="text-white bg-indigo-600 p-5 rounded-full mb-5" />
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Members</h4>
                    <div id="members" className="animate-pulse h-5 w-12 bg-slate-700 rounded flex mx-auto"></div>
                </div>
            </div>
        </section>
    )
}