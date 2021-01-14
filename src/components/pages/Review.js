import React, {useState, useEffect} from 'react'
import { Row, Alert, Col, Form, Card, Button } from 'react-bootstrap'
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
        if(images.length > 0) {
            const checkArray = ratingArray.filter(image => image.rating !== null)
            if(checkArray.length === images.length) {
                setReady(true)
            }
        }
    }, [ratingArray])

    const handleRating = async (e) => {
        console.log(e.target.class)
        if(e.target.attributes.rating.textContent === "up") {
            setRatingArray(ratingArray.map((img) => img.imagePath === e.target.attributes.image.textContent ? { ...img, rating: true } : img));

        } else if(e.target.attributes.rating.textContent === "down") {
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
                ? (<p>Loading...</p>) 
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
                                                        <Button image={image.path} rating="up"onClick={handleRating} variant="primary">👍</Button>
                                                        <Button image={image.path} rating="down" onClick={handleRating} variant="primary">👎</Button>
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
                        : (<p>Loading...</p>)}
                        {ready && (<Button onClick={handleSend}>Save</Button>)}
                        
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Review
