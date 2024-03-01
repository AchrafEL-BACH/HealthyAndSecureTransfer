import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from "bcryptjs";
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('UserB');
    const [password, setPassword] = useState('UserBPass');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Now send the hashed password and username to the server for authentication
        const loginData = {
            username: username,
            password: password
        };

        // Make a POST request to the server to authenticate the user
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            sessionStorage.setItem('token', data["token"]);
            sessionStorage.setItem('userKey', data["userKey"]);
            sessionStorage.setItem('name', username);
            sessionStorage.setItem('isAuthenticated', 'true');
            console.log('Login successful:', data);
            navigate("/");
            // Optionally redirect the user to another page or display a success message
        } catch (error) {
            console.error('Error logging in:', error);
            // Handle login error (e.g., display error message to the user)
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Mot de Passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button className="form-button" type="submit">Login</button>
                <p style={{textAlign:"center"}} onClick={() => {navigate("/register")}}>S'inscrire maintenant</p>
            </form>
        </div>
    );
};

export default LoginPage;
