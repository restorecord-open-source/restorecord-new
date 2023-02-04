import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router";
import { useTheme } from "@mui/material/styles";

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
import { ArrowDropDownRounded } from "@mui/icons-material";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import { stringToColor } from "../../src/functions";


const drawerWidth = 250;

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

    const userDropdownRef: any = useRef(null);
        
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
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: "#09090d", borderBottomLeftRadius: "1rem", borderBottomRightRadius: "1rem", boxShadow: "none", borderBottom: "1px solid rgb(38, 38, 42)" }}>
                    <Toolbar>
                        {isMobile && (
                            <>
                                <IconButton onClick={() => setOpenDrawer(!openDrawer)} edge="start" sx={{ marginRight: (theme) => theme.spacing(2) }} color="inherit" aria-label="menu">
                                    <MenuIcon />
                                </IconButton>
                            </>
                        )}
                        <Typography variant="h6" noWrap component="div" sx={{  flexGrow: 0, cursor: "pointer" }} onClick={() => { router.push("/dashboard") }}>
                            RestoreCord
                        </Typography>

                        {/* desktop only */}
                        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", flexGrow: 1, justifyContent: "flex-end", mr: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <ButtonBase disableRipple onClick={() => { 
                                    userDropdownRef?.current?.style?.display === "none" ? userDropdownRef.current.style.display = "flex" : userDropdownRef.current.style.display = "none";
                                    // userDropdownRef?.current?.style?.flexDirection === "column" ? userDropdownRef.current.style.flexDirection = "row" : userDropdownRef.current.style.flexDirection = "column";
                                }}>
                                    <Avatar alt="Profile Picture" src={props.user.icon} sx={{ width: 32, height: 32, mr: 1 }} />
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
                    <Box sx={{ overflow: "auto" }}>
                        <List>
                            {navItemWrappers.map((item, index) => {
                                if (item.admin && !props.user.admin) return null;
                                return (
                                    <Link key={index} href={item.href} color="inherit">
                                        <ListItemButton selected={pathName === item.href} disableRipple sx={{ 
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
                                            {/* <ListItemButton sx={{ borderLeft: pathName === item.href ? "3px solid #4f46e5" : "none", background: "none",  padding: "0", ["&:hover"]: { background: "none" } }}> */}
                                            {/* <Link href={item.href}> */}
                                            {/* <ListItemButton sx={{ borderRadius: "0.5rem", background: "none", ["&:hover"]: { background: "none" }, fontSize: "0.75rem" }}> */}
                                            {/* <ListItem button selected={pathName === item.href} disablePadding> */}
                                            <ListItemIcon sx={{ "& .MuiSvgIcon-root": { fontSize: "1.25rem" }, minWidth: "2rem", marginRight: "0.75rem" }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.name} sx={{ "& .MuiTypography-root": { fontWeight: "300", fontSize: "0.9rem" } }} />
                                            {/* </ListItem> */}
                                            {/* </ListItemButton> */}
                                            {/* </Link> */}
                                            {/* </ListItemButton> */}
                                        </ListItemButton>
                                    </Link>
                                )
                            })}
                        </List>
                    </Box>
                </Drawer>
            </Box>
            <Main open={openDrawer} sx={{ flexGrow: 1, p: 3 }}>
                {props.children}
            </Main>
        </>
    )
}


