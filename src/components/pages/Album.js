import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams } from 'react-router-dom'
import { db, storage } from '../../firebase/index'
import { Alert, Row, Col, Image, Form, Button } from 'react-bootstrap'
import { AuthContext } from '../../contexts/AuthContext'
import firebase from 'firebase/app'

// TODO: Make component smaller

const Album = () => {
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const [tempImages, setTempImages] = useState([])
    const [error, setError] = useState(null)

    const { albumId } = useParams()
    const { currentUser } = useContext(AuthContext)

    useEffect(() => {
        db.collection("albums").doc(albumId).get()
        .then(doc => {
            if (doc.exists) {
                setTitle(doc.data().title)
                setDescription(doc.data().description)
                setTempImages(doc.data().images)
            } else {
                // TODO: Show only error if album does not exist
                setError('This album does not exist!')
            }
        }).catch(error => {
            setError(error);
        });
    }, [])

    
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach(image => {
            // TODO: What even is this?? SQUASH THIS BUG!
            if(currentUser) {
                uploadImageToStorage(image)
            } else {
                setError('No user?')
            }
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        await db.collection('albums').doc(albumId).update({
            title,
            description,
            images: firebase.firestore.FieldValue.arrayUnion(...tempImages)
        });
    }

    const uploadImageToStorage = (image) => {
        const storageRef = storage.ref(`images/${currentUser.uid}/${albumId}/${image.name}`);

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
            setTempImages(prev => ([...prev, img]))
        })
        .catch(error => {
            setError(error)
        })
    }

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }}>

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

                    {tempImages ? (
                        <>
                        {tempImages.length > 0 
                        ? (
                            <>
                            {tempImages.map(image => (
                                <Image src={image.url} fluid className="mb-3"/>
                            ))}
                            </>
                        ) 
                        : (
                            <p>There are no images in this album yet...</p>
                        )}
                        </>
                    )
                    : (<p>Loading...</p>)}

                    <Button variant="primary" type="submit">Save</Button>
                </Form>
            </Col>
        </Row>
    )
}

export default Album