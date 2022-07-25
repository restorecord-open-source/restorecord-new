import { useRouter } from "next/router";
import { useQuery } from "react-query"
import NavBar from "../../components/dashboard/navBar";
import functions from "../../src/functions";
import NavBarLoading from "../../components/dashboard/navBarLoading";
import { useToken } from "../../src/token";
import getUser from "../../src/dashboard/getUser";
import DashBoard from "../../components/dashboard/DashBoard";

export default function Dashboard() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


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

                <DashBoard user={data} />
            </div>
        </>
    )
}



