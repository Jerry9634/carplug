import { useCallback } from "react";

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from "@mui/material/Stack";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from "@mui/material/Typography";


const ToggleButtons = ({ name, labelList, value, setValue, additionalCheck = null, desc = null, firstRow = false }) => {

    const getLabel = useCallback((label) => {
        if (label.includes("&")) {
            return <>{label.split("&")[0]}<br />& {label.split("&")[1]}</>;
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
    }, [desc, labelList, value]);

    const handleChange = useCallback((event, newValue) => {
        if (newValue) {
            setValue(newValue);
        }
    }, [setValue]);

    return (
        <Stack sx={{ marginTop: firstRow ? 0 : 2 }} spacing={1} >
            {name &&
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.secondary" }}>
                    {name}
                </Typography>
            }
            <ToggleButtonGroup value={value} exclusive color="primary" sx={{ height: 56 }}
                onChange={handleChange}
            >
                {labelList.map((selection, index) =>
                    <ToggleButton size="large" key={index}
                        sx={{ minWidth: 120, textTransform: "none", fontSize: 16, fontWeight: 700 }}
                        value={selection}
                    >
                        {getLabel(selection)}
                    </ToggleButton>
                )}
            </ToggleButtonGroup>
            {(additionalCheck || desc) &&
                <Stack sx={{ justifyContent: "flex-start", alignItems: "flex-start", paddingLeft: 1 }}>
                    {additionalCheck &&
                        <FormControlLabel
                            control={<Checkbox size="small" defaultChecked />}
                            label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>{additionalCheck}</Typography>}
                        />
                    }
                    {desc &&
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {getDesc()}
                        </Typography>
                    }
                </Stack>
            }
        </Stack>
    );
};

export default ToggleButtons;