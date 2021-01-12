import React, { useCallback, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams } from 'react-router-dom'
import { db, storage } from '../../firebase/index'
import { Alert, Row, Col, Image, Form, Button } from 'react-bootstrap'
import { AuthContext } from '../../contexts/AuthContext'
import firebase from 'firebase/app'
import useAlbum from '../../hooks/useAlbum'

// TODO: Make component smaller

const Album = () => {
    const { albumId } = useParams()
    const { currentUser } = useContext(AuthContext)

    const {title, setTitle, description, setDescription, images, setImages, error, setError, loading} = useAlbum(albumId)
    
    const onDrop = useCallback(acceptedFiles => {
        setError(null)
        acceptedFiles.forEach(image => {
            uploadImage(image)
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

    const uploadImage = (image) => {
        const storageRef = storage.ref(`images/${currentUser.uid}/${albumId}/${image.name}`);

        storageRef.getMetadata()
            .then(() => setError('This image already is in the album'))
            .catch(() => {
                const uploadTask = storageRef.put(image);
        
                uploadTask.then(async(snapshot) => {
                    const url = await snapshot.ref.getDownloadURL();
        
                    const img = {
                        name: image.name,
                        path: snapshot.ref.fullPath,
                        size: image.size,
                        type: image.type,
                        url,
                    };

                    db.collection('albums').doc(albumId).update({
                        images: firebase.firestore.FieldValue.arrayUnion(img)
                    })
                    .then(async() => {
                        db.collection("albums").doc(albumId).get()
                        .then(doc => {
                            setImages(doc.data().images)
                        })
                        .catch(error => {
                            setError(error)
                        })
                    });

                })
                .catch(error => {
                    setError(error)
                })
            })
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
                                {/* TODO: What should I give as key? */}
                                {images.map(image => (
                                    <Image src={image.url} fluid/>
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
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Album