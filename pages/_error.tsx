import styles from "../public/styles/_404.module.css";

export default function _404() {

    const goBack = () => {
        window.history.back();
    }

    return (
        <>
            <section className={styles.mainWrapper}>
                <div className={styles.main}>
                    <div>
                        <h1 className={styles.header}>404</h1>
                        <p className={styles.subHeader}>Page not found</p>
                        <p className={styles.description}>Sorry, the page you are looking for does not exist.</p>
                        <a className={styles.button} onClick={goBack}>Go Back</a>
                    </div>   
                </div>
            </section>
        </>
    )
}