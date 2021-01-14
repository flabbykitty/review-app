import React from 'react'
import { Row, Alert, Col, Form, Image } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import useAlbum from '../../hooks/useAlbum'

const Review = () => {
    const { albumId } = useParams()
    const {title, description, images, error, setError, loading} = useAlbum(albumId)

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
                                <div className="grid">
                                {images.map(image => (
                                    <div key={image.name} className="image-container">
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
                    </Form>
                )}

            </Col>
        </Row>
    )
}

export default Review
