import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Error404() {
    return (
        <>
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ textAlign: "center" }}>
                <Stack spacing={2} sx={{ width: "50%" }}>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: "bold" }}>404</Typography>
                    <Typography variant="h4" component="h4" >Not Found</Typography>
                    <Button variant="contained" onClick={() => { window.location.href = "/"; }}>Go Back to Homepage</Button>
                </Stack>
            </Box>
        </>
    )
}