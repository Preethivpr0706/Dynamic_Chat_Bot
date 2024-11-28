//utils.js
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

// Function to validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
    return re.test(String(email).toLowerCase());
};

// Function to send a plain text WhatsApp message
async function sendWhatsAppMessage(to, message) {
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Use the correct token
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
}

// Function to send a button message (interactive message)
async function sendInteractiveMessageWithImage(to, bodyText, buttons, filePath) {
    const mediaId = await uploadImage(filePath);
    // Ensure there's at least one button
    if (buttons.length === 0) {
        console.error('No buttons provided for interactive message.');
        return; // Exit if no buttons are provided
    }

    // Limit the number of buttons to 3
    const limitedButtons = buttons.slice(0, 3);
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Use the correct token
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            header: {
                type: 'image',
                image: {
                    id: mediaId
                }
            },
            body: {
                text: bodyText
            },
            action: {
                buttons: limitedButtons.map((button) => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title
                    }
                }))
            }

        }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Interactive message sent successfully');
    } catch (error) {
        console.error('Error sending interactive message:', error.response ? error.response.data : error.message);
    }
}

const fs = require('fs');
const FormData = require('form-data');


async function uploadImage(filePath) {
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/media`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    };

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath)); // Local path
    formData.append('type', 'image/png'); // Specify the MIME type
    formData.append('messaging_product', 'whatsapp'); // Add the missing parameter

    try {
        const response = await axios.post(url, formData, { headers: {...headers, ...formData.getHeaders() } });
        console.log('Image uploaded successfully:', response.data);
        return response.data.id; // This is the media ID
    } catch (error) {
        console.error('Error uploading image:', error.response ? error.response.data : error.message);
    }
}

// Function to send a radio button message (list message)
async function sendRadioButtonMessage(to, headerText, options) {

    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // Function to truncate title to 24 characters
    const truncateTitle = (title) => {
        return title.length > 24 ? title.substring(0, 24) : title;
    };

    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'list',

            header: {
                type: 'text',
                text: " "
            },
            body: {
                text: headerText || "Choose an option below"
            },
            action: {
                button: 'Select',
                sections: [{
                    title: 'Options',
                    rows: options.map((option) => ({
                        id: option.id, // Option IDs should be unique and consistent
                        title: truncateTitle(option.title) // Truncate title if necessary
                    }))
                }]
            }
        }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Radio button message sent successfully');
    } catch (error) {
        console.error('Error sending radio button message:', error.response ? error.response.data : error.message);
    }
}

// Function to send a button message (interactive message)
async function sendBackButtonMessage(to, buttons) {
    // Ensure there's at least one button
    if (buttons.length === 0) {
        console.error('No buttons provided for interactive message.');
        return; // Exit if no buttons are provided
    }

    // Limit the number of buttons to 3
    const limitedButtons = buttons.slice(0, 3);
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Use the correct token
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: 'Please click this button to go back'
            },
            action: {
                buttons: limitedButtons.map((button) => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title
                    }
                }))
            }

        }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Interactive message sent successfully');
    } catch (error) {
        console.error('Error sending interactive message:', error.response ? error.response.data : error.message);
    }
}



async function sendCancelRescheduleInteractiveMessage(to, bodyText, buttons) {
    // Ensure there's at least one button
    if (buttons.length === 0) {
        console.error('No buttons provided for interactive message.');
        return; // Exit if no buttons are provided
    }

    // Limit the number of buttons to 3
    const limitedButtons = buttons.slice(0, 3);
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Use the correct token
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',

            body: {
                text: bodyText
            },
            action: {
                buttons: limitedButtons.map((button) => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title
                    }
                }))
            }

        }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Interactive message sent successfully');
    } catch (error) {
        console.error('Error sending interactive message:', error.response ? error.response.data : error.message);
    }
}

async function sendInteractiveMessageWithDescription(to, sections, buttons, headerMessage) {

    // Ensure there's at least one button  
    if (buttons.length === 0) {
        console.error('No buttons provided for interactive message.');
        return; // Exit if no buttons are provided  
    }

    // Limit the number of buttons to 3  
    const limitedButtons = buttons.slice(0, 3);
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Use the correct token  
        'Content-Type': 'application/json'
    };

    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            header: {
                type: 'text',
                text: headerMessage
            },
            body: {
                text: sections.map((section) => `${section.title}\n${section.description}`).join('\n\n')
            },
            action: {
                buttons: limitedButtons.map((button) => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title
                    }
                }))
            }
        }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Interactive message sent successfully');
    } catch (error) {
        console.error('Error sending interactive message:', error.response ? error.response.data : error.message);
    }
}

// Function to send a button message (interactive message)
async function sendInteractiveMessage(to, bodyText, buttons) {
    // Ensure there's at least one button
    if (buttons.length === 0) {
        console.error('No buttons provided for interactive message.');
        return; // Exit if no buttons are provided
    }

    // Limit the number of buttons to 3
    const limitedButtons = buttons.slice(0, 3);
    const url = `https://graph.facebook.com/v13.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Use the correct token
        'Content-Type': 'application/json'
    };
    const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: bodyText
            },
            action: {
                buttons: limitedButtons.map((button) => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title
                    }
                }))
            }

        }
    };

    try {
        await axios.post(url, data, { headers });
        console.log('Interactive message sent successfully');
    } catch (error) {
        console.error('Error sending interactive message:', error.response ? error.response.data : error.message);
    }
}
// Exporting functions
module.exports = {
    validateEmail,
    sendWhatsAppMessage,
    sendInteractiveMessage,
    sendCancelRescheduleInteractiveMessage,
    sendRadioButtonMessage,
    sendBackButtonMessage,
    sendInteractiveMessageWithDescription,
    sendInteractiveMessageWithImage
};