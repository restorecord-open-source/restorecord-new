import { useRouter } from "next/router";
import { useToken } from "../../../../src/token";
import { useQuery } from "react-query";

import NavBar from "../../../../components/dashboard/navBar";
import DashServerSettings from "../../../../components/dashboard/ServerSettings";
import getUser from "../../../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";

export default function Settings() {
    const router = useRouter();
    const [ token ]: any = useToken()
    const { guildId } = router.query;

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
                    <DashServerSettings user={data} id={guildId} />
                </NavBar>
            </Box>
        </>
    )
}