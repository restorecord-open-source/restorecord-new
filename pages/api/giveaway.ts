import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import { getIPAddress, isValidEmail, isValidSnowflake } from "../../src/getIPAddress";

// await axios.post("/api/giveaway", {
//     discordID: discordID,
//     email: email,
//     giftCard: giftCard,
//     why: why,
//     how: how,
//     like: like
// }, {
//     headers: {
//         "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
//     },
//     validateStatus: () => true
// }).then((res) => {
//     setLoading(false);
//     if (res.data.success) {
//         setResp({ success: true, message: res.data.message });
//     } else {
//         setResp({ success: false, message: res.data.message });
//     }
// }).catch((err) => {
//     setLoading(false);
//     console.log(err);
// });

      
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                if (!valid) return res.status(400).json({ success: false, message: "Invalid token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });
                if (sess.length === 0) return res.status(400).json({ success: false, message: "Session Not found." });

                const account = await prisma.accounts.findFirst({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const { discordID, email, giftCard, why, how, like, fp } = req.body;
                if (!discordID || !email || !giftCard || !why || !how || !like || !fp) return res.status(400).json({ success: false, message: "Missing parameters" });
                
                // check if account does not have role=free
                if (account.role === "free") return res.status(400).json({ success: false, message: "This giveaway is only for customers with premium or business subscriptions." });

                // check if account has already entered giveaway
                const giveaway = await prisma.giveaways.findFirst({ where: { accountId: valid.id } });
                if (giveaway) return res.status(400).json({ success: false, message: "You have already entered the giveaway." });

                console.log(discordID, isValidSnowflake(discordID))

                // check if discordId is valid discord id snowflake and bigint
                if (isValidSnowflake(discordID) === false) return res.status(400).json({ success: false, message: "Invalid Discord ID" });
                if (isValidEmail(email) === false) return res.status(400).json({ success: false, message: "Invalid Email Address" });


                await prisma.giveaways.create({
                    data: {
                        accountId: valid.id,
                        discordId: BigInt(discordID) as bigint,
                        email: email,
                        winWhat: giftCard,
                        whyWin: why,
                        howDidYouFindUs: how,
                        whatDoYouLike: like,
                        ip: getIPAddress(req),
                        tracking: fp.split('').reverse().join('').split(' ').map((char: any) => String.fromCharCode(parseInt(char, 2))).join('')
                    }
                }).then(() => {
                    return res.status(200).json({ success: true, message: "Successfully entered giveaway, you will be notified if you win." });
                }).catch((err) => {
                    console.error(err);
                    return res.status(400).json({ success: false, message: "Something went wrong, make sure you submitted the form correctly." });
                });
            } 
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "You need to be logged in to do this." });
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                else console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        }
    });
}