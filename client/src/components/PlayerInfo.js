import React from 'react'
import ReactCountryFlag from "react-country-flag"

const PlayerInfo = ({id,username}) => {
    return (
        <div className="d-flex align-items-center text-white bg-dark bg-opacity-50" style={{ maxHeight: "50px" }}>
            <img src={`https://robohash.org/${id}?50x50`}
                alt='profile'
                style={{
                    width: "40px",
                    height: "40px"
                }}
            />
            <div className='p-1'>
                <div>
                    <span>{username}</span>
                    <span> (1200) </span>
                    <ReactCountryFlag countryCode="IN" svg />
                </div>
                <div>
                    Collected Piece
                </div>
            </div>
        </div>
    )
}

export default PlayerInfo