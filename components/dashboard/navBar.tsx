import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router";
import { SxProps, useTheme } from "@mui/material/styles";
import { ArrowDropDownRounded } from "@mui/icons-material";

import Link from "next/link"
import navItemWrappers from "../../src/dashboard/navBarItems"
import theme from "../../src/theme";

import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
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
import MuiLink from "@mui/material/Link";
import styled from "@emotion/styled";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import { createHash } from "crypto";
import Button from "@mui/material/Button";


const drawerWidth = 250;

const Main = styled("main", { shouldForwardProp: (prop: any) => prop !== "open" })<{
    open?: boolean;
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

    const userDropdownRef: any = useRef(null);
        
    const router = useRouter();
    const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));

    useEffect(() => {
        userDropdownRef.current.style.display = "none";
        setPathName(router.pathname);

        if (isMobile) setOpenDrawer(false);
        else setOpenDrawer(true);
    }, [router.pathname, isMobile]);

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#09090d", boxShadow: "none", borderBottom: "1px solid rgb(38, 38, 42)" }}>
                    <Toolbar>
                        {isMobile && (
                            <IconButton onClick={() => setOpenDrawer(!openDrawer)} edge="start" sx={{ marginRight: (theme) => theme.spacing(2) }} color="inherit" aria-label="menu">
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h6" noWrap component="div" sx={{  flexGrow: 0, cursor: "pointer" }} onClick={() => { router.push("/dashboard") }}>
                            RestoreCord
                        </Typography>

                        <Box sx={{ display: { xs: "none", md: "flex",  }, alignItems: "center", flexGrow: 1, justifyContent: "flex-end", mr: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <ButtonBase disableRipple onClick={() => {
                                    userDropdownRef?.current?.style?.display === "none" ? userDropdownRef.current.style.display = "flex" : userDropdownRef.current.style.display = "none";
                                }}>
                                    <Avatar alt="Profile Picture" src={`https://api.gravatar.com/avatar/${createHash("md5").update(props.user.email).digest("hex")}?d=mp&s=128`} sx={{ width: 32, height: 32, mr: 1 }} />
                                    {/* <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: stringToColor(props.user.username), color: theme.palette.getContrastText(stringToColor(props.user.username)) }}>{props.user.username[0].toUpperCase()}</Avatar> */}
                                    <Typography variant="body1" color={theme.palette.text.primary}>{props.user.username}</Typography>
                                    <ArrowDropDownRounded />
                                </ButtonBase>
                            </Stack>
                        </Box> 


                        <Box ref={userDropdownRef} sx={{ position: "absolute", background: theme.palette.background.paper, borderRadius: "0.5rem", top: "calc(100% + 0.5rem)", display: "none", right: "2rem", border: "1px solid rgb(40, 40, 47)", zIndex: 1000 }}>
                            <List>
                                <ListItemButton sx={{ padding: "0.5rem 0.75rem" }}>
                                    <ButtonBase disableRipple onClick={() => { router.push("/dashboard") }}>
                                        <Link href="/dashboard" color="text.primary">
                                            <Typography variant="body1">Dashboard</Typography>
                                        </Link>
                                    </ButtonBase>
                                </ListItemButton>
                                <ListItemButton sx={{ padding: "0.5rem 0.75rem" }}>
                                    <ButtonBase disableRipple onClick={() => { router.push("/dashboard/account") }}>
                                        <Link href="/dashboard/account" color="text.primary">
                                            <Typography variant="body1">Settings</Typography>
                                        </Link>
                                    </ButtonBase>
                                </ListItemButton>
                                <Divider />
                                <ListItemButton sx={{ padding: "0.5rem 0.75rem" }}>
                                    <ButtonBase disableRipple onClick={() => { router.push("/logout") }}>
                                        <Link href="/logout" color="text.primary">
                                            <Typography variant="body1">Sign Out</Typography>
                                        </Link>
                                    </ButtonBase>
                                </ListItemButton>
                            </List>
                        </Box>

                    </Toolbar>
                </AppBar>
                
                <Drawer open={openDrawer} onClose={() => setOpenDrawer(false)} variant="persistent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", background: "#00000000" } }}>
                    <Toolbar />
                    <Stack direction="column" justifyContent={"space-between"} sx={{ height: "100%", width: "100%" }}>
                        <Box sx={{ overflow: "auto" }}>
                            <List>
                                {navItemWrappers.map((item, index) => {
                                    if (item.admin && !props.user.admin) return null;
                                    return (
                                        <MuiLink key={index} href={item.href} color="text.primary" sx={{ textDecoration: "none" }} onClick={(e: any) => { e.preventDefault(); router.push(item.href) }}>
                                            <ListItemButton selected={pathName === item.href} disableRipple onClick={() => { router.push(item.href) }} sx={{ 
                                                margin: "0.3rem 0", ["&.Mui-selected"]: {
                                                    backgroundColor: "unset",
                                                    "&:hover": { 
                                                        borderRadius: "0 0.5rem 0.5rem 0",
                                                        backgroundColor: "unset",
                                                    }, 
                                                    "&:before": { 
                                                        backgroundColor: theme.palette.primary.main,
                                                        content: "''", 
                                                        height: "100%", 
                                                        position: "absolute", 
                                                        width: "0.125rem" ,
                                                        left: 0
                                                    },
                                                    "&:after": {
                                                        backgroundColor: "#12121a", 
                                                        borderRadius: "0.5rem",
                                                        content: '""',
                                                        height: "100%",
                                                        left: "0.5rem",
                                                        position: "absolute",
                                                        width: "90%",
                                                        zIndex: -999,
                                                    }
                                                }, 
                                                "&:before": {
                                                    backgroundColor: "#12121a", 
                                                    borderRadius: "0 5px 5px 0",
                                                    content: '""',
                                                    height: "100%",
                                                    position: "absolute",
                                                    transition: ".25s",
                                                    width: "0",
                                                    zIndex: -998,
                                                },
                                                "&:hover:before": {
                                                    borderRadius: "0.5rem",
                                                    height: "100%",
                                                    left: "0.5rem",
                                                    width: "90%",
                                                },
                                                "&:hover": {
                                                    background: "none"
                                                },
                                                background: "none", 
                                                borderRadius: "0.5rem", 
                                                zIndex: 1000,
                                                transition: "all 0.1s ease-in-out"
                                            }}> 
                                                <ListItemIcon sx={{ "& .MuiSvgIcon-root": { fontSize: "1.25rem" }, minWidth: "2rem", marginRight: "0.75rem" }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText primary={item.name} sx={{ "& .MuiTypography-root": { fontWeight: "300", fontSize: "0.9rem" } }} />
                                            </ListItemButton>
                                        </MuiLink>
                                    )
                                })}
                            </List>
                        </Box>
                        <Button variant="contained" color="secondary" href="https://discord.com/oauth2/authorize?client_id=1168230726689362063&redirect_uri=https://restorecord.com/api/callback&response_type=code&scope=identify+guilds.join&state=1168231515839279245&prompt=none" target="_blank" sx={{ m: 1, }}>
                            Contact Support
                        </Button>
                    </Stack>
                </Drawer>
            </Box>
            <Main open={openDrawer}>
                {props.children}
            </Main>
        </>
    )
}


