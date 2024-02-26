const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cryptoJS = require('crypto-js');
const cors = require('cors')
const fs = require("fs");
const { Readable } = require('stream');

const keyStorageRouter = require('./routes/keyStorageRouter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.json());
app.use(cors());
app.use('/api', keyStorageRouter);

const AESKey = (keySize) => {
    const key = cryptoJS.lib.WordArray.random(keySize);
    return cryptoJS.enc.Base64.stringify(key);
};

/*const encryptAES = (data, key) => {
    // Convert the key from base64 to a Buffer
    const keyBuffer = Buffer.from(key, 'base64');

    // Create a Cipher object with AES algorithm and Cipher Block Chaining (CBC) mode
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, Buffer.alloc(16)); // Initialization vector (IV) is required for CBC mode

    // Enable PKCS7 padding explicitly
    cipher.setAutoPadding(true);

    // Perform the encryption
    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    return encryptedData;
};


const decryptAES = (encryptedData, key) => {
    // Convert the key from base64 to a Buffer
    const keyBuffer = Buffer.from(key, 'base64');

    // Create a Decipher object with AES algorithm and Cipher Block Chaining (CBC) mode
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.alloc(16)); // Initialization vector (IV) is required for CBC mode

    // Perform the decryption
    let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
};*/

const decodeStringToFile = (encodedString) => {
    const delimiterIndex = encodedString.indexOf(':');
    if (delimiterIndex === -1) {
        throw new Error('Invalid encoded string');
    }
    const fileInfo = encodedString.slice(0, delimiterIndex); // Extract file name and extension
    const fileContent = encodedString.slice(delimiterIndex + 1); // Extract base64-encoded file content
    const [fileName, fileExtension] = fileInfo.split('.'); // Split file name and extension

    // Decode the base64-encoded file content into a buffer
    const fileDataBuffer = Buffer.from(fileContent, 'base64');

    // Construct the file path
    const filePath = `./files/${fileName}.${fileExtension}`;

    // Write the file data to the file path
    fs.writeFileSync(filePath, fileDataBuffer);

    // Return the file path
    return filePath;
};

const writeStringToFile = (encrypted) => {
    fs.readdir("./encryptedFiles", (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Filter out files with names that can be parsed as numbers
        const filteredFiles = files.filter((fileName) => /^\d+$/.test(fileName));

        // Sort the files by their names
        filteredFiles.sort((a, b) => parseInt(a) - parseInt(b));
        let lastFile;
        if (filteredFiles.length > 0) {
            // Get the last file in the sorted list
            lastFile = +filteredFiles[filteredFiles.length - 1];
            console.log('Last file:', lastFile);
        } else {
            lastFile = 0;
            console.log('No files found in the directory.');
        }

        const filePath = `./encryptedFiles/${lastFile+1}`
        fs.writeFile(filePath, encrypted, (err) => {
            if (err) {
                console.error("Unsuccessful write up.");
                return;
            }
            console.log(filePath);
        })
    });
}

io.on('connection', (socket) => {
    console.log('Client connected');

    // Handle transfer initiation request from the client
    socket.on('initiateTransfer', (destinationUser) => {
        try {
            console.log("Transfer to", destinationUser);
            // Generate a session key (Key C) using AES-256 encryption
            const sessionKey = AESKey(32).toString(); // 32 bytes for AES-256
            console.log("Sessions key:", sessionKey);
            // Send the session key back to the client
            socket.emit('sessionKey', sessionKey);

            // Handle receiving encrypted file from client
            socket.on('encryptedFile', (encryptedFile) => {
                // This is the encrypted payload received from the client
                // (encoded+encrypted file + encrypted session key from User A key)
                console.log('Received encrypted file:', encryptedFile);
                // This is the decrypted file string using the session key
                let decoded = cryptoJS.AES.decrypt(encryptedFile.slice(0, -88), sessionKey).toString(cryptoJS.enc.Utf8);
                console.log('Decrypt test:', decoded);
                // This is the file translated from the encoded (base64) string
                // let decryptedFile = decodeStringToFile(decoded);
                // console.log("File decrypted:", decryptedFile);
                // This is the key of the UserB
                let keyB;
                try {
                    keyB = fs.readFileSync(`./keys/UserB`, 'utf8');
                } catch (e) {
                    console.log("There is no keyB.");
                }
                console.log('Key B:', keyB);
                // This is the session key encrypted with the UserB key
                let keyCbyB = cryptoJS.AES.encrypt(sessionKey, keyB).toString();
                console.log('Key C by B:', keyCbyB);
                let finalFile = encryptedFile + keyCbyB;
                console.log('Final encrypted file:', finalFile);
                writeStringToFile(finalFile);
            });
        } catch (error) {
            console.error('Error in file transfer:', error);
        }
    });

    socket.on('initiateRetrieval', (connectingUser, fileName) => {
        try {
            console.log(`${connectingUser} is connecting.`);
            let userKey;
            let fileString;
            try {
                userKey = fs.readFileSync(`./keys/${connectingUser}`, 'utf8');
            } catch (e) {
                console.log("Connect error:", e);
                socket.disconnect();
            }
            try {
                fileString = fs.readFileSync(`./encryptedFiles/${fileName}`, 'utf8');
            } catch (e) {
                console.log("File retrieval error:", e);
                socket.disconnect();
            }

            socket.emit("userKey", userKey, fileString);

        } catch (error) {
            console.error("Error in file retrieval process:", error);
        }
    });

    socket.on("transferTest", (file) => {
        (new Promise((resolve, reject) => {
            // Write the buffer data to a file
            fs.writeFile("test.txt", file, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve("test.txt");
                }
            });
        })).then((filename) => {
            console.log(new File(filename));
        });
    })

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
