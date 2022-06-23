import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";

const SubscriptionList: Subscription[] = [
    {
        name: "Free", 
        priceMonthly: "$0",
        priceYearly: "$0",
        bestPlan: false,
        features: [
            {
                name: "memberCapacity",
                value: "100 Restoreable Members",
                description: "Maximum number of Restoreable Members",
                icon: faCheck,
            },
            {
                name: "serverCapacity",
                value: "1 Server",
                description: "Maximum number of Servers you can add",
                icon: faCheck,
            },
            {
                name: "ipBans",
                value: "IP Bans",
                description: "IP Ban members from your server",
                icon: faCheck,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: faX,
            },
            {
                name: "verificationLogs",
                value: "Verification Logs",
                description: "Log all verifications in your server",
                icon: faX,
            },
            {
                name: "autoKick",
                value: "Auto Kick",
                description: "Automatically kick members if they don\"t verify in a given time",
                icon: faX,
            },
            {
                name: "serverBackups",
                value: "Server Backups",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: faX,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: faX,
            }
        ]
    },
    {
        name: "Premium",
        priceMonthly: "$2",
        priceYearly: "$10",
        bestPlan: true,
        features: [
            {
                name: "memberCapacity",
                value: "Unlimited Restoreable Members",
                description: "Maximum number of Restoreable Members",
                icon: faCheck,
            },
            {
                name: "serverCapacity",
                value: "5 Servers",
                description: "Maximum number of Servers you can add",
                icon: faCheck,
            },
            {
                name: "ipBans",
                value: "IP Bans",
                description: "IP Ban members from your server",
                icon: faCheck,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: faCheck,
            },
            {
                name: "verificationLogs",
                value: "Verification Logs",
                description: "Log all verifications in your server",
                icon: faCheck,
            },
            {
                name: "autoKick",
                value: "Auto Kick",
                description: "Automatically kick members if they don\"t verify in a given time",
                icon: faCheck,
            },
            {
                name: "serverBackups",
                value: "Server Backups",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: faCheck,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: faX,
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
                value: "Unlimited Restoreable Members",
                description: "Maximum number of Restoreable Members",
                icon: faCheck,
            },
            {
                name: "serverCapacity",
                value: "5 Servers",
                description: "Maximum number of Servers you can add",
                icon: faCheck,
            },
            {
                name: "ipBans",
                value: "IP Bans",
                description: "IP Ban members from your server",
                icon: faCheck,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: faCheck,
            },
            {
                name: "verificationLogs",
                value: "Verification Logs",
                description: "Log all verifications in your server",
                icon: faCheck,
            },
            {
                name: "autoKick",
                value: "Auto Kick",
                description: "Automatically kick members if they don\"t verify in a given time",
                icon: faCheck,
            },
            {
                name: "serverBackups",
                value: "Server Backups",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: faCheck,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: faCheck,
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
