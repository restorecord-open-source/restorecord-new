import axios from 'axios';

export default async function getMembers(options: any, serverId?: any) {
    return await axios.get(`/api/v1/server/members${serverId ? `?guild=${serverId}` : ``}`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
        
}