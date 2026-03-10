import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { DataGrid, gridClasses, useGridApiRef } from '@mui/x-data-grid';

import { AppContext } from '../AppContext';
import { CustomToolbar } from './CustomStyles';
import { restoreColumnWidths } from '../persistency/PersistentMemory';


const CustomDataGrid = ({
    gridName, rows, defaultColumns,
    containerStyles=undefined,
    handleGetCellClassName=undefined,
    handleGetRowClassName=undefined,
    handleCellEditStop=undefined,
    isCellEditable=undefined,
    cellModesModel=undefined,
    handleCellModesModelChange=undefined,
    handleCellClick=undefined
}) => {

    const { isDarkTheme } = useContext(AppContext);

    const apiRef = useGridApiRef();

    const [restored, setRestored] = useState(false);

    const columns = useMemo(() => {
        restoreColumnWidths(gridName, defaultColumns);
        return defaultColumns;
    }, [gridName, defaultColumns]);

    const defaultContainerStyles = useMemo(() => ({
        [`.${gridClasses.cell}.key`]: {
            fontWeight: "bold"
        },
        [`.${gridClasses.cell}.value`]: {
            color: isDarkTheme ? "yellow" : "blue"
        },
    }), [isDarkTheme]);

    const dataGridStyles = useMemo(() => {
        if (containerStyles) {
            return {
                '& .MuiDataGrid-columnHeaderTitle': {
                    fontSize: "medium",
                    fontWeight: "bold"
                },
                ...containerStyles,
            };
        }
        else {
            return {
                '& .MuiDataGrid-columnHeaderTitle': {
                    fontSize: "medium",
                    fontWeight: "bold"
                },
                ...defaultContainerStyles,
            };
        }
    }, [containerStyles, defaultContainerStyles]);

    const handleGetCellClassNameDefault = useCallback((params) => {
        if (params.field === "id" || params.field === 'key' || params.field === 'label') {
            return "key";
        }
        else if (params.field === "value") {
            return "value";
        }
        return "";
    }, []);

    const restoreSnapshot = useCallback(() => {
        if (apiRef && apiRef.current && !restored && localStorage) {
            const key = gridName + '.dataGridState';
            const stateFromLocalStorage = localStorage.getItem(key);
            let storedState = {};
            if (stateFromLocalStorage) {
                storedState = {
                    ...JSON.parse(stateFromLocalStorage),
                    pagination: {
                        paginationModel: { page: 0, pageSize: -1 },
                        rowCount: rows.length
                    }
                }
            }
            apiRef.current.restoreState(storedState);
            setRestored(true);
        }
    }, [apiRef, gridName, restored, rows]);

    const saveSnapshot = useCallback(() => {
        if (apiRef && apiRef.current && restored && localStorage) {
            const currentState = apiRef.current.exportState();
            const key = gridName + '.dataGridState';
            localStorage.setItem(key, JSON.stringify(currentState));
        }
    }, [apiRef, gridName, restored]);

    useEffect(() => {
        setTimeout(restoreSnapshot, 0);
    }, [restoreSnapshot]);

    useLayoutEffect(
        () => {
            // handle refresh and navigating away/refreshing
            window.addEventListener('beforeunload', saveSnapshot);

            return () => {
                // in case of an SPA remove the event-listener
                window.removeEventListener('beforeunload', saveSnapshot);
            };
        },
        // eslint-disable-next-line
        []
    );

    return (
        <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            getRowClassName={handleGetRowClassName}
            getCellClassName={handleGetCellClassName ?? handleGetCellClassNameDefault}
            sx={dataGridStyles}
            initialState={{
                pagination: { paginationModel: { pageSize: -1 } },
            }}
            pageSizeOptions={[25, 50, 100, { value: -1, label: 'All' }]}
            onColumnWidthChange={saveSnapshot}
            slots={{
                toolbar: CustomToolbar
            }}
            showToolbar
            density="compact"

            onCellEditStop={handleCellEditStop}
            isCellEditable={isCellEditable}
            cellModesModel={cellModesModel}
            onCellModesModelChange={handleCellModesModelChange}
            onCellClick={handleCellClick}
        />
    );
};

export default CustomDataGrid;