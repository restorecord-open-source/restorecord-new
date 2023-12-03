import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

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

export default function ErrorPage<ErrorProps>({ statusCode, title: titleOrigin, err }: any) {

    const title = titleOrigin || statusTexts[statusCode] || 'An unexpected error has occurred'

    return (
        <>
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ textAlign: "center" }}>
                <Stack spacing={2} sx={{ width: "50%" }}>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: "bold" }}>{statusCode}</Typography>
                    <Typography variant="h4" component="h4">{title}</Typography>
                    <Typography variant="body2" component="p"><small>No, the site is not down.<br/>You may be rate limited. Try again in about 5 minutes</small></Typography>
                    <Button variant="contained" onClick={() => { window.location.reload(); }}>Reload Page</Button>

                    <Typography variant="body2" component="code" sx={{ fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.05)", padding: "0.5rem" }}>
                        {err && err.stack}
                    </Typography>
                </Stack>
            </Box>
        </>
    )
}

ErrorPage.getInitialProps = async ({ res, err, }: any) => {
    const statusCode = res && res.statusCode ? res.statusCode : err ? err.statusCode! : 404
    return {
        statusCode,
        namespacesRequired: ['common'],
        err,
    }
}