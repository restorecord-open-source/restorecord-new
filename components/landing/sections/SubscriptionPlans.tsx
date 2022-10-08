import SubscriptionList from "../../../src/SubscriptionList";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";

export default function SubscriptionPlansSection() {
    return (
        <>
            <div id="pricing" />

            <Typography variant="h3" component="h2" sx={{ textAlign: "center", marginTop: 24, fontWeight: "semibold" }}>
                Our Plans
            </Typography>
            <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "normal", marginBottom: "2.5rem" }}>
                Ready to get started? Check out our plans below.
            </Typography>

            <Grid container spacing={2} alignItems="flex-end">
                {SubscriptionList.map((tier) => (
                    <Grid item key={tier.name} xs={12} md={4}>
                        <Card sx={{ borderRadius: "8px", px: 0.5, py: 2, transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", background: "rgba(0, 0, 0, 0.5)", border: "0.125rem solid rgba(0, 0, 0, 0.5)", backdropFilter: "blur(1rem)", [`&:hover`]: { border: `0.125rem solid ${tier.name === "Premium" ? "rgb(251, 140, 0)" : "rgb(79, 70, 229)"}` } }}>
                            <CardHeader title={tier.name} titleTypographyProps={{ align: "center" }} subheaderTypographyProps={{ align: "center", }} sx={{ bgColor: "grey.700" }} />
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                    <Typography component="h2" variant="h3" color="text.primary" sx={{ fontWeight: "500" }}>
                                        {tier.priceYearly}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">
                                        /yearly
                                    </Typography>
                                </Box>
                                {tier.features.map((feature) => (
                                    <Typography variant="subtitle1" align="left" key={feature.name} sx={{ fontWeight: "400" }}>
                                        {feature.icon} {feature.value}
                                    </Typography>
                                ))}
                            </CardContent>
                            <CardActions>
                                <Button fullWidth variant={tier.name === "Premium" ? "contained" : "outlined"} sx={{ fontWeight: "600" }}>
                                    {tier.priceYearly === "$0" ? "Sign Up" : "Purchase"}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}