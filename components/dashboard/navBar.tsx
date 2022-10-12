import { useEffect, useState } from "react"
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";

import Link from "next/link"
import MuiLink from "@mui/material/Link";
import navItemWrappers from "../../src/dashboard/navBarItems"

import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";

import MenuIcon from "@mui/icons-material/Menu";
import styled from "@emotion/styled";
import { Button } from "@mui/material";


const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop: any) => prop !== "open" })<{
    open?: boolean;
    sx?: any;
}>(({ theme, open }: any) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));
  

export default function NavBar({ ...props }: any) {
    const [pathName, setPathName] = useState("/")
    const [openDrawer, setOpenDrawer] = useState(true);
        
    const router = useRouter();
    const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));

    useEffect(() => {
        setPathName(router.pathname);

        if (isMobile) setOpenDrawer(false);
        else setOpenDrawer(true);
    }, [router.pathname, isMobile]);

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        {isMobile && (
                            <>
                                <IconButton onClick={() => setOpenDrawer(!openDrawer)} edge="start" sx={{ marginRight: (theme) => theme.spacing(2) }} color="inherit" aria-label="menu">
                                    <MenuIcon />
                                </IconButton>
                            </>
                        )}
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 0, cursor: "pointer"}} onClick={() => { router.push("/dashboard") }}>
                            RestoreCord
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} variant="persistent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" } }}>
                    <Toolbar />
                    <Box sx={{ overflow: "auto" }}>
                        {navItemWrappers.map((item, index) => {
                            return (
                                <List key={index}>
                                    {item.items.map((item, index) => {
                                        if (item.admin) {
                                            return null
                                        }
                                        return (
                                            <MuiLink key={index} href={item.href} underline="none" color="inherit">
                                                <ListItem disablePadding selected={pathName === item.href} sx={{ "&.Mui-selected": { backgroundColor: "#1e1e1e" } }}>
                                                    <Link href={item.href}>
                                                        <ListItemButton>
                                                            {/* <ListItem button selected={pathName === item.href} disablePadding> */}
                                                            <ListItemIcon>
                                                                {item.icon}
                                                            </ListItemIcon>
                                                            <ListItemText primary={item.name} />
                                                            {/* </ListItem> */}
                                                        </ListItemButton>
                                                    </Link>
                                                </ListItem>
                                            </MuiLink>

                                        )
                                    }
                                    )}
                                </List>
                            )
                        })}
                    </Box>
                </Drawer>
            </Box>
            <Main open={openDrawer} sx={{ flexGrow: 1, p: 3 }}>
                {props.children}
            </Main>
        </>
    )
}


