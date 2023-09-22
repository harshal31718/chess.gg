import React, { useState } from 'react'
import { Button, TextField } from "@mui/material"
import CustomDialog from './components/CustomDialog'
import socket from './socket'

const InitGame = ({ setRoom, setOrientation, setPlayers }) => {
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [roomInput, setRoomInput] = useState('');
    const [roomError, setRoomError] = useState('');

    return (
        <div>
            <CustomDialog open={roomDialogOpen}
                handleClose={() => setRoomDialogOpen(false)}
                title="Select Room to Join"
                contentText="Enter a valid room ID to join the room"
                handleContinue={() => {
                    if (!roomInput) return;
                    socket.emit("joinRoom", { roomId: roomInput }, (r) => {
                        if (r.error) return setRoomError(r.message);
                        setRoom(r?.roomId);
                        setPlayers(r?.players);
                        setOrientation("black");
                        setRoomDialogOpen(false);
                    });
                }}
            >
                <TextField
                    autoFocus
                    margin="dense"
                    id="room"
                    label="Room ID"
                    name="room"
                    value={roomInput}
                    required
                    onChange={(e) => setRoomInput(e.target.value)}
                    type="text"
                    fullWidth
                    variant="standard"
                    error={Boolean(roomError)}
                    helperText={!roomError ? 'Enter a room ID' : `Invalid room ID: ${roomError}`}
                />
            </CustomDialog>

            {/* Button for starting a game */}
            <Button variant="contained"
                onClick={() => {
                    socket.emit("createRoom", (r) => {
                        setRoom(r);
                        setOrientation("white");
                    })
                }}
            >
                Start a game
            </Button>

            {/* Button for joining a game */}
            <Button
                onClick={() => {
                    setRoomDialogOpen(true);
                }}
            >
                Join a game
            </Button>
        </div>
    )
}

export default InitGame