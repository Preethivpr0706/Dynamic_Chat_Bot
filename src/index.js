const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');
const userView = require('./userView');
const pocView = require('./pocView');
const { getClientID, getPocDetails } = require('./dbController');
const { connectDB } = require('./db');
const { parseWebhookData, logMessageDetails } = require('./utils');
const logger = require('./Logger');

connectDB();
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    logger.info('GET / endpoint hit - Server is running!');
    res.send('Server is running! Welcome to the Meister Solutions.');
});

app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        logger.info('Webhook verified successfully.');
        res.status(200).send(challenge);
    } else {
        logger.warn('Webhook verification failed.');
        res.sendStatus(403);
    }
});


app.post('/webhook', async(req, res) => {

    if (!req.body || Object.keys(req.body).length === 0) {
        logger.error('Empty webhook payload received.');
        return res.status(204).send(); // Send a 204 status code   
    }

    try {
        const webhookData = await parseWebhookData(req.body);

        if (!webhookData || !webhookData.from || !webhookData.messageBody || !webhookData.messageType || !webhookData.displayPhoneNumber) {
            //logger.error('Invalid webhook data.');
            return res.status(204).send(); // Send a 204 status code    
        }

        if (webhookData.messageType === 'interactive' && !webhookData.message.interactive) {
            logger.error('Invalid interactive message.');
            return res.status(204).send(); // Send a 204 status code    
        }

        const { from, messageBody, messageType, displayPhoneNumber, phoneNumberId } = webhookData;
        await logMessageDetails(logger, from, messageBody, messageType);

        process.env.PHONE_NUMBER_ID = phoneNumberId;

        const clientId = await getClientID(displayPhoneNumber, from);
        const pocDetails = await getPocDetails(clientId, from);

        if (pocDetails) {
            pocView.handlePocView(req, res, webhookData);
        } else {
            userView.handleUserView(req, res, webhookData);
        }
    } catch (error) {
        logger.error(`Error processing webhook: ${error.message}`);
        res.status(204).send(); // Send a 204 status code   
    }
});



app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});