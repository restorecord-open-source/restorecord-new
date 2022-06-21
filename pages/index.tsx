import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "../components/landing/Footer";
import NavBar from "../components/landing/nav/navBar";
import FeaturesSection from "../components/landing/sections/Features";
import StatisticsSection from "../components/landing/sections/Statistics";
import SubscriptionPlansSection from "../components/landing/sections/SubscriptionPlans";
import TestimonialsSection from "../components/landing/sections/Testimonials";
import WelcomeSection from "../components/landing/sections/Welcome";

export default function Home() {
    return (
        <>
            <NavBar />

            <WelcomeSection />
            
            <FeaturesSection />

            <TestimonialsSection />

            <SubscriptionPlansSection />

            <StatisticsSection />

            <Footer />
        </>
    );
}