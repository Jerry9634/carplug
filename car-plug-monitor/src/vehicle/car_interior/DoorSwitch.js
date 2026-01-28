import IconButton from "@mui/material/IconButton";


const DoorSwitch = ({
    doorOpen, pressSwitch, doorOpenImage, doorClosedImage
}) => {

    return (
        <IconButton onClick={pressSwitch} sx={{ bgcolor: "#000000", opacity: 0.8, padding: 0 }}>
            <img src={doorOpen ? doorOpenImage : doorClosedImage}  alt=""
                style={{ width: 33, height: 48 }}
            />
        </IconButton>
    );
};

export default DoorSwitch;