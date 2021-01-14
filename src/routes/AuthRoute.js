import React, { useContext } from 'react'
import { Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

const AuthRoute = (props) => {
    const { currentUser } = useContext(AuthContext)
    return (
        <>
        {currentUser
        ? (<Route {...props}/>)
        : (<Navigate to="/login"/>)
        }
        </>
    )
}

export default AuthRoute
