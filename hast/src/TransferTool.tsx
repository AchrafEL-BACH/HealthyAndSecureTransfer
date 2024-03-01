import React, {useEffect, useState, useRef} from 'react';
import {useDropzone} from "react-dropzone";
import {AES} from "crypto-js";
import {io} from "socket.io-client";
import {useKeyContext} from "./KeyContext";
import "./TransferTool.css"

interface TransferToolProps{
    className?: string;
    contactName: string;
}

const TransferTool: React.FC<TransferToolProps> = ({className, contactName}) => {
    const [myFile, setMyFile] = useState<File | null>(null);
    const fileRef: React.MutableRefObject<File|null> = useRef(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setMyFile(acceptedFiles[0]);
            fileRef.current = acceptedFiles[0];
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleEncrypt = (file: File|null, sessionKey: string) => {
        return new Promise<string>((resolve, reject) => {
            if (!file || !sessionStorage.hasOwnProperty("userKey")) {
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
                const encodedString = `${sessionStorage.getItem("name")}:${fileName}:${fileContent.split(",").pop()}`; // Combine name, extension, and content
                const encryptedString = AES.encrypt(encodedString, sessionKey).toString();
                resolve(encryptedString);
            };
            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };
            reader.readAsDataURL(file); // Read the file as data URL
        });
    };

    const initiateTransfer = (destinationUser: string) => {
        try {
            let finished = document.getElementById("finished");
            // @ts-ignore
            finished.innerHTML = "";
            const socketOptions = {
                transports: ['websocket'], // Enable WebSocket transport
                upgrade: false, // Prevent protocol upgrades
                withCredentials: true, // Include cookies in the requests
            };
            const socket = io("http://localhost:3000", socketOptions);
            socket.emit('initiateTransfer', destinationUser);
            socket.on('sessionKey', (sessionKey:string) => {
                handleEncrypt(fileRef.current, sessionKey)
                    .then(encryptedContent => {
                        console.log(encryptedContent);
                        // @ts-ignore
                        let keyCbyA = AES.encrypt(sessionKey, sessionStorage.getItem('userKey')).toString();
                        console.log(keyCbyA)
                        let payload = encryptedContent + keyCbyA;
                        socket.emit('encryptedFile', payload);
                        let text = document.createElement("p");
                        text.innerHTML = "Transfer is done.";
                        finished?.appendChild(text);
                    })
            })
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const transferButton = document.getElementById("transfer");
        const clickHandler = () => initiateTransfer(contactName);
        // @ts-ignore
        transferButton.addEventListener("click", clickHandler);
        return () => {
            // @ts-ignore
            transferButton.removeEventListener("click", clickHandler);
        };
    }, [contactName]);

    return (
        <div {...getRootProps()} className={`${className} input`}>
            <input {...getInputProps()}/>
            {myFile ? (
                <div className="file selected">
                    <div className="file-info">
                        <div className="file-icon">

                        </div>
                        <div className="file-details">
                            <p className="file-name">{myFile.name}</p>
                            <p className="file-metadata">Type: {myFile.type}</p>
                            <p className="file-metadata">Size: {myFile.size} bytes</p>
                            <p className="file-metadata">Last Modified: {myFile.lastModified}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="file unselected">Drag & drop a file here, or click to select a file</div>
            )}
            <div id="finished">

            </div>
        </div>
    );
}

export default TransferTool;
