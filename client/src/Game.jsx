import { useState, useMemo, useCallback, useEffect } from 'react'
import { Chessboard, chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { List, ListItem, ListItemText, ListSubheader, Box } from "@mui/material";
import CustomDialog from './components/CustomDialog'
import socket from './socket'

const Game = ({ players, room, orientation, cleanup }) => {
    const chess = useMemo(() => new Chess(), []); // The useMemo hook lets us cache the chess instance between re-renders so that the instance is not created on every re-render.
    const [fen, setFen] = useState(chess.fen()); // FEN is a standard notation to describe the positions of a chess game.
    const [over, setOver] = useState("");

    // This function will pass moveData to the Chess instance for validation and generation. 
    const makeAMove = useCallback((move) => {
        try {
            const result = chess.move(move);
            setFen(chess.fen());
            if (chess.isGameOver()) {
                if (chess.isCheckmate()) {
                    setOver(`Checkmate! ${chess.turn() == "w" ? "black" : "white"} wins!`);
                }
                else if (chess.isDraw()) {
                    setOver("Draw");
                }
                else {
                    setOver("Game Over");
                }
            }
            return result;
        } catch (e) {
            return null;
        }

    }, [chess]);


    // function to trigger after peicedrop
    function onDrop(sourceSquare, targetSquare) {
        if (chess.turn() !== orientation[0]) return false;
        if (players.length < 2) return false;

        const moveData = {
            from: sourceSquare,
            to: targetSquare,
            color: chess.turn(),
            promotion: "q", // promote to queen where possible
        }

        const move = makeAMove(moveData);

        socket.emit("move", { move, room });

        if (move === null) return false;
        return true;
    }

    useEffect(() => {
        socket.on("move", (move) => {
            makeAMove(move);
        })
    }, [makeAMove]);

    useEffect(() => {
        socket.on('playerDisconnected', (player) => {
            setOver(`${player.username} has disconnected`); // set game over
        });
    }, []);

    useEffect(() => {
        socket.on('closeRoom', ({ roomId }) => {
            if (roomId === room) {
                cleanup();
            }
        });
    }, [room, cleanup]);


    return (
        <div className='container'>
            <div className='row card'>
                <h5>Room Id: <span>{room}</span></h5>
            </div>
            <div className='row justify-content-center'>
                <div className='board m-2 p-0 col' style={{ minWidth: "300px", maxWidth: "500px" }}>   {/* need to make responsive min and max width */}
                    <Chessboard position={fen} onPieceDrop={onDrop} />
                </div>
                {/* <div className='board m-2 p-0 col-auto bg-dark' style={{ minWidth: "300px", maxWidth: "500px", maxHeight: "500px" }}>
                    Itp-2It is a long established fen
                </div> */}
            </div>
            {players.length > 0 && (
                <Box>
                    <List>
                        <ListSubheader>Players</ListSubheader>
                        {players.map((p) => (
                            <ListItem key={p.id}>
                                <ListItemText primary={p.username} />
                            </ListItem>
                        ))}
                    </List>
                </Box>)}
            <CustomDialog
                open={Boolean(over)}
                title={over}
                contentText={over}
                handleContinue={() => {
                    socket.emit("closeRoom", { roomId: room });
                    cleanup();
                }}
            />
        </div>
    )
}

export default Game