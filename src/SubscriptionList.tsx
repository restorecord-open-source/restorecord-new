import Check from "@mui/icons-material/Check"
import Clear from "@mui/icons-material/Clear"

const SubscriptionList: Subscription[] = [
    {
        name: "Free", 
        priceMonthly: "$0",
        priceYearly: "$0",
        bestPlan: false,
        features: [
            {
                name: "memberCapacity",
                value: "Unlimited Restorable Members",
                description: "Maximum number of Restorable Members",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "serverCapacity",
                value: "1 Server",
                description: "Maximum number of Servers you can add",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "customBots",
                value: "Custom Bot",
                description: "Custom Bot just for you",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "ipBans",
                value: "IP Bans",
                description: "IP Ban members from your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "proxied",
                value: "Proxied Requests",
                description: "All requests sent to Discord are anonymous and proxied",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "verificationLogs",
                value: "Verification Logs",
                description: "Log all verifications in your server",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "serverBackups",
                value: "Server Backup",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "onlineStatus",
                value: "Online Status",
                description: "Shows your bot as online in the Member List",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "botCommands",
                value: "Bot Commands",
                description: "Send verify embed, pull members and more directly from Discord",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            }
        ]
    },
    {
        name: "Premium",
        priceMonthly: "$2",
        priceYearly: "$15",
        bestPlan: true,
        features: [
            {
                name: "memberCapacity",
                value: "Unlimited Restorable Members",
                description: "Maximum number of Restorable Members",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "serverCapacity",
                value: "5 Servers",
                description: "Maximum number of Servers you can add",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "customBots",
                value: "Custom Bot",
                description: "Custom Bot just for you",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "ipBans",
                value: "IP Bans",
                description: "IP Ban members from your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "proxied",
                value: "Proxied Requests",
                description: "All requests sent to Discord are anonymous and proxied",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "verificationLogs",
                value: "Verification Logs",
                description: "Log all verifications in your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "serverBackups",
                value: "Server Backup",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "onlineStatus",
                value: "Online Status",
                description: "Shows your bot as online in the Member List",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            },
            {
                name: "botCommands",
                value: "Bot Commands",
                description: "Send verify embed, pull members and more directly from Discord",
                icon: <Clear sx={{ color: "#ef4444" }} />,
            }
        ]
    },
    {
        name: "Business",
        priceMonthly: "$5",
        priceYearly: "$30",
        bestPlan: false,
        features: [
            {
                name: "memberCapacity",
                value: "Unlimited Restorable Members",
                description: "Maximum number of Restorable Members",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "serverCapacity",
                value: "250 Servers",
                description: "Maximum number of Servers you can add",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "customBots",
                value: "Custom Bot",
                description: "Custom Bot just for you",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "ipBans",
                value: "IP Bans",
                description: "IP Ban members from your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "proxied",
                value: "Proxied Requests",
                description: "All requests sent to Discord are anonymous and proxied",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "verificationLogs",
                value: "Advanced Verification Logs",
                description: "Log all verifications in your server",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "serverBackups",
                value: "Server Backup",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "onlineStatus",
                value: "Online Status",
                description: "Shows your bot as online in the Member List",
                icon: <Check sx={{ color: "#22c55e" }} />,
            },
            {
                name: "botCommands",
                value: "Bot Commands",
                description: "Send verify embed, pull members and more directly from Discord",
                icon: <Check sx={{ color: "#22c55e" }} />,
            }
        ]
    },
];

interface Subscription {
    name: string;
    priceMonthly: string;
    priceYearly: string;
    bestPlan: boolean;
    features: Feature[];
}

interface Feature {
    name: string;
    value: string;
    description: string;
    icon: any;
}

export default SubscriptionList as Subscription[];
