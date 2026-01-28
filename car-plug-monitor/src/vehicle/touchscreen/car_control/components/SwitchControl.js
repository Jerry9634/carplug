import { useCallback } from "react";

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";


const SwitchControl = ({
    name, value, setValue, additionalCheck, desc, firstRow = false
}) => {

    const getDesc = useCallback(() => {
        if (desc.length > 1) {
            if (value) {
                return desc[0];
            }
            else {
                return desc[1];
            }
        }
        else {
            return desc[0];
        }
    }, [desc, value]);

    return (
        <Stack sx={{ marginTop: firstRow ? 0 : 2 }} >
            <FormControlLabel control={<Switch checked={value} onChange={() => setValue(!value)} />} label={name} />
            {(additionalCheck || desc) &&
                <Stack sx={{ justifyContent: "flex-start", alignItems: "flex-start", paddingLeft: 6 }}>
                    {desc &&
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {getDesc()}
                        </Typography>
                    }
                    {additionalCheck &&
                        <FormControlLabel
                            control={<Checkbox size="small" defaultChecked />}
                            label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>{additionalCheck}</Typography>}
                        />
                    }
                </Stack>
            }
        </Stack>
    );
};

export default SwitchControl;