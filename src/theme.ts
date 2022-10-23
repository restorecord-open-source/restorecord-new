import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            // main: '#4f46e5',
            main: '#ff7e3d',
        },
        secondary: {
            main: '#433add',
        },
        info: {
            main: '#3f84f6',
        }
    },
    typography: {
        fontFamily: [
            'Roboto',
        ].join(','),
    }
});

export default theme;