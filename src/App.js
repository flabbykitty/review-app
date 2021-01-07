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
import AddAlbum from './components/pages/AddAlbum'
import Album from './components/pages/Album'
import Albums from './components/pages/Albums'

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

						<Route path="/add-album">
							<AddAlbum/>
						</Route>

						<Route path="/album/:albumId">
							<Album/>
						</Route>

						<Route path="/albums">
							<Albums/>
						</Route>
						
					</Routes>

				</Container>

			</AuthContextProvider>

		</BrowserRouter>
	)
}

export default App

