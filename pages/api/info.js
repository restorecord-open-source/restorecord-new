import { toUptime } from '../../src/functions';

export default function handler(req, res) {
    const uptime = toUptime(process.uptime());
    res.status(200).json({ uptime: uptime });
}