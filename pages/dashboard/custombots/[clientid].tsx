import { useRouter } from "next/router";
import { useQuery } from "react-query";
import DashBotSettings from "../../../components/dashboard/BotSettings";
import NavBar from "../../../components/dashboard/navBar";
import NavBarLoading from "../../../components/dashboard/navBarLoading";
import getUser from "../../../src/dashboard/getUser";
import functions from "../../../src/functions";
import { useToken } from "../../../src/token";

export default function CustomSettings() {
    const router = useRouter();
    const [ token ]: any = useToken()
    const { clientid } = router.query;


    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });


    if (isLoading) {
        return <NavBarLoading />;
    }

    if (isError) {
        functions.ToastAlert("Something went wrong.", "error")
        return <NavBarLoading />;
    }

    if (!data.username) {
        return router.push("/login") 
    }

    return (
        <>
            <div className="min-h-screen max-h-screen flex">
                <NavBar user={data} />

                <DashBotSettings user={data} id={clientid} />
            </div>
        </>
    )
}