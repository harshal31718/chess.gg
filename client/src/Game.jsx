import { useState, useMemo, useCallback, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import socket from './socket'
import CustomDialog from './components/CustomDialog'
import PlayerInfo from './components/PlayerInfo'

const Game = ({ room, orientation, username, players, cleanup }) => {
    const chess = useMemo(() => new Chess(), []); // The useMemo hook lets us cache the chess instance between re-renders so that the instance is not created on every re-render.
    const [fen, setFen] = useState(chess.fen()); // FEN is a standard notation to describe the positions of a chess game.
    const [over, setOver] = useState("");
    const [logHistory, setLogHistory] = useState([]);

    // This function will pass moveData to the Chess instance for validation and generation. 
    const makeAMove = useCallback((move) => {
        try {
            const result = chess.move(move);
            setFen(chess.fen());

            if (chess.isGameOver()) {
                if (chess.isCheckmate()) { setOver(`Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`); }
                else if (chess.isDraw()) { setOver("Draw"); }
                else { setOver("Game Over"); }
            }
            return result;
        } catch (e) { return null; }

    }, [chess]);

    // function to trigger after peicedrop
    function onDrop(sourceSquare, targetSquare) {
        if (chess.turn() !== orientation[0]) return false;
        if (players.length < 2) return false;

        const moveData = {
            color: chess.turn(),
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // promote to queen where possible
        }

        const move = makeAMove(moveData);

        if (move === null) return false;
        else {
            socket.emit("move", { move, room });
            setLogHistory([...logHistory, { color: moveData.color, from: moveData.from, to: moveData.to }]);
            console.log("0");
            console.log(logHistory);
        }
        return true;
    }

    useEffect(() => {
        socket.on("move", (move) => {
            makeAMove(move);
            setLogHistory([...logHistory, { color: move.color, from: move.from, to: move.to }]);
            console.log(1);
            console.log(logHistory);
        })
    }, [makeAMove, logHistory]);

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
            <div className='row justify-content-center'>
                <div className='board col m-2 p-0' style={{ minWidth: "300px", maxWidth: "500px" }}>   {/* need to make responsive min and max width */}
                    {players.length > 0 ? (
                        <PlayerInfo id="1" username={username === players[1].username ? players[0].username : players[1].username} />
                    ) : (<h5>waiting...</h5>)}
                    <Chessboard position={fen} onPieceDrop={onDrop} boardOrientation={orientation} />
                    <PlayerInfo id="2" username={username} />
                </div>
                <div className='board m-2 p-0 col-auto text-white bg-dark bg-opacity-50' style={{ minWidth: "300px", maxWidth: "500px", maxHeight: "600px" }}>
                    <h6 className='m-0 p-2'>Room Id: <small>{room}</small></h6>
                    <h6 className='bg-dark bg-opacity-75 m-0 p-2'>Log History</h6>
                    <div className='overflow-auto h-75 m-0 p-0'>
                        <ul class="list-group">
                            {logHistory.length > 0 && (logHistory.map(({ color, from, to }, index) => (
                                <li class="list-group-item bg-dark bg-opacity-75 text-white">{index + 1}. {color == "w" ? "White: " : "Black :"}  {from}  {to}</li>
                            )))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* {players.length > 0 && (
                <Box>
                    <List>
                        <ListSubheader>Players</ListSubheader>
                        {players.map((p) => (
                            <ListItem key={p.id}>
                                <ListItemText primary={p.username} />
                            </ListItem>
                        ))}
                    </List>
                </Box>)} */}
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