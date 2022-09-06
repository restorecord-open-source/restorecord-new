import axios from "axios";

export default async function getServer(serverId: any) {
    return await axios.get(`/api/v1/server?id=${serverId}`, {
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
        
}