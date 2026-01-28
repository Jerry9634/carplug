
export const DARK_THEME_KEY = "ZoneMonitor.Settings.isDarkTheme";
export const NAME_BLUR_KEY = "ZoneMonitor.Settings.isNameBlurred";

export const APPEARANCE_KEY = "Car.Display.Appearance";

export const ZONE_CONFIG_KEY = "ZoneMonitor.ZoneConfig";


export const getBoolean = (key) => {
    return getDataSafely(key, false);
};

export const getData = (key) => {
    const txt = window.localStorage.getItem(key);
    if (txt != null) {
        const jsonData = JSON.parse(txt);
        if (jsonData) {
            return jsonData.value;
        }
    }
    return null;
};

export const getDataSafely = (key, initVal) => {
    const txt = window.localStorage.getItem(key);
    if (txt != null) {
        const jsonData = JSON.parse(txt);
        if (jsonData) {
            return jsonData.value;
        }
    }
    saveData(key, initVal);
    return initVal;
};

export const saveData = (key, value) => {
    if (key != null && value != null) {
        const jsonData = {
            key: key,
            type: typeof value,
            value: value
        }
        window.localStorage.setItem(key, JSON.stringify(jsonData));
    }
};

export const removeData = (key) => {
    if (key != null) {
        window.localStorage.removeItem(key);
    }
};

export function restoreColumnWidths(gridName, columns) {
    if (localStorage) {
        const key = gridName + ".dataGridState";
        const stateFromLocalStorage = localStorage.getItem(key);
        if (stateFromLocalStorage) {
            const storedState = JSON.parse(stateFromLocalStorage);
            if (storedState?.columns?.dimensions) {
                for (const column of columns) {
                    const dimension = storedState.columns.dimensions[column.field];
                    if (dimension) {
                        column.width = dimension.width;
                    }
                }
            }
        }
    }
}
