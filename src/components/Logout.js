import React, { useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Alert } from 'react-bootstrap'
import { AuthContext } from '../contexts/AuthContext'

const Logout = () => {
    const { logout } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(async () => {
        await logout()
        navigate('/')
    }, [])

    return (
        <Row>
            <Col xs={{ span: 10, offset: 1 }} md={{ span: 6, offset: 3}} xl={{ span: 4, offset: 4 }}>
                <Alert variant="primary">You are being logged out</Alert>
            </Col>
        </Row>
    )
}

export default Logout
