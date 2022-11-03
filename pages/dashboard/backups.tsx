import { useToken } from "../../src/token";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import NavBar from "../../components/dashboard/navBar";
import DashBackups from "../../components/dashboard/Backups";
import getUser from "../../src/dashboard/getUser";
import CircularProgress from "@mui/material/CircularProgress";

export default function Backups() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    if (isLoading) {
        return <CircularProgress />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress />
    }
    
    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />
                    <DashBackups user={data} />
                </NavBar>
            </Box>
        </>
    )
}