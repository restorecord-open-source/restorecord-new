import { MessageEmbed, FileOptions } from "discord.js";

export interface MessageData {
    channelId: bigint;
    username: string;
    avatar?: string;
    content?: string;
    embeds?: MessageEmbed[];
    files?: FileOptions[] | undefined | null;
    createdAt: Date;
}
