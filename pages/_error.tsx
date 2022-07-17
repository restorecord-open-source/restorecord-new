import styles from "../public/styles/error.module.css";

const statusTexts: { [code: number]: string} = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    413: "Payload Too Large",
    414: "URI Too Long",
    418: "I'm a teapot",
    500: "Internal Server Error",
    501: "Not Implemented",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    508: "Loop Detected",
}

export interface ErrorProps {
    statusCode: number
    title?: string
    namespacesRequired?: string[]
}  

export default function ErrorPage<ErrorProps>({ statusCode, title: titleOrigin }: any) {

    const title = titleOrigin || statusTexts[statusCode] || 'An unexpected error has occurred'

    return (
        <>
            <section className={styles.mainWrapper}>
                <div className={styles.main}>
                    <div>
                        <h1 className={styles.header}>{statusCode}</h1>
                        <p className={styles.subHeader}>{title}</p>
                        <a className={styles.button} onClick={() => { window.location.href = "/"; }}>Go Back to Homepage</a>
                    </div>   
                </div>
            </section>
        </>
    )
}

ErrorPage.getInitialProps = ({ res, err, }: any): Promise<ErrorProps> | ErrorProps => {
    const statusCode = res && res.statusCode ? res.statusCode : err ? err.statusCode! : 404
    return {
        statusCode,
        namespacesRequired: ['common'],
    }
}
  