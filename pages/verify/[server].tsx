/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import NavBar from "../../components/landing/NavBar";
import getServer from "../../src/getServer";
import Link from "next/link";
import Head from "next/head";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import theme from "../../src/theme";
import Button from "@mui/material/Button";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export default function Verify({ status, err }: any) {
    const router = useRouter();
    const guildId = router.query.server;

    const { data, isLoading, error } = useQuery("server", async () => {
        return await getServer(guildId);
    }, { retry: false, refetchOnWindowFocus: false });

    if (error) {
        return (
            <>
                <Typography variant="h1">
                    Error
                </Typography>
            </>
        )
    }

    return (
        <>
            <Head>
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="" />
                <meta name="msapplication-navbutton-color" content="" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                {isLoading ? <title>Loading...</title> : <title>{data.server.name} - Verify</title>}
            </Head>

            {isLoading ? ( <></> ) : (
                <>
                    {data.success ? (
                        <Box sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${data.server.bg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", height: "100vh", width: "100vw", position: "absolute", top: "0", left: "0", zIndex: "-999", filter: "blur(0.5rem)" }} />
                    ) : ( <></> )}
                </>
            )}

            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
                    <Paper sx={{ borderRadius: "1rem", padding: "2rem", marginTop: "1rem", width: { xs: "100%", md: "50%" }, marginBottom: "2rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)", backgroundColor: "#00000026", backdropFilter: "blur(1.5rem)" }}>

                        {isLoading ? ( <></> ) : (
                            <>
                                {status === "finished" ? (
                                    <Alert severity="success" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(28, 205, 30, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                                        <AlertTitle>Success</AlertTitle>
                                        You have successfully verified in <b>{data.server.name}</b>!
                                    </Alert>
                                ) : ( <></> )}
                            </>
                        )}

                        {isLoading ? ( <></> ) : (
                            <>
                                {err === "403" ? (
                                    <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                                        <AlertTitle>Error</AlertTitle>
                                        Seems like this bot hasn&#39;t been setup correctly, please contact the owner telling him the bot is <b><code>Missing Permission</code></b>.
                                    </Alert>
                                ) : ( <></> )}

                                {err === "306" ? (
                                    <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                                        <AlertTitle>Error</AlertTitle>
                                        VPN or Proxy detected, please disable it and try again.
                                    </Alert>
                                ) : ( <></> )}
                            </>
                        )}
                        

                        {/* Server name */}
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Skeleton animation="wave" variant="text" width="20rem" height="56px" />
                            </Box>
                        ) : (
                            <>
                                {data.success ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={data.server.name} placement="top" disableInteractive>
                                            <Typography variant="h1" component="h1" sx={{ fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" }, pl: "1rem", mr: "1rem", textShadow: "0px 0px 15px rgba(0, 0, 0, 0.25)" }}>
                                                {data.server.name}
                                            </Typography>
                                        </Tooltip>

                                        {data.server.verified && (
                                            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={`Verified`} placement="top" disableInteractive>
                                                <CheckCircle sx={{ color: theme.palette.grey[500], width: "2rem", height: "2rem" }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                ) : ( 
                                    <>
                                        <Typography variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" } }}>
                                            Server not found
                                        </Typography>
                                    </>
                                )}
                            </>
                        )}

                        {/* Server description */}
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Skeleton animation="wave" variant="text" width="10rem" height="48px" />
                            </Box>
                        ) : (
                            <>
                                {data.success && (
                                    <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" } }}>
                                        {data.server.description}
                                    </Typography>
                                )}
                            </>
                        )}

                        {/* Server avatar */}
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: "1rem" }}>
                            {isLoading ? (
                                <Skeleton animation="wave" variant="circular" width="122px" height="122px" />
                            ) : (
                                <>
                                    {data.success && (
                                        <Avatar src={data.server.icon} sx={{ width: { xs: "6rem", md: "8rem" }, height: { xs: "6rem", md: "8rem" } }} />
                                    )}
                                </>
                            )}
                        </Box>

                        {/* verify button */}
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {isLoading ? (
                                <Skeleton animation="wave" variant="text" width="100%" height="56px" sx={{ width: "100%", marginTop: "2rem" }} />
                            ) : (
                                <>
                                    {data.success && (
                                        <Button variant="contained" color="primary" href={`https://discord.com/oauth2/authorize?client_id=${data.server.clientId}&redirect_uri=${data.server.domain ? `https://${data.server.domain}` : window.location.origin}/api/callback&response_type=code&scope=identify+guilds.join&state=${data.server.guildId}`} sx={{ width: "100%", marginTop: "2rem" }}>
                                            Verify
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    </Paper>

                    {/* creation date */}
                    {isLoading ? (
                        <Skeleton animation="wave" variant="text" width="7.5rem" height="24px" />
                    ) : (
                        <>
                            {data.success && (
                                <Typography variant="body1" component="p" sx={{ textAlign: "center", mt: 1, color: "rgba(255, 255, 255, 0.15)", bottom: 0, position: "absolute", marginBottom: { xs: "0.25rem", md: "2rem" }, display: { xs: "none", md: "block" } }}>
                                    Created on {new Date(data.server.createdAt).toLocaleDateString()} by {data.server.owner}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
            </Container>
            

            {/* <div className="lg:block hidden">
                <NavBar />
            </div>
            
            {data.success ? (
                <div>
                    {err === "403" ? (
                        <div className="flex p-4 mb-4 text-sm rounded-lg bg-red-200 text-red-800" role="alert">
                            <svg className="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                            <div>
                                <span className="font-medium">Error!</span> Seems like this bot hasn&#39;t been setup correctly, please contact the owner telling him the bot is <code className="font-black">Missing Permission</code>
                                <p className="text-blue-500 font-semibold hover:text-blue-400 transition-all"><a target="_blank" href="https://docs.restorecord.com/troubleshooting/missing-permission/" rel="noreferrer">Read More</a></p>
                            </div>
                        </div>
                    ) : (
                        <>
                        </>
                    )}

                    <div className="text-white text-4xl font-bold text-center">
                        {status === "finished" ? (
                            <>
                                You <span className="text-green-400">successfully</span> verified in <span className="text-indigo-600">{data.server.name}</span>
                            </>
                        ) : (
                            <>
                                You&#39;re verifying in <span className="text-indigo-600">{data.server.name}</span>
                            </>
                        )}
                        <p className="text-lg text-gray-600 mt-2">{data.server.description}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-5">
                        <Image src={data.server.picture} width={512} height={512} loading="lazy" className="smx:w-36 smx:h-36 w-24 h-24 rounded-full border-2 border-indigo-600 object-cover" alt="Server Picture" />
                    </div>

                    <div className="smx:pt-6 pt-4">
                        <div className="text-white text-2xl font-bold">
                            {status === "finished" ? (
                                <>
                                </>
                            ) : (
                                <a href={`https://discord.com/oauth2/authorize?client_id=${data.server.clientId}&redirect_uri=${window.location.origin}/api/callback&response_type=code&scope=identify+guilds.join&state=${data.server.guildId}`}>
                                    <button className="focus:ring-4 sm:font-medium font-bold rounded-lg sm:text-sm text-xl px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all">
                                        Verify
                                    </button>
                                </a>
                            )}
                            <button className="focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-red-800 text-white transition-all">
                                Unlink
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="text-white text-4xl font-bold text-center">
                        Server does not exist
                    </div>
                    <button onClick={() => {
                        window.history.back();
                    }} className="transition-all text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-primary-900 my-4">
                        Go Back
                    </button>
                </div>
            )}

            <div className="sticky inset-x-0 p-4 bottom-0 text-center sm:pt-0">
                <div className="text-gray-500 text-medium pt-2 sm:text-sm text-lg">
                    {data.success ? (
                        <>
                            Server created by {data.server.owner} at {new Date(data.server.createdAt).toLocaleString()}
                        </>
                    ) : (
                        <>
                        </>
                    )}
                    <br/>
                    By verifying you agree to the <Link href="/terms" className="text-indigo-600">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600">Privacy Policy</Link>
                </div>
            </div>
            */}
        </>
    )
}

export function getServerSideProps({ req }: any) {
    if (req) {
        const cookies = req.headers.cookie ? req.headers.cookie : "";

        // if (cookies.includes("verified=true")) {
        //     return { props: { status: "finished", } }
        // }
        // if (cookies.includes("RC_err=")) {
        //     return { props: { err: cookies.split("RC_err=")[1].split(";")[0] } }
        // }

        return { 
            props: { 
                status: cookies.includes("verified=true") ? "finished" : "verifying",
                err: cookies.includes("RC_err=") ? cookies.split("RC_err=")[1].split(";")[0] : "",
            } 
        }
    }
}
