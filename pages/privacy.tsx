import NavBar from "../components/landing/NavBar";
import Footer from "../components/landing/Footer";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Head from "next/head";

export default function Privacy() {
    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem", background: "rgba(0, 0, 0, 0.75)" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Privacy Policy" />
                </Head>
                
                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>

                    <NavBar />

                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography color="primary" variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "2.5rem", md: "3rem", lg: "4rem" } }}>
                            Privacy Policy
                        </Typography>
                        <Typography variant="body1" component="div" sx={{ textAlign: "left", wordBreak: "break-word", mb: "4rem" }}>
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="what-information-do-we-collect">1. WHAT INFORMATION DO WE COLLECT?</Typography>
                            <br/>Personal information you disclose to us
                            <br/>In Short: We collect personal information that you provide to us.
                            <br/>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                            <br/>Personal Information Provided by You. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
                            <br/>email addresses
                            <br/>usernames
                            <br/>passwords (hashed)
                            <br/>ip address
                            <br/>discord <strong>oauth2</strong> tokens (NOT account token)
                            <br/>discord <strong>oauth2</strong> information (e.g. username, avatar, banner)
                            <br/>Payment Data, is stored by our payment processor (Stripe) and we do not have access to it. For more information, please see Stripe&#39;s privacy policy here: <a href="https://stripe.com/privacy">https://stripe.com/privacy</a>
                            <br/>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information. 
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="how-do-we-process-your-information">2. HOW DO WE PROCESS YOUR INFORMATION?</Typography>
                            <br/>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
                            <br/>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
                            <br/>To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.
                            <br/>To save or protect an individual&#39;s vital interest. We may process your information when necessary to save or protect an individual&#34;s vital interest, such as to prevent harm.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="when-and-with-whom-do-we-share-your-personal-information">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</Typography>
                            <br/>In Short: We may share information in specific situations described in this section and/or with the following third parties.
                            <br/>We may need to share your personal information in the following situations:
                            <br/>Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="how-long-do-we-keep-your-information">4. HOW LONG DO WE KEEP YOUR INFORMATION?</Typography>
                            <br/>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
                            <br/>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
                            <br/>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
                          
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="how-do-we-keep-your-information-safe">5. HOW DO WE KEEP YOUR INFORMATION SAFE?</Typography>
                            <br/>In Short: We aim to protect your personal information through a system of organizational and technical security measures.
                            <br/>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="do-we-make-updates-to-this-notice">6. DO WE MAKE UPDATES TO THIS NOTICE?</Typography>
                            <br/>In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.
                            <br/>We may update this privacy notice from time to time. The updated version will be indicated by an updated &#34;Revised&#34; date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="how-can-you-contact-us-about-this-notice">7. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</Typography>
                            <br/>If you have questions or comments about this notice, you may email us at <a href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="how-can-you-review-update-or-delete-the-data-we-collect-from-you">8. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</Typography>
                            <br/>Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please submit a request form by clicking here.
                        </Typography>
                    </Box>
                </Container>

                <Footer />
            </Box>
        </>
    )
}