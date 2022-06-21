import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SubscriptionList from "../../../src/SubscriptionList";

export default function SubscriptionPlansSection() {
    return (
        
        <section className="pt-20" id="pricing">
            <div className="px-10 text-center mb-5">
                <h4 className="font-bold text-3xl mb-1 text-gray-200">
                    Our Subscription Plans
                </h4>
            </div>

            <div className="grid grid-cols-1 gap-5 px-10 sm:grid-cols-1 lg:grid-cols-3 xl:px-32">
                {SubscriptionList.map((subscription, index) => (
                    // if subscription.bestplan is true, then set border-gray-400 to border-indigo-600
                    <div className={`${subscription.bestPlan ? "border-indigo-600 border-4" : "border-gray-400 border-2"} text-center rounded-lg shadow-lg p-6`} key={index}>
                        <h3 className="font-bold text-2xl mb-5 text-gray-200">{subscription.name}</h3>

                        <h5 className="text-5xl text-gray-200 font-bold">
                            {subscription.priceYearly}
                            <span className="text-gray-200 text-base font-semibold">/year</span>
                        </h5>

                        <ul className="text-left my-5">
                            {subscription.features.map((feature, index) => (
                                <li className="my-2 font-bold text-lg text-gray-200" key={index}>
                                    <FontAwesomeIcon icon={feature.icon} className={`${feature.icon === faCheck ? "text-green-500" : "text-red-500"} mr-2`} />
                                    {feature.value}
                                </li>
                            ))}
                        </ul>


                        <a href="https://restorecord.sell.app" className="bg-indigo-600 border border-indigo-600 block w-full rounded-lg p-3 hover:bg-indigo-700 text-white transition-all">
                            Select Plan
                        </a>
                    
                    </div>
                ))}
            </div>
        </section>
    )
}