import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import Footer from "../components/landing/sections/Footer";
import NavBar from "../components/landing/NavBar";
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