
export function setInitialSelection(moduleStore, setSelectedId, navigationHistory) {
    if (moduleStore.items && moduleStore.items.length > 0) {
        if (!moduleStore.lastSelection) {
            const rootId = moduleStore.items[0].id;
            setSelectedId(rootId);
            if (navigationHistory) {
                navigationHistory.addToHistory(rootId);
            }
        }
    }
}

export function downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append to body is required for some browsers
    a.click();
    document.body.removeChild(a); // Clean up the temporary element
    URL.revokeObjectURL(url); // Release the object URL
}
