import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";


const PlusMinusButtons = ({ title, value, increment, decrement, getValueString, firstRow = false }) => {

    return (
        <Stack sx={{ marginTop: firstRow ? 0 : 2 }} spacing={1} >
            {title &&
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    {title}
                </Typography>
            }
            <Stack
                direction="row"
                sx={{
                    height: 48, width: 200,
                    justifyContent: "center", alignItems: "center",
                    borderColor: "primary.main", borderRadius: "4px", borderWidth: 1, borderStyle: "solid"
                }}
            >
                <IconButton
                    onClick={decrement}
                    sx={{ width: 48, height: 48 }} color="primary"
                >
                    <Remove sx={{ width: 24, height: 24 }} />
                </IconButton>

                <Box sx={{ width: 96, height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.secondary", position: "absolute", zIndex: -1 }}>
                        {getValueString(value)}
                    </Typography>
                </Box>

                <IconButton
                    onClick={increment}
                    sx={{ width: 48, height: 48 }} color="primary"
                >
                    <Add sx={{ width: 24, height: 24 }} />
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default PlusMinusButtons;