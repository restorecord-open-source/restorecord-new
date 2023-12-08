import { cloneElement, useEffect, useState } from "react";
import Link from "next/link";

import CreditCard from "@mui/icons-material/CreditCard";
import Apps from "@mui/icons-material/Apps";
import Help from "@mui/icons-material/Help";
import MenuIcon from "@mui/icons-material/Menu";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ButtonBase from "@mui/material/ButtonBase";
import ListItemText from "@mui/material/ListItemText";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Stack from "@mui/material/Stack";
import MuiLink from "@mui/material/Link";

interface Props {
    window?: () => Window;
    children: React.ReactElement;
}
  
function ElevationScroll(props: Props = { children: <div style={{ backgroundColor: "transparent" }} /> }) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
        target: window ? window() : undefined,
    });
  
    return cloneElement(children, {
        elevation: trigger ? 4 : 0,
    });
}

export default function NavBar() {
    const [button, setButton] = useState({
        text: "Dashboard",
        href: "/dashboard"
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const checkSession = async () => {
        if (localStorage.getItem("token")) {
            const token = localStorage?.getItem("token")?.split(".");
            if (token) {
                const payload = JSON.parse(atob(token[1]));
                if (!payload.id && new Date(payload.exp * 1000) < new Date()) { setButton({ text: "Login", href: "/login" }); }
                else { setButton({ text: "Dashboard", href: "/dashboard" }); }
            } else { setButton({ text: "Login", href: "/login" }); }
        } else { setButton({ text: "Login", href: "/login" }); }
    }

    useEffect(() => {
        checkSession();

        window.addEventListener("storage", async function (e) {
            checkSession();
        });

        try {
            if (localStorage.getItem("token")) {
                checkSession();
            }
        } catch (error) {
            console.error(error);
        }
    }, []);

    return (
        <Box sx={{ marginBottom: "6rem" }}>
            <ElevationScroll>
                <AppBar component="nav" sx={{ backdropFilter: "blur(1rem)", backgroundColor: "transparent", width: "100%", backgroundImage: "none", background: `rgba(15,15,15,0.5)`, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <Container maxWidth="lg">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ display: { xs: "none", md: "block" }, cursor: "pointer", flexGrow: 1 }}>
                                <MuiLink href="/" color="text.primary" sx={{ textDecoration: "none" }}>
                                    RestoreCord
                                </MuiLink>
                            </Typography>
                            <Box sx={{ display: { xs: "flex", md: "none" }, flexGrow: 1 }}>
                                <IconButton id="menu-btn" edge="start" color="inherit" aria-label="menu" aria-controls={open ? "menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined} onClick={handleClick}>
                                    <MenuIcon />
                                </IconButton>
                                <Menu id="menu" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{ "aria-labelledby": "menu-btn" }}>
                                    <MenuItem onClick={handleClose}>
                                        <Link href="/#pricing">
                                            <ButtonBase href="/#pricing">
                                                <ListItemIcon>
                                                    <CreditCard />
                                                </ListItemIcon>
                                                <ListItemText>Pricing</ListItemText>
                                            </ButtonBase>
                                        </Link>
                                    </MenuItem>

                                    <MenuItem onClick={handleClose}>
                                        <ButtonBase href="/discovery">
                                            <ListItemIcon>
                                                <Help />
                                            </ListItemIcon>
                                            <ListItemText>Discovery</ListItemText>
                                        </ButtonBase>
                                    </MenuItem>
                                </Menu>
                            </Box>
                            <Box sx={{ display: { xs: "none", md: "block" }}}>
                                <Stack direction="row" spacing={1}>
                                    <Button href="/#pricing">
                                        Pricing
                                    </Button>
                                    <Button href="/discovery">
                                        Discovery
                                    </Button>
                                </Stack>
                            </Box>
                            <Link href={button.href}>
                                <Button href={button.href} variant="contained" color="primary" sx={{ ml: 1 }}>
                                    {button.text}
                                </Button>
                            </Link>
                        </Toolbar>
                    </Container>
                </AppBar>
            </ElevationScroll>
        </Box>
    )
}