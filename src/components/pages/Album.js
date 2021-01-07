import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useParams } from 'react-router-dom'
import { db } from '../../firebase/index'
import {Alert, Row, Col} from 'react-bootstrap'

const Album = () => {
    const [title, setTitle] = useState(null)
    const [description, setDescription] = useState(null)
    const [error, setError] = useState(null)

    const { albumId } = useParams()

    useEffect(() => {
        // Get info from db
        db.collection("albums").doc(albumId).get()
        .then(doc => {
            if (doc.exists) {
                setTitle(doc.data().title)
                setDescription(doc.data().description)
            } else {
                setError('This album does not exist!')
            }
        }).catch(error => {
            setError(error);
        });
    }, [])

    
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach(image => {
            console.log(image)
            //TODO: Upload to storage
        })
    }, [])
    
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

                {/* TODO: Add form */}
            </Col>
        </Row>
    )
}

export default Album