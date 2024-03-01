const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cryptoJS = require('crypto-js');
const cors = require('cors')
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const keyStorageRouter = require('./routes/keyStorageRouter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.json());
app.use(cors());
app.use('/api', keyStorageRouter);

const pool = new Pool({
    user: 'postgres',
    host: 'postgres',
    database: 'mydatabase',
    password: 'mysecretpassword',
    port: 5432,
});

const generateAuthToken = (userId) => {
    return jwt.sign({ userId }, 'secretkey', { expiresIn: '1h' });
};

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password]);

        // Generate authentication token
        const token = generateAuthToken(username);
        const userKey = AESKey(32).toString();
        const filePath = `./keys/${username}`;
        fs.writeFile(filePath, userKey, (err) => {
                if (err) {
                    console.error("Unsuccessful write up.");
                    throw Error();
                }
                console.log("Key written successfully.", filePath, userKey);
        });

        res.status(201).send({ message: 'User registered successfully', token, userKey });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in the database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send('Invalid password');
        }

        // Generate authentication token
        const token = generateAuthToken(username);
        let userKey;
        try {
            userKey = fs.readFileSync(`./keys/${username}`, 'utf8');
        } catch (e) {
            console.log("There is no userKey for", username);
        }

        res.status(200).send({ message: 'Login successful', token, userKey });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal server error');
    }
});

const AESKey = (keySize) => {
    const key = cryptoJS.lib.WordArray.random(keySize);
    return cryptoJS.enc.Base64.stringify(key);
};

const stopDBContainer = () => {
    try {
        // Stop the Docker container
        execSync('docker stop my-postgres-container');
        console.log('Docker container stopped successfully.');
    } catch (error) {
        console.error('Error stopping Docker container:', error.message);
    }
};
process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Cleaning up...');

    // Stop the Docker container before exiting
    stopDBContainer();

    // Exit the process
    process.exit();
});

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
        } else {
            lastFile = 0;
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

const getFilesByDate = (directoryPath, date = (() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return oneWeekAgo;
})()) => {
    const files = fs.readdirSync(directoryPath);
    return files.map((file) => {
        const filePath = path.join(directoryPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            const fileNameDate = new Date(file); // Parse file name into Date object
            if (date === null || fileNameDate > date) { // Compare with provided date
                const content = fs.readFileSync(filePath, 'utf-8'); // Read file content
                console.log(fileNameDate, date);
                return { filename: file, content };
            }
        }
        return null;
    }).filter(Boolean); // Filter out null values
};

const writeFiletoUser = (encrypted, username) => {
    const directoryPath = `./encryptedFiles/${username}`;
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    const date = new Date().toISOString();
    const filePath = `${directoryPath}/${date}`;
    fs.writeFile(filePath, encrypted, (err) => {
        if (err) {
            console.error("Unsuccessful write up.");
        }
    })
}

io.on('connection', (socket) => {

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
                let userKey;
                try {
                    userKey = fs.readFileSync(`./keys/${destinationUser}`, 'utf8');
                } catch (e) {
                    console.log(`There is no userKey for ${destinationUser}.`);
                }
                console.log('Key B:', userKey);
                // This is the session key encrypted with the UserB key
                let keyCbyB = cryptoJS.AES.encrypt(sessionKey, userKey).toString();
                console.log('Key C by B:', keyCbyB);
                let finalFile = encryptedFile + keyCbyB;
                console.log('Final encrypted file size:', finalFile.length);
                writeFiletoUser(finalFile, destinationUser);
                socket.emit("transferFinished");
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

    socket.on('getRecentFiles', (connectingUser) => {
        try{
            const directoryPath = `./encryptedFiles/${connectingUser}`;
            console.log(`${connectingUser} retrieving file this week.`)
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }
            let files = getFilesByDate(directoryPath);
            socket.emit("filesForWeek", files);
        } catch (e) {

        }
    })

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
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});