import { ReactElement } from "react";

import Home from '@mui/icons-material/Home';
import Dns from "@mui/icons-material/Dns";
import Backup from "@mui/icons-material/Backup";
import Code from "@mui/icons-material/Code";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Help from "@mui/icons-material/HelpOutline";
import FindInPage from "@mui/icons-material/FindInPage";
import PersonOffIcon from "@mui/icons-material/PersonOff";

const navItemWrappers: navItemWrapper[] = [
    {
        name: "Dashboard",
        icon: <Home />,
        href: "/dashboard",
    },
    {
        name: "Servers",
        icon: <Dns />,
        href: "/dashboard/server",
    },
    {
        name: "Backups",
        icon: <Backup />,
        href: "/dashboard/backups",
    },
    {
        name: "Custom Bots",
        icon: <Code />,
        href: "/dashboard/custombots",
    },
    {
        name: "Verified Members",
        icon: <VerifiedUser />,
        href: "/dashboard/members",
    },
    {
        name: "Blacklist",
        icon: <PersonOffIcon />,
        href: "/dashboard/blacklist",
    },
    {
        name: "Admin",
        icon: <AdminPanelSettings />,
        href: "/dashboard/admin",
        admin: true,
    },
    {
        name: "Account",
        icon: <ManageAccountsIcon />,
        href: "/dashboard/account",
    },
    {
        name: "Upgrade",
        icon: <AccountBalanceWallet />,
        href: "/dashboard/upgrade",
    },
    // {
    //     name: "Help",
    //     icon: <Help />,
    //     href: "https://community.restorecord.com",
    // },
    // {
    //     name: "Documentation",
    //     icon: <FindInPage />,
    //     href: "https://docs.restorecord.com",
    // }
]

interface navItemWrapper {
    name: string;
    href: string;
    icon: ReactElement;
    admin?: boolean;
}


export default navItemWrappers as navItemWrapper[];
