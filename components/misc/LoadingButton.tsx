import Button, { ButtonPropsColorOverrides } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { SxProps, Theme } from "@mui/material/styles";
import { OverridableStringUnion } from "@mui/types";
import { useState } from "react";

interface LoadingButtonProps {
    event: () => void;
    variant?: "text" | "outlined" | "contained";
    color?: OverridableStringUnion<"inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | "yellow", ButtonPropsColorOverrides>;
    sx?: SxProps<Theme>;
    ref?: React.Ref<HTMLButtonElement>;
    children: React.ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
    type?: "button" | "submit" | "reset";
}

export default function LoadingButton(props: LoadingButtonProps) {
    const { event, variant, color, sx, ref, children } = props;
    const [loading, setLoading] = useState(false);

    return (
        <Button
            variant={variant ?? "contained"}
            color={color ?? "primary"}
            sx={sx}
            disabled={loading || props.disabled}
            fullWidth={props.fullWidth}
            ref={ref}
            type={props.type}
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