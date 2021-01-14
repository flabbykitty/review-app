import React, { useEffect, useContext, useState } from 'react'
import { db } from '../../firebase/index'
import { AuthContext } from '../../contexts/AuthContext'
import AlbumListItem from '../AlbumListItem'
import { Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'

const Albums = () => {
    const { currentUser } = useContext(AuthContext)
    const [albums, setAlbums] = useState([])
    
    // Get all the albums that the user owns
    useEffect(() => {
        if(currentUser) {
            let albumsArray = []
            db.collection("albums").where("owner", "==", currentUser.uid).get()
            .then(snap => {
                snap.forEach(doc => {
                    albumsArray.push({
                        id: doc.id,
                        ...doc.data()
                    })
                })

                setAlbums(albumsArray)
            })
        }
    }, [currentUser])

    return (
        <div>
            {albums.length > 0
            ? (
                <ul>
                    {albums.map(album => (
                        <AlbumListItem album={album} key={album.id} />
                    ))}
                </ul>
            )
            : (<p>You have no albums yet. Add one <Link to="/add-album">here</Link>.</p>)
            }
        </div>
    )
}

export default Albums
