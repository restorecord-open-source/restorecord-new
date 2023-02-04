import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function StripeCheckout({ client_secret, price, plan, email }: any) {
    const elements: any = useElements();
    const stripe: any = useStripe();
    
    const [paymentError, setPaymentError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    async function handleSubmitStripe(e: any) {
        console.log("handleSubmitStripe");
        e.preventDefault();
        setPaymentProcessing(true);
    
        const payload = await stripe.confirmCardPayment(client_secret, {
            receipt_email: email,
            payment_method: {
                card: elements.getElement(CardElement)
            }
        });
    
        if (payload.error) {
            setPaymentError(`Payment failed ${payload.error.message}`);
            setPaymentProcessing(false);
        } else {
            setPaymentError("");
            setPaymentProcessing(false);
            setPaymentSuccess(true);
        }
    }

    return (
        <>
            <form id="payment-form" style={{ width: "100%" }} onSubmit={handleSubmitStripe}>
                

                {!paymentSuccess && (
                    <>
                        <Typography variant="h6" gutterBottom component="div">
                            Payment details
                        </Typography>
                        <CardElement id="card-element" options={{
                            style: {
                                base: {
                                    color: "#fff",
                                },
                                invalid: {
                                    fontFamily: 'Arial, sans-serif',
                                    color: "#fa755a",
                                    iconColor: "#fa755a"
                                }
                            }
                        }} />
                    </>
                )}

                {paymentSuccess && (
                    <>
                        <Typography variant="h6" color="success">
                            Thank you for Upgrading to: {plan}!
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Account upgrades are instant and you can now use all features, if you have any questions please contact us at <a href="mailto:contact@restorecord.com">contact@restorecord.com</a>
                        </Typography>
                    </>
                )}

                {paymentError && (
                    <Typography variant="body2" color="error" sx={{ mt: 2}}>
                        {paymentError}
                    </Typography>
                )}

                <Button variant="contained" sx={{ mt: 3, width: "100%" }} id="submit" type="submit" data-secret={client_secret} disabled={paymentProcessing || paymentSuccess || !stripe}>
                    {paymentProcessing ? "Processing..." : `Pay $${price}`}
                </Button>
            </form>
        </>
    )
}