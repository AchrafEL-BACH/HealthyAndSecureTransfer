import React, {useEffect, useState} from 'react';
import bcrypt from 'bcryptjs';
import "./LoginPage.css"
import {useNavigate} from "react-router-dom";

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: 'Patient0',
        email: 'patient.zero@doctolib.com',
        password: 'PatientPassword'
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Hash the password before sending it to the server
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        const testPassword = await bcrypt.hash(formData.password, 10);
        console.log(hashedPassword, testPassword)

        // Now send the hashed password and other registration data to the server
        const registrationData = {
            username: formData.username,
            email: formData.email,
            password: hashedPassword
        };

        // Make a POST request to the server to register the user
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            const data = await response.json();
            sessionStorage.setItem('token', data["token"]);
            sessionStorage.setItem('userKey', data["userKey"]);
            sessionStorage.setItem('name', formData.username);
            sessionStorage.setItem('isAuthenticated', 'true');
            console.log('Registration successful:', data);
            navigate("/");
        } catch (error) {
            console.error('Error registering user:', error);
            // Handle registration error (e.g., display error message to the user)
        }
    };

    return (
        <div className="registration-container">
            <form className="registration-form" onSubmit={handleSubmit}>
                <h2>Register</h2>
                <div className="form-group">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button className="form-button" type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegistrationForm;
