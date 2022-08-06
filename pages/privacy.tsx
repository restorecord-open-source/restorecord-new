import Head from "next/head";
import NavBar from "../components/landing/NavBar";
import styles from "../public/styles/index.module.css"

export default function Privacy() {
    return (
        <>
            <Head>
                <title>RestoreCord | Privacy Policy</title>
                <meta name="description" content="What information does RestoreCord have? We only collect information that is necessary to provide you with the services you request." />
            </Head>

            <NavBar />

            <section className="py-20 px-10">
                <h1 className="font-bold text-5xl mb-5 text-center lg:text-8xl text-gray-200">Privacy Policy</h1>

                <div className="items-left justify-start text-left md:pl-24 md:pr-24 lg:pl-32 lg:pr-32">

                    <p className={styles.title}>1. WHAT INFORMATION DO WE COLLECT?</p>
                    <p className={styles.paragraph}>Personal information you disclose to us</p>
                    <br/>
                    <p className={styles.paragraph}>In Short: We collect personal information that you provide to us.</p>
                    <br/>
                    <p className={styles.paragraph}>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
                    <br/>
                    <p className={styles.paragraph}>Personal Information Provided by You. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
                    <p className={styles.paragraph}>email addresses</p>
                    <p className={styles.paragraph}>usernames</p>
                    <p className={styles.paragraph}>passwords (hashed)</p>
                    <p className={styles.paragraph}>ip address</p>
                    <p className={styles.paragraph}>discord oauth2 tokens (not account)</p>
                    <p className={styles.paragraph}>discord oauth2 information (e.g. username, avatar, banner)
                    </p>
                    <br/>
                    <p className={styles.paragraph}>Payment Data. We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by Sellix.io. You may find their privacy notice link(s) here: <a className={styles.link} href="https://sell.app/privacy-policy">Sell.app — Privacy Policy</a>.</p>
                    <br/>
                    <p className={styles.paragraph}>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information. </p>
                    <br/>
                    <p className={styles.title}>2. HOW DO WE PROCESS YOUR INFORMATION?</p>
                    <p className={styles.paragraph}>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
                    </p><p>
                        <br/>
                    </p><p className={styles.paragraph}>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
                    </p><p>
                    </p><p className={styles.paragraph}>To facilitate account creation and authentication and otherwise manage user accounts. We may process your information so you can create and log in to your account, as well as keep your account in working order.
                    </p><p>
                        <br/>
                    </p><p className={styles.paragraph}>To save or protect an individual&#39;s vital interest. We may process your information when necessary to save or protect an individual&#34;s vital interest, such as to prevent harm.
                    </p><p>
                        <br/>
                    </p><p className={styles.title}>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
                    </p>
                    <p className={styles.paragraph}>In Short: We may share information in specific situations described in this section and/or with the following third parties.
                    </p><p>
                        <br/>
                    </p><p className={styles.paragraph}>We may need to share your personal information in the following situations:
                    </p><p>
                    </p><p className={styles.paragraph}>Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
                    </p><p>
                        <br/>
                    </p><p className={styles.title}>4. HOW LONG DO WE KEEP YOUR INFORMATION?</p>
                    <p className={styles.paragraph}>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
                    </p><p>
                        <br/>
                    </p><p className={styles.paragraph}>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.
                    </p><p>
                        <br/>
                    </p><p className={styles.paragraph}>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
                    </p><p>
                        <br/>
                    </p><p className={styles.title}>5. HOW DO WE KEEP YOUR INFORMATION SAFE?</p>
                    <p className={styles.paragraph}>In Short: We aim to protect your personal information through a system of organizational and technical security measures.
                    </p><p>
                    </p><p className={styles.paragraph}>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
                    </p>
                    <br/>
                    <p className={styles.title}>6. DO WE MAKE UPDATES TO THIS NOTICE?</p>
                    <p className={styles.paragraph}>In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.
                    </p><p>
                    </p><p className={styles.paragraph}>We may update this privacy notice from time to time. The updated version will be indicated by an updated &#34;Revised&#34; date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
                    </p><p>
                        <br/>
                    </p><p className={styles.title}>7. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</p>
                    <p className={styles.paragraph}>If you have questions or comments about this notice, you may email us at <a className={styles.link} href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                    </p><p>
                        <br/>
                    </p><p className={styles.title}>8. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
                    </p>
                    <p className={styles.paragraph}>Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please submit a request form by clicking here.
                    </p><p>
                    </p></div>
            </section>
        </>
    )
}