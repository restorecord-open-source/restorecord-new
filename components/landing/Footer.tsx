import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export default function Footer() {
    return (
        <Container component="footer" maxWidth={false} sx={{ padding: "16px 0", px: { xs: 3, sm: 24, md: 32 }, backgroundColor: "#212121", paddingTop: 2, paddingBottom: 5, marginTop: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" } , flexWrap: "wrap" }}>
                
                <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", justifyContent: "center", flexWrap: "wrap", marginBottom: "auto", maxWidth: "30%" }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "bold" }}>Restorecord</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: "break-all" }}>RestoreCord is a Discord Recovery Service, that allows you to restore your Discord Guild after being nuked, raided, or otherwise lost.</Typography>
                </Box>

                <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexWrap: "wrap", marginBottom: "auto" }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "bold" }}>Social</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: "break-all" }}>
                        <Link href="https://twitter.com/restorecord"><MuiLink variant="body2" href="https://twitter.com/restorecord">Twitter</MuiLink></Link>
                        <br />
                        <Link href="https://youtube.com/channel/UCdO4LjbTjSJWxP9VQg7ZNXw"><MuiLink variant="body2" href="https://youtube.com/channel/UCdO4LjbTjSJWxP9VQg7ZNXw">YouTube</MuiLink></Link>
                        <br />
                        <Link href="https://github.com/restorecord"><MuiLink variant="body2" href="https://github.com/restorecord">GitHub</MuiLink></Link>
                    </Typography>
                </Box>

                <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexWrap: "wrap", marginBottom: "auto" }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "bold" }}>Resources</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: "break-all" }}>
                        <Link href="https://community.restorecord.com"><MuiLink variant="body2" href="https://community.restorecord.com">Support</MuiLink></Link>
                        <br />
                        <Link href="https://docs.restorecord.com"><MuiLink variant="body2" href="https://docs.restorecord.com">Documentation</MuiLink></Link>
                    </Typography>
                </Box>

                <Box style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexWrap: "wrap", marginBottom: "auto" }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "bold" }}>Legal</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: "break-all" }}>
                        <Link href="/privacy"><MuiLink variant="body2" href="/privacy">Privacy Policy</MuiLink></Link>
                        <br />
                        <Link href="/terms"><MuiLink variant="body2" href="/terms">Terms of Service</MuiLink></Link>
                    </Typography>
                </Box>

            </Box>
        </Container>
    )
}