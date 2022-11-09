import { useRef } from "react"
import { useQuery } from "react-query";
import axios from "axios";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

async function getStats() {
    return await axios.get(`/api/v1/stats`, {
        headers: {
            "Cache-Control": "max-age=1800",
        },
        validateStatus: () => true
    })
        .then((res: any) => { return res.data; })
        .catch((err: any) => { return err; });    
}

export default function StatisticsSection() {
    const accountsRef: any = useRef();
    const serversRef: any = useRef();
    const membersRef: any = useRef();

    useQuery('stats', async () => await getStats(), { retry: false, onSuccess(data: any) {
        accountsRef.current.innerText = data.accounts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        serversRef.current.innerText = data.servers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        membersRef.current.innerText = data.members.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, });

    return (
        <>
            <Typography variant="h3" component="h2" sx={{ textAlign: "center", marginTop: 24, fontWeight: "semibold" }} id="statistics">
                Statistics
            </Typography>
            <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "normal", marginBottom: "2.5rem" }}>
                Our statistics are live and update every minute.
            </Typography>
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} md={4}>
                    <Card sx={{ border: "1px solid rgba(255, 255, 255, 0.125)", borderRadius: "8px", background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(0.25rem)" }}>
                        <CardHeader title="Accounts" titleTypographyProps={{ align: "center" }} subheaderTypographyProps={{ align: "center", }} sx={{ bgColor: "grey.700" }} />
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                <Typography component="h2" variant="h3" color="text.primary" ref={accountsRef} sx={{ fontWeight: "500" }}>0</Typography>
                                {/* <Typography variant="h6" color="text.secondary">accounts</Typography> */}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ border: "1px solid rgba(255, 255, 255, 0.125)", borderRadius: "8px", background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(0.25rem)" }}>
                        <CardHeader title="Servers" titleTypographyProps={{ align: "center" }} subheaderTypographyProps={{ align: "center", }} sx={{ bgColor: "grey.700" }} />
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                <Typography component="h2" variant="h3" color="text.primary" ref={serversRef} sx={{ fontWeight: "500" }}>0</Typography>
                                {/* <Typography variant="h6" color="text.secondary">servers</Typography> */}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ border: "1px solid rgba(255, 255, 255, 0.125)", borderRadius: "8px", background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(0.25rem)" }}>
                        <CardHeader title="Members" titleTypographyProps={{ align: "center" }} subheaderTypographyProps={{ align: "center", }} sx={{ bgColor: "grey.700" }} />
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                <Typography component="h2" variant="h3" color="text.primary" ref={membersRef} sx={{ fontWeight: "500" }}>0</Typography>
                                {/* <Typography variant="h6" color="text.secondary">members</Typography> */}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}