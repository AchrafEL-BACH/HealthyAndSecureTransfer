import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { useKeyContext} from "./KeyContext";

interface Props {
    onComplete: () => void;
    username: string;
}

const TestKeyGenerationComponent: React.FC<Props> = ({ onComplete, username }) => {
    const [generatedKey, setGeneratedKey] = useState<string>('');
    // @ts-ignore
    const { sharedState, setSharedState } = useKeyContext();

    const AESKey = (keySize: number) => {
        const key = CryptoJS.lib.WordArray.random(keySize);
        return CryptoJS.enc.Base64.stringify(key);
    };

    const generateAndStoreKey = async () => {
        try {
            // Generate a random 256-bit (32 bytes) symmetric encryption key
            const key = AESKey(32);

            // Convert the generated key to a Base64-encoded string for storage
            const keyString = key.toString();

            // Update the state with the generated key
            setGeneratedKey(keyString);
            setSharedState(keyString);
            // Send the generated key to the server for storage
            // await sendKeyToServer(keyString, username);

            // Callback function to notify completion
            onComplete();
        } catch (error) {
            console.error('Error generating and storing key:', error);
        }
    };

    const sendKeyToServer = async (key: string, username: string) => {
        try {
            // Send a POST request to the server to store the key in the PKI
            const response = await axios.post('/api/store-key', { key });
            console.log(response.data);
        } catch (error) {
            console.error('Error storing key:', error);
        }
    };

    return (
        <div>
            <h2>Symmetric Encryption Key Generation</h2>
            <button onClick={generateAndStoreKey}>Generate and Store Key</button>
            {generatedKey && (
                <div>
                    <h3>Generated Key:</h3>
                    <p>{generatedKey}</p>
                </div>
            )}
        </div>
    );
};

export default TestKeyGenerationComponent;
