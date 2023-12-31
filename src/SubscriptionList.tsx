import { ClearOutlined, HighlightOffOutlined } from "@mui/icons-material";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded"
import Clear from "@mui/icons-material/Clear"
import theme from "./theme";

const SubscriptionList: Subscription[] = [
    {
        id: 0,
        name: "Free", 
        priceMonthly: 0,
        priceYearly: 0,
        bestPlan: false,
        features: [
            { name: "memberCapacity", value: "Unlimited Restorable Members", description: "Max restorable members", icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} /> },
            { name: "serverCapacity", value: "1 Server", description: "Max servers you can add", icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} /> },
            { name: "customBots", value: "Custom Bot", description: "Personalized bot for you", icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} /> },
            { name: "proxied", value: "Proxied Requests", description: "Anonymous and proxied Discord requests", icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} /> },
            { name: "cooldown", value: "18h Pull Cooldown", description: "Can pull data every 18h", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "blacklist", value: "Blacklist", description: "Prevent verification using ID, ASN, IP, and more", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "antiVPN", value: "Anti VPN & Proxy", description: "Restrict VPN and Proxy use", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "webhookLogs", value: "Webhook Logs", description: "Log all verifications", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "verificationLogging", value: "Verification Logging", description: "Detailed info about verified members", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "altDetection", value: "Alt Detection", description: "Prevent alt accounts from verifying", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "serverBackups", value: "Server Backup", description: "Backup server settings, channels, roles, etc.", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "customization", value: "Customization", description: "Personalize verify page appearance", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "botCommands", value: "Bot Commands", description: "Execute commands via Discord", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "discovery", value: "Discovery", description: "Showcase server on our website", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "export", value: "Export Members", description: "Export members to CSV", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            { name: "analytics", value: "Analytics", description: "View server and member analytics", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            // { name: "customBotStatus", value: "Custom Bot Status", description: "Tailor bot status", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            // { name: "serverReviews", value: "Server Reviews", description: "Allow member reviews/vouches", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            // { name: "dashboardManagers", value: "Dashboard Managers", description: "Add managers with permissions", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            // { name: "customCSS", value: "Custom CSS", description: "Add custom CSS to verify page", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
            // { name: "verified", value: "Verified Checkmark", description: "Display verified checkmark", icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} /> },
        ]
    },
    {
        id: 1,
        name: "Premium",
        priceMonthly: 2,
        priceYearly: 15,
        bestPlan: true,
        features: [
            {
                name: "memberCapacity",
                value: "Unlimited Restorable Members",
                description: "Maximum number of Restorable Members",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "serverCapacity",
                value: "5 Servers",
                description: "Maximum number of Servers you can add",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "customBots",
                value: "Custom Bot",
                description: "Custom Bot just for you",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "proxied",
                value: "Proxied Requests",
                description: "All requests sent to Discord are anonymous and proxied",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "cooldown",
                value: "2h Pull Cooldown",
                description: "You can only pull every 12h",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
            },
            {
                name: "blacklist",
                value: "Blacklist",
                description: "Blacklist people from verifying with id, asn, ip and more",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "webhookLogs",
                value: "Webhook Logs",
                description: "Log all verifications in your server",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "verificationLogging",
                value: "Basic Verification Logging",
                description: "See more information about verified members",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "altDetection",
                value: "Alt Detection",
                description: "Detects if a member is an alt account and prevents them from verifying",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "serverBackups",
                value: "Server Backup",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "botCommands",
                value: "Bot Commands",
                description: "Send verify embed, pull members and more directly from Discord",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "discovery",
                value: "Discovery",
                description: "Your server will be shown on our website",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "export",
                value: "Export Members",
                description: "Export all your members to a CSV file",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "analytics",
                value: "Analytics",
                description: "View analytics about your server and members",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            // {
            //     name: "customBotStatus",
            //     value: "Custom Bot Status",
            //     description: "Customize your bot status",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "serverReviews",
            //     value: "Server Reviews",
            //     description: "Allow members to review/vouch your server",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "dashboardManagers",
            //     value: "Dashboard Managers",
            //     description: "Add managers with permissions to your dashboard",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "customCSS",
            //     value: "Custom CSS",
            //     description: "Add custom CSS to your verify page",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "verified",
            //     value: "Verified Checkmark",
            //     description: "Verified Checkmark next to your server name",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
        ]
    },
    {
        id: 2,
        name: "Business",
        priceMonthly: 5,
        priceYearly: 30,
        bestPlan: false,
        features: [
            {
                name: "memberCapacity",
                value: "Unlimited Restorable Members",
                description: "Maximum number of Restorable Members",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "serverCapacity",
                value: "25 Servers",
                description: "Maximum number of Servers you can add",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "customBots",
                value: "Custom Bot",
                description: "Custom Bot just for you",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "proxied",
                value: "Proxied Requests",
                description: "All requests sent to Discord are anonymous and proxied",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "cooldown",
                value: "30min Pull Cooldown",
                description: "You can only pull every 12h",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "blacklist",
                value: "Blacklist",
                description: "Blacklist people from verifying with id, asn, ip and more",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "webhookLogs",
                value: "Advanced Webhook Logs",
                description: "Log all verifications in your server",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "verificationLogging",
                value: "Advanced Verification Logging",
                description: "See more information about verified members",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "altDetection",
                value: "Alt Detection",
                description: "Detects if a member is an alt account and prevents them from verifying",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "serverBackups",
                value: "Server Backup",
                description: "Backup all your Server Settings, Channels, Roles and more",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "customization",
                value: "Customization",
                description: "Customize your verify page with your own color, icon and background",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "botCommands",
                value: "Bot Commands",
                description: "Send verify embed, pull members and more directly from Discord",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "discovery",
                value: "Discovery",
                description: "Your server will be shown on our website",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "export",
                value: "Export Members",
                description: "Export all your members to a CSV file",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            {
                name: "analytics",
                value: "Analytics",
                description: "View analytics about your server and members",
                icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
            },
            // {
            //     name: "customBotStatus",
            //     value: "Custom Bot Status",
            //     description: "Customize your bot status",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "serverReviews",
            //     value: "Server Reviews",
            //     description: "Allow members to review/vouch your server",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "dashboardManagers",
            //     value: "Dashboard Managers",
            //     description: "Add managers with permissions to your dashboard",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "customCSS",
            //     value: "Custom CSS",
            //     description: "Add custom CSS to your verify page",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
            // {
            //     name: "verified",
            //     value: "Verified Checkmark",
            //     description: "Verified Checkmark next to your server name",
            //     icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            // },
        ]
    },
    // {
    //     id: 3,
    //     name: "Enterprise",
    //     priceMonthly: "15",
    //     priceYearly: "120",
    //     bestPlan: false,
    //     features: [
    //         {
    //             name: "memberCapacity",
    //             value: "Unlimited Restorable Members",
    //             description: "Maximum number of Restorable Members",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "serverCapacity",
    //             value: "25 Servers",
    //             description: "Maximum number of Servers you can add",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "customBots",
    //             value: "Custom Bot",
    //             description: "Custom Bot just for you",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "proxied",
    //             value: "Proxied Requests",
    //             description: "All requests sent to Discord are anonymous and proxied",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "cooldown",
    //             value: "30min Pull Cooldown",
    //             description: "You can only pull every 12h",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "blacklist",
    //             value: "Blacklist",
    //             description: "Blacklist people from verifying with id, asn, ip and more",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "antiVPN",
    //             value: "Anti VPN & Proxy",
    //             description: "Prevent members from using a VPN or Proxy to verify in your server",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "webhookLogs",
    //             value: "Advanced Webhook Logs",
    //             description: "Log all verifications in your server",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "verificationLogging",
    //             value: "Advanced Verification Logging",
    //             description: "See more information about verified members",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "altDetection",
    //             value: "Alt Detection",
    //             description: "Detects if a member is an alt account and prevents them from verifying",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "serverBackups",
    //             value: "Full Server Backup",
    //             description: "Backup all your Server Settings, Channels, Roles and more",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "customization",
    //             value: "Customization",
    //             description: "Customize your verify page with your own color, icon and background",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "botCommands",
    //             value: "Bot Commands",
    //             description: "Send verify embed, pull members and more directly from Discord",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "discovery",
    //             value: "Discovery",
    //             description: "Your server will be shown on our website",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "export",
    //             value: "Export Members",
    //             description: "Export all your members to a CSV file",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "analytics",
    //             value: "Analytics",
    //             description: "View analytics about your server and members",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "customBotStatus",
    //             value: "Custom Bot Status",
    //             description: "Customize your bot status",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "serverReviews",
    //             value: "Server Reviews",
    //             description: "Allow members to review/vouch your server",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "dashboardManagers",
    //             value: "Dashboard Managers",
    //             description: "Add managers with permissions to your dashboard",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "customCSS",
    //             value: "Custom CSS",
    //             description: "Add custom CSS to your verify page",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //         {
    //             name: "verified",
    //             value: "Verified Checkmark",
    //             description: "Verified Checkmark next to your server name",
    //             icon: <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />,
    //         },
    //     ]
    // },
];

interface Subscription {
    id: number;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    discount?: number;
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
