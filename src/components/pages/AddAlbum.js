import React, { useState, useRef, useContext } from 'react'
import { Row, Col, Form, Button, Alert } from 'react-bootstrap'
import { db } from '../../firebase/index'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const AddAlbum = () => {
    const [error, setError] = useState(null)
    const titleRef = useRef()
    const descriptionRef = useRef()
    const navigate = useNavigate()

    const { currentUser } = useContext(AuthContext)

      const handleSubmit = (e) => {
        e.preventDefault()

        // Create a new album
        db.collection("albums").add({
            title: titleRef.current.value,
            owner: currentUser.uid,
            description: descriptionRef.current.value,
        })
        .then(docRef => {
            // navigate to the album, where you can add the images
            navigate(`/album/${docRef.id}`)
        })
        .catch(error => {
            setError(error)
        });
      }


    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }} md={{ span: 6, offset: 3}} xl={{ span: 4, offset: 4 }}>
                <Form onSubmit={handleSubmit}>
                    {error && (<Alert variant="danger">{error}</Alert>)}
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" ref={titleRef} placeholder="Enter title of album" />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" ref={descriptionRef} placeholder="Enter description of album" />
                    </Form.Group>

                    <Button variant="primary" type="submit">Create album</Button>

                </Form>
            </Col>
        </Row>
    )
}

export default AddAlbum
