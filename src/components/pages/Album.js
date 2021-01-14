import React, { useCallback, useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams, useNavigate } from 'react-router-dom'
import { db, storage } from '../../firebase/index'
import { Alert, Row, Col, Card, Form, Button } from 'react-bootstrap'
import { AuthContext } from '../../contexts/AuthContext'
import firebase from 'firebase/app'
import useAlbum from '../../hooks/useAlbum'
import { SRLWrapper } from 'simple-react-lightbox'

// TODO: Make component smaller

const Album = () => {
    const { albumId } = useParams()
    const { currentUser } = useContext(AuthContext)
    const navigate = useNavigate()

    const [selectedImages, setSelectedImages] = useState([])

    const {title, setTitle, description, setDescription, images, setImages, error, setError, loading} = useAlbum(albumId)
    
    const onDrop = useCallback(acceptedFiles => {
        setError(null)
        acceptedFiles.forEach(image => {
            // TODO: Squash strange bug that get's the old albums images (??) when adding new image directly after creating a new album from selected imaged??
            uploadImageToStorage(image, albumId)
        })
    }, [])

    const handleSubmit = async (e) => {
        setError(null)
        e.preventDefault()
        await db.collection('albums').doc(albumId).update({
            title,
            description,
        });
    }

    const uploadImageToStorage = async (image, id) => {
        let storageRef = storage.ref(`images/${currentUser.uid}/${image.name}`)

        // Check if the ref already exists
        storageRef.getMetadata()
        .then(() => {
            // TODO: This error shows after creating a new album from selected images, make it not so
            // Currently it shows just because the image is already in storage, I just wanna show it when it's not in the album... 
            setError('This image is already in the album')
            // If the ref already exists:
            storageRef.getMetadata().then((metadata) => {
                const img = {
                    name: metadata.name,
                    path: metadata.fullPath,
                    size: metadata.size,
                    type: metadata.type,
                    url: metadata.customMetadata.url,
                };
    
                addImageToDb(img, id)
            })
        })
        .catch(() => {
            // If the ref does not exist:
            const uploadTask = storageRef.put(image);

            uploadTask.then(async() => {
                const url = await storageRef.getDownloadURL()
                const newMetadata = {
                    customMetadata : {
                        url
                    }
                }
    
                storageRef.updateMetadata(newMetadata).then(metadata => {
                    const img = {
                        name: metadata.name,
                        path: metadata.fullPath,
                        size: metadata.size,
                        type: metadata.type,
                        url: metadata.customMetadata.url,
                    };

                    addImageToDb(img, id)
                })
                .catch(error => {
                    setError(error)
                })
            }) 
        })
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

    const handleNewAlbum = () => {
        db.collection("albums").add({
            title: 'New album',
            owner: currentUser.uid,
            description: 'New description',
            images: []
        })
        .then(docRef => {
            selectedImages.forEach(image => {
                const ref = storage.refFromURL(image)
                uploadImageToStorage(ref, docRef.id)
            })
            setSelectedImages([])
            navigate(`/album/${docRef.id}`)
        })
        .catch(error => {
            setError(error)
        });
    }

    const handleSelectedImages = (e) => {
        // TODO: I wanna be able to deselect images also...
        setSelectedImages(prev => [...prev, e.target.attributes.target.textContent])
        // TODO: Change the + to a tick, and change color to green
    }

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }}>

            {loading 
                ? (<p>Loading...</p>) 
                : (
                    <Form onSubmit={handleSubmit}>
                        {error && (<Alert variant="danger">{error}</Alert>)}
                        {/* TODO: Set save success */}

                        <Form.Group>
                            <Form.Control className="title-input" type="text" onChange={e => setTitle(e.target.value)} value={title} />
                        </Form.Group>

                        <Form.Group>
                            <Form.Control className="description-input" type="text" onChange={e => setDescription(e.target.value)} value={description} />
                        </Form.Group>

                        <div {...getRootProps()} className="dropzone mb-4">
                            <input {...getInputProps()} />
                            {
                                isDragActive ?
                                <p>Drop the files here ...</p> :
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            }
                        </div>

                        {images ? (
                            <>
                            {images.length > 0 
                            ? (
                                <SRLWrapper>
                                {/* Have I done something here to make it break?? */}
                                    <div className="grid">
                                    {images.map(image => (
                                        <Card key={image.name}>
                                            <Card.Img variant="top" src={image.url} />
                                            <Card.Body>
                                                <Card.Title>{image.name}</Card.Title>
                                                <div className="d-flex justify-content-between">
                                                    <Button target={image.url} onClick={handleSelectedImages} variant="primary">+</Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    </div>
                                </SRLWrapper>
                            ) 
                            : (
                                <p>There are no images in this album yet...</p>
                            )}
                            </>
                        )
                        : (<p>Loading...</p>)}
                        {/* TODO: Remove the save button, and just have it save automatically? Can I do that? */}
                        <div className="mt-4">
                            <Button className="mr-3" variant="primary" type="submit">Save</Button>
                            {selectedImages.length > 0 && (<Button className="mr-3" variant="primary" onClick={handleNewAlbum}>Create new album</Button>)}
                            {/* TODO: Do not redirect to the page, just show the link */}
                            <Button type="button" onClick={() => navigate(`/review/${albumId}`)}>Get link</Button>
                        </div>
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Album