import React, { useCallback, useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams, useNavigate } from 'react-router-dom'
import { db, storage } from '../../firebase/index'
import { Alert, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap'
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
    const [link, setLink] = useState(null)

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
            // TODO: Set error message if the image is already in that album, not just in storage
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
        const url = e.target.attributes.target.textContent

        if(selectedImages.includes(url)) {
            setSelectedImages(selectedImages.filter(image => image !== url))
        } else {
            setSelectedImages(prev => [...prev, url])     
        }
    }

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }}>

            {loading 
                ? (<Spinner animation="border" />) 
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
                                    <div className="grid">
                                    {images.map(image => (
                                        <Card key={image.name}>
                                            <Card.Img variant="top" src={image.url} />
                                            <Card.Body>
                                                <Card.Title>{image.name}</Card.Title>
                                                <div className="d-flex justify-content-between">
                                                    <input target={image.url} onClick={handleSelectedImages} type="checkbox"/>
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
                        <div className="mt-4">
                            <Button className="mr-3" variant="primary" type="submit">Save</Button>
                            {selectedImages.length > 0 && (<Button className="mr-3" variant="primary" onClick={handleNewAlbum}>Create new album</Button>)}
                            <Button type="button" onClick={() => setLink(`${window.location.origin}/review/${albumId}`)}>Get link</Button>
                        </div>
                        
                        {link && (
                            <div className="d-inline-block bg-light p-2 mt-3">
                                <code>{link}</code>
                            </div>
                        )}
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Album