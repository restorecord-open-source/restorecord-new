import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast, { Toaster } from "react-hot-toast";

class functions {
    constructor() {
        functions.toUptime = functions.toUptime.bind(this);
        functions.ToastAlert = functions.ToastAlert.bind(this);
    }

    static async toUptime(uptime: number) {
        const days = Math.floor(uptime / (60 * 60 * 24));
        const hours = Math.floor((uptime % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);
        const milliseconds = Math.floor((uptime % 1) * 1000);

        return { 
            full: `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`,
            short: `${hours}h ${minutes}m`,

            days: days, 
            hours: hours, 
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds
        };
    }

    static async ToastAlert(message: string, type: "success" | "error" | "info" = "info") {
        switch (type) {
        case "success":
            toast.success(message, {
                position: "bottom-right",
                style: {
                    background: "#333",
                    color: "#fff",
                },
            });
            break;
        case "error":
            toast.error(message, {
                position: "bottom-right",
                style: {
                    background: "#333",
                    color: "#fff",
                },
            });
            break;
        case "info":
            toast(message, {
                position: "bottom-right",
                style: {
                    background: "#333",
                    color: "#fff",
                },
            });
            break;
        default:
            toast(message, {
                position: "bottom-right",
                style: {
                    background: "#333",
                    color: "#fff",
                },
            });
            break;
        }
    }
}

export default functions;