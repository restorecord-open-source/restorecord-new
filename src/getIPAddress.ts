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


export function makeXTrack() {

    // create a new json object for the x-track header with the following properties:
    // {"os":"Windows","browser":"Chrome","system_locale":"en-US","browser_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36","browser_version":"112.0.0.0","referrer":"https://xenos.services/","referring_domain":"xenos.services","device-aspect-ratio":"16/9","screen":"1920x1080","hardwareConcurrency":"12"}
    // then base64 encode it
    
    const gcd: any = (a: any, b: any) => b == 0 ? a : gcd(b, a % b);
    const screenRatio = gcd(window.screen.width, window.screen.height);


    const os = getPlatform(navigator.userAgent);
    const browser = getBrowser(navigator.userAgent);
    const system_locale = navigator.language;
    const browser_user_agent = navigator.userAgent;
    const browser_version = getBrowserName(navigator.userAgent);
    const referrer = document.referrer;
    const referring_domain = document.referrer.split("/")[2];
    const device_aspect_ratio = `${window.screen.width / screenRatio}/${window.screen.height / screenRatio}`; // 16/9
    const screen = `${window.screen.width}x${window.screen.height}`;
    const hardwareConcurrency = navigator.hardwareConcurrency;

    const xTrack = {
        os,
        browser,
        system_locale,
        browser_user_agent,
        browser_version,
        referrer,
        referring_domain,
        device_aspect_ratio,
        screen,
        hardwareConcurrency
    };

    return Buffer.from(JSON.stringify(xTrack)).toString("base64");
}

export function getXTrack(req: NextApiRequest) {
    // get the x-track header from the request
    // if it exists, decode it and return it as an object
    // if it doesn't exist, return null

    const xTrack = req.headers["x-track"];
    if (xTrack) {
        return JSON.parse(Buffer.from(xTrack.toString(), "base64").toString("ascii"));
    }
    else {
        return null;
    }
}


export function getPlatform(userAgent: string) {
    let platform = "";
    if (userAgent.indexOf("Android") > -1) platform = "Android";
    else if (userAgent.indexOf("iPhone") > -1) platform = "iOS";
    else if (userAgent.indexOf("Windows") > -1) platform = "Windows";
    else if (userAgent.indexOf("Macintosh") > -1) platform = "Mac";
    else if (userAgent.indexOf("Linux") > -1) platform = "Linux";
    else if (userAgent.indexOf("crOS") > -1) platform = "Chrome OS";
    else if (userAgent.indexOf("Symbian") > -1) platform = "Nokia";
    else if (userAgent.indexOf("SMART-TV") > -1 && userAgent.indexOf("Tizen") > -1) platform = "Samsung Smart TV";
    else platform = "Unknown";

    return platform;
}

export function getBrowserName(userAgent: string) {
    const browser = userAgent.match(/\b(?:MSIE |Trident\/7\.0;.*?rv:|Edge\/|OPR\/|Chrome\/|Firefox\/|DuckDuckGo\/|Instagram)(\d+)/);
    if (browser) return browser[1];

    return "Unknown";
}

export function getBrowser(userAgent: string) {
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

    return date.getFullYear() >= 2015;
}

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/;
    return emailRegex.test(email);
}
  