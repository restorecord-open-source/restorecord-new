import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../src/token";

import NavBar from "../../components/dashboard/navBar";
import VerifiedMembers from "../../components/dashboard/VerifiedMembers";
import getUser from "../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";

export default function Members() {
    const [ token ]: any = useToken()
    const router = useRouter();

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
                    <VerifiedMembers user={data} />
                </NavBar>
            </Box>
        </>
    )
}