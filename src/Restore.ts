import { backups, customBots, servers } from "@prisma/client";
import { clearGuild } from "./BackupUtils";
import {
    loadChannels,
    loadConfig,
    // loadMemberRoles,
    loadRoles,
} from "./RestoreUtils";

export const startRestore = async (
    server: servers,
    bot: customBots,
    backup: backups,
    clear: boolean,
    settings: boolean,
    channels: boolean,
    roles: boolean,
    messages: boolean
) => {
    return new Promise(async (resolve, reject) => {
        if (!server) return reject("Server not found");

        console.log(`[Restore] Starting restore for ${server.guildId} ${clear} ${settings} ${channels} ${roles} ${messages}`);

        try {
            try {
                // if (clear) await clearGuild(server, bot);
                // run wait until clearGuild(server, bot) is done
                if (clear) await clearGuild(server, bot);
                // if (clear) await new Promise((resolve) => setTimeout(resolve, 20000));

                if (settings) await loadConfig(server, bot, backup);
                // if (settings) await new Promise((resolve) => setTimeout(resolve, 2000));

                if (roles) await loadRoles(server, bot, backup);
                // if (roles) await new Promise((resolve) => setTimeout(resolve, 5000));

                if (channels) await loadChannels(server, bot, backup, messages);
                // if (channels) await new Promise((resolve) => setTimeout(resolve, 5000));
          
            } catch (e) {
                console.error(`[Restore 1] [ERROR] ${e}`);
                return reject(e);
            }
            return resolve("Restored");
        } catch (e) {
            console.error(`[Restore 2] [ERROR] ${e}`);
            return reject("Invalid Backup");
        }
    });
};
