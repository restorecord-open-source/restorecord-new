import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

export default function BlurredBlob({ toolTipText }: any) {
    return (
        <Tooltip title={toolTipText} placement="top">
            <Box sx={{ display: "inline-block", width: "fit-content", height: "fit-content", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", fontWeight: "bold", boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", filter: "blur(4px)", WebkitFilter: "blur(4px)", opacity: "0.8" }}>
                {toolTipText}
            </Box>
        </Tooltip>
    )
}