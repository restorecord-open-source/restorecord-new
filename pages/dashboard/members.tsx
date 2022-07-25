import { useRouter } from "next/router";
import { useQuery } from "react-query";
import NavBar from "../../components/dashboard/navBar";
import NavBarLoading from "../../components/dashboard/navBarLoading";
import VerifiedMembers from "../../components/dashboard/VerifiedMembers";
import getUser from "../../src/dashboard/getUser";
import functions from "../../src/functions";
import { useToken } from "../../src/token";

export default function Members() {
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

                <VerifiedMembers user={data} />
            </div>
        </>
    )
}