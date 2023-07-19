import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import { accounts, members } from "@prisma/client";
import withAuthentication from "../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
        if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

        let query = req.query.q as string;
        let limit = req.query.limit as string | undefined | null | number;

        if (limit && Number(limit) > 100) limit = 100;

        let members: members[] = [];

        switch (query) {
        case "recent":
            members = await prisma.members.findMany({
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                },
                select: {
                    id: true,
                    username: true,
                    userId: true,
                    avatar: true,
                    createdAt: true,
                },
                orderBy: { id: "desc" },
                take: 99999,
            }) as members[];

            members = members.map(member => ({ ...member, userId: String(member.userId) })) as any;
            members = members.slice(0, Number(limit) || 10);

            return res.status(200).json({ success: true, content: members });
            break;
        case "isp":
            members = await prisma.members.findMany({
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    isp: {
                        not: null,
                    },
                },
                select: {
                    isp: true,
                },
                take: 99999,
            }) as members[];


            const isps = members.map(member => member.isp);
            const uniqueIsps: Set<string | null> = new Set(isps);
              
            let ispCount = Array.from(uniqueIsps).map(isp => ({
                isp,
                count: isps.filter(i => i === isp).length,
            }));
            
            ispCount = ispCount.sort((a, b) => b.count - a.count);
            ispCount = ispCount.slice(0, Number(limit) || 10);

            return res.status(200).json({ success: true, content: ispCount });
            break;
        case "state":
            members = await prisma.members.findMany({
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    state: {
                        not: null,
                    },
                },
                select: {
                    state: true,
                },
                take: 99999,
            }) as members[];

            const states = members.map(member => member.state);
            const uniqueStates: Set<string | null> = new Set(states);

            let stateCount = Array.from(uniqueStates).map(state => ({
                state,
                count: states.filter(s => s === state).length,
            }));

            stateCount = stateCount.sort((a, b) => b.count - a.count);
            stateCount = stateCount.slice(0, Number(limit) || 10);

            return res.status(200).json({ success: true, content: stateCount });
            break;
        case "city":
            members = await prisma.members.findMany({
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    city: {
                        not: null,
                    },
                },
                select: {
                    city: true,
                },
                take: 99999,
            }) as members[];

            const cities = members.map(member => member.city);
            const uniqueCities: Set<string | null> = new Set(cities);

            let cityCount = Array.from(uniqueCities).map(city => ({
                city,
                count: cities.filter(c => c === city).length,
            }));

            cityCount = cityCount.sort((a, b) => b.count - a.count);
            cityCount = cityCount.slice(0, Number(limit) || 10);

            return res.status(200).json({ success: true, content: cityCount });
            break;
        case "country":
            members = await prisma.members.findMany({
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    country: {
                        not: null,
                    },
                },
                select: {
                    country: true,
                },
                take: 99999,
            }) as members[];

            const countries = members.map(member => member.country);
            const uniqueCountries: Set<string | null> = new Set(countries);

            let countryCount = Array.from(uniqueCountries).map(country => ({
                country,
                count: countries.filter(c => c === country).length,
            }));

            countryCount = countryCount.sort((a, b) => b.count - a.count);
            countryCount = countryCount.slice(0, Number(limit) || 10);

            return res.status(200).json({ success: true, content: countryCount });
            break;
        case "vpn":
            break;
        default:
            return res.status(400).json({ success: false, content: [], message: "Invalid query" });
        }
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);