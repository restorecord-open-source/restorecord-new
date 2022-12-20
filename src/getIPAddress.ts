import { NextApiRequest } from "next";

export function getIPAddress(req: NextApiRequest): string {
    let ip: any;
    const headers = req.headers;

    if (headers["cf-connecting-ip"]) {
        ip = headers["cf-connecting-ip"];
    }
    else if (headers["x-forwarded-for"]) {
        ip = headers["x-forwarded-for"];
    }
    else if (headers["x-real-ip"]) {
        ip = headers["x-real-ip"];
    }
    else {
        ip = req.connection.remoteAddress;
        if (ip.substr(0, 7) === "::ffff:") {
            ip = ip.substr(7);
        }
    }

    return ip;
}

export function getPlatform(userAgent: string) {
    let platform = "";
    if (userAgent.indexOf("Android") > -1) platform = "Android";
    else if (userAgent.indexOf("iPhone") > -1) platform = "iOS";
    else if (userAgent.indexOf("Windows") > -1) platform = "Windows";
    else if (userAgent.indexOf("Macintosh") > -1) platform = "Mac";
    else if (userAgent.indexOf("crOS") > -1) platform = "Chrome OS";
    else if (userAgent.indexOf("Symbian") > -1) platform = "Nokia";
    else if (userAgent.indexOf("Linux") > -1) platform = "Linux";
    else platform = "Unknown";

    return platform;
}

export function getBrowser(userAgent: string) {
    // get browser and version
    const browser = userAgent.match(/\b(?:MSIE |Trident\/7\.0;.*?rv:|Edge\/)(\d+)/);
    if (browser) return `IE ${browser[1]}`;

    const chrome = userAgent.match(/\b(?:Chrome\/)(\d+)/);
    if (chrome) return `Chrome v${chrome[1]}`;

    const safari = userAgent.match(/\b(?:Version\/)(\d+)/);
    if (safari) return `Safari ${safari[1]}`;

    const firefox = userAgent.match(/\b(?:Firefox\/)(\d+)/);
    if (firefox) return `Firefox v${firefox[1]}`;

    const duckduckgo = userAgent.match(/\b(?:DuckDuckGo\/)(\d+)/);
    if (duckduckgo) return `DuckDuckGo ${duckduckgo[1]}`;

    const facebook = userAgent.match(/\b(?:FBAN\/)(\d+)/);
    if (facebook) return `Facebook App ${facebook[1]}`;
    
    const instagram = userAgent.match(/\b(?:Instagram)(\d+)/);
    if (instagram) return `Instagram App ${instagram[1]}`;

    const miui = userAgent.match(/\b(?:MiuiBrowser)(\d+)/);
    if (miui) return `Miui Browser ${miui[1]}`;

    const opera = userAgent.match(/\b(?:OPR|Opera|OPT|Opera Mini)(\d+)/);
    if (opera) return `Opera ${opera[1]}`;

    const qqbrowser = userAgent.match(/\b(?:QQBrowser)(\d+)/);
    if (qqbrowser) return `QQ Browser ${qqbrowser[1]}`;

    const samsung = userAgent.match(/\b(?:SamsungBrowser)(\d+)/);
    if (samsung) return `Samsung Browser ${samsung[1]}`;

    const snapchat = userAgent.match(/\b(?:Snapchat)(\d+)/);
    if (snapchat) return `Snapchat ${snapchat[1]}`;

    const UCBrowser = userAgent.match(/\b(?:UCBrowser)(\d+)/);
    if (UCBrowser) return `UC Browser ${UCBrowser[1]}`;

    const twitter = userAgent.match(/\b(?:Twitter)(\d+)/);
    if (twitter) return `Twitter ${twitter[1]}`;

    const wechat = userAgent.match(/\b(?:MicroMessenger)(\d+)/);
    if (wechat) return `WeChat ${wechat[1]}`;

    const yandex = userAgent.match(/\b(?:YaBrowser)(\d+)/);
    if (yandex) return `Yandex Browser ${yandex[1]}`;
    
    return "Unknown";
}

export function isValidSnowflake(snowflake: string): boolean {
    const snowflakeRegex = /^\d{16,21}$/;

    if (!snowflakeRegex.test(snowflake)) {
        return false;
    }

    const timestamp = parseInt(snowflake.slice(0, -4));
    const date = new Date(timestamp + 1420070400000);

    
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/;
    return emailRegex.test(email);
}
  