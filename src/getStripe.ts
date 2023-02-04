import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        //stripePromise = loadStripe("pk_test_51LntpRIDsTail4YBw4xTQ6vVWquPvE1JtXkPkxmhSAL1rpFWN2grsspBjiFEkjIhND6NbavkO3rWWVqzIcd7iLcr00K6yyuLxL");
    }
    return stripePromise;
};

export default getStripe;