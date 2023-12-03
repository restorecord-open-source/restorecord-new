import { Avatar, SxProps } from "@mui/material";
import { createHash } from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import axios from "axios";
import crypto from "crypto";
import { useEffect, useState } from "react";

export function stringToColor(string: string): string {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = "#";
  
    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
}
  
export function stringAvatar(name: string, props: { sx: SxProps }) {
    return {
        sx: {
            bgcolor: stringToColor(name),
            ...props.sx
        },
        children: `${name.split(" ")[0][0]}`,
    };
}

export function generateQRUrl(secret: string, username: string, issuer: string = "RestoreCord") {
    return `otpauth://totp/${username}?secret=${secret}&issuer=${issuer}`;
}

export function generateFingerprint(): string {
    const timestamp = Date.now().toString();
    const hmac = crypto.createHmac("sha256", process.env.JWT_SECRET!);
    hmac.update(timestamp);
    const signature = hmac.digest("base64");
    const alphanumericSignature = signature.replace(/\+/g, "a").replace(/\//g, "b").replace(/=/g, "c");
    return `${timestamp}.${alphanumericSignature}`;
}

export function verifyFingerprint(fingerprint: string): boolean {
    const parts = fingerprint.split(".");
    if (parts.length !== 2) return false;

    const timestamp = parts[0];
    if (isNaN(parseInt(timestamp))) return false;

    const signature = parts[1];
    if (!/^[a-zA-Z0-9]+$/.test(signature)) return false;

    const hmac = crypto.createHmac("sha256", process.env.JWT_SECRET!);
    hmac.update(timestamp);
    const expectedSignature = hmac.digest("base64");
    const alphanumericExpectedSignature = expectedSignature.replace(/\+/g, "a").replace(/\//g, "b").replace(/=/g, "c");
    if (signature !== alphanumericExpectedSignature) return false;

    return true;
}


const avatarCache: Record<string, string> = {};

export function AvatarFallback({ url, fallback, username, sx, ...props }: { url: string, fallback: string, username: string, sx: SxProps | null | undefined, props?: any | null | undefined }) {
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (avatarCache[url]) {
                setAvatarUrl(avatarCache[url]);
                setImageLoaded(true);
            } else {
                try {
                    await axios.get(url);
                    setAvatarUrl(url);
                    avatarCache[url] = url;
                } catch {
                    if (avatarCache[fallback]) {
                        setAvatarUrl(avatarCache[fallback]);
                        setImageLoaded(true);
                    } else {
                        try {
                            await axios.get(fallback);
                            setAvatarUrl(fallback);
                            avatarCache[fallback] = fallback;
                        } catch {
                            setAvatarUrl(`https://ui-avatars.com/api/?background=${stringToColor(username)}&color=fff&name=${username}`);
                        }
                    }
                }
            }
        };

        if (!imageLoaded) {
            fetchAvatar();
        }
    }, [url, fallback, username, imageLoaded]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <Avatar
            alt={username}
            src={avatarUrl}
            sx={sx}
            onLoad={handleImageLoad}
            {...props}
        >
            {username[0]}
        </Avatar>
    );
}

export function IntlRelativeTime(time: number) {
    const intlRelativeTimeFormat = new Intl.RelativeTimeFormat("en", { style: "long" });
    const now = new Date(Date.now()).getTime();

    const fixedTime = time - now;

    if (time === null || time === undefined || isNaN(time) || time === 0) {
        return null;
    } else if ((fixedTime < 0 && fixedTime > -60000) || (fixedTime > 0 && fixedTime < 60000)) {
        return "just now";
    } else if ((fixedTime < 0 && fixedTime > -3600000) || (fixedTime > 0 && fixedTime < 3600000)) {
        return intlRelativeTimeFormat.format(Math.round(fixedTime / 60000), "minutes");
    } else if ((fixedTime < 0 && fixedTime > -86400000) || (fixedTime > 0 && fixedTime < 86400000)) {
        return intlRelativeTimeFormat.format(Math.round(fixedTime / 3600000), "hours");
    } else if ((fixedTime < 0 && fixedTime > -604800000) || (fixedTime > 0 && fixedTime < 604800000)) {
        return intlRelativeTimeFormat.format(Math.round(fixedTime / 86400000), "days");
    } else if ((fixedTime < 0 && fixedTime > -2629800000) || (fixedTime > 0 && fixedTime < 2629800000)) {
        return intlRelativeTimeFormat.format(Math.round(fixedTime / 604800000), "weeks");
    } else if ((fixedTime < 0 && fixedTime > -31557600000) || (fixedTime > 0 && fixedTime < 31557600000)) {
        return intlRelativeTimeFormat.format(Math.round(fixedTime / 2629800000), "months");
    } else if ((fixedTime < 0 && fixedTime > -3155760000000) || (fixedTime > 0 && fixedTime < 3155760000000)) {
        return intlRelativeTimeFormat.format(Math.round(fixedTime / 31557600000), "years");
    } else {
        return "a long time";
    }
}

export function formatEstimatedTime(estimatedTime: any) {
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
  
    if (estimatedTime > day) {
        return `${Math.round(estimatedTime / day)} days`;
    } else if (estimatedTime > hour) {
        return `${Math.round(estimatedTime / hour)} hours`;
    } else if (estimatedTime > minute) {
        return `${Math.round(estimatedTime / minute)} minutes`;
    } else {
        return `${Math.round(estimatedTime / 1000)} seconds`;
    }
}

export function formatRoundNumber(number: number) {
    // format number so 7 becomes 10, 87 becomes 90, 127 becomes 130, 1372 becomes 1.4k and 8172912 becomes 8.2m
    if (number < 10) {
        return Math.ceil(number);
    } else if (number < 100) {
        return Math.ceil(number / 10) * 10;
    } else if (number < 1000) {
        return Math.ceil(number / 100) * 100;
    } else if (number < 10000) {
        return Math.ceil(number / 1000) * 1000;
    } else if (number < 100000) {
        return `${Math.ceil(number / 1000 * 10) / 10}k`;
    } else if (number < 1000000) {
        return `${Math.ceil(number / 1000)}k`;
    } else if (number < 10000000) {
        return `${Math.ceil(number / 100000) * 100}k`;
    } else if (number < 100000000) {
        return `${Math.ceil(number / 1000000 * 10) / 10}m`;
    } else if (number < 1000000000) {
        return `${Math.ceil(number / 1000000)}m`;
    } else if (number < 10000000000) {
        return `${Math.ceil(number / 100000000) * 100}m`;
    } else if (number < 100000000000) {
        return "1b+";
    } else {
        return "1b+";
    }
    
}