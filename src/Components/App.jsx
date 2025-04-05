import React from 'react';
import {Routes, Route, HashRouter} from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import '../styles/style.css';
import Home from './Home.jsx'

const App = () => {
  return(
    <HashRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/Home"/>}></Route>
        <Route path ='/Home' element={<Home/>}></Route>
      </Routes>
    </HashRouter>
  )
}

export default App;