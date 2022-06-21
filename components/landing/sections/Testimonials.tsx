import React from "react";
import Image from "next/image";

export default function TestimonialsSection() {
    return (
        
        <section className="bg-slate-900 pb-20 md:grid md:grid-cols-2 md:items-center xl:px-32">
            <div className="pt-5 px-10">
                <h5 className="uppercase text-indigo-600 text-xl">
                    What our customers say
                </h5>
                <h3 className="font-bold text-3xl mt-2 mb-4 lg:text-6xl text-gray-200">
                    Testimonials
                </h3>
                <p className="mb-10 text-gray-200">
                    Don&#39;t just take our word for it, read what our customers have to say about us.
                </p>
                <a href="https://www.trustpilot.com/review/restorecord.com"
                    className="bg-indigo-600 p-3 rounded-lg text-white shadow-lg transition-all border-2 border-indigo-600 hover:shadow-sm cursor-pointer hover:bg-transparent hover:text-indigo-600 font-bold">
                    Read More
                </a>
            </div>

            <div className="cards px-10 mt-16 grid grid-cols-1 gap-5">
                <div className="card flex justify-between pl-6 pr-6 md:pl-16 md:pr-16 p-5 rounded-lg shadow-lg transition-all hover:shadow-sm bg-slate-800 text-white">
                    <div>
                        <h2 className="font-bold text-xl mb-3">Perfect uptime, support and features.</h2>
                        <p className="mr-5 mb-3">Perfect uptime, support and features. I&#39;ve been using Restorecord since almost two months, it is working totally fine and the support is faster then light Really recommending it</p>
                        <h6 className="font-bold text-gray-200">
                            <a href="https://www.trustpilot.com/users/62205ecafd05820013406dd9">ZsoZso</a>
                        </h6>
                    </div>

                    <div>
                        <a href="https://www.trustpilot.com/users/62205ecafd05820013406dd9">
                            <div className="flex items-center justify-center w-12 h-12 font-bold rounded-full select-none text-black bg-cyan-100">
                                ZS
                            </div>
                        </a>
                    </div>
                </div>

                <div className="card flex justify-between pl-6 pr-6 md:pl-16 md:pr-16 p-5 rounded-lg shadow-lg transition-all hover:shadow-sm bg-slate-800 text-white">
                    <div>
                        <h2 className="font-bold text-xl mb-3">Top Service!</h2>
                        <p className="mr-5 mb-3">I use restorecord since 2019 and I am still happy, it does what it should do pulling members fine and yea. Also the new owner made a lot of cool updates in his short time. I recommend buying :D</p>
                        <h6 className="font-bold text-gray-200">
                            <a href="https://www.trustpilot.com/users/6089953ea954eb001c618960">Visual</a>
                        </h6>
                    </div>

                    <div>
                        <a href="https://www.trustpilot.com/users/6089953ea954eb001c618960">
                            <div className="flex items-center justify-center w-12 h-12 font-bold rounded-full select-none text-black bg-yellow-100">
                                VI
                            </div>
                        </a>
                    </div>
                </div>

                <div className="card flex justify-between pl-6 pr-6 md:pl-16 md:pr-16 p-5 rounded-lg shadow-lg transition-all hover:shadow-sm bg-slate-800 text-white">
                    <div>
                        <h2 className="font-bold text-xl mb-3">It pulls members fast</h2>
                        <p className="mr-5 mb-3">It pulls members fast, I mean for 10€ a year it&#39;s worth!</p>
                        <h6 className="font-bold text-gray-200">
                            <a href="https://www.trustpilot.com/users/621f58afd1a8dc001289dcff">Aci</a>
                        </h6>
                    </div>

                    <div>
                        <a href="https://www.trustpilot.com/users/621f58afd1a8dc001289dcff">
                            <div className="flex items-center justify-center w-12 h-12 font-bold rounded-full select-none text-black bg-pink-100">
                                AC
                            </div>
                        </a>
                    </div>
                </div>

            </div>
        </section>
    )
}