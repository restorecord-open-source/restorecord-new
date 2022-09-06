import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

export default function Footer() {
    return (
        <Container component="footer" maxWidth={false} sx={{ padding: "16px 0px", backgroundColor: "#212121", textAlign: "center", marginTop: "auto" }}>
            {/* <Box component="footer"> */}
            <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} <Link href="https://restorecord.com/"><MuiLink variant="body2" href="https://restorecord.com/">RestoreCord</MuiLink></Link>. All rights reserved.
            </Typography>
            {/* </Box> */}
        </Container>
    )
}