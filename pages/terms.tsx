import NavBar from "../components/landing/NavBar";
import Footer from "../components/landing/Footer";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Head from "next/head";

export default function Terms() {
    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem", background: "rgba(0, 0, 0, 0.75)" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Terms of Service" />
                </Head>
                
                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>

                    <NavBar />

                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography color="primary" variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "2.5rem", md: "3rem", lg: "4rem" } }}>
                            Terms of Service
                        </Typography>

                        <Typography variant="body1" component="div" sx={{ textAlign: "left", wordBreak: "break-word", mb: "4rem" }}>
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="agreement-to-terms">1. AGREEMENT TO TERMS</Typography>
                            <br/>These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&#34;you&#34;) and RestoreCord (&#34;Company,&#34; &#34;we,&#34; &#34;us,&#34; or &#34;our&#34;), concerning your access to and use of the <a href="https://restorecord.com">RestoreCord</a> website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”). You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                            <br/>Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use from time to time. We will alert you about any changes by updating the “Last updated” date of these Terms of Use, and you waive any right to receive specific notice of each such change. Please ensure that you check the applicable Terms every time you use our Site so that you understand which Terms apply. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms of Use by your continued use of the Site after the date such revised Terms of Use are posted.
                            <br/>The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Site from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
                            <br/>The Site is not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use this Site. You may not use the Site in a way that would violate the Gramm-Leach-Bliley Act (GLBA).
                            <br/>The Site is intended for users who are at least 13 years of age. All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Site. If you are a minor, you must have your parent or guardian read and agree to these Terms of Use prior to you using the Site.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="intellectual-property-rights">2. INTELLECTUAL PROPERTY RIGHTS</Typography>
                            <br/>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, international copyright laws, and international conventions.
                            <br/>The Content and the Marks are provided on the Site “AS IS” for your information and personal use only. Except as expressly provided in these Terms of Use, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                            <br/>Provided that you are eligible to use the Site, you are granted a limited license to access and use the Site and to download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use.
                            <br/>We reserve all rights not expressly granted to you in and to the Site, the Content and the Marks.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="user-accounts">3. USER ACCOUNTS</Typography>
                            <br/>If you create an account on the Site, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it.
                            <br/>We may, but have no obligation to, monitor and review new accounts before you may sign in and use our Services. Providing false contact information of any kind may result in the termination of your account.
                            <br/>You must immediately notify us of any unauthorized uses of your account or any other breaches of security. We will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions.
                            <br/>We may suspend, disable, or delete your account (or any part thereof) if we determine that you have violated any provision of these Terms of Use or that your conduct or content would tend to damage our reputation and goodwill.
                            <br/>If we delete your account for the foregoing reasons, you may not re-register for our Services.

                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="user-representations">4. USER REPRESENTATIONS</Typography>
                            By using the Site, you represent and warrant that:
                            <br/>All registration information you submit will be true, accurate, current, and complete.
                            <br/>You will maintain the accuracy of such information and promptly update such registration information as necessary.
                            <br/>You have the legal capacity and you agree to comply with these Terms of Use.
                            <br/>You are not under the age of 13.
                            <br/>You are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Site.
                            <br/>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.
                            <br/>You will not use the Site for any illegal or unauthorized purpose.
                            <br/>Your use of the Site will not violate any applicable law or regulation.
                            <br/>If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Site (or any portion thereof).
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="user-registration">5. USER REGISTRATION</Typography>
                            You may be required to register with the Site.
                            <br/>You agree to keep your password confidential and will be responsible for all use of your account and password.
                            <br/>We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.


                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="prohibited-activities">6. PROHIBITED ACTIVITIES</Typography>
                            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            <br/>As a user of the Site, you agree not to:
                            <br/>Using the Site for any purpose other than its intended use, unless specifically endorsed or approved by us for commercial endeavors
                            <br/>Systematically collecting data or content from the Site without our written permission
                            <br/>Attempting to trick, defraud, or mislead us or other users for personal gain, including attempting to obtain sensitive account information
                            <br/>Interfering with security-related features of the Site
                            <br/>Disparaging or harming us or the Site in any way
                            <br/>Using information obtained from the Site to harass, abuse, or harm others
                            <br/>Making improper use of our support services or submitting false reports
                            <br/>Violating any applicable laws or regulations while using the Site
                            <br/>Engaging in unauthorized framing or linking to the Site
                            <br/>Uploading or transmitting viruses, Trojan horses, or other harmful material that interferes with the Site or its features
                            <br/>Engaging in automated use of the system or using data mining, robots, or similar tools
                            <br/>Deleting copyright or other proprietary notices from any content
                            <br/>Attempting to impersonate another user or person
                            <br/>Uploading or transmitting any material that collects or transmits information without consent
                            <br/>Interfering with or disrupting the Site or its connected networks and services
                            <br/>Harassing, intimidating, or threatening our employees or agents
                            <br/>Attempting to bypass any measures designed to prevent or restrict access to the Site
                            <br/>Copying or adapting the Site&#39;s software or reverse engineering it
                            <br/>Using any automated system to access the Site or its content
                            <br/>Using a buying or purchasing agent to make purchases on the Site
                            <br/>Making unauthorized use of the Site, including collecting user information for unsolicited emails or creating false accounts
                            <br/>Using the Site to compete with us or for any commercial enterprise
                            <br/>Selling or transferring your account for money, goods, or services
                            <br/>Attacking the webserver or attempting arbitrary code execution
                            <br/>Attempting to libel RestoreCord with the intent of hurting its reputation
                            <br/>Creating multiple accounts.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="guidelines-for-reviews">7. GUIDELINES FOR REVIEWS</Typography>
                            We may provide you with areas on the Site where you can leave reviews or ratings. When posting a review, you must comply with the following criteria: (1) you should have firsthand experience with the person/entity being reviewed; (2) your reviews should not contain offensive profanity or abusive, racist, offensive, or hate language; (3) your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability; (4) your reviews should not contain references to illegal activity; (5) you should not be affiliated with competitors if posting negative reviews; (6) you should not make any conclusions as to the legality of conduct; (7) you may not post any false or misleading statements; and (8) you may not organize a campaign encouraging others to post reviews, whether positive or negative.
                            <br/>We may accept, reject, or remove reviews at our sole discretion. We have absolutely no obligation to screen reviews or to delete reviews, even if anyone considers reviews objectionable or inaccurate. Reviews are not endorsed by us and do not necessarily represent our opinions or the views of any of our affiliates or partners. We do not assume liability for any review or for any claims, liabilities, or losses resulting from any review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide, royalty-free, fully-paid, assignable, and sublicensable right and license to reproduce, modify, translate, transmit by any means, display, perform, and/or distribute all content relating to reviews.

                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="submissions">8. SUBMISSIONS</Typography>
                            <br/>You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information regarding the Site (&#34;Submissions&#34;) provided by you to us are non-confidential and shall become our sole property. We shall own exclusive rights, including all intellectual property rights, and shall be entitled to the unrestricted use and dissemination of these Submissions for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you. You hereby waive all moral rights to any such Submissions, and you hereby warrant that any such Submissions are original with you or that you have the right to submit such Submissions. You agree there shall be no recourse against us for any alleged or actual infringement or misappropriation of any proprietary right in your Submissions.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="third-party-website-and-content">9. THIRD-PARTY WEBSITE AND CONTENT</Typography>
                            <br/>The Site may contain (or you may be sent via the Site) links to other websites (&#34;Third-Party Websites&#34;) as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties (&#34;Third-Party Content&#34;). Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the Site or any Third-Party Content posted on, available through, or installed from the Site, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content. Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us. If you decide to leave the Site and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Terms of Use no longer govern. You should review the applicable terms and policies, including privacy and data gathering practices, of any website to which you navigate from the Site or relating to any applications you use or install from the Site. Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases which are exclusively between you and the applicable third party. You agree and acknowledge that we do not endorse the products or services offered on Third-Party Websites and you shall hold us harmless from any harm caused by your purchase of such products or services. Additionally, you shall hold us harmless from any losses sustained by you or harm caused to you relating to or resulting in any way from any Third-Party Content or any contact with Third-Party Websites.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="site-management">10. SITE MANAGEMENT</Typography>
                            <br/>We reserve the right, but not the obligation, to: (1) monitor the Site for violations of these Terms of Use; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Use, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Site or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Site in a manner designed to protect our rights and property and to facilitate the proper functioning of the Site.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="privacy-policy">11. PRIVACY POLICY</Typography>
                            <br/>We care about data privacy and security. Please review our <a href="https://restorecord.com/privacy/">Privacy Policy</a>. By using the Site, you agree to be bound by our Privacy Policy, which is incorporated into these Terms of Use. Please be advised the Site is hosted in United Kingdom. If you access the Site from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in United Kingdom, then through your continued use of the Site, you are transferring your data to United Kingdom, and you agree to have your data transferred to and processed in United Kingdom. Further, we do not knowingly accept, request, or solicit information from children or knowingly market to children. Therefore, in accordance with the U.S. Children&#39;s Online Privacy Protection Act, if we receive actual knowledge that anyone under the age of 13 has provided personal information to us without the requisite and verifiable parental consent, we will delete that information from the Site as quickly as is reasonably practical.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="term-and-termination">12. TERM AND TERMINATION</Typography>
                            <br/>These Terms of Use shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF USE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF USE OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SITE OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
                            <br/>If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
                           
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="modifications-and-interruptions">13. MODIFICATIONS AND INTERRUPTIONS</Typography>
                            <br/>We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
                            <br/>We cannot guarantee the Site will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Site, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Site at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Site during any downtime or discontinuance of the Site. Nothing in these Terms of Use will be construed to obligate us to maintain and support the Site or to supply any corrections, updates, or releases in connection therewith.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="user-data">14. USER DATA</Typography>
                            <br/>We will maintain certain data that you transmit to the Site for the purpose of managing the performance of the Site, as well as data relating to your use of the Site. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Site. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="miscellaneous">15. MISCELLANEOUS</Typography>
                            <br/>These Terms of Use and any policies or operating rules posted by us on the Site or in respect to the Site constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Terms of Use shall not operate as a waiver of such right or provision. These Terms of Use operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Terms of Use is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Terms of Use and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Terms of Use or use of the Site. You agree that these Terms of Use will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Terms of Use and the lack of signing by the parties hereto to execute these Terms of Use.
                            
                            <Typography variant="h6" component="h2" sx={{ mt: "3rem" }} id="contact-us">16. CONTACT US</Typography>
                            <br/>In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
                            <br/><br/>SMS (only): <a href="tel:+15083883458">+1 (508)-388-3458</a>
                            <br/>Email: <a href="mailto:contact@restorecord.com">contact@restorecord.com</a>
                        </Typography>
                    </Box>
                </Container>

                <Footer />
            </Box>
        </>
    )   
}