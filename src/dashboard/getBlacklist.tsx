import axios from "axios";

export default async function getBlacklist(options: any, serverId?: any, search?: any, page: any = null) {
    return await axios.get(`/api/v2/server/blacklist${page ? `?page=${page}` : ""}${search ? `&search=${search}` : ""}${serverId ? `&guild=${serverId}` : ""}`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
}
