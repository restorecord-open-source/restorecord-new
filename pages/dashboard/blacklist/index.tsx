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
    { "name": "Afghanistan", "code": "AF" },
    { "name": "Åland Islands", "code": "AX" },
    { "name": "Albania", "code": "AL" },
    { "name": "Algeria", "code": "DZ" },
    { "name": "American Samoa", "code": "AS" },
    { "name": "Andorra", "code": "AD" },
    { "name": "Angola", "code": "AO" },
    { "name": "Anguilla", "code": "AI" },
    { "name": "Antarctica", "code": "AQ" },
    { "name": "Antigua and Barbuda", "code": "AG" },
    { "name": "Argentina", "code": "AR" },
    { "name": "Armenia", "code": "AM" },
    { "name": "Aruba", "code": "AW" },
    { "name": "Australia", "code": "AU" },
    { "name": "Austria", "code": "AT" },
    { "name": "Azerbaijan", "code": "AZ" },
    { "name": "Bahamas", "code": "BS" },
    { "name": "Bahrain", "code": "BH" },
    { "name": "Bangladesh", "code": "BD" },
    { "name": "Barbados", "code": "BB" },
    { "name": "Belarus", "code": "BY" },
    { "name": "Belgium", "code": "BE" },
    { "name": "Belize", "code": "BZ" },
    { "name": "Benin", "code": "BJ" },
    { "name": "Bermuda", "code": "BM" },
    { "name": "Bhutan", "code": "BT" },
    { "name": "Bolivia", "code": "BO" },
    { "name": "Bosnia and Herzegovina", "code": "BA" },
    { "name": "Botswana", "code": "BW" },
    { "name": "Bouvet Island", "code": "BV" },
    { "name": "Brazil", "code": "BR" },
    { "name": "British Indian Ocean Territory", "code": "IO" },
    { "name": "Brunei Darussalam", "code": "BN" },
    { "name": "Bulgaria", "code": "BG" },
    { "name": "Burkina Faso", "code": "BF" },
    { "name": "Burundi", "code": "BI" },
    { "name": "Cambodia", "code": "KH" },
    { "name": "Cameroon", "code": "CM" },
    { "name": "Canada", "code": "CA" },
    { "name": "Cape Verde", "code": "CV" },
    { "name": "Cayman Islands", "code": "KY" },
    { "name": "Central African Republic", "code": "CF" },
    { "name": "Chad", "code": "TD" },
    { "name": "Chile", "code": "CL" },
    { "name": "China", "code": "CN" },
    { "name": "Christmas Island", "code": "CX" },
    { "name": "Cocos (Keeling) Islands", "code": "CC" },
    { "name": "Colombia", "code": "CO" },
    { "name": "Comoros", "code": "KM" },
    { "name": "Congo", "code": "CG" },
    { "name": "Congo, The Democratic Republic of the", "code": "CD" },
    { "name": "Cook Islands", "code": "CK" },
    { "name": "Costa Rica", "code": "CR" },
    { "name": "Croatia", "code": "HR" },
    { "name": "Cuba", "code": "CU" },
    { "name": "Cyprus", "code": "CY" },
    { "name": "Czech Republic", "code": "CZ" },
    { "name": "Denmark", "code": "DK" },
    { "name": "Djibouti", "code": "DJ" },
    { "name": "Dominica", "code": "DM" },
    { "name": "Dominican Republic", "code": "DO" },
    { "name": "Ecuador", "code": "EC" },
    { "name": "Egypt", "code": "EG" },
    { "name": "El Salvador", "code": "SV" },
    { "name": "Equatorial Guinea", "code": "GQ" },
    { "name": "Eritrea", "code": "ER" },
    { "name": "Estonia", "code": "EE" },
    { "name": "Ethiopia", "code": "ET" },
    { "name": "Falkland Islands (Malvinas)", "code": "FK" },
    { "name": "Faroe Islands", "code": "FO" },
    { "name": "Fiji", "code": "FJ" },
    { "name": "Finland", "code": "FI" },
    { "name": "France", "code": "FR" },
    { "name": "French Guiana", "code": "GF" },
    { "name": "French Polynesia", "code": "PF" },
    { "name": "French Southern Territories", "code": "TF" },
    { "name": "Gabon", "code": "GA" },
    { "name": "Gambia", "code": "GM" },
    { "name": "Georgia", "code": "GE" },
    { "name": "Germany", "code": "DE" },
    { "name": "Ghana", "code": "GH" },
    { "name": "Gibraltar", "code": "GI" },
    { "name": "Greece", "code": "GR" },
    { "name": "Greenland", "code": "GL" },
    { "name": "Grenada", "code": "GD" },
    { "name": "Guadeloupe", "code": "GP" },
    { "name": "Guam", "code": "GU" },
    { "name": "Guatemala", "code": "GT" },
    { "name": "Guernsey", "code": "GG" },
    { "name": "Guinea", "code": "GN" },
    { "name": "Guinea-Bissau", "code": "GW" },
    { "name": "Guyana", "code": "GY" },
    { "name": "Haiti", "code": "HT" },
    { "name": "Heard Island and Mcdonald Islands", "code": "HM" },
    { "name": "Holy See (Vatican City State)", "code": "VA" },
    { "name": "Honduras", "code": "HN" },
    { "name": "Hong Kong", "code": "HK" },
    { "name": "Hungary", "code": "HU" },
    { "name": "Iceland", "code": "IS" },
    { "name": "India", "code": "IN" },
    { "name": "Indonesia", "code": "ID" },
    { "name": "Iran, Islamic Republic Of", "code": "IR" },
    { "name": "Iraq", "code": "IQ" },
    { "name": "Ireland", "code": "IE" },
    { "name": "Isle of Man", "code": "IM" },
    { "name": "Israel", "code": "IL" },
    { "name": "Italy", "code": "IT" },
    { "name": "Jamaica", "code": "JM" },
    { "name": "Japan", "code": "JP" },
    { "name": "Jersey", "code": "JE" },
    { "name": "Jordan", "code": "JO" },
    { "name": "Kazakhstan", "code": "KZ" },
    { "name": "Kenya", "code": "KE" },
    { "name": "Kiribati", "code": "KI" },
    { "name": "Korea, Republic of", "code": "KR" },
    { "name": "Kuwait", "code": "KW" },
    { "name": "Kyrgyzstan", "code": "KG" },
    { "name": "Latvia", "code": "LV" },
    { "name": "Lebanon", "code": "LB" },
    { "name": "Lesotho", "code": "LS" },
    { "name": "Liberia", "code": "LR" },
    { "name": "Libyan Arab Jamahiriya", "code": "LY" },
    { "name": "Liechtenstein", "code": "LI" },
    { "name": "Lithuania", "code": "LT" },
    { "name": "Luxembourg", "code": "LU" },
    { "name": "Macao", "code": "MO" },
    { "name": "North Macedonia", "code": "MK" },
    { "name": "Madagascar", "code": "MG" },
    { "name": "Malawi", "code": "MW" },
    { "name": "Malaysia", "code": "MY" },
    { "name": "Maldives", "code": "MV" },
    { "name": "Mali", "code": "ML" },
    { "name": "Malta", "code": "MT" },
    { "name": "Marshall Islands", "code": "MH" },
    { "name": "Martinique", "code": "MQ" },
    { "name": "Mauritania", "code": "MR" },
    { "name": "Mauritius", "code": "MU" },
    { "name": "Mayotte", "code": "YT" },
    { "name": "Mexico", "code": "MX" },
    { "name": "Micronesia, Federated States of", "code": "FM" },
    { "name": "Moldova, Republic of", "code": "MD" },
    { "name": "Monaco", "code": "MC" },
    { "name": "Mongolia", "code": "MN" },
    { "name": "Montenegro", "code": "ME" },
    { "name": "Montserrat", "code": "MS" },
    { "name": "Morocco", "code": "MA" },
    { "name": "Mozambique", "code": "MZ" },
    { "name": "Myanmar", "code": "MM" },
    { "name": "Namibia", "code": "NA" },
    { "name": "Nauru", "code": "NR" },
    { "name": "Nepal", "code": "NP" },
    { "name": "Netherlands", "code": "NL" },
    { "name": "Netherlands Antilles", "code": "AN" },
    { "name": "New Caledonia", "code": "NC" },
    { "name": "New Zealand", "code": "NZ" },
    { "name": "Nicaragua", "code": "NI" },
    { "name": "Niger", "code": "NE" },
    { "name": "Nigeria", "code": "NG" },
    { "name": "Niue", "code": "NU" },
    { "name": "Norfolk Island", "code": "NF" },
    { "name": "Northern Mariana Islands", "code": "MP" },
    { "name": "Norway", "code": "NO" },
    { "name": "Oman", "code": "OM" },
    { "name": "Pakistan", "code": "PK" },
    { "name": "Palau", "code": "PW" },
    { "name": "Palestinian Territory, Occupied", "code": "PS" },
    { "name": "Panama", "code": "PA" },
    { "name": "Papua New Guinea", "code": "PG" },
    { "name": "Paraguay", "code": "PY" },
    { "name": "Peru", "code": "PE" },
    { "name": "Philippines", "code": "PH" },
    { "name": "Pitcairn Islands", "code": "PN" },
    { "name": "Poland", "code": "PL" },
    { "name": "Portugal", "code": "PT" },
    { "name": "Puerto Rico", "code": "PR" },
    { "name": "Qatar", "code": "QA" },
    { "name": "Reunion", "code": "RE" },
    { "name": "Romania", "code": "RO" },
    { "name": "Russian Federation", "code": "RU" },
    { "name": "Rwanda", "code": "RW" },
    { "name": "Saint Helena", "code": "SH" },
    { "name": "Saint Kitts and Nevis", "code": "KN" },
    { "name": "Saint Lucia", "code": "LC" },
    { "name": "Saint Pierre and Miquelon", "code": "PM" },
    { "name": "Saint Vincent and the Grenadines", "code": "VC" },
    { "name": "Samoa", "code": "WS" },
    { "name": "San Marino", "code": "SM" },
    { "name": "Sao Tome and Principe", "code": "ST" },
    { "name": "Saudi Arabia", "code": "SA" },
    { "name": "Senegal", "code": "SN" },
    { "name": "Serbia", "code": "RS" },
    { "name": "Seychelles", "code": "SC" },
    { "name": "Sierra Leone", "code": "SL" },
    { "name": "Singapore", "code": "SG" },
    { "name": "Slovakia", "code": "SK" },
    { "name": "Slovenia", "code": "SI" },
    { "name": "Solomon Islands", "code": "SB" },
    { "name": "Somalia", "code": "SO" },
    { "name": "South Africa", "code": "ZA" },
    { "name": "South Georgia and the South Sandwich Islands", "code": "GS" },
    { "name": "Spain", "code": "ES" },
    { "name": "Sri Lanka", "code": "LK" },
    { "name": "Sudan", "code": "SD" },
    { "name": "Suriname", "code": "SR" },
    { "name": "Svalbard and Jan Mayen", "code": "SJ" },
    { "name": "Swaziland", "code": "SZ" },
    { "name": "Sweden", "code": "SE" },
    { "name": "Switzerland", "code": "CH" },
    { "name": "Syrian Arab Republic", "code": "SY" },
    { "name": "Taiwan", "code": "TW" },
    { "name": "Tajikistan", "code": "TJ" },
    { "name": "Tanzania, United Republic of", "code": "TZ" },
    { "name": "Thailand", "code": "TH" },
    { "name": "Timor-Leste", "code": "TL" },
    { "name": "Togo", "code": "TG" },
    { "name": "Tokelau", "code": "TK" },
    { "name": "Tonga", "code": "TO" },
    { "name": "Trinidad and Tobago", "code": "TT" },
    { "name": "Tunisia", "code": "TN" }
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
    
    if (userLoading) return <CircularProgress />
    if (userError) return <div>Error</div>
    if (listsLoading) return <CircularProgress />
    
    if (!user.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress />
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
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
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
                                    axios.delete(`/api/v1/server/blacklist?id=${item.id}`, { 
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
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
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