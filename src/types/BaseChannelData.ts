import {
    TextBasedChannelTypes,
    VoiceBasedChannelTypes,
    ThreadChannelTypes,
} from "discord.js";
import { ChannelPermissionsData } from "./";

export interface BaseChannelData {
    type:
        | TextBasedChannelTypes
        | VoiceBasedChannelTypes
        | ThreadChannelTypes
        | "text"
        | "voice";
    name: string;
    parent?: string | null;
    permissions: ChannelPermissionsData[];
}
