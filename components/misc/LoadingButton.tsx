import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { SxProps, Theme } from "@mui/material/styles";
import { useState } from "react";

interface LoadingButtonProps {
    event: () => void;
    variant?: "text" | "outlined" | "contained";
    color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | "yellow";
    sx?: SxProps<Theme>;
    children: React.ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
}

export default function LoadingButton(props: LoadingButtonProps) {
    const { event, variant, color, sx, children } = props;
    const [loading, setLoading] = useState(false);

    return (
        <Button
            variant={variant ?? "contained"}
            color={color ?? "primary"}
            sx={sx}
            disabled={loading || props.disabled}
            fullWidth={props.fullWidth}
            onClick={async () => {
                setLoading(true);
                await event();
                setLoading(false);
            }}
        >
            {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : <></>}
            {children}
        </Button>
    );
}