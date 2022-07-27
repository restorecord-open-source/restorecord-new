import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tippy";
import SubscriptionList from "../../../src/SubscriptionList";
import Link from "next/link";

export default function SubscriptionPlansSection() {

    const [subscriptionType, setSubscriptionType] = useState("monthly");
    const [subscriptionToggle , setSubscriptionToggle] = useState(true);
    const toggleClass = " transform translate-x-6";

    useEffect(() => {
        setSubscriptionType("monthly");
    }, []);

    return (
        
        <section className="pt-20" id="pricing">
            <div className="px-10 text-center mb-5">
                <h4 className="font-bold text-3xl mb-1 text-gray-200">
                    Our Subscription Plans
                </h4>
            </div>

            <div className="flex justify-center">
                <p className="text-center text-gray-200">Monthly</p>

                <div className={"mx-5 mb-5 md:w-14 md:h-7 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all " + (subscriptionToggle ? "bg-slate-600" : "bg-indigo-600")}
                    onClick={() => {
                        setSubscriptionToggle(!subscriptionToggle);
                        subscriptionType === "monthly" ? setSubscriptionType("yearly") : setSubscriptionType("monthly");
                    }}>
                    <div className={"bg-white md:w-5 md:h-5 h-4 w-4 rounded-full shadow-md transform transition-all " +  (subscriptionToggle ? null : toggleClass)} />
                </div>

                <p className="text-center text-gray-200">Yearly</p>
            </div>

            <div className="grid grid-cols-1 gap-5 px-10 sm:grid-cols-1 lg:grid-cols-3 xl:px-32">
                {SubscriptionList.map((subscription, index) => (
                    <div className={`${subscription.bestPlan ? "border-indigo-600 border-4" : "border-gray-400 border-2"} text-center rounded-lg shadow-lg p-6`} key={index}>
                        <h3 className="font-bold text-2xl mb-5 text-gray-200">{subscription.name}</h3>

                        <h5 className="text-5xl text-gray-200 font-bold">
                            {subscriptionType === "monthly" ? subscription.priceMonthly : subscription.priceYearly}
                            <span className="text-gray-200 text-base font-semibold">/{subscriptionType}</span>
                        </h5>

                        <ul className="text-left my-5">
                            {subscription.features.map((feature, index) => (
                                <li className="my-4 font-bold text-lg text-gray-200 group" key={index}>
                                    <Tooltip title={feature.description} position={"top"} duration={200} theme={"dark"}>
                                        <FontAwesomeIcon icon={feature.icon} className={`${feature.icon === faCheck ? "text-green-500" : "text-red-500"} mr-2`} />
                                        {feature.value}
                                    </Tooltip>
                                </li>
                            ))}
                        </ul>

                        {subscription.name === "Free" ? (
                            <Link href="/register">
                                <a className="bg-indigo-600 border border-indigo-600 block w-full rounded-lg p-3 hover:bg-indigo-700 text-white transition-all">
                                    Register
                                </a>
                            </Link>
                        ) : (
                            <a target="_blank" rel="noreferrer" href={`https://restorecord.sell.app/product/${subscription.name.toLowerCase()}`} className="bg-indigo-600 border border-indigo-600 block w-full rounded-lg p-3 hover:bg-indigo-700 text-white transition-all">
                                Purchase
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}