import { ReactElement } from "react";

import Dashboard from "@mui/icons-material/Dashboard";
import Storage from "@mui/icons-material/Storage";
import Code from "@mui/icons-material/Code";
import VerifiedUser from "@mui/icons-material/VerifiedUser";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import Help from "@mui/icons-material/Help";
import FindInPage from "@mui/icons-material/FindInPage";
import Logout from "@mui/icons-material/Logout";

const navItemWrappers: navItemWrapper[] = [
    {
        seperator: false,
        items: [
            {
                name: "Dashboard",
                icon: <Dashboard />,
                href: "/dashboard",
                admin: false,
            }
        ]
    },
    {
        seperator: true,
        items: [
            {
                name: "Servers",
                icon: <Storage />,
                href: "/dashboard/settings",
                admin: false,
            },
            {
                name: "Custom Bots",
                icon: <Code />,
                href: "/dashboard/custombots",
                admin: false,
            },
            // {
            //     name: "Backups",
            //     icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
            //     href: "/dashboard/backups",
            // },
            {
                name: "Verified Members",
                icon: <VerifiedUser />,
                href: "/dashboard/members",
                admin: false,
            }
        ]
    },
    {
        seperator: true,
        items: [
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
                admin: false,
            },
            {
                name: "Upgrade",
                icon: <AccountBalanceWallet />,
                href: "/dashboard/upgrade",
                admin: false,
            },
            {
                name: "Help",
                icon: <Help />,
                href: "https://community.restorecord.com",
                admin: false,
            },
            {
                name: "Documentation",
                icon: <FindInPage />,
                href: "https://docs.restorecord.com",
                admin: false,
            },
            {
                name: "Sign Out",
                icon: <Logout />,
                href: "/logout",
                admin: false,
            },
        ]
    },
]

interface navItemWrapper {
    seperator: boolean;
    items: navItem[];
}

interface navItem {
    name: string;
    href: string;
    icon: ReactElement;
    admin: boolean;
}

export default navItemWrappers as navItemWrapper[];
