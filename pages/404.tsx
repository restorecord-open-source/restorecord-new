import styles from "../public/styles/error.module.css";

export default function Error404() {

    return (
        <>
            <section className={styles.mainWrapper}>
                <div className={styles.main}>
                    <div>
                        <h1 className={styles.header}>404</h1>
                        <p className={styles.subHeader}>Not Found</p>
                        <a className={styles.button} onClick={() => { window.location.href = "/"; }}>Go Back to Homepage</a>
                    </div>   
                </div>
            </section>
        </>
    )
}