import ToggleButton from "@mui/material/ToggleButton";
import { Icon as MdiIcon } from '@mdi/react';

const NavigationBarItem = ({
    id,
    itemIndex,
    tabIndex,
    Icon,
    iconPath
}) => {

    return (
        <ToggleButton value={id} selected={itemIndex === tabIndex} id={id}
            color="primary" sx={{ width: 64, height: 64 }}
        >
            {iconPath &&
                <MdiIcon path={iconPath} style={{ width: 64, height: 64 }} />
            }
            {Icon &&

                <Icon sx={{ width: 64, height: 64 }} />
            }
        </ToggleButton>
    );
};

export default NavigationBarItem;