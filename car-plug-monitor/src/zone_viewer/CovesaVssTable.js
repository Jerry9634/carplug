import React, { useEffect, useMemo, useState } from "react";

import { GridActionsCellItem } from '@mui/x-data-grid';

import DetailsIcon from "@mui/icons-material/Details";

import CustomDataGrid from "../common_viewer/CustomDataGrid";
import { subscribeSignals, unsubscribeSignals } from "../signal_db/VssSocket";

import { VssSignalDetails } from "./VssSignalDetails";


const CovesaVssTable = ({
    moduleStore, selectedId
}) => {

    const { nodeMap } = moduleStore;

    const defaultColumns = useMemo(() => initColumns(moduleStore), [moduleStore]);

    const [rows, setRows] = useState([]);

    useEffect(() => {
        const signals = [];
        if (selectedId && nodeMap.has(selectedId)) {
            const branch = nodeMap.get(selectedId);

            getSignals(branch, signals);

            const jsonData = moduleStore.jsonData;
            unsubscribeSignals(jsonData);
            jsonData.signals.length = 0;

            const signalMap = new Map();

            for (const signal of signals) {
                if (signal.type !== "branch") {
                    jsonData.signals.push({ name: signal.id });
                    if (!signal.value) {
                        signal.value = signal.default ?? "";
                    }
                    signalMap.set(signal.id, signal);
                }
            }

            subscribeSignals(
                jsonData,
                (json) => {
                    if (json && json.signals && json.signals.length > 0) {
                        const updatedSignalMap = new Map();
                        for (const signal of json.signals) {
                            if (signal.value != null && signalMap.has(signal.name)) {
                                const storedSignal = signalMap.get(signal.name);
                                if (storedSignal.value !== signal.value) {
                                    storedSignal.value = signal.value;
                                    updatedSignalMap.set(signal.name, signal);
                                }                             
                            }
                        }
                        
                        if (updatedSignalMap.size > 0) {
                            setRows((prevRows) => {
                                return prevRows.map((row, index) =>
                                    updatedSignalMap.has(row.id) ? { ...row, value: updatedSignalMap.get(row.id).value } : row,
                                );
                            });
                        }
                    }
                }
            );
        }
        setRows(signals);
    }, [selectedId, moduleStore, nodeMap]);

    useEffect(() => {
        return () => unsubscribeSignals({ channel: moduleStore.jsonData.channel });
    }, [moduleStore]);

    return (
        <CustomDataGrid
            gridName={moduleStore.name} rows={rows} defaultColumns={defaultColumns}
        />
    );
};


function initColumns(moduleStore) {
    const columns = [
        {
            field: 'id', headerName: 'Key', width: 350, sortable: false,
            renderCell: (params) => (
                <>
                    {params.row.type === "branch" ?
                        <span style={{ fontWeight: "bold" }}>{params.value}</span>
                        :
                        <>
                            <span style={{ fontWeight: "bold", color: "darkgray" }}>
                                {params.value.substring(0, params.value.length - params.row.name.length)}
                            </span>
                            <span style={{ fontWeight: "bold" }}>
                                {params.row.type !== "branch" && params.row.name}
                            </span>
                        </>
                    }
                </>
            )
        },
        { field: 'value', headerName: 'Value', width: 125 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'description', headerName: 'Description', width: 350 },
        { field: 'unit', headerName: 'Unit', width: 75 },
        { field: 'datatype', headerName: 'Data Type', width: 100 },
        {
            field: 'details', headerName: 'Details', width: 90, sortable: false,
            renderCell: (params) => (<VssSignalDetailsButton vssKey={params.row.id} nodeMap={moduleStore.nodeMap} />)
        }
    ];

    return columns;
}

function VssSignalDetailsButton({ vssKey, nodeMap }) {
    const [open, setOpen] = useState(false);
    return (
        <React.Fragment>
            <GridActionsCellItem
                icon={<DetailsIcon />}
                label="Details"
                material={{ sx: { color: 'primary.main', }, }}
                onClick={() => setOpen(true)}
                title="Details"
                size="medium"
            />
            {vssKey && nodeMap.has(vssKey) &&
                <VssSignalDetails
                    vssKey={vssKey}
                    vssSignal={nodeMap.get(vssKey).vss}
                    open={open}
                    onClose={() => setOpen(false)}
                />
            }
        </React.Fragment>
    );
}

function getSignals(node, signals) {
    signals.push(node.vss);
    for (const name in node.vss.children) {
        const subnode = node.vss.children[name];
        if (subnode.type !== "branch") {
            signals.push(subnode);
        }
    }

    if (node.id !== "Vehicle") {
        for (const subnode of node.children) {
            if (subnode.type === "branch") {
                getSignals(subnode, signals);
            }
        }
    }
}

export default CovesaVssTable;