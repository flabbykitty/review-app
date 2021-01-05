import React, { useRef, useState, useContext } from 'react'
import { Alert, Form, Button, Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'

const Login = () => {
    const emailRef = useRef()
    const passwordRef = useRef()
    const [error, setError] = useState(null)

    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError(null)

        try{
            await login(emailRef.current.value, passwordRef.current.value)
            navigate('/')
        }
        catch(error) {
            setError("Could not log in. Please check your email and password.")
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
                    <Button variant="primary" type="submit">Login</Button>
                </Form>
            </Col>
        </Row>
    )
}

export default Login
