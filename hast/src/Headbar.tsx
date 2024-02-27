import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Headbar.css';

const Headbar = () => {
    const [isHidden, setIsHidden] = useState(false);
    const navigate = useNavigate();

    const toggleHeadbar = () => {
        setIsHidden(!isHidden);
    };

    const deconnect = () => {
        sessionStorage.clear();
        navigate("/");
    }

    return (
        <div className="headbar-container">
            <div className={`menu-icon ${isHidden ? 'black' : ''}`} onClick={toggleHeadbar}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <div className={`headbar ${isHidden ? 'hidden' : ''}`}>
                <div className="headbar-content">
                    <button>
                        <Link to="/test">
                            <p>Test</p>
                        </Link>
                    </button>
                    <button onClick={deconnect}>
                        <p>Déconnecter</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Headbar;