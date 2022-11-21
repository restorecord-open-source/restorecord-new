import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: '#4f46e5',
            // main: '#0090ff',
        },
        secondary: {
            main: '#433add',
        },
        info: {
            main: '#3f84f6',
        },
        background: {
            paper: '#0a0a12',
        } 
    },
    typography: {
        fontFamily: [
            'Roboto',
        ].join(','),
    },
    components: {
        MuiDialog: { 
            styleOverrides: {
                paper: {
                    backgroundColor: "#13131f",
                    backgroundImage: "unset",
                    padding: "0.5rem",
                    borderRadius: "1rem",
                }
            }
        }
    }
});

export default theme;