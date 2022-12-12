import { backups, customBots, servers } from "@prisma/client";
import { clearGuild, loadChannel } from "./BackupUtils";
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
    clear: boolean = true,
    settings: boolean = true,
    channels: boolean = true,
    roles: boolean = true,
) => {
    return new Promise(async (resolve, reject) => {
        if (!server) return reject("Server not found");

        try {
            try {
                // if (clear) await clearGuild(server, bot);
                // run wait until clearGuild(server, bot) is done
                if (clear) new Promise((resolve) => resolve(clearGuild(server, bot)));
                await new Promise((resolve) => setTimeout(resolve, 10000));

                if (settings) await loadConfig(server, bot, backup);
                await new Promise((resolve) => setTimeout(resolve, 2000));

                if (channels) await loadChannels(server, bot, backup);
                await new Promise((resolve) => setTimeout(resolve, 5000));

                if (roles) await loadRoles(server, bot, backup);
                await new Promise((resolve) => setTimeout(resolve, 5000));                
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
