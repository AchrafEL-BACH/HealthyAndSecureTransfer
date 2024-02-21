import React, {useEffect, useState} from 'react';
import {AES, enc} from 'crypto-js';
import {useDropzone} from 'react-dropzone';
import {io} from "socket.io-client";
import {useKeyContext} from "./KeyContext";
import fs from "fs";

const FileEncryptionComponent: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [encryptedFile, setEncryptedFile] = useState<string | null>(null);
    const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
    const [key, setKey] = useState<string>(''); // State to store encryption key
    const [inputValue, setInputValue] = useState<string>(''); // State to store encryption key

    // @ts-ignore
    const { sharedState, setSharedState } = useKeyContext();

    useEffect(() => {
        // Retrieve the key from sessionStorage
        const storedKey = sessionStorage.getItem('encryptionKey');
        if (storedKey) {
            setKey(storedKey);
        }
    }, []); // Run only once on component mount

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            const reader = new FileReader();
            reader.onload = (event) => {
                // @ts-ignore
                const fileContent = event.target.result;
                console.log(fileContent);
            };

            reader.readAsText(acceptedFiles[0]);
        }
    };

    const handleEncrypt = (sessionKey: string) => {
        return new Promise<string>((resolve, reject) => {
            if (!file || !sharedState) {
                alert('Please select a file and ensure a key is available.');
                reject("No no no");
                return;
            }
            // Read the file content as a Data URL
            const reader = new FileReader();
            reader.onload = () => {
                // @ts-ignore
                const fileContent = reader.result.toString();
                console.log(fileContent);
                const fileName = file.name;
                const encodedString = `${fileName}:${fileContent.split(",").pop()}`; // Combine name, extension, and content
                const encryptedString = AES.encrypt(encodedString, sessionKey).toString();
                resolve(encryptedString);
            };
            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };
            reader.readAsDataURL(file); // Read the file as data URL
        });
    };

    const downloadFileFromEncodedString = (encodedString: string) => {
        const delimiterIndex = encodedString.indexOf(':');
        if (delimiterIndex === -1) {
            throw new Error('Invalid encoded string');
        }
        const fileInfo = encodedString.slice(0, delimiterIndex); // Extract file name and extension
        const fileContent = encodedString.slice(delimiterIndex + 1); // Extract base64-encoded file content
        const [fileName, fileExtension] = fileInfo.split('.'); // Split file name and extension

        // Decode the base64-encoded file content into a Blob
        const byteCharacters = atob(fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `text/${fileExtension}` });
        const file = new File([blob], fileName);
        console.log(file);

        // Create a download link for the Blob
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${fileName}.${fileExtension}`;
        document.body.appendChild(downloadLink);

        // Trigger the click event on the download link to start the download
        downloadLink.click();

        // Cleanup: remove the download link
        document.body.removeChild(downloadLink);
    };

    const handleDownload = (file: File) => {
        // Create a temporary link element
        const link = document.createElement('a');
        //link.href = fileURL;
        link.download = file.name;
        document.body.appendChild(link);
        // Trigger the click event on the link
        link.click();
        // Remove the link from the DOM
        document.body.removeChild(link);
    };

    const handleDecrypt = (fileString: string, userKey: string) => {
        return new Promise<File>((resolve, reject) => {
            console.log("User key:", userKey);
            console.log("Encrypted session key:", fileString.slice(-88, fileString.length))
            let keyC = AES.decrypt(fileString.slice(-88, fileString.length), userKey).toString(enc.Utf8);
            console.log("Session key:", keyC);
            let fileDecrypted = AES.decrypt(fileString.slice(0, -176), keyC).toString(enc.Utf8);
            console.log("Decrypted file string:", fileDecrypted);

            downloadFileFromEncodedString(fileDecrypted);
        });
    }

    const transferTest = () => {
        try {
            const socketOptions = {
                transports: ['websocket'], // Enable WebSocket transport
                upgrade: false, // Prevent protocol upgrades
                withCredentials: true, // Include cookies in the requests
            };
            const socket = io("http://localhost:3000", socketOptions);
            socket.emit("transferTest", file);
        } catch (e) {
            console.log(e);
        }
    }

    const initiateTransfer = (destinationUser: string) => {
        console.log(sharedState);
        try {
            const socketOptions = {
                transports: ['websocket'], // Enable WebSocket transport
                upgrade: false, // Prevent protocol upgrades
                withCredentials: true, // Include cookies in the requests
            };
            const socket = io("http://localhost:3000", socketOptions);
            socket.emit('initiateTransfer', destinationUser);
            socket.on('sessionKey', (sessionKey:string) => {
                handleEncrypt(sessionKey)
                    .then(encryptedContent => {
                        console.log(encryptedContent);
                        setEncryptedFile(encryptedContent)
                        let keyCbyA = AES.encrypt(sessionKey, key).toString();
                        console.log(keyCbyA)
                        let payload = encryptedContent + keyCbyA;
                        socket.emit('encryptedFile', payload);
                    })
            })
        } catch (e) {
            console.log(e);
        }
    }

    const initiateRetrieval = (connectingUser: string, fileName: string) => {
        try {
            const socketOptions = {
                transports: ['websocket'], // Enable WebSocket transport
                upgrade: false, // Prevent protocol upgrades
                withCredentials: true, // Include cookies in the requests
            };
            const socket = io("http://localhost:3000", socketOptions);
            socket.emit('initiateRetrieval', connectingUser, fileName);
            socket.on('userKey', (userKey:string, fileString:string) => {
                handleDecrypt(fileString, userKey)
                    .then(encryptedContent => {

                    })
            })
        } catch (e) {
            console.log(e);
        }
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div>
            <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <input {...getInputProps()} />
                {file ? (
                    <div>
                        <h2>Selected File:</h2>
                        <p>Name: {file.name}</p>
                        <p>Type: {file.type}</p>
                        <p>Size: {file.size} bytes</p>
                        <p>Last Modified: {file.lastModified}</p>
                    </div>
                ) : (
                <p>Drag & drop a file here, or click to select a file</p>
                    )}
            </div>
            <br />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {encryptedFile && (
                        <div>
                            <h3>Encrypted File</h3>
                            <textarea rows={10} cols={50} value={encryptedFile} readOnly />
                        </div>
                    )}
                    <button onClick={() => initiateTransfer('UserB')}>Initiate File Transfer to User B</button>
                    <button onClick={() => transferTest()}>Direct transfer of the file</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {decryptedFile && (
                        <div>
                            <h2>Selected File:</h2>
                            <p>Name: {decryptedFile.name}</p>
                            <p>Type: {decryptedFile.type}</p>
                            <p>Size: {decryptedFile.size} bytes</p>
                            <p>Last Modified: {decryptedFile.lastModified}</p>
                            <button onClick={() => handleDownload(decryptedFile)}>Download File</button>
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="Enter value"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button onClick={() => initiateRetrieval('UserB', inputValue)}>Initiate File Retrieval as User B</button>
                </div>
            </div>
        </div>
    );
};

export default FileEncryptionComponent;
