import { useCallback, useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
} from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';

import { Resizable } from 're-resizable';

import { getDataSafely, saveData } from "../persistency/PersistentMemory";


export const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

export const a11yProps = (index) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
};

export const useThemeDetector = () => {
    const getCurrentTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
    const mqListener = (e => {
        setIsDarkTheme(e.matches);
    });

    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        darkThemeMq.addListener(mqListener);
        return () => darkThemeMq.removeListener(mqListener);
    }, []);
    return isDarkTheme;
};

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        fontSize: "medium",
        fontWeight: "bold",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: "medium",
    },
}));

export const StyledFieldTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.body}`]: {
        fontSize: "medium",
        color: theme.palette.mode === "dark" ? "yellow" : "blue",
    },
}));

export const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.mode === "dark" ? '#2b2b2b' : '#f5f5f9',
        color: theme.palette.mode === "dark" ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        maxWidth: 500,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));


// Custom handle component
const CustomResizeHandle = (props) => {
    
    const { active, setActive, MAX_HEIGHT, timeoutId, setTimeoutId } = props;

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 4,
                height: MAX_HEIGHT,
                backgroundColor: active? '#2196f3' : 'transparent',
            }}
            onMouseOver={(e) => {
                if (!timeoutId) {
                    setActive(true);
                }
                else {
                    clearTimeout(timeoutId);
                    setTimeoutId(null);
                }
            }}
            onMouseOut={(e) => {
                if (e.buttons === 0) {
                   setActive(false);
                }
            }}
        />
    );
};

export const CustomResizable = ({ children, moduleStore, treeWidth, setTreeWidth, MIN_WIDTH, MAX_WIDTH, MAX_HEIGHT }) => {

    const [resizeStart, setResizeStart] = useState(false);
    const [handleActive, setHandleActive] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const onResize = useCallback(() => {
        setResizeStart(true);
        setHandleActive(true);
    }, []);

    const onResizeStop = useCallback((delta) => {
        if (resizeStart) {
            const newWidth = treeWidth + delta.width;
            if (newWidth < MIN_WIDTH) {
                setTreeWidth(MIN_WIDTH);
            }
            else if (newWidth > MAX_WIDTH) {
                setTreeWidth(MAX_WIDTH);
            }
            else {
                setTreeWidth(newWidth);
            }
            setResizeStart(false);
            const id = setTimeout(() => {
                setHandleActive(false);
                setTimeoutId(null);
            }, 0);
            setTimeoutId(id);
        }
    }, [resizeStart, setTreeWidth, MIN_WIDTH, MAX_WIDTH, treeWidth]);

    useEffect(() => {
        saveData(moduleStore.name + ".treeWidth", treeWidth);
    }, [moduleStore, treeWidth]);

    return (
        <Resizable
            minWidth={MIN_WIDTH} maxWidth={MAX_WIDTH}
            size={{ width: treeWidth, height: MAX_HEIGHT }}
            onResize={onResize}
            onResizeStop={(event, direction, elementRef, delta) => onResizeStop(delta)}
            handleComponent={{
                right: 
                    <CustomResizeHandle 
                        active={handleActive} setActive={setHandleActive}
                        MAX_HEIGHT={MAX_HEIGHT} resizeStart={resizeStart}
                        timeoutId={timeoutId} setTimeoutId={setTimeoutId}
                    />
            }}
            handleClasses={{
                top: "pointer-events-none",
                bottom: "pointer-events-none",
                left: "pointer-events-none",
                topRight: "pointer-events-none",
                bottomRight: "pointer-events-none",
                bottomLeft: "pointer-events-none",
                topLeft: "pointer-events-none",
            }}
            handleStyles={{
                right: {
                    width: '4px',
                    backgroundColor: 'transparent',
                    cursor: 'e-resize',
                },
            }}
        >
            {children}
        </Resizable>
    );
};

export const getPageDimension = (moduleStore, windowSize) => {
    return ({
        INITIAL_WIDTH: getDataSafely(moduleStore.name + ".treeWidth", windowSize.width * 0.2),
        MIN_WIDTH: 0,
        MAX_WIDTH: windowSize.width * 0.5,
        MAX_HEIGHT: (windowSize.height - 108),
    });
};


const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));

const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 260 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

export function CustomToolbar() {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuTriggerRef = useRef(null);

  return (
    <Toolbar>
      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Export">
        <ToolbarButton
          ref={exportMenuTriggerRef}
          id="export-menu-trigger"
          aria-controls="export-menu"
          aria-haspopup="true"
          aria-expanded={exportMenuOpen ? 'true' : undefined}
          onClick={() => setExportMenuOpen(true)}
        >
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>

      <Menu
        id="export-menu"
        anchorEl={exportMenuTriggerRef.current}
        open={exportMenuOpen}
        onClose={() => setExportMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            'aria-labelledby': 'export-menu-trigger',
          },
        }}
      >
        <ExportPrint render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
          Print
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportMenuOpen(false)}>
          Download as CSV
        </ExportCsv>
        {/* Available to MUI X Premium users */}
        {/* <ExportExcel render={<MenuItem />}>
           Download as Excel
          </ExportExcel> */}
      </Menu>

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <StyledToolbarButton
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledToolbarButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledTextField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Clear search"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}
