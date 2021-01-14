import React, {useState, useEffect} from 'react'
import { Row, Alert, Col, Form, Card, Button, Spinner } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import useAlbum from '../../hooks/useAlbum'
import { SRLWrapper } from 'simple-react-lightbox'
import { db, storage} from '../../firebase/index'
import firebase from 'firebase/app'

// TODO: MAKE IT DRYYYY, MAKE IT BETTERRR

const Review = () => {
    const { albumId } = useParams()
    const {title, description, images, setImages, error, loading, owner} = useAlbum(albumId)
    const [ratingArray, setRatingArray] = useState([])
    const [ready, setReady] = useState(false)
    
    useEffect(() => {
        images.forEach(image => {
            setRatingArray(prev => [...prev, {imagePath: image.path, rating: null}])
        })
    }, [images])

    useEffect(() => {
        // TODO: Fix bug that sometimes the save button doesn't show up although all pictures have been rated...
        if(images.length > 0) {
            const checkArray = ratingArray.filter(image => image.rating !== null)
            if(checkArray.length === images.length) {
                setReady(true)
            }
        }
    }, [ratingArray])

    // Such hacker. Much wow.
    const handleRating = async (e) => {
        if(e.target.attributes.rating.textContent === "up") {
            if(!e.target.classList.contains('btn-sucess')) {
                e.target.classList.add('btn-success')
                e.target.parentElement.lastChild.classList.remove('btn-danger')
            }

            setRatingArray(ratingArray.map((img) => img.imagePath === e.target.attributes.image.textContent ? { ...img, rating: true } : img));

        } else if(e.target.attributes.rating.textContent === "down") {
            if(!e.target.classList.contains('btn-danger')) {
                e.target.classList.add('btn-danger')
                e.target.parentElement.firstChild.classList.remove('btn-success')
            }

            setRatingArray(ratingArray.map((img) => img.imagePath === e.target.attributes.image.textContent ? { ...img, rating: false } : img));
        }
    }

    // TODO: Fix bug where after sending it, it shows the images that were chosen
    const handleSend = () => {
        const newArray = ratingArray.filter(image => image.rating === true)
        const date = new Date()
        const timestamp = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

        db.collection("albums").add({
            title: `${title}_reviewed_${timestamp}`,
            owner,
            description,
            images: []
        })
        .then(docRef => {
            newArray.forEach(image => {
                const storageRef = storage.ref(image.imagePath)

                storageRef.getMetadata().then((metadata) => {
                    const img = {
                        name: metadata.name,
                        path: metadata.fullPath,
                        size: metadata.size,
                        type: metadata.type,
                        url: metadata.customMetadata.url,
                    }

                    addImageToDb(img, docRef.id)
                })
            })
        })
        .catch(error => {
            setError(error)
        });

        // TODO: Set some kind of alert thank you, this is now sent or whatever

    }

    const addImageToDb = (img, id) => {
        db.collection('albums').doc(id).update({
            images: firebase.firestore.FieldValue.arrayUnion(img)
        })
        .then(async() => {
            db.collection("albums").doc(id).get()
            .then(doc => {
                setImages(doc.data().images)
            })
            .catch(error => {
                setError(error)
            })
        });
    }

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }}>

            {loading 
                ? (<Spinner animation="border" />) 
                : (
                    <Form>
                        {error && (<Alert variant="danger">{error}</Alert>)}

                        <h1>{title}</h1>
                        <p>{description}</p>

                        {images ? (
                            <>
                            {images.length > 0 
                            ? ( 
                                <SRLWrapper>
                                    <div className="grid">
                                    {images.map(image => (
                                            <Card key={image.name}>
                                                <Card.Img variant="top" src={image.url} />
                                                <Card.Body>
                                                    <Card.Title>{image.name}</Card.Title>
                                                    <div className="d-flex justify-content-between">
                                                        <Button image={image.path} rating="up"onClick={handleRating} variant="white">👍</Button>
                                                        <Button image={image.path} rating="down" onClick={handleRating} variant="white">👎</Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                    ))}
                                    </div>
                                </SRLWrapper>
                            ) 
                            : (
                                <p>There are no images in this album</p>
                            )}
                            </>
                        )
                        : (<Spinner animation="border" />)}
                        {ready && (<Button className="mt-4" onClick={handleSend}>Save</Button>)}
                        
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Review
