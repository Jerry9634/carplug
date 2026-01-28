import { useMemo, useState } from 'react';

import {
    TreeItem,
    TreeItemLabel,
    useTreeItemModel
} from '@mui/x-tree-view';

import Typography from '@mui/material/Typography';

import DirectionsCarTwoToneIcon from "@mui/icons-material/DirectionsCarTwoTone";
import FolderTwoToneIcon from "@mui/icons-material/FolderTwoTone";

import CustomTreeView from "../common_viewer/CustomTreeView";
import vssDB from "../signal_db/vss.json";
import { SIGNAL_TYPES } from "../signal_db/VssSocket";

import CovesaVssTable from "./CovesaVssTable";


const CovesaVssPage = () => {

    const { items } = useMemo(initTree, []);

    const [selectedId, setSelectedId] = useState(moduleStore.lastSelection);

    return (
        <CustomTreeView
            moduleStore={moduleStore} items={items} CustomTreeItem={CustomTreeItem}
            selectedId={selectedId} setSelectedId={setSelectedId}
        >
            <CovesaVssTable
                moduleStore={moduleStore}
                selectedId={selectedId}
            />
        </CustomTreeView>
    );
};

const CustomLabel = ({ children, className, item, ...other }) => {
    return (
        <TreeItemLabel
            {...other}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
            {item.type === "vehicle"? <DirectionsCarTwoToneIcon/> : <FolderTwoToneIcon/>}
            <Typography fontSize="medium"><b>{item.label}</b></Typography>
            <Typography fontSize={12} color="secondary">{item.signalNum}</Typography>
        </TreeItemLabel>
    );
};

const CustomTreeItem = (props) => {
    const item = useTreeItemModel(props.itemId);

    return (
        <TreeItem
            {...props}
            slots={{
                label: CustomLabel,
            }}
            slotProps={{
                label: { item: item || '' },
            }}
        />
    );
};


const ROOT_NAME = "Vehicle";

export const moduleStore = {
    name: "COVESA_VSS",
    items: [],
    nodeMap: new Map(),
    parentMap: new Map(),
    expandedItemSet: new Set(),
    lastSelection: null,
    jsonData: {
        channel: "vss",
        type: SIGNAL_TYPES.VSS,
        signals: []
    },
    valid: false
};

function initTree() {
    const { items, nodeMap, parentMap, expandedItemSet } = moduleStore;
    
    if (moduleStore.valid) {
        return ({
            items: items,
            nodeMap: nodeMap,
            parentMap: parentMap,
            expandedItemSet: expandedItemSet
        });
    }
    else {
        moduleStore.valid = true;
    }

    const addSubTree = (vssNode, context) => {
        let size = 0;

        if (vssNode.type !== "branch") {
            size = 1;
        }
        else {
            for (const name in vssNode.children) {
                const subNode = vssNode.children[name];
                const id = context.id + "." + name;
                subNode.id = id;
                subNode.name = name;
                const subContext = {
                    name: name,
                    id: id,
                    label: name,
                    children: [],
                    vss: subNode,
                    type: subNode.type,
                    level: context.level + 1
                };

                nodeMap.set(id, subContext);
                parentMap.set(subContext, context);

                if (subNode.type === "branch") {
                    context.children.push(subContext);
                }
                else {
                    subNode.id = id;
                    subNode.name = name;
                }
                size += addSubTree(subNode, subContext);
            }

            context.signalNum = size;
        }

        return size;
    };

    if (items.length === 0) {
        vssDB.Vehicle.id = ROOT_NAME;
        vssDB.Vehicle.name = ROOT_NAME;
        const firstItem = {
            name: ROOT_NAME,
            id: ROOT_NAME,
            label: ROOT_NAME,
            children: [],
            vss: vssDB.Vehicle,
            type: "vehicle",
            level: 0
        };
        items.push(firstItem);

        nodeMap.set(ROOT_NAME, firstItem);
        expandedItemSet.add(ROOT_NAME);
        
        addSubTree(vssDB.Vehicle, firstItem);
    }

    return {
        items: items,
        nodeMap: nodeMap,
        parentMap: parentMap,
        expandedItemSet: expandedItemSet
    };
}

export default CovesaVssPage;