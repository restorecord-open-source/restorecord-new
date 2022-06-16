export default function handler(req, res) {
    res.status(200).json([{username: "test", password: "test"}, {username: "test2", password: "test2"}, {username: "test3", password: "test3"}]);
}