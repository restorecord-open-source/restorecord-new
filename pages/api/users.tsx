export default function handler(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { username: string; password: string; }[]): void; new(): any; }; }; }) {
    res.status(200).json([{username: "test", password: "test"}, {username: "test2", password: "test2"}, {username: "test3", password: "test3"}]);
}