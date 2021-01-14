import './assets/style.scss';
import {BrowserRouter, Route, Routes, } from 'react-router-dom'
import { Container } from 'react-bootstrap';
import AuthContextProvider from './contexts/AuthContext'
import AuthRoute from './routes/AuthRoute'
import SimpleReactLightbox from 'simple-react-lightbox'

//Compontens
import Home from './components/pages/Home'
import Navigation from './components/navigation/Navigation'
import Login from './components/pages/Login'
import Logout from './components/Logout'
import Signup from './components/pages/Signup'
import AddAlbum from './components/pages/AddAlbum'
import Album from './components/pages/Album'
import Albums from './components/pages/Albums'
import Review from './components/pages/Review'

const App = () => {
	return (
		<BrowserRouter>

			<AuthContextProvider>

				<SimpleReactLightbox>

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
							
							<AuthRoute path="/add-album">
								<AddAlbum/>
							</AuthRoute>

							<AuthRoute path="/album/:albumId">
								<Album/>
							</AuthRoute>

							<AuthRoute path="/albums">
								<Albums/>
							</AuthRoute>

							<Route path="/review/:albumId">
								<Review/>
							</Route>
							
						</Routes>

					</Container>

				</SimpleReactLightbox>

			</AuthContextProvider>

		</BrowserRouter>
	)
}

export default App

