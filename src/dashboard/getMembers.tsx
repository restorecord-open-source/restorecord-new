import axios from "axios";

export default async function getMembers(options: any, serverId?: any, search?: any, page: any = null) {
    return await axios.get(`/api/v2/server/members${page ? `?page=${page}` : ""}${search ? `&search=${search}` : ""}${serverId ? `&guild=${serverId}` : ""}`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
}

export async function getMemberList(options: any) {
    return await axios.get(`/api/v2/server/graph`, {
        headers: options,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
}

export async function getMemberStats(token: any, option: string, limit: number | null | undefined = null) {
    return await axios.get(`/api/v2/server/stats?q=${option}${limit ? `&limit=${limit}` : ""}`, {
        headers: token,
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
}




export const DISCORD_EMPLOYEE = 1;
export const DISCORD_PARTNER = 2;
export const HYPESQUAD_EVENTS = 4;
export const BUG_HUNTER_LEVEL_1 = 8;
export const MFA_SMS = 16;
export const PREMIUM_PROMO_DISMISSED = 32;
export const HOUSE_BRAVERY = 64;
export const HOUSE_BRILLIANCE = 128;
export const HOUSE_BALANCE = 256;
export const EARLY_SUPPORTER = 512;
export const TEAM_PSEUDO_USER = 1024;
export const INTERNAL_APPLICATION = 2048;
export const SYSTEM = 4096;
export const HAS_UNREAD_URGENT_MESSAGES = 8192;
export const BUG_HUNTER_LEVEL_2 = 16384;
export const UNDERAGE_DELETED = 32768;
export const VERIFIED_BOT = 65536;
export const VERIFIED_BOT_DEVELOPER = 131072;
export const CERTIFIED_MODERATOR = 262144;
export const BOT_HTTP_INTERACTIONS = 524288;
export const SPAMMER = 1048576;
export const DISABLE_PREMIUM = 2097152;
export const HIGH_GLOBAL_RATE_LIMIT = 8589934592;
export const DELETED = 17179869184;
export const DISABLED_SUSPICIOUS_ACTIVITY = 34359738368;
export const SELF_DELETED = 68719476736;
export const PREMIUM_DISCRIMINATOR = 137438953472;
export const USED_DESKTOP_CLIENT = 274877906944;
export const USED_WEB_CLIENT = 549755813888;
export const USED_MOBILE_CLIENT = 1099511627776;
export const DISABLED = 2199023255552;
export const VERIFIED_EMAIL = 8796093022208;
export const QUARANTINED = 17592186044416;