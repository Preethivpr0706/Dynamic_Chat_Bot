// index.js  
const express = require('express');
const dotenv = require('dotenv');
const userView = require('./userView');
const pocView = require('./pocView');
const { getClientID, getPocDetails } = require('./dbController');
const { connectDB } = require('./db');

connectDB();
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running! Welcome to the Meister Solutions.');
});

app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', async(req, res) => {
    const body = req.body;

    if (body.object) {
        const changes = body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages;
        const displayPhoneNumber = body.entry[0].changes[0].value.metadata.display_phone_number;
        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;

        process.env.PHONE_NUMBER_ID = phoneNumberId;

        if (changes && changes[0]) {
            const from = changes[0].from;
            const messageBody = changes[0].text ? changes[0].text.body : null;
            console.log(`Received message: ${messageBody} from: ${from}`);

            const messageType = changes[0].text ? changes[0].type : null;
            console.log(`Received message type: ${messageType}`);

            // Check if the message is from a POC or a User  
            const clientId = await getClientID(displayPhoneNumber, from);
            const pocDetails = await getPocDetails(clientId, from);

            if (pocDetails) {
                // Handle POC view  
                pocView.handlePocView(req, res);
            } else {
                // Handle User view  
                userView.handleUserView(req, res);
            }
        } else {
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(404);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});