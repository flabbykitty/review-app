import React, { useContext } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink, Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'

const Navigation = () => {

    const { currentUser } = useContext(AuthContext)

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-5 py-3">
            <Container>
                <Link to="/">Review App</Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        {currentUser && 
                            (<Navbar.Text className="mr-3">Signed in as: {currentUser.displayName ? curentUser.displayName : currentUser.email}</Navbar.Text>)}

                        {currentUser 
                            ? 
                            (<>
                                <NavLink to="/logout">Logout</NavLink>
                            </>)
                            : 
                            (<>
                                <NavLink className="mr-3" to="/login">Login</NavLink>
                                <NavLink to="/signup">Signup</NavLink>
                            </>)
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Navigation
