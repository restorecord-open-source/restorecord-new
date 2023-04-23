import axios from "axios";
import router from "next/router";

export default async function getUser(options: any) {
    return await axios.get(`/api/v2/self`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => {
            if (res.data.id) {
                return res.data
            }
            else {
                window.localStorage.removeItem("token");
                document.location.href = `/login?redirect_to=${encodeURIComponent(router.pathname)}`;
            }
        })
        .catch(err => { return err; });
}