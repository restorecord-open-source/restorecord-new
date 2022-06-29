import axios from 'axios';

export default async function getNews(options: any) {
    return await axios.get(`/api/v1/news`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
        
}