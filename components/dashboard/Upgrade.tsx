import { useRouter } from "next/router";
import { useToken } from "../../src/token";

import SubscriptionList from "../../src/SubscriptionList";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

export default function DashUpgrade({ user }: any) {
    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Upgrade
                        </Typography>

                        <Typography component="h6" variant="h6" sx={{ mb: 2, fontWeight: "400" }}>
                            Your current plan is <b>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</b>.
                        </Typography>
                        
                        <Grid container spacing={2} alignItems="flex-end">
                            {SubscriptionList.map((tier) => (
                                <Grid item key={tier.name} xs={12} md={4}>
                                    <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                        <CardHeader title={tier.name} titleTypographyProps={{ align: "center" }} subheaderTypographyProps={{ align: "center", }} sx={{ bgColor: "grey.700", }} />
                                        <CardContent>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                                <Typography component="h2" variant="h3" color="text.primary">
                                                    {tier.priceYearly}
                                                </Typography>
                                                <Typography variant="h6" color="text.secondary">
                                                    /yearly
                                                </Typography>
                                            </Box>
                                            {tier.features.map((feature) => (
                                                <Typography variant="subtitle1" align="left" key={feature.name}>
                                                    {feature.icon} {feature.value}
                                                </Typography>
                                            ))}
                                        </CardContent>
                                        <CardActions>
                                            {user.role.toLowerCase() === tier.name.toLowerCase() ? (
                                                <Button fullWidth variant="contained" color="primary" href={`https://shop.restorecord.com/product/${tier.name.toLowerCase()}`}>
                                                    Extend
                                                </Button>
                                            ) : (
                                                <>
                                                    {(tier.priceYearly === "$0") ? (
                                                        <Button fullWidth variant="contained" color="primary" disabled>
                                                            Purchase
                                                        </Button>
                                                    ) : (
                                                        <Button fullWidth variant="contained" color="primary" href={`https://shop.restorecord.com/product/${tier.name.toLowerCase()}${tier.name.toLowerCase() === "premium" ? `?additional-4085c60735770cdb133e54cded7d1960=${user.username}` : `?additional-4085c60735770cdb133e54cded7d1960=${user.username}`}`}>
                                                            Purchase
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </CardActions>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}