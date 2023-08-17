import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../src/token";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import theme from "../../src/theme";
import SubscriptionList from "../../src/SubscriptionList";

import MuiLink from "next/link";
import axios from "axios";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import AlertTitle from "@mui/material/AlertTitle";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Badge from "@mui/material/Badge";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";

function CustomTabPanel(props: any) {
    const { children, value, index, ...other } = props;
  
    return (
        <div role="tabpanel" hidden={value !== index} id={`custom-tabpanel-${index}`} aria-labelledby={`custom-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Upgrade() {
    const [token]: any = useToken();
    const router = useRouter();
    const alertRef: any = useRef();

    const [upgradeWindow, setUpgradeWindow] = useState(false);
    const [downgradeWindow, setDowngradeWindow] = useState(false);
    const [purchaseWindow, setPurchaseWindow] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [selectedPlan, setSelectedPlan] = useState({
        id: "",
        name: "",
        price: 0,
        priceMonthly: 0,
    });

    const [subTab, setSubTab] = useState(0);

    const { data: user, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    const { data: payments, isError: paymentsIsError, isLoading: paymentsIsLoading } = useQuery("payments", async () => await axios.get("/api/v2/self/payments", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
        },
    }).then((res) => res.data), { retry: false, refetchOnWindowFocus: false });

    if (isLoading || paymentsIsLoading) {
        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (isError || paymentsIsError) {
        return <div>Error</div>
    }

    if (!user || !user.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    function handleRadioChange(event: any) {
        setSelectedPlan({
            ...selectedPlan,
            id: event.target.value,
            // name: event.target.name,
        });
    }

    function renderBillingCycleSelect(trial?: boolean | undefined | null) {
        return (
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ color: theme.palette.primary.main, fontWeight: "bold", mb: 1 }}>Billing Cycle</FormLabel>
                <RadioGroup aria-label="plan" name="plan" value={selectedPlan} onChange={handleRadioChange}>
                    <Stack direction="column" spacing={0} sx={{ textAlign: "center", textTransform: "none", mb: 1 }}>
                        <FormControlLabel value={selectedPlan.id.split("_")[0]} checked={selectedPlan.id.split("_")[1] !== "monthly"} control={<Radio />} label={
                            <Badge badgeContent={<>Save {trial ? "100" : Math.round(((selectedPlan.priceMonthly - (selectedPlan.price / 12)) / selectedPlan.priceMonthly) * 100)}%</>} color="primary" sx={{ [`& .MuiBadge-badge`]: { color: "#fff", fontSize: "0.85rem", fontWeight: "bold", padding: "0.95rem", mt: "1.20rem", mr: "-3.5rem" } }}>
                                <Typography variant="h6" color="white" sx={{ fontWeight: "500" }}>Yearly (${trial ? 0 : selectedPlan.price / 12}/mo)</Typography>
                            </Badge>
                        } />
                        <FormControlLabel value={`${selectedPlan.id.split("_")[0]}_monthly`} checked={selectedPlan.id.split("_")[1] === "monthly"} control={<Radio />} label={
                            <Typography variant="h6" color="white" sx={{ fontWeight: "500" }}>Monthly (${trial ? 0 : selectedPlan.priceMonthly}/mo)</Typography>
                        } />
                    </Stack>
                </RadioGroup>
            </FormControl>
        )
    }

    function renderPaymentWindow() {
        return (
            <Dialog open={purchaseWindow} onClose={() => setPurchaseWindow(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                {/* window to select if Stripe, Coinbase or Paypal */}
                <DialogTitle id="alert-dialog-title">
                    <Typography variant="h6" sx={{ fontWeight: "500" }}>
                        Select a payment method
                    </Typography>
                    <IconButton aria-label="close" onClick={() => setPurchaseWindow(false)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {/* error alert if request fails */}
                    <Alert ref={alertRef} severity="error" sx={{ display: "none" }}></Alert>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button variant="contained" fullWidth sx={{ height: "100%", borderRadius: "1rem", border: `1px solid ${theme.palette.primary.main}`, backgroundColor: paymentMethod === "coinbase" ? theme.palette.primary.main : theme.palette.background.paper }}  onClick={() => setPaymentMethod("coinbase")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" style={{ height: "2rem", marginRight: "0.5rem" }}>
                                    <path fill="#0052FF" d="M512,0L512,0c282.8,0,512,229.2,512,512l0,0c0,282.8-229.2,512-512,512l0,0C229.2,1024,0,794.8,0,512l0,0  C0,229.2,229.2,0,512,0z"></path><path fill="#FFFFFF" d="M512.1,692c-99.4,0-180-80.5-180-180s80.6-180,180-180c89.1,0,163.1,65,177.3,150h181.3  c-15.3-184.8-170-330-358.7-330c-198.8,0-360,161.2-360,360s161.2,360,360,360c188.7,0,343.4-145.2,358.7-330H689.3  C675,627,601.2,692,512.1,692z"></path>
                                </svg>
                                <Stack direction="column" spacing={0} sx={{ textAlign: "left", textTransform: "none" }}>
                                    <Typography variant="h6" color="white" sx={{ fontWeight: "500" }}>Coinbase</Typography>
                                    <Typography variant="body2" color="text.secondary">Bitcoin, Litecoin, Ethereum, USDT, USDC, BCH</Typography>
                                </Stack>
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" fullWidth sx={{ height: "100%", borderRadius: "1rem", border: `1px solid ${theme.palette.primary.main}`, backgroundColor: paymentMethod === "stripe" ? theme.palette.primary.main : theme.palette.background.paper }}  onClick={() => setPaymentMethod("stripe")}>
                                <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style={{ height: "2rem", marginRight: "0.5rem" }}>
                                    <path fill="#FFFFFF" d="M165 144.7l-43.3 9.2-.2 142.4c0 26.3 19.8 43.3 46.1 43.3 14.6 0 25.3-2.7 31.2-5.9v-33.8c-5.7 2.3-33.7 10.5-33.7-15.7V221h33.7v-37.8h-33.7zm89.1 51.6l-2.7-13.1H213v153.2h44.3V233.3c10.5-13.8 28.2-11.1 33.9-9.3v-40.8c-6-2.1-26.7-6-37.1 13.1zm92.3-72.3l-44.6 9.5v36.2l44.6-9.5zM44.9 228.3c0-6.9 5.8-9.6 15.1-9.7 13.5 0 30.7 4.1 44.2 11.4v-41.8c-14.7-5.8-29.4-8.1-44.1-8.1-36 0-60 18.8-60 50.2 0 49.2 67.5 41.2 67.5 62.4 0 8.2-7.1 10.9-17 10.9-14.7 0-33.7-6.1-48.6-14.2v40c16.5 7.1 33.2 10.1 48.5 10.1 36.9 0 62.3-15.8 62.3-47.8 0-52.9-67.9-43.4-67.9-63.4zM640 261.6c0-45.5-22-81.4-64.2-81.4s-67.9 35.9-67.9 81.1c0 53.5 30.3 78.2 73.5 78.2 21.2 0 37.1-4.8 49.2-11.5v-33.4c-12.1 6.1-26 9.8-43.6 9.8-17.3 0-32.5-6.1-34.5-26.9h86.9c.2-2.3.6-11.6.6-15.9zm-87.9-16.8c0-20 12.3-28.4 23.4-28.4 10.9 0 22.5 8.4 22.5 28.4zm-112.9-64.6c-17.4 0-28.6 8.2-34.8 13.9l-2.3-11H363v204.8l44.4-9.4.1-50.2c6.4 4.7 15.9 11.2 31.4 11.2 31.8 0 60.8-23.2 60.8-79.6.1-51.6-29.3-79.7-60.5-79.7zm-10.6 122.5c-10.4 0-16.6-3.8-20.9-8.4l-.3-66c4.6-5.1 11-8.8 21.2-8.8 16.2 0 27.4 18.2 27.4 41.4.1 23.9-10.9 41.8-27.4 41.8zm-126.7 33.7h44.6V183.2h-44.6z"></path>
                                </svg>
                                <Stack direction="column" spacing={0} sx={{ textAlign: "left", textTransform: "none" }}>
                                    <Typography variant="h6" color="white" sx={{ fontWeight: "500" }}>Stripe</Typography>
                                    <Typography variant="body2" color="text.secondary">Debit/Credit Card, Apple & Google Pay</Typography>
                                </Stack>
                            </Button>
                        </Grid>
                        {/* <Grid item xs={12}>
                            <Button variant="contained" fullWidth sx={{ height: "100%", borderRadius: "1rem", border: `1px solid ${theme.palette.primary.main}`,  backgroundColor: paymentMethod === "paypal" ? theme.palette.primary.main : theme.palette.background.paper }} onClick={() => setPaymentMethod("paypal")}>
                                <svg id="icon-logo-paypal" x="0px" y="0px" viewBox="0 0 28 32" style={{ height: "2rem", marginRight: "0.5rem" }}>
                                    <path fill="#253B80" d="M7.266,29.154l0.523-3.322l-1.165-0.027H1.061L4.927,1.292C4.939,1.218,4.978,1.149,5.035,1.1 c0.057-0.049,0.13-0.076,0.206-0.076h9.38c3.114,0,5.263,0.648,6.385,1.927c0.526,0.6,0.861,1.227,1.023,1.917 c0.17,0.724,0.173,1.589,0.007,2.644l-0.012,0.077v0.676l0.526,0.298c0.443,0.235,0.795,0.504,1.065,0.812 c0.45,0.513,0.741,1.165,0.864,1.938c0.127,0.795,0.085,1.741-0.123,2.812c-0.24,1.232-0.628,2.305-1.152,3.183 c-0.482,0.809-1.096,1.48-1.825,2c-0.696,0.494-1.523,0.869-2.458,1.109c-0.906,0.236-1.939,0.355-3.072,0.355h-0.73 c-0.522,0-1.029,0.188-1.427,0.525c-0.399,0.344-0.663,0.814-0.744,1.328l-0.055,0.299l-0.924,5.855l-0.042,0.215 c-0.011,0.068-0.03,0.102-0.058,0.125c-0.025,0.021-0.061,0.035-0.096,0.035H7.266z"></path>
                                    <path fill="#179BD7" d="M23.048,7.667L23.048,7.667L23.048,7.667c-0.028,0.179-0.06,0.362-0.096,0.55 c-1.237,6.351-5.469,8.545-10.874,8.545H9.326c-0.661,0-1.218,0.48-1.321,1.132l0,0l0,0L6.596,26.83l-0.399,2.533 c-0.067,0.428,0.263,0.814,0.695,0.814h4.881c0.578,0,1.069-0.42,1.16-0.99l0.048-0.248l0.919-5.832l0.059-0.32 c0.09-0.572,0.582-0.992,1.16-0.992h0.73c4.729,0,8.431-1.92,9.513-7.476c0.452-2.321,0.218-4.259-0.978-5.622 C24.022,8.286,23.573,7.945,23.048,7.667z"></path>
                                    <path fill="#222D65" d="M21.754,7.151c-0.189-0.055-0.384-0.105-0.584-0.15c-0.201-0.044-0.407-0.083-0.619-0.117 c-0.742-0.12-1.555-0.177-2.426-0.177h-7.352c-0.181,0-0.353,0.041-0.507,0.115C9.927,6.985,9.675,7.306,9.614,7.699L8.05,17.605 l-0.045,0.289c0.103-0.652,0.66-1.132,1.321-1.132h2.752c5.405,0,9.637-2.195,10.874-8.545c0.037-0.188,0.068-0.371,0.096-0.55 c-0.313-0.166-0.652-0.308-1.017-0.429C21.941,7.208,21.848,7.179,21.754,7.151z"></path>
                                    <path fill="#253B80" d="M9.614,7.699c0.061-0.393,0.313-0.714,0.652-0.876c0.155-0.074,0.326-0.115,0.507-0.115h7.352 c0.871,0,1.684,0.057,2.426,0.177c0.212,0.034,0.418,0.073,0.619,0.117c0.2,0.045,0.395,0.095,0.584,0.15 c0.094,0.028,0.187,0.057,0.278,0.086c0.365,0.121,0.704,0.264,1.017,0.429c0.368-2.347-0.003-3.945-1.272-5.392 C20.378,0.682,17.853,0,14.622,0h-9.38c-0.66,0-1.223,0.48-1.325,1.133L0.01,25.898c-0.077,0.49,0.301,0.932,0.795,0.932h5.791 l1.454-9.225L9.614,7.699z"></path>
                                </svg>
                                <Stack direction="column" spacing={0} sx={{ textAlign: "left", textTransform: "none" }}>
                                    <Typography variant="h6" color="white" sx={{ fontWeight: "500" }}>Paypal</Typography>
                                    <Typography variant="body2" color="text.secondary">PayPal Balance, Bank Account, Credit Card</Typography>
                                </Stack>
                            </Button>
                        </Grid> */}
                    </Grid>

                    {(paymentMethod === "coinbase") && (
                        <>
                            <Grid container sx={{ mt: 2, mb: 2 }}>
                                {payments.payments.length === 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        <AlertTitle>Warning</AlertTitle>
                                        Crypto Payments do not support the 7 day free trial. If you want to use the 7 day free trial, please select Stripe as your payment method.
                                    </Alert>
                                )}

                                {renderBillingCycleSelect()}

                                <Button variant="contained" color="primary" fullWidth onClick={() => {
                                    axios.post("/api/coinbase/checkout", {
                                        plan: selectedPlan.id,
                                        id: user.id,
                                    }, {
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                    }).then((res) => {
                                        document.location.href = res.data.redirect;
                                    }).catch((err) => {
                                        console.error(err);
                                    });
                                }}>Go to checkout</Button>
                            </Grid>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontSize: "0.75rem", mt: 1 }}>
                                As soon as you pay you agree to our <MuiLink href="/terms">Terms of Service</MuiLink>, <MuiLink href="/privacy">Privacy Policy</MuiLink> and <MuiLink href="/refund-policy">Refund Policy</MuiLink>.
                            </Typography>
                        </>
                    )}
                                
                    {(paymentMethod === "stripe") && (
                        <>
                            <Grid container sx={{ mt: 2, mb: 2 }}>
                                {renderBillingCycleSelect(payments.payments.length === 0)}

                                <Button variant="contained" color="primary" fullWidth onClick={() => {
                                    axios.post("/api/stripe/checkout", {
                                        plan: selectedPlan.id,
                                        id: user.id,
                                    }, {
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                    }).then((res) => {
                                        document.location.href = res.data.redirect;
                                    }).catch((err) => {
                                        console.error(err);
                                    });
                                }}>Go to checkout</Button>
                            </Grid>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontSize: "0.75rem", mt: 1 }}>
                                As soon as you subscribe you agree to our <MuiLink href="/terms">Terms of Service</MuiLink>, <MuiLink href="/privacy">Privacy Policy</MuiLink> and <MuiLink href="/refund-policy">Refund Policy</MuiLink>. <br/>Your card will be charged ${selectedPlan.id.split("_")[1] === "monthly" ? selectedPlan.priceMonthly : selectedPlan.price} every {selectedPlan.id.split("_")[1] === "monthly" ? "month" : "year"} {payments.payments.length === 0 && "after the 7 day free trial."}
                            </Typography>
                        </>
                    )}

                    {/* {(paymentMethod === "paypal") && (
                        <Typography variant="body1" sx={{ mt: 2, fontWeight: "300", whiteSpace: "pre-line", breakWord: "break-word" }}>
                            To proceed with your payment using PayPal, please contact us via Discord by messaging <b>xenos#0001</b> or <b>Bl4ckBl1zZ#5652</b> or via Telegram at <MuiLink href="https://t.me/xenos1337">https://t.me/xenos1337</MuiLink> or <MuiLink href="https://t.me/Bl4ckBl1zZ">https://t.me/Bl4ckBl1zZ</MuiLink>.
                            <br/>Kindly provide us with your <b>username</b> and <b>email address</b> for verification purposes. Once we have confirmed your payment, we will provide you with access to the selected plan.
                            <br/><br/>Thank you for your support!
                        </Typography>
                    )} */}

                    <Typography variant="body2" color="text.primary" sx={{ textAlign: "center", fontSize: "0.75rem", mt: 1 }}>
                        <b>Coinbase and Stripe accounts are not required to purchase.</b>
                    </Typography>
                </DialogContent>
            </Dialog>
        )
    }

    function renderUpgradeWindow() {
        return (
            <Dialog open={upgradeWindow} onClose={() => setUpgradeWindow(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    <Typography variant="h6" sx={{ fontWeight: "700" }}>
                        Upgrade
                    </Typography>

                    <IconButton aria-label="close" onClick={() => setUpgradeWindow(false)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Alert ref={alertRef} severity="error" sx={{ display: "none" }}>
                        <AlertTitle>Error</AlertTitle>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left", fontSize: "0.75rem", mt: 1 }}></Typography>
                    </Alert>

                    {/* show a table with the upcharge if he upgrades */}
                    <Typography component="h6" variant="body1" sx={{ fontWeight: "400", wordWrap: "break-word", whiteSpace: "pre-line" }}>
                        You are currently on the <b>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</b> plan.<br/>
                        Upgrading to the <b>{selectedPlan.name}</b> plan will cost you <b>${Number(selectedPlan.price) - Number(SubscriptionList.find((plan: any) => plan.name.toLowerCase() === user.role.toLowerCase())?.priceYearly ?? 0)}</b> more.
                        This currently only works if you have paid via Stripe.
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
                        {renderBillingCycleSelect()}
                        <Button variant="contained" color="primary" fullWidth onClick={() => {
                            axios.post("/api/stripe/update", {
                                plan: selectedPlan.id,
                            }, {
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                },
                            }).then((res) => {
                                alertRef.current.style.display = "none";

                                document.location.href = res.data.redirect;
                            }).catch((err) => {
                                alertRef.current.style.display = "flex";
                                alertRef.current.children[1].innerHTML = err.response.data.message;
                                
                                console.error(err);
                            });
                        }}>Go to checkout</Button>
                    </Grid>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontSize: "0.75rem", mt: 1 }}>
                        As soon as you subscribe you agree to our <MuiLink href="/terms">Terms of Service</MuiLink>, <MuiLink href="/privacy">Privacy Policy</MuiLink> and <MuiLink href="/refund-policy">Refund Policy</MuiLink>. <br/>Your card will be charged ${selectedPlan.id.split("_")[1] === "monthly" ? selectedPlan.priceMonthly : selectedPlan.price} every {selectedPlan.id.split("_")[1] === "monthly" ? "month" : "year"}.
                    </Typography>
                </DialogContent>
            </Dialog>
        )
    }

    function renderDowngradeWindow() {
        return (
            <Dialog open={downgradeWindow} onClose={() => setDowngradeWindow(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    <Typography variant="h6" sx={{ fontWeight: "700" }}>
                        Downgrade
                    </Typography>

                    <IconButton aria-label="close" onClick={() => setDowngradeWindow(false)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Alert ref={alertRef} severity="error" sx={{ display: "none" }}>
                        <AlertTitle>Error</AlertTitle>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left", fontSize: "0.75rem", mt: 1 }}></Typography>
                    </Alert>

                    {/* show a table with the upcharge if he upgrades */}
                    <Typography component="h6" variant="body1" sx={{ fontWeight: "400", wordWrap: "break-word", whiteSpace: "pre-line" }}>
                        You are currently on the <b>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</b> plan.<br/>
                        Downgrading to the <b>{selectedPlan.name}</b> plan will remove all features from <b>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</b> and will cost you <b>${Number(SubscriptionList.find((plan: any) => plan.name.toLowerCase() === user.role.toLowerCase())?.priceYearly ?? 0) - Number(selectedPlan.price)}</b> less.<br/>
                        This currently only works if you have paid via Stripe.
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
                        {renderBillingCycleSelect()}
                        <Button variant="contained" color="primary" fullWidth onClick={() => {
                            axios.post("/api/stripe/update", {
                                plan: selectedPlan.id,
                            }, {
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                },
                            }).then((res) => {
                                alertRef.current.style.display = "none";

                                document.location.href = res.data.redirect;
                            }).catch((err) => {
                                alertRef.current.style.display = "flex";
                                alertRef.current.children[1].innerHTML = err.response.data.message;
                                
                                console.error(err);
                            });
                        }}>Go to checkout</Button>
                    </Grid>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontSize: "0.75rem", mt: 1 }}>
                        As soon as you subscribe you agree to our <MuiLink href="/terms">Terms of Service</MuiLink>, <MuiLink href="/privacy">Privacy Policy</MuiLink> and <MuiLink href="/refund-policy">Refund Policy</MuiLink>. <br/>Your card will be charged ${selectedPlan.id.split("_")[1] === "monthly" ? selectedPlan.priceMonthly : selectedPlan.price} every {selectedPlan.id.split("_")[1] === "monthly" ? "month" : "year"}.
                    </Typography>
                </DialogContent>
            </Dialog>
        )
    }

    function renderSubscriptionStatus() {
        return (
            <>
                <Typography component="h6" variant="h6" sx={{ fontWeight: "400" }}>
                    Your current plan is <b>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</b>{payments.payments.length > 0 && payments.payments[payments.payments.length - 1].status === "trialing" && <Badge badgeContent="Trial" color="warning" sx={{ ml: 2.5, mb: 0.25 }} />}. 
                </Typography>
                <Typography component="h6" variant="h6" sx={{ fontWeight: "400" }}>
                    Expires on <b>{new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "long", day: "2-digit" }).format(new Date(user.expiry))}</b>.
                </Typography>
                {/* <Typography component="span" variant="body2" sx={{ display: "block", mb: 2, }}>
                    Click <MuiLink href="https://billing.stripe.com/p/login/eVa4jz31t0dHgsUfYY">here</MuiLink> to manage and cancel your subscription. <small>(If paid via Stripe)</small>
                </Typography> */}

                {/* if current user.role is not free and last payment is active or trialing, show Manage button */}
                {(user.role !== "free" && payments.payments.length > 0 && (payments.payments[payments.payments.length - 1].status === "active" || payments.payments[payments.payments.length - 1].status === "trialing")) && (
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => {
                        axios.get("/api/stripe/portal", {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                            },
                        }).then((res) => {
                            document.location.href = res.data.redirect;
                        }).catch((err) => {
                            console.error(err);
                        });
                    }}>Manage</Button>
                )}
            </>
        )
    }

    function renderSuccessfulPayment() {
        if (typeof window !== "undefined") window.history.replaceState({}, document.title, window.location.pathname);
        
        return (
            <Alert severity="success" sx={{ mb: 2 }}>
                <AlertTitle>Success</AlertTitle>
                Your Payment has been processed successfully, your plan will be updated in a few minutes.
                <Typography component="small" variant="body2" sx={{ display: "block", mt: 1 }}>
                    If your plan is not updated in a few minutes, please contact us at <MuiLink href="mailto:support@restorecord.com">support@restorecord.com</MuiLink>.
                </Typography>
            </Alert>
        )
    }

    function renderPendingPayment() {
        if (typeof window !== "undefined") window.history.replaceState({}, document.title, window.location.pathname);
        
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Payment Pending</AlertTitle>
                Your Payment is pending, your plan will be updated as soon as your transaction reaches 1 on-chain confirmation.
                <br/>This process may vary depending on the network, but usually takes 5-30 minutes.
                <Typography component="small" variant="body2" sx={{ display: "block", mt: 1 }}>
                    If your plan is not updated in a few minutes, please contact us at <MuiLink href="mailto:support@restorecord.com">support@restorecord.com</MuiLink>.
                </Typography>
            </Alert>
        )
    }

    function renderSubscriptionList() {
        return (
            <Grid container spacing={2} alignItems="flex-end">
                {SubscriptionList.map((tier: any, index: any) => (
                    <Grid item key={tier.name} xs={12} md={4}>
                        <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 32, color: theme.palette.text.primary, textAlign: "center", marginTop: 2 }}>{tier.name}</Typography>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                    <Typography component="h2" variant="h3" color="text.primary" sx={{ fontWeight: "600" }}>
                                        ${tier.priceMonthly}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "600" }}>
                                        /monthly <Typography variant="body2" color="grey.700" sx={{ fontWeight: "500", alignItems: "center", display: "flex", mb: 1 }}>${tier.priceYearly} billed annually</Typography>
                                    </Typography>
                                </Box>
                                {tier.features.map((feature: any) => (
                                    <Typography variant="subtitle1" align="left" key={feature.name} sx={{ fontWeight: "400", alignItems: "center", display: "flex", mb: 1 }}>
                                        {feature.icon} {feature.value}
                                    </Typography>
                                ))}
                            </CardContent>
                            <CardActions>
                                <Button fullWidth variant="contained" sx={{ fontWeight: "600" }} disabled={((tier.name.toLowerCase() === user.role && tier.name.toLowerCase() !== "free") ? true : false) || (payments.payments.length > 0 && payments.payments[payments.payments.length - 1].status === "trialing" && user.role !== "free")} onClick={() => {
                                    setSelectedPlan({
                                        id: tier.name.toLowerCase(),
                                        name: tier.name,
                                        price: Number(tier.priceYearly) as number,
                                        priceMonthly: Number(tier.priceMonthly) as number,
                                    });

                                    // show downgrade, upgrade or purchase window
                                    if (tier.id > SubscriptionList.findIndex((plan: any) => plan.name.toLowerCase() === user.role.toLowerCase()) && payments.payments.length > 0 && user.role !== "free") {
                                        setUpgradeWindow(true);
                                    } else if (tier.id < SubscriptionList.findIndex((plan: any) => plan.name.toLowerCase() === user.role.toLowerCase())) {
                                        setDowngradeWindow(true);
                                    } else {
                                        setPurchaseWindow(true);
                                    }
                                }}>
                                    {/* show "Current Plan" if tier.name matches user.role, show "Upgrade" if tier.id (number) is higher than user.role (tier.name) and payments.payments is not empty, show "Downgrade" if tier.id (number) is lower than user.role, if "payments.payments" is empty then show "Try 7 days for free" instead of "Upgrade" */}
                                    {(tier.name.toLowerCase() === user.role) ? "Current Plan" : (tier.id > SubscriptionList.findIndex((plan: any) => plan.name.toLowerCase() === user.role.toLowerCase()) && payments.payments.length > 0) ? "Upgrade" : (tier.id < SubscriptionList.findIndex((plan: any) => plan.name.toLowerCase() === user.role.toLowerCase())) ? "Downgrade" : "Try 7 days for free"}
                                </Button>
                            </CardActions>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        )
    }

    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={user}>
                <Toolbar />
                <Container maxWidth="xl">
                    {user.role !== "free" &&
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Current Subscription
                                </Typography>

                                <Tabs value={subTab} onChange={(e, newValue) => setSubTab(newValue)} aria-label="basic tabs example" sx={{ mb: 2 }}>
                                    <Tab label="Subscription" id="sub-tabs-0" aria-controls="basic-tabs-0" />
                                    <Tab label="Payment History" id="sub-tabs-1" aria-controls="basic-tabs-1" />
                                </Tabs>

                                <CustomTabPanel value={subTab} index={0}>
                                    {renderSubscriptionStatus()}
                                </CustomTabPanel>
                                <CustomTabPanel value={subTab} index={1}>
                                    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: "none", border: `1px solid ${theme.palette.grey[800]}` }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Payment ID</TableCell>
                                                    <TableCell>Amount</TableCell>
                                                    <TableCell>Plan</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {payments.payments.map((payment: any) => (
                                                    <TableRow key={payment.id} sx={{ "&:last-child td, &:last-child th": { borderBottom: 0 } }}>
                                                        <TableCell component="th" scope="row" sx={{ borderLeft: `3px solid ${payment.status === "active" ? theme.palette.success.main : payment.status === "cancelled" ? theme.palette.error.main : payment.status === "trialing" ? theme.palette.warning.main : theme.palette.grey[800]}`, paddingLeft: "0.5rem" }}>{payment.id}</TableCell>
                                                        <TableCell>${Math.round(payment.amount / 100).toFixed(2)}</TableCell>
                                                        <TableCell>{payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}</TableCell>
                                                        <TableCell>{payment.status === "active" ? "PAID" : payment.status === "cancelled" ? "CANCELLED" : payment.status === "trialing" ? "TRIAL" : payment.status}</TableCell>
                                                        <TableCell>{new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "long", day: "2-digit" }).format(new Date(payment.createdAt))}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    
                                </CustomTabPanel>
                            </CardContent>
                        </Paper>
                    }
                   
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                        <CardContent sx={{ pb: "1rem !important" }}>
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                Upgrade
                            </Typography>

                            {(router.query.s === "1") ? renderSuccessfulPayment() : null}
                            {(router.query.s === "2") ? renderPendingPayment() : null}
                            {purchaseWindow ? renderPaymentWindow() : null}
                            {upgradeWindow ? renderUpgradeWindow() : null}
                            {downgradeWindow ? renderDowngradeWindow() : null}
                        
                            {renderSubscriptionList()}
                        
                        </CardContent>
                    </Paper>

                    

                </Container>
            </NavBar>
        </Box>
    )
}

