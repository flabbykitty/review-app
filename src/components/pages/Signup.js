import React, { useRef, useContext, useState } from 'react'
import { Form, Button, Col, Row, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'

const Signup = () => {

    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfRef = useRef()

    const [error, setError] = useState(null)

    const { signup } = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError(null)

        if(passwordRef.current.value !== passwordConfRef.current.value) {
            //set error and return
            return setError('The passwords does not match')
        }

        try {
            await signup(emailRef.current.value, passwordRef.current.value)
            navigate('/')
        }
        catch(error) {
            setError(error.message)
        }        
    }


    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }} md={{ span: 6, offset: 3}} xl={{ span: 4, offset: 4 }}>
                <Form onSubmit={handleSubmit}>

                    {error && (<Alert variant="danger">{error}</Alert>)}
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" ref={emailRef} placeholder="Enter email" />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" ref={passwordRef} placeholder="Password" />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Password confirmation</Form.Label>
                        <Form.Control type="password" ref={passwordConfRef} placeholder="Password confirmation" />
                    </Form.Group>

                    <Button variant="primary" type="submit">Sign up</Button>
                </Form>
            </Col>
        </Row>
    )
}

export default Signup
