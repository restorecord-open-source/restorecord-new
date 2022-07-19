import { useRouter } from "next/router";
import { useToken } from "../../src/token";
import { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SubscriptionList from "../../src/SubscriptionList";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export default function DashUpgrade({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    if (!user.username) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    return (
        <>
            <Toaster />

            <div className="lg:mx-32 lg:mt-12 md:mt-8 md:mx-20 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
                        Upgrade
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
                        Upgrade your account to get more features.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 rounded-lg border shadow-md bg-gray-900 border-gray-800 p-4">
                    {SubscriptionList.map((subscription, index) => (
                        <div className={`mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700 text-center`} key={index}>
                            <h3 className="font-bold text-2xl mb-5 text-gray-200">{subscription.name}</h3>

                            <h5 className="text-5xl text-gray-200 font-bold">
                                {subscription.priceYearly}
                                <span className="text-gray-200 text-base font-semibold">/yearly</span>
                            </h5>

                            <ul className="text-left my-5">
                                {subscription.features.map((feature, index) => (
                                    <li className="my-4 font-bold text-lg text-gray-200 group" key={index} title={feature.description}>
                                        <FontAwesomeIcon icon={feature.icon} className={`${feature.icon === faCheck ? "text-green-500" : "text-red-500"} mr-2`} />
                                        {feature.value}
                                    </li>
                                ))}
                            </ul>

                            {/* show all subscription types if user.role == subscription.name then disable the button */}
                            {user.role.toLowerCase() === subscription.name.toLowerCase() ? (
                                <button className={`cursor-not-allowed bg-indigo-800 border-indigo-800 border block w-full rounded-lg p-3 text-white transition-all`}>
                                    Current
                                </button>
                            ) : (
                                <a href={`${subscription.name.includes("Free") ? "#" : `https://shop.restorecord.com/product/${subscription.name}`}`} target="_blank" rel="noopener noreferrer" className={`${subscription.name.includes("Free") ? "cursor-not-allowed" : ""} bg-indigo-600 border-indigo-600 border block w-full rounded-lg p-3 hover:bg-indigo-700 text-white transition-all`}>
                                    Purchase
                                </a> 
                            )}

                            {/* <a href={`${subscription.name.includes("Free") ? "#" : `https://shop.restorecord.com/product/${subscription.name}`}`} target="_blank" rel="noopener noreferrer" className={`${subscription.name.includes("Free") ? "cursor-not-allowed" : ""} bg-indigo-600 border-indigo-600 border block w-full rounded-lg p-3 hover:bg-indigo-700 text-white transition-all`}>
                                Select Plan
                            </a> */}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}