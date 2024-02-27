import React, {useEffect, useState} from 'react';
import "./NewDocumentContainer.css";
import {AES, enc} from "crypto-js";
import {io} from "socket.io-client";

type document = {
    sender: string,
    date: string,
    file: any,
    name: string,
    extension: string,
}

const NewDocumentContainer: React.FC = () => {
    const [files, setFiles] = useState<document[]>([]);

    const downloadFileFromEncodedString = (encodedString: string) => {
        const delimiterIndex = encodedString.indexOf(':');
        if (delimiterIndex === -1) {
            throw new Error('Invalid encoded string');
        }
        const [sender, fileInfo, fileContent] = encodedString.split(":");
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
        let result = {sender: sender, file: file, name: fileName, extension: fileExtension};
        return result;
    };

    const makeDownloadLink = (file: document) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(file["file"]);
        downloadLink.download = `${file["name"]}.${file["extension"]}`;
        document.body.appendChild(downloadLink);

        // Trigger the click event on the download link to start the download
        downloadLink.click();

        // Cleanup: remove the download link
        document.body.removeChild(downloadLink);
    }

    const handleDecrypt = (fileString: string) => {
        return new Promise<any>((resolve) => {
            // @ts-ignore
            let userKey = sessionStorage.getItem("userKey").toString();
            let keyC = AES.decrypt(fileString.slice(-88, fileString.length), userKey).toString(enc.Utf8);
            let fileDecrypted = AES.decrypt(fileString.slice(0, -176), keyC).toString(enc.Utf8);

            let resultFile = downloadFileFromEncodedString(fileDecrypted);
            console.log(resultFile);
            resolve(resultFile);
        });
    }

    const initiateRetrieval = () => {
        try {
            const socketOptions = {
                transports: ['websocket'], // Enable WebSocket transport
                upgrade: false, // Prevent protocol upgrades
                withCredentials: true, // Include cookies in the requests
            };
            const socket = io("http://localhost:3000", socketOptions);
            socket.emit('getRecentFiles', sessionStorage.getItem("name"));
            socket.on('filesForWeek', async (files: any[]) => {
                let newFiles: document[] = [];
                for (let i = 0; i < files.length; i++) {
                    let filed = files[i];
                    handleDecrypt(filed["content"]).then((resultFile) => {
                        console.log(resultFile);
                        let newFile = {
                            sender: resultFile["sender"],
                            date: (new Date(filed["filename"])).toLocaleString('fr-FR', { hour12: false }),
                            file: resultFile["file"],
                            name: resultFile["name"],
                            extension: resultFile["extension"],
                        }
                        console.log(newFile);
                        newFiles.push(newFile);
                    })
                }
                setFiles(newFiles);
            })
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        initiateRetrieval();
    }, []);

    return (
        <div className="doc-container">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '3vh', height: '10%', borderBottom: '1px black solid', borderTop: '1px black solid', margin: '0px 10px' }}>
                    New Documents
                </p>
                <div id="documents" style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {files.map((file, index) => (
                        <div key={index} className="document-item">
                            <div className="doc-icon"></div>
                            <div className="doc-details">
                                <p className="doc-name">{`${file["name"]}.${file["extension"]}`}</p>
                                <p className="doc-size">{`From: ${file["sender"]}`}</p>
                                <p className="doc-size">{`${file["file"].size} bytes`}</p>
                            </div>
                            <div className="doc-right">
                                <button onClick={() => makeDownloadLink(file)}>Download</button>
                                <p className="doc-date">{file["date"]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NewDocumentContainer;