import { useToken } from "../../src/token";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import NavBar from "../../components/dashboard/navBar";
import DashBackups from "../../components/dashboard/Backups";
import getUser from "../../src/dashboard/getUser";

export default function Backups() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <p>Loading...</p>
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