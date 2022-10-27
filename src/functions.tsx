import { SxProps } from "@mui/material";
import { createHmac, randomBytes } from "crypto";

export function stringToColor(string: string) {
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
    // return `https://chart.googleapis.com/chart?chs=512x512&chld=L|0&cht=qr&chl=${encodeURIComponent(otpauth)}`;
}
