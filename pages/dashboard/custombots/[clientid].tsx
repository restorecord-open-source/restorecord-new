import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Toolbar from "@mui/material/Toolbar";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import DashBotSettings from "../../../components/dashboard/BotSettings";
import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";
import { useToken } from "../../../src/token";

export default function CustomSettings() {
    const router = useRouter();
    const [ token ]: any = useToken()
    const { clientid } = router.query;


    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });


    if (isLoading) {
        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />
                    <DashBotSettings user={data} id={clientid} />
                </NavBar>
            </Box>
        </>
        
    )
}