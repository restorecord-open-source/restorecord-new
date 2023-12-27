import { useRouter } from "next/router";
import { useInfiniteQuery, useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useEffect, useState } from "react";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";
import getBlacklist from "../../../src/dashboard/getBlacklist";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/lab/Alert";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import HubIcon from "@mui/icons-material/Hub";
import LanguageIcon from "@mui/icons-material/Language";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import theme from "../../../src/theme";

export const countries: { code: string; name: string }[] = [
    { code: "AF", name: "Afghanistan" },
    { code: "AX", name: "Aland Islands" },
    { code: "AL", name: "Albania" },
    { code: "DZ", name: "Algeria" },
    { code: "AS", name: "American Samoa" },
    { code: "AD", name: "Andorra" },
    { code: "AO", name: "Angola" },
    { code: "AI", name: "Anguilla" },
    { code: "AQ", name: "Antarctica" },
    { code: "AG", name: "Antigua and Barbuda" },
    { code: "AR", name: "Argentina" },
    { code: "AM", name: "Armenia" },
    { code: "AW", name: "Aruba" },
    { code: "AU", name: "Australia" },
    { code: "AT", name: "Austria" },
    { code: "AZ", name: "Azerbaijan" },
    { code: "BS", name: "Bahamas" },
    { code: "BH", name: "Bahrain" },
    { code: "BD", name: "Bangladesh" },
    { code: "BB", name: "Barbados" },
    { code: "BY", name: "Belarus" },
    { code: "BE", name: "Belgium" },
    { code: "BZ", name: "Belize" },
    { code: "BJ", name: "Benin" },
    { code: "BM", name: "Bermuda" },
    { code: "BT", name: "Bhutan" },
    { code: "BO", name: "Bolivia" },
    { code: "BQ", name: "Bonaire, Saint Eustatius and Saba" },
    { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BW", name: "Botswana" },
    { code: "BV", name: "Bouvet Island" },
    { code: "BR", name: "Brazil" },
    { code: "IO", name: "British Indian Ocean Territory" },
    { code: "VG", name: "British Virgin Islands" },
    { code: "BN", name: "Brunei" },
    { code: "BG", name: "Bulgaria" },
    { code: "BF", name: "Burkina Faso" },
    { code: "BI", name: "Burundi" },
    { code: "CV", name: "Cabo Verde" },
    { code: "KH", name: "Cambodia" },
    { code: "CM", name: "Cameroon" },
    { code: "CA", name: "Canada" },
    { code: "KY", name: "Cayman Islands" },
    { code: "CF", name: "Central African Republic" },
    { code: "TD", name: "Chad" },
    { code: "CL", name: "Chile" },
    { code: "CN", name: "China" },
    { code: "CX", name: "Christmas Island" },
    { code: "CC", name: "Cocos Islands" },
    { code: "CO", name: "Colombia" },
    { code: "KM", name: "Comoros" },
    { code: "CK", name: "Cook Islands" },
    { code: "CR", name: "Costa Rica" },
    { code: "HR", name: "Croatia" },
    { code: "CU", name: "Cuba" },
    { code: "CW", name: "Curacao" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czechia" },
    { code: "CD", name: "Democratic Republic of the Congo" },
    { code: "DK", name: "Denmark" },
    { code: "DJ", name: "Djibouti" },
    { code: "DM", name: "Dominica" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" },
    { code: "SV", name: "El Salvador" },
    { code: "GQ", name: "Equatorial Guinea" },
    { code: "ER", name: "Eritrea" },
    { code: "EE", name: "Estonia" },
    { code: "SZ", name: "Eswatini" },
    { code: "ET", name: "Ethiopia" },
    { code: "FK", name: "Falkland Islands" },
    { code: "FO", name: "Faroe Islands" },
    { code: "FJ", name: "Fiji" },
    { code: "FI", name: "Finland" },
    { code: "FR", name: "France" },
    { code: "GF", name: "French Guiana" },
    { code: "PF", name: "French Polynesia" },
    { code: "TF", name: "French Southern Territories" },
    { code: "GA", name: "Gabon" },
    { code: "GM", name: "Gambia" },
    { code: "GE", name: "Georgia" },
    { code: "DE", name: "Germany" },
    { code: "GH", name: "Ghana" },
    { code: "GI", name: "Gibraltar" },
    { code: "GR", name: "Greece" },
    { code: "GL", name: "Greenland" },
    { code: "GD", name: "Grenada" },
    { code: "GP", name: "Guadeloupe" },
    { code: "GU", name: "Guam" },
    { code: "GT", name: "Guatemala" },
    { code: "GG", name: "Guernsey" },
    { code: "GN", name: "Guinea" },
    { code: "GW", name: "Guinea-Bissau" },
    { code: "GY", name: "Guyana" },
    { code: "HT", name: "Haiti" },
    { code: "HM", name: "Heard Island and McDonald Islands" },
    { code: "HN", name: "Honduras" },
    { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" },
    { code: "IS", name: "Iceland" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "IR", name: "Iran" },
    { code: "IQ", name: "Iraq" },
    { code: "IE", name: "Ireland" },
    { code: "IM", name: "Isle of Man" },
    { code: "IL", name: "Israel" },
    { code: "IT", name: "Italy" },
    { code: "CI", name: "Ivory Coast" },
    { code: "JM", name: "Jamaica" },
    { code: "JP", name: "Japan" },
    { code: "JE", name: "Jersey" },
    { code: "JO", name: "Jordan" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "KE", name: "Kenya" },
    { code: "KI", name: "Kiribati" },
    { code: "KW", name: "Kuwait" },
    { code: "KG", name: "Kyrgyzstan" },
    { code: "LA", name: "Laos" },
    { code: "LV", name: "Latvia" },
    { code: "LB", name: "Lebanon" },
    { code: "LS", name: "Lesotho" },
    { code: "LR", name: "Liberia" },
    { code: "LY", name: "Libya" },
    { code: "LI", name: "Liechtenstein" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "MO", name: "Macao" },
    { code: "MG", name: "Madagascar" },
    { code: "MW", name: "Malawi" },
    { code: "MY", name: "Malaysia" },
    { code: "MV", name: "Maldives" },
    { code: "ML", name: "Mali" },
    { code: "MT", name: "Malta" },
    { code: "MH", name: "Marshall Islands" },
    { code: "MQ", name: "Martinique" },
    { code: "MR", name: "Mauritania" },
    { code: "MU", name: "Mauritius" },
    { code: "YT", name: "Mayotte" },
    { code: "MX", name: "Mexico" },
    { code: "FM", name: "Micronesia" },
    { code: "MD", name: "Moldova" },
    { code: "MC", name: "Monaco" },
    { code: "MN", name: "Mongolia" },
    { code: "ME", name: "Montenegro" },
    { code: "MS", name: "Montserrat" },
    { code: "MA", name: "Morocco" },
    { code: "MZ", name: "Mozambique" },
    { code: "MM", name: "Myanmar" },
    { code: "NA", name: "Namibia" },
    { code: "NR", name: "Nauru" },
    { code: "NP", name: "Nepal" },
    { code: "NC", name: "New Caledonia" },
    { code: "NZ", name: "New Zealand" },
    { code: "NI", name: "Nicaragua" },
    { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigeria" },
    { code: "NU", name: "Niue" },
    { code: "NF", name: "Norfolk Island" },
    { code: "KP", name: "North Korea" },
    { code: "MK", name: "North Macedonia" },
    { code: "MP", name: "Northern Mariana Islands" },
    { code: "NO", name: "Norway" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PW", name: "Palau" },
    { code: "PS", name: "Palestinian Territory" },
    { code: "PA", name: "Panama" },
    { code: "PG", name: "Papua New Guinea" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PN", name: "Pitcairn" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "PR", name: "Puerto Rico" },
    { code: "QA", name: "Qatar" },
    { code: "CG", name: "Republic of the Congo" },
    { code: "RE", name: "Reunion" },
    { code: "RO", name: "Romania" },
    { code: "RU", name: "Russia" },
    { code: "RW", name: "Rwanda" },
    { code: "BL", name: "Saint Barthelemy" },
    { code: "SH", name: "Saint Helena" },
    { code: "KN", name: "Saint Kitts and Nevis" },
    { code: "LC", name: "Saint Lucia" },
    { code: "MF", name: "Saint Martin" },
    { code: "PM", name: "Saint Pierre and Miquelon" },
    { code: "VC", name: "Saint Vincent and the Grenadines" },
    { code: "WS", name: "Samoa" },
    { code: "SM", name: "San Marino" },
    { code: "ST", name: "Sao Tome and Principe" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SN", name: "Senegal" },
    { code: "RS", name: "Serbia" },
    { code: "SC", name: "Seychelles" },
    { code: "SL", name: "Sierra Leone" },
    { code: "SG", name: "Singapore" },
    { code: "SX", name: "Sint Maarten" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "SB", name: "Solomon Islands" },
    { code: "SO", name: "Somalia" },
    { code: "ZA", name: "South Africa" },
    { code: "GS", name: "South Georgia and the South Sandwich Islands" },
    { code: "KR", name: "South Korea" },
    { code: "SS", name: "South Sudan" },
    { code: "ES", name: "Spain" },
    { code: "LK", name: "Sri Lanka" },
    { code: "SD", name: "Sudan" },
    { code: "SR", name: "Suriname" },
    { code: "SJ", name: "Svalbard and Jan Mayen" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "SY", name: "Syria" },
    { code: "TW", name: "Taiwan" },
    { code: "TJ", name: "Tajikistan" },
    { code: "TZ", name: "Tanzania" },
    { code: "TH", name: "Thailand" },
    { code: "NL", name: "Netherlands" },
    { code: "NL", name: "The Netherlands" },
    { code: "TL", name: "Timor Leste" },
    { code: "TG", name: "Togo" },
    { code: "TK", name: "Tokelau" },
    { code: "TO", name: "Tonga" },
    { code: "TT", name: "Trinidad and Tobago" },
    { code: "TN", name: "Tunisia" },
    { code: "TR", name: "Turkey" },
    { code: "TM", name: "Turkmenistan" },
    { code: "TC", name: "Turks and Caicos Islands" },
    { code: "TV", name: "Tuvalu" },
    { code: "VI", name: "U.S. Virgin Islands" },
    { code: "UG", name: "Uganda" },
    { code: "UA", name: "Ukraine" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "UM", name: "United States Minor Outlying Islands" },
    { code: "US", name: "United States" },
    { code: "UY", name: "Uruguay" },
    { code: "UZ", name: "Uzbekistan" },
    { code: "VU", name: "Vanuatu" },
    { code: "VA", name: "Vatican" },
    { code: "VE", name: "Venezuela" },
    { code: "VN", name: "Vietnam" },
    { code: "WF", name: "Wallis and Futuna" },
    { code: "EH", name: "Western Sahara" },
    { code: "YE", name: "Yemen" },
    { code: "ZM", name: "Zambia" },
    { code: "ZW", name: "Zimbabwe" }
];

export default function Blacklist() {
    const [ token ]: any = useToken()
    const router = useRouter();
    
    const [serverId, setServerId] = useState("");
    const [search, setSearch] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const { data: user, isError: userError, isLoading: userLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });
    

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: listsLoading, refetch } = useInfiniteQuery("members", async ({ pageParam = 1 }: any) => await getBlacklist({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId, search, pageParam), {
        getNextPageParam: (lastPage, allPages: any) => {
            const maxPages = lastPage.maxPages;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        retry: true 
    });

    useEffect(() => {
        let fetching = false;
        const onScroll = async (event: any) => {
            const { scrollHeight, scrollTop, clientHeight } = event.target.scrollingElement;

            if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.5) {
                fetching = true;
                if (hasNextPage) await fetchNextPage();
                fetching = false;
            }
        }

        const delayDebounceFn = setTimeout(() => {
            refetch();
        }, 1000)

        document.addEventListener("scroll", onScroll);
        return () => {
            document.addEventListener("scroll", onScroll);
            clearTimeout(delayDebounceFn);
        }       
    }, [hasNextPage, fetchNextPage, refetch, search]);
    
    if (userError) return <div>Error</div>
    if (listsLoading || userLoading) return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    
    if (!user.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }



    function ShowType(item: any) {
        switch (item.type) {
        case 0:
            return (
                <Tooltip title="User ID" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    <PersonIcon sx={{ color: theme.palette.primary.main }}/>
                </Tooltip>
            );
        case 1:
            return (
                <Tooltip title="IP Address" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    <PublicIcon sx={{ color: theme.palette.primary.main }}/>
                </Tooltip>
            );
        case 2:
            return (
                <Tooltip title="ASN" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    <HubIcon sx={{ color: theme.palette.primary.main }}/>
                </Tooltip>
            );
        case 3:
            return (
                <Tooltip title="Country" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    {/* <LanguageIcon sx={{ color: theme.palette.primary.main }}/> */}
                    <Avatar sx={{ borderRadius: 0, width: 20, height: 20 }} src={`https://cdn.ipregistry.co/flags/twemoji/${item.value.toLowerCase()}.svg`} />
                </Tooltip>
            );
        }
    }

    function renderNotifications() {
        return (
            <>
                <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="error">
                        {notiTextE}
                    </Alert>
                </Snackbar>

                <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="success">
                        {notiTextS}
                    </Alert>
                </Snackbar>

                <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenI(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="info">
                        {notiTextI}
                    </Alert>
                </Snackbar>
            </>
        )
    }

    function renderSubTitle() {
        return (
            <Grid justifyContent={"space-between"}>
                <Grid item>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2, "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                            Blacklist
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => router.push("/dashboard/blacklist/add")} sx={{ fontWeight: "500" }}>
                            + Create Blacklist
                        </Button>
                    </Stack>
                </Grid>
                <Grid item>
                    {listsLoading ? (
                        <Skeleton animation="wave" variant="rectangular" width={"100%"} height={55} sx={{ borderRadius: "14px" }} />
                    ) : (
                        <TextField id="search" label="Search" variant="outlined" sx={{ width: "100%" }} onChange={(e) => setSearch(e.target.value)} />
                    )}
                </Grid>
            </Grid>
        )
    }

    function renderBlacklistValue(item: any) {
        switch (item.type) {
        case 0:
            return (<Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word", ml: 1 }}>{item.value}</Typography>);
        case 1:
            return (<Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word", ml: 1 }}>{item.value}</Typography>);
        case 2:
            return (<Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word", ml: 1 }}>AS{item.value}</Typography>);
        case 3:
            return (<Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word", ml: 1 }}>{countries.find((c: any) => c.code === item.value)?.name} ({item.value})</Typography>);
        }
    }

    function renderBlacklistItem(item: any) {
        return (
            <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                <CardContent>
                    <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                        <Grid item>
                            <div style={{ display: "inline-flex", alignItems: "center" }}>
                                {ShowType(item)}

                                {item.value ? (
                                    renderBlacklistValue(item)
                                ) : (
                                    <Skeleton variant="text" width={50} />
                                )}
                            </div>
                            {(item.guildId && !userLoading) ? (
                                <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                    Server: {user.servers.find((g: any) => g.guildId === item.guildId)?.name}
                                </Typography>
                            ) : (
                                <Skeleton variant="text" width={50} />
                            )}
                            {item.reason ? (
                                <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                    Reason: {item.reason}
                                </Typography>
                            ) : (<> </>)}
                            <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                Blacklisted: {new Date(item.createdAt).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                            <Stack spacing={2} direction="column" justifyContent={"space-between"}>
                                <Button variant="contained" color="error" onClick={() => {                                                                
                                    axios.delete(`/api/v2/server/blacklist?id=${item.id}`, { 
                                        headers: {
                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                        validateStatus: () => true
                                    }).then((res: any) => {
                                        if (!res.data.success) {
                                            setNotiTextE(res.data.message);
                                            setOpenE(true);
                                        }
                                        else {
                                            setNotiTextS(res.data.message);
                                            setOpenS(true);

                                            refetch();
                                        }
                                    }).catch((err): any => {
                                        setNotiTextE(err.message);
                                        setOpenE(true);
                                        console.error(err);
                                    });
                                }}>Remove</Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Paper>
        )
    }

    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={user}>
                <Toolbar />

                <Container maxWidth="xl">
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                        <CardContent>

                            {renderNotifications()}
                            {renderSubTitle()}

                            {listsLoading ? (
                                <Stack spacing={2}>
                                    {[...Array(15)].map((_, i) => (
                                        <Paper key={i} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                            <CardContent>
                                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                                    <Grid item>
                                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                            <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ mr: "0.5rem" }} />
                                                            <Skeleton animation="wave" variant="text" width={200} height={32} />
                                                        </div>
                                                        <Skeleton animation="wave" variant="text" width={200} height={20} />
                                                    </Grid>
                                                    <Grid item>
                                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                                            <Skeleton animation="wave" variant="rectangular" width={100} height={35} sx={{ borderRadius: "14px" }} />
                                                            <Skeleton animation="wave" variant="rectangular" width={100} height={35} sx={{ borderRadius: "14px" }} />
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : (
                                <>
                                    {(data?.pages?.[0]?.list ?? []).map((item: any) => renderBlacklistItem(item))}
                                </>
                            )}

                            <Box sx={{ display: "flex", justifyContent: "center", mt: "1rem", alignItems: "center" }}>
                                {hasNextPage && (
                                    <Button variant="contained" color="primary" onClick={() => {
                                        fetchNextPage();
                                    }}>Load More</Button>
                                )}
                                {isFetchingNextPage && (
                                    <Typography variant="body2" color="textSecondary" sx={{ ml: "0.5rem" }}>
                                        Loading...
                                    </Typography>
                                )}
                            </Box>
                                
                        </CardContent>
                    </Paper>
                </Container>

            </NavBar>
        </Box>
    )
}