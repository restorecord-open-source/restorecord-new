import { faServer, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios";
import { useEffect, useRef } from "react"
import { useQuery } from "react-query";

async function getStats() {
    return await axios.get(`/api/v1/stats`, {
        validateStatus: () => true
    })
        .then((res: any) => { return res.data; })
        .catch((err: any) => { return err; });
        
}

export default function StatisticsSection() {

    const accountsRef: any = useRef();
    const serversRef: any = useRef();
    const membersRef: any = useRef();

    useQuery('stats', async () => await getStats(), { retry: false, onSuccess(data) {
        accountsRef.current.innerText = data.accounts;
        serversRef.current.innerText = data.servers;
        membersRef.current.innerText = data.members;

        accountsRef.current.classList.remove(...accountsRef.current.classList);
        serversRef.current.classList.remove(...serversRef.current.classList);
        membersRef.current.classList.remove(...membersRef.current.classList);
    }, });

    return (
        <section className="pt-20 pb-20 px-10" id="stats">
            <h2 className="font-bold text-4xl text-center text-gray-200">Statistics</h2>

            <div className="cards mt-10 sm:grid sm:grid-cols-1 sm:gap-5 lg:grid-cols-3 xl:px-32">
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon icon={faUser} className="text-white bg-indigo-600 p-5 rounded-full mb-5" />
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Accounts</h4>
                    <span ref={accountsRef} className="animate-pulse h-5 w-12 bg-slate-700 rounded flex mx-auto"></span>
                </div>

                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon icon={faServer} className="text-white bg-indigo-600 p-5 rounded-full mb-5 " />
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Servers</h4>
                    <span ref={serversRef} className="animate-pulse h-5 w-12 bg-slate-700 rounded flex mx-auto"></span>
                </div>

                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon icon={faUserGroup} className="text-white bg-indigo-600 p-5 rounded-full mb-5" />
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Members</h4>
                    <span ref={membersRef} className="animate-pulse h-5 w-12 bg-slate-700 rounded flex mx-auto"></span>
                </div>
            </div>
        </section>
    )
}