import { ClearOutlined, HighlightOffOutlined } from "@mui/icons-material";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded"
import Clear from "@mui/icons-material/Clear"
import theme from "./theme";

const SubscriptionList: Subscription[] = [
    {
        id: 0,
        name: "Free", 
        priceMonthly: "0",
        priceYearly: "0",
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
                value: "1 Server",
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
                value: "18h Pull Cooldown",
                description: "You can only pull every 12h",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "blacklist",
                value: "Blacklist",
                description: "Blacklist people from verifying with id, asn, ip and more",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "antiVPN",
                value: "Anti VPN & Proxy",
                description: "Prevent members from using a VPN or Proxy to verify in your server",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "webhookLogs",
                value: "Webhook Logs",
                description: "Log all verifications in your server",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
            },
            {
                name: "verificationLogging",
                value: "Verification Logging",
                description: "See more information about verified members",
                icon: <HighlightOffOutlined sx={{ color: theme.palette.error.main, mr: 1 }} />,
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
                name: "onlineStatus",
                value: "Online Status",
                description: "Shows your bot as online in the Member List",
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
            }
        ]
    },
    {
        id: 1,
        name: "Premium",
        priceMonthly: "2",
        priceYearly: "15",
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
                name: "onlineStatus",
                value: "Online Status",
                description: "Shows your bot as online in the Member List",
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
            }
        ]
    },
    {
        id: 2,
        name: "Business",
        priceMonthly: "5",
        priceYearly: "30",
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
                name: "onlineStatus",
                value: "Online Status",
                description: "Shows your bot as online in the Member List",
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
            }
        ]
    },
];

interface Subscription {
    id: number;
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
