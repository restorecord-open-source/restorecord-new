import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#4f46e5",
            // main: "#0090ff",
        },
        secondary: {
            main: "#433add",
        },
        info: {
            main: "#3f84f6",
        },
        success: {
            main: "#43a047",
        },
        yellow: {
            light: "#fbd67c",
            main: "#fbc02d",
            dark: "#9b6e00",
        },
        background: {
            paper: "#0a0a12",
        },
    },
    typography: {
        fontFamily: [
            "Inter",
            // "Roboto",
        ].join(","),
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ ownerState }: any) => ({
                    borderRadius: 14,
                    padding: "8px 14px",
                    transitionDuration: "0.3s",
                    ...(ownerState?.color === "primary" && {
                        outline: `1px solid ${theme.palette.primary.main}`,
                    }),
                    ...(ownerState?.color === "secondary" && {
                        outline: `1px solid ${theme.palette.secondary.main}`,
                    }),
                    ...(ownerState?.color === "info" && {
                        outline: `1px solid ${theme.palette.info.main}`,
                    }),
                    ...(ownerState?.color === "default" && {
                        outline: `1px solid ${theme.palette.text.primary}`,
                    }),
                    ...(ownerState?.color === "error" && {
                        outline: `1px solid ${theme.palette.error.main}`,
                    }),
                    ...(ownerState?.color === "warning" && {
                        outline: `1px solid ${theme.palette.warning.main}`,
                    }),
                    ...(ownerState?.color === "success" && {
                        outline: `1px solid ${theme.palette.success.main}`,
                    }),
                    ...(ownerState?.color === "yellow" && {
                        outline: `1px solid ${theme.palette.yellow.main}`,
                    }),
                    // change outline to backgroundColor for safari browser
                    "@media only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (-o-min-device-pixel-ratio: 3/2), only screen and (min--moz-device-pixel-ratio: 1.5), only screen and (min-device-pixel-ratio: 1.5)": {
                        outline: "none",
                    },
                    // if not safari browser
                    "@media not all and (-webkit-min-device-pixel-ratio: 1.5), not all and (-o-min-device-pixel-ratio: 3/2), not all and (min--moz-device-pixel-ratio: 1.5), not all and (min-device-pixel-ratio: 1.5)": {
                        "&:hover": {
                            backgroundColor: "transparent",
                            ...(ownerState?.color === "primary" && {
                                color: theme.palette.primary.main,
                            }),
                            ...(ownerState?.color === "secondary" && {
                                color: theme.palette.secondary.main,
                            }),
                            ...(ownerState?.color === "info" && {
                                color: theme.palette.info.main,
                            }),
                            ...(ownerState?.color === "default" && {
                                color: theme.palette.text.primary,
                            }),
                            ...(ownerState?.color === "error" && {
                                color: theme.palette.error.main,
                            }),
                            ...(ownerState?.color === "warning" && {
                                color: theme.palette.warning.main,
                            }),
                            ...(ownerState?.color === "success" && {
                                color: theme.palette.success.main,
                            }),
                            ...(ownerState?.color === "yellow" && {
                                color: theme.palette.yellow.main,
                            }),
                        },
                    },
                }),
            },
            variants: [
                {
                    props: { variant: "filled", color: "white" },
                    style: ({ ownerState }: any) => ({
                        outline: `1px solid ${theme.palette.grey[700]}`,
                        "@media only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (-o-min-device-pixel-ratio: 3/2), only screen and (min--moz-device-pixel-ratio: 1.5), only screen and (min-device-pixel-ratio: 1.5)": {
                            outline: "none",
                            backgroundColor: theme.palette.grey[400],
                            color: theme.palette.grey[900],
                            "&:hover": {
                                backgroundColor: "#fff",
                                color: theme.palette.grey[700],
                            },
                        },
                        "@media not all and (-webkit-min-device-pixel-ratio: 1.5), not all and (-o-min-device-pixel-ratio: 3/2), not all and (min--moz-device-pixel-ratio: 1.5), not all and (min-device-pixel-ratio: 1.5)": {
                            backgroundColor: "transparent",
                            color: "#fff",
                            "&:hover": {
                                backgroundColor: "#fff",
                                color: theme.palette.grey[700],
                            },
                        }
                    }),
                },
            ],         
        },
        MuiButtonBase: {
            styleOverrides: {
                root: ({ ownerState }: any) => ({
                    "&.Mui-disabled": {
                        backgroundColor: `rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.15) !important`,
                    }
                }),
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: ({ ownerState }: any) => ({
                    borderRadius: 14,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 14,
                        "& fieldset": {
                            borderRadius: 14,
                        },
                        "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: theme.palette.primary.main,
                        },
                    },
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ ownerState }: any) => ({
                    borderRadius: 14,
                    "& fieldset": {
                        borderRadius: 14,
                    },
                    "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                    },
                }),
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: ({ ownerState }: any) => ({
                    "&.Mui-focused": {
                        color: theme.palette.primary.main,
                    },
                }),
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root:{
                    borderRadius: 14,
                },
            },
        },
        MuiInput: {
            styleOverrides: {
                underline: ({ ownerState }: any) => ({
                    "&:after": {
                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                    },
                    "&:before": {
                        borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    },
                }),
            },
        },
        MuiFormControl: {
            styleOverrides: {
                root:{
                    borderRadius: 14,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: ({ ownerState }: any) => ({
                    backgroundColor: theme.palette.background.paper,
                    backgroundImage: "unset !important",
                    border: `1px solid ${theme.palette.grey[900]}`,
                    "& .MuiList-padding": {
                        padding: 0,
                    },
                }),
            },
        },
        MuiDialog: { 
            styleOverrides: {
                paper: {
                    backgroundColor: "#13131f",
                    backgroundImage: "unset",
                    padding: "0.5rem",
                    borderRadius: "1rem",
                },
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    backgroundColor: "unset !important",
                }
            }
        },
        MuiAccordion: {
            styleOverrides: {
                root: {
                    backgroundColor: "unset !important",
                    borderRadius: "1rem !important",
                    "&.Mui-expanded": {
                        borderRadius: "1rem !important",
                    },
                    "&:before": {
                        display: "none",
                    },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    backgroundColor: "unset !important",
                    borderRadius: "1rem !important",
                    "&.Mui-expanded": {
                        borderRadius: "1rem !important",
                        minHeight: "unset !important",
                    },
                },
            },
        },
    }
});

export default theme;