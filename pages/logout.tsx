import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import functions from "../src/functions";
import { useToken } from "../src/token";

export default function Logout() {
    const [token]: any = useToken();

    useEffect(() => {
        try {
            fetch(`/api/v1/logout`, {
                headers: {
                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                },
            })
                .then(res => res.json())
                .then(res => {
                    if (!res.success) {
                        functions.ToastAlert(res.message, "error");
                    }
                    else {
                        functions.ToastAlert(res.message, "success");
                        window.localStorage.removeItem("token");
                        window.location.href = "/";
                    }
                })
        } catch (error) {
            console.log(error);
        }
    })

    return (
        <>
            <Toaster />
            <span className="text-white">Logging out...</span>
        </>
    )
}