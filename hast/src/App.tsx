import React from 'react';
import {BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom';
import './App.css';
import TestPage from "./TestPage";
import MainPage from "./MainPage";
import withAuth from "./withAuth";
import RegistrationForm from "./RegistrationForm";
import LoginPage from "./LoginPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" Component={withAuth(MainPage)} />
                {/*<Route path="/" Component={MainPage} />*/}
                <Route path="/login" Component={LoginPage} />
                <Route path="/register" Component={RegistrationForm} />
                <Route path="/test" Component={TestPage} />
            </Routes>
        </Router>
  );
}

export default App;
