import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faGear, faNetworkWired, faPen, faUserSlash, faUserXmark } from "@fortawesome/free-solid-svg-icons";

export default function FeaturesSection() {
    return (
        <section className="pt-32 pb-20 px-10" id="features">
            <h2 className="font-bold text-4xl text-center text-gray-200">Our Features</h2>
            <div className="cards mt-10 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:px-32">
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon className="text-white bg-indigo-600 p-5 rounded-full mb-5" icon={faGear}></FontAwesomeIcon>
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Backup Server Settings</h4>
                    <p>Our Bot will let you Backup all of your Server&#39;s Channels, Roles, User Roles and Settings.</p>
                </div>
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon className="text-white bg-indigo-600 p-5 rounded-full mb-5" icon={faUserXmark}></FontAwesomeIcon>
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Auto Kick</h4>
                    <p>We will automatically kick your non verified members.</p>
                </div>
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon className="text-white bg-indigo-600 p-5 rounded-full mb-5" icon={faPen}></FontAwesomeIcon>
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Customization</h4>
                    <p>You can customize every message the bot has sent, and almost every element on the Verification Page.</p>
                </div>
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon className="text-white bg-indigo-600 p-5 rounded-full mb-5" icon={faFile}></FontAwesomeIcon>
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Verification Logs</h4>
                    <p>Want to see when people verify? We offer Verification Logs via Discord Webhooks.</p>
                </div>
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon className="text-white bg-indigo-600 p-5 rounded-full mb-5" icon={faNetworkWired}></FontAwesomeIcon>
                    <h4 className="font-bold text-xl mb-2 text-gray-200">Anti VPN/Proxy</h4>
                    <p>We offer a premium level Anti VPN, so no one using a VPN or Proxy can verify.</p>
                </div>
                <div className="card px-5 pt-10 pb-5 mb-10 rounded-lg shadow-lg transition-all hover:shadow-sm text-center sm:mb-0 bg-slate-800 text-gray-300">
                    <FontAwesomeIcon className="text-white bg-indigo-600 p-5 rounded-full mb-5" icon={faUserSlash}></FontAwesomeIcon>
                    <h4 className="font-bold text-xl mb-2 text-gray-200">IP Ban</h4>
                    <p>Want to Permanently Ban someone from your Server? We have IP Bans which will help banning a person from your Server.
                    </p>
                </div>
            </div>
        </section>
    )
}
