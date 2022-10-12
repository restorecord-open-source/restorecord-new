import type { GuildFeatures } from "discord.js";

export * from "./BackupData";
export * from "./BaseChannelData";
export * from "./EmojiData";
export * from "./MessageData";
export * from "./RoleData";
export * from "./VoiceChannelData";
export * from "./WidgetData";

declare global {
    var db: any;
  }
  
export {};
  