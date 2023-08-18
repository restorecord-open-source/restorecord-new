import { Snowflake } from "discord.js";
import { MessageData } from "./MessageData";

export interface channelData {
    channelId:            bigint; 
    type:                 Number;
    name:                 String;
    position:             Number;
    bitrate?:             Number | undefined | null;
    userLimit?:           Number | undefined | null;
    parentId?:            bigint | undefined | null;
    topic?:               String | undefined | null;
    rateLimitPerUser?:    Number; 
    nsfw:                 Boolean;
    channelPermissions?:  Array<ChannelPermissionsData> | undefined | null;
}

export interface ChannelPermissionsData {
    channelId:  bigint;
    roleId:     bigint;
    type:       String;
    allow:      bigint;
    deny:       bigint;
}

export interface roleData {
    name:         String;
    roleId:       bigint;
    color:        String;
    hoist:        Boolean;
    permissions:  bigint;
    mentionable:  Boolean;
    position:     Number;
    isEveryone:   Boolean;
}

export interface MemberData {
    guildId:    bigint;
    userId:     bigint;
    nickname?:  String | undefined | null;
    roles:      String;
}

export interface BackupData {
    // serverId:     Number;
    serverName:   String;
    guildId:      bigint;
    iconURL?:     String | undefined | null;
    backupId:     String;
    channels:     channelData[] | undefined;
    roles:        roleData[] | undefined;
    guildMembes:  MemberData[] | undefined;
    messages:     MessageData[];
}
