import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import Stack from '@mui/material/Stack';
import TableContainer from '@mui/material/TableContainer';

import {
    RichTreeView
} from '@mui/x-tree-view';

import { AppContext } from '../AppContext';
import { CustomResizable, getPageDimension } from "./CustomStyles";
import { setInitialSelection } from "./ViewerUtil";


const CustomTreeView = ({
    children,
    moduleStore, items, CustomTreeItem,
    selectedId, setSelectedId, navigationHistory=undefined,
    isItemEditable=undefined, handleItemLabelChange=undefined
}) => {

    const { nodeMap, parentMap, expandedItemSet } = moduleStore;

    const { windowSize } = useContext(AppContext);

    const { INITIAL_WIDTH, MIN_WIDTH, MAX_WIDTH, MAX_HEIGHT } = useMemo(
        () => getPageDimension(moduleStore, windowSize), [moduleStore, windowSize]);

    const [treeWidth, setTreeWidth] = useState(INITIAL_WIDTH);

    const [expandedItems, setExpandedItems] = useState(Array.from(expandedItemSet));

    const handleItemClick = useCallback((event, itemId) => {
        setSelectedId(itemId);
        if (navigationHistory) {
            navigationHistory.addToHistory(itemId);
        }
    }, [navigationHistory, setSelectedId]);

    const handleItemExpansionToggle = useCallback((event, itemId, isExpanded) => {
        const node = nodeMap.get(itemId);
        if (node && node.level > 0) {
            if (isExpanded) {
                expandedItemSet.add(itemId);
            }
            else {
                expandedItemSet.delete(itemId);
            }
        }
        setExpandedItems(Array.from(expandedItemSet));
    }, [expandedItemSet, nodeMap, setExpandedItems]);

    useEffect(() => {
        setInitialSelection(moduleStore, setSelectedId, navigationHistory);
    }, [moduleStore, setSelectedId, navigationHistory]);

    useEffect(() => {
        if (selectedId && nodeMap.has(selectedId)) {
            moduleStore.lastSelection = selectedId;

            const node = nodeMap.get(selectedId);
            let parent = parentMap.get(node);
            while (parent != null) {
                expandedItemSet.add(parent.id);
                parent = parentMap.get(parent);
            }
            setExpandedItems(Array.from(expandedItemSet));
        }
    }, [expandedItemSet, moduleStore, nodeMap, parentMap, selectedId, setExpandedItems]);

    return (
        <Stack direction="row" gap={4} sx={{ maxHeight: MAX_HEIGHT }}>
            <CustomResizable
                moduleStore={moduleStore} treeWidth={treeWidth} setTreeWidth={setTreeWidth}
                MIN_WIDTH={MIN_WIDTH} MAX_WIDTH={MAX_WIDTH} MAX_HEIGHT={MAX_HEIGHT}
            >
                <TableContainer sx={{ width: "100%", height: MAX_HEIGHT }}>
                    <RichTreeView
                        items={items}
                        expandedItems={expandedItems}
                        selectedItems={selectedId}
                        slots={{ item: CustomTreeItem }}
                        onItemClick={handleItemClick}
                        onItemExpansionToggle={handleItemExpansionToggle}
                        isItemEditable={isItemEditable}
                        onItemLabelChange={handleItemLabelChange}
                    />
                </TableContainer>
            </CustomResizable>
            <TableContainer sx={{ width: (windowSize.width - treeWidth), height: MAX_HEIGHT }}>
                {children}
            </TableContainer>
        </Stack>
    );
};

export default CustomTreeView;
