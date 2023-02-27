import { SxProps } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function TextSB2({ children }: any, props: { sx: SxProps }) {
    return (
        <Typography color="textSecondary" variant="body2" sx={{...props.sx}}>
            {children}
        </Typography>
    )
}