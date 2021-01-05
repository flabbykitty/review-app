import React from 'react'
import {Container, Nav, Navbar} from 'react-bootstrap'
import {NavLink, Link} from 'react-router-dom'

const Navigation = () => {

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-5 py-3">
            <Container>
                <Link to="/">Review App</Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <NavLink className="mr-3" to="/login">Login</NavLink>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Navigation
