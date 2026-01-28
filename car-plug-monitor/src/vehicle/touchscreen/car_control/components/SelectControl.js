import { useCallback } from "react";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";


const SelectControl = ({ name, labelList, value, setValue, additionalCheck, desc, firstRow = false }) => {

    const getLabel = useCallback((label) => {
        if (label.includes("&")) {
            return <>{label.split("&")[0]}<br />&  {label.split("&")[1]}</>;
        }
        return label;
    }, []);

    const getDesc = useCallback(() => {
        if (desc.length > 1) {
            for (let i = 0; i < labelList.length; i++) {
                if (labelList[i] === value) {
                    return desc[i];
                }
            }
        }
        return desc[0];
    }, []);

    return (
        <Stack sx={{ marginTop: firstRow ? 0 : 2 }} spacing={1} >
            {name &&
                <Typography variant="h6" component="div" sx={{ fontSize: 18 }}>
                    {name}
                </Typography>
            }
            <ButtonGroup variant="outlined" sx={{ height: 56 }}>
                {labelList.map((selection, index) =>
                    <Button size="large" key={index}
                        style={{ minWidth: 120, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        variant={value === selection ? "contained" : "outlined"}
                        onClick={() => setValue(selection)}
                    >
                        {getLabel(selection)}
                    </Button>
                )}
            </ButtonGroup>
            {additionalCheck &&
                <Typography gutterBottom variant="subtitle2" component="div">
                    {"V " + additionalCheck}
                </Typography>
            }
            {desc &&
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {getDesc()}
                </Typography>
            }
        </Stack>
    );
};

export default SelectControl;