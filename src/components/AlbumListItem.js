import React from 'react'
import { Link } from 'react-router-dom'

const AlbumListItem = (props) => {
    return (
        <li>
            <Link to={`/album/${props.album.id}`}>{props.album.title}</Link>      
        </li>
    )
}

export default AlbumListItem
