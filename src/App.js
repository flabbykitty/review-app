import './assets/style.scss';
import {BrowserRouter, Route, Routes, } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import AuthContextProvider from './contexts/AuthContext'

//Compontens
import Home from './components/pages/Home'
import Navigation from './components/navigation/Navigation'
import Login from './components/pages/Login'
import Logout from './components/Logout'
import Signup from './components/pages/Signup'

const App = () => {
	return (
		<BrowserRouter>

			<AuthContextProvider>

				<Navigation/>

				<Container>

					<Routes>
						<Route path="/">
							<Home/>
						</Route>

						<Route path="/login">
							<Login/>
						</Route>

						<Route path="/logout">
							<Logout/>
						</Route>

						<Route path="/signup">
							<Signup/>
						</Route>
						
					</Routes>

				</Container>

			</AuthContextProvider>
			
		</BrowserRouter>
	)
}

export default App

