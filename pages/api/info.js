import functions from '../../src/functions';

export default function handler(req, res) {
    const uptime = functions.toUptime(process.uptime());
    res.status(200).json({ uptime: uptime });
}