import { useCallback } from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";


const ButtonArrayControl = ({ title, labelList, firstRow = false }) => {

    const getLabel = useCallback((label) => {
        if (label.includes("&")) {
            const tokens = label.split("&");
            return <>{tokens[0]}<br />&{tokens[1]}</>;
        }
        return label;
    }, []);

    return (
        <Stack sx={{ marginTop: firstRow ? 0 : 2 }} spacing={1} >
            {title &&
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    {title}
                </Typography>
            }
            <Stack direction="row" spacing={1} >
                {labelList.map((label, index) =>
                    <Button size="large" key={index}
                        sx={{ height: 56, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        variant="outlined"
                    >
                        {getLabel(label)}
                    </Button>
                )}
            </Stack>
        </Stack>
    );
};

export default ButtonArrayControl;