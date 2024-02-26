import React from 'react';
// import React, { useState } from 'react';
// import CryptoJS from 'crypto-js';
// import axios from 'axios';
import KeyGenerationComponent from "./KeyGenerationComponent";
import FileEncryptionComponent from "./FileEncryptionComponent";
import {KeyProvider} from "./KeyContext";

const TestPage: React.FC = () => {
    const registerUser = async (username: string) => {
        // try {
        //     // Generate and store key for the user
        //     const response = await axios.post('/api/register', { username });
        //     console.log(response.data);
        // } catch (error) {
        //     console.error('Error registering user:', error);
        // }
    };

    const initiateFileTransfer = async (destination: string) => {
        try {
            // Initiate file transfer process to the specified destination
            // This could involve navigating to the FileEncryptionComponent
            console.log('Initiating file transfer to', destination);
        } catch (error) {
            console.error('Error initiating file transfer:', error);
        }
    };

    return (
        <div>
            <h2>Test Page</h2>
            <KeyProvider>
                <KeyGenerationComponent onComplete={() => registerUser('UserA')} username="UserA" />
                <FileEncryptionComponent />
            </KeyProvider>
        </div>
    );
};

export default TestPage;
