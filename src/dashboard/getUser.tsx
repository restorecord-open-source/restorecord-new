import axios from "axios";

export default async function getUser(options: any) {
    return await axios.get(`/api/v1/user`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { 
            if (res.data.code === 50014) {
                localStorage.removeItem("token");
            } else {
                return res.data;
            }
        })
        .catch(err => { return err; });
}