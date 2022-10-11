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
                if (clear) await clearGuild(server, bot);

                if (settings) await loadConfig(server, bot, backup);
                if (channels) await loadChannels(server, bot, backup);
                if (roles) await loadRoles(server, bot, backup);
            } catch (e) {
                console.error(e);
                return reject(e);
            }
            return resolve("Restored");
        } catch (e) {
            console.error(e);
            return reject("Invalid Backup");
        }
    });
};
