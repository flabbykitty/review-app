import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams } from 'react-router-dom'
import { db, storage } from '../../firebase/index'
import {Alert, Row, Col} from 'react-bootstrap'
import {AuthContext} from '../../contexts/AuthContext'
import firebase from 'firebase/app'

// TODO: Make component smaller

const Album = () => {
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const [images, setImages] = useState(null)
    const [error, setError] = useState(null)

    const { albumId } = useParams()
    const { currentUser } = useContext(AuthContext)

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
        }).catch(error => {
            setError(error);
        });
    }, [])

    
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach(image => {
            // TODO: What even is this??
            if(currentUser) {
                uploadImageToStorage(image)
            } else {
                setError('No user?')
            }
        })
    }, [])

    const uploadImageToStorage = (image) => {
        const storageRef = storage.ref(`images/${currentUser.uid}/${image.name}`);

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

            await db.collection('albums').doc(albumId).update({
                images: firebase.firestore.FieldValue.arrayUnion(img)
            });
        })
    }
    
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }}>
                {error && (<Alert variant="danger">{error}</Alert>)}
                <h1>{title}</h1>
                <p>{description}</p>
                <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag 'n' drop some files here, or click to select files</p>
                    }
                </div>

                {/* TODO: make images look nice... and make loading better, what if there are no images? Make them show up instantly  */}

                {images ? (
                    <>
                    {images.map(image => (
                        <img key={image.name} src={image.url}/>
                    ))}
                    </>
                )
                : (<p>Loading...</p>)}

                {/* TODO: Add form */}
            </Col>
        </Row>
    )
}

export default Album