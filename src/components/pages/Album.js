import React, { useCallback, useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams, useNavigate } from 'react-router-dom'
import { db, storage } from '../../firebase/index'
import { Alert, Row, Col, Image, Form, Button } from 'react-bootstrap'
import { AuthContext } from '../../contexts/AuthContext'
import firebase from 'firebase/app'
import useAlbum from '../../hooks/useAlbum'

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

        storageRef.getMetadata()
        .then(() => {
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
        .then(async docRef => {
            await selectedImages.forEach(image => {
                const ref = storage.refFromURL(image)
                uploadImageToStorage(ref, docRef.id)
            })
            navigate(`/album/${docRef.id}`)
        })
        .catch(error => {
            setError(error)
        });

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
                                <div className="grid">
                                {images.map(image => (
                                    <div key={image.name} className="image-container">
                                        <span onClick={e => setSelectedImages(prev => [...prev, e.target.parentElement.children[1].src])} className="add">+</span>
                                        <Image src={image.url} fluid/>
                                    </div>
                                ))}
                                </div>
                            ) 
                            : (
                                <p>There are no images in this album yet...</p>
                            )}
                            </>
                        )
                        : (<p>Loading...</p>)}

                        <Button variant="primary" type="submit">Save</Button>
                        {selectedImages.length > 0 && (<Button variant="primary" onClick={handleNewAlbum}>Create new album</Button>)}
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Album