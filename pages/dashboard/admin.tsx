import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../src/token";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import ErrorPage from "../_error";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

export default function Admin() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


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

    if (!data.admin) {
        return <ErrorPage statusCode={404} />
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />
                    
                </NavBar>
            </Box>
        </>
    )
}