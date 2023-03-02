import axios from "axios";
import router from "next/router";

export default async function getUser(options: any) {
    return await axios.get(`/api/v1/user`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { 
            if (res.data.code === 50014) {
                window.localStorage.removeItem("token");
                document.location.href = `/login?redirect_to=${encodeURIComponent(router.pathname)}`;
            } else {
                return res.data;
            }
        })
        .catch(err => { return err; });
}