import { SxProps } from "@mui/material";
import { createHash } from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import axios from "axios";
import crypto from "crypto";

export function stringToColor(string: string): string {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
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
        children: `${name.split(' ')[0][0]}`,
    };
}

export function generateQRUrl(secret: string, username: string, issuer: string = "RestoreCord") {
    const otpauth = `otpauth://totp/${username}?secret=${secret}&issuer=${issuer}`;
    return otpauth;
}

export async function isBreached(pw: string) {
    const hash = createHash('sha1').update(pw).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    try {
        const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
        const data = response.data.toString();
        const lines = data.split('\n');
        for (const line of lines) {
            if (line.startsWith(suffix)) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
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