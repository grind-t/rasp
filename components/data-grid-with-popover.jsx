import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";

export default function DataGridWithPopover(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [value, setValue] = React.useState("");

  const handlePopoverOpen = (event) => {
    const field = event.currentTarget.dataset.field;
    const id = Number.parseInt(event.currentTarget.parentElement.dataset.id);
    const row = props.rows.find((r) => r.id === id);
    setValue(row[field]);
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <DataGrid
        {...props}
        componentsProps={{
          cell: {
            onMouseEnter: handlePopoverOpen,
            onMouseLeave: handlePopoverClose,
          },
        }}
      />
      <Popover
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>{value}</Typography>
      </Popover>
    </div>
  );
}
