import functions from "../../src/functions";

export default function handler(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { uptime: { full: string; short: string; days: number; hours: number; minutes: number; seconds: number; milliseconds: number; }; }): void; new(): any; }; }; }) {
    const uptime = functions.toUptime(process.uptime());
    res.status(200).json({ uptime: uptime });
}