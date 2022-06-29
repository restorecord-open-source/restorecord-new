import { useQuery } from "react-query";
import getUser from "../../src/dashboard/getUser";
import functions from "../../src/functions";
import { useToken } from "../../src/token";

export default function DashCustomBot({ user }: any) {
    const [token]: any = useToken();
    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


    if (isError) {
        functions.ToastAlert("Something went wrong.", "error")
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    if (!user || isLoading) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    return (
        <>
        </>
    )
}
