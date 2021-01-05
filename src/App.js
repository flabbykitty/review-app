import './assets/style.scss';
import {BrowserRouter, Route, Routes, } from 'react-router-dom'
import Home from './components/pages/Home'
import Navigation from './components/navigation/Navigation'

const App = () => {
	return (
		
		<BrowserRouter>
			<Navigation/>

			<Routes>
				<Route path="/">
					<Home/>
				</Route>
				
			</Routes>

		</BrowserRouter>
	)
}

export default App

