import { useState, useEffect } from 'react'
import { db } from '../firebase/index'

const useAlbum = (albumId) => {
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const [images, setImages] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        db.collection("albums").doc(albumId).get()
    .then(doc => {
        if (doc.exists) {
            setTitle(doc.data().title)
            setDescription(doc.data().description)
            setImages(doc.data().images)
        } else {
            setError('This album does not exist!')
        }
        setLoading(false)
    }).catch(error => {
        setError(error);
    });

    }, [albumId])

    return {title, setTitle, description, setDescription, images, setImages, error, setError, loading}
}

export default useAlbum
