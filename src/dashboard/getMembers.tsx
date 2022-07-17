import axios from 'axios';

export default async function getMembers(options: any) {
    return await axios.get(`/api/v1/server/members`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
        
}