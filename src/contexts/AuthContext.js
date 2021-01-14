import { createContext, useState, useEffect } from 'react'
import { auth } from '../firebase/index'
import { Spinner } from 'react-bootstrap'

const AuthContext = createContext()

const AuthContextProvider = (props) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const signup = (email, password) => {
        return auth.createUserWithEmailAndPassword(email, password)
    }

    const login = (email, password) => {
        return auth.signInWithEmailAndPassword(email, password)
    }

    const logout = () => {
        return auth.signOut()
    }

    //set the current user on change
    useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(user => {
			setCurrentUser(user)
			setLoading(false)
		})

		return unsubscribe
	}, [])

    const contextValues = {
        currentUser,
        loading,
        login,
        logout,
        signup,
    }

    return (
        <AuthContext.Provider value={contextValues}>
			{loading && (<Spinner animation="border" />)}
			{!loading && props.children}
		</AuthContext.Provider>
    )
}

export { AuthContext, AuthContextProvider as default }