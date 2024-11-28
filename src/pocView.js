// pocView.js  
const { getPocDetails, getAppointmentDetailsForPocView, getAvailableDates, getAvailableTimes, getAppointmentJsonDataByKey, getAppointmentJsonData, updateAppointmentJsonData, getClientID, getTemplateMessage, updateAppointment, increaseAvailableSlots, insertAppointment } = require('./dbController');
const { sendWhatsAppMessage, sendInteractiveMessage, sendInteractiveMessageWithImage, sendInteractiveMessageWithDescription, sendCancelRescheduleInteractiveMessage, sendRadioButtonMessage, sendBackButtonMessage } = require('./utils');

exports.handlePocView = async(req, res) => {
    const body = req.body;
    const changes = body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages;
    const displayPhoneNumber = body.entry[0].changes[0].value.metadata.display_phone_number;
    const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const from = changes[0].from;
    const messageBody = changes[0].text ? changes[0].text.body : null;
    console.log(`Received message: ${messageBody} from: ${from}`);

    const messageType = changes[0].text ? changes[0].type : null;
    console.log(`Received message type: ${messageType}`);

    if (messageType === 'text') {
        // Get client ID based on the display phone number   
        const clientId = await getClientID(displayPhoneNumber, from);
        if (clientId) {
            const pocDetails = await getPocDetails(clientId, from);
            if (pocDetails) {
                // Show welcome message for POC and two options    
                const welcomeMessage = `Welcome, ${pocDetails.POC_NAME}!`;
                const options = [
                    { id: clientId + '~' + 'VIEW_APPOINTMENTS', title: 'View Appointments' },
                    { id: clientId + '~' + 'UPDATE_UNAVAILABILITY', title: 'Update Availability' }
                ];
                await sendInteractiveMessageWithImage(from, welcomeMessage, options, 'E:/WHATSAPP CHAT BOT/DYNAMIC CHAT BOT/src/images/poc1.jpg');
            }
        }
    } else {
        // Extract the title from the JSON data   
        const message = body.entry[0].changes[0].value.messages[0];
        let title = [];
        let Response_id = [];

        if (message.interactive) {
            const interactiveType = message.interactive.type;
            if (interactiveType === 'button_reply' && message.interactive.button_reply) {
                title = message.interactive.button_reply.title;
                Response_id = message.interactive.button_reply.id;
            } else if (interactiveType === 'list_reply' && message.interactive.list_reply) {
                title = message.interactive.list_reply.title;
                Response_id = message.interactive.list_reply.id;
            }
        }

        console.log(`Title: ${title} ID: ${Response_id}`);
        Response_id = Response_id.split('~');
        const clientId = Response_id[0];
        const action = Response_id[1];
        const pageNumber = Response_id[2] ? parseInt(Response_id[2]) : 1;

        try {
            if (action === 'VIEW_APPOINTMENTS') {
                // Fetch appointments in format [date - time - no of appointments >0] (in interactive message with previous[<--] and next[-->] button which fetches in batch)    
                const appointments = await getAppointmentDetailsForPocView(clientId, pageNumber, 10);
                if (typeof appointments === 'object' && appointments.message) {
                    const sections = [{
                        title: appointments.message,
                        description: ''
                    }];
                    const options = [
                        { id: clientId + '~' + 'VIEW_APPOINTMENTS' + '~' + (pageNumber - 1), title: '<-- Previous' },
                        { id: clientId + '~' + 'UPDATE_UNAVAILABILITY', title: 'Update availability' }
                    ];
                    await sendInteractiveMessageWithDescription(from, sections, options, '');
                } else {
                    let sections = [];
                    appointments.forEach(appointment => {
                        sections.push({
                            title: `${appointment.date} - ${appointment.time} - ${appointment.noOfAppointments}`,
                            description: appointment.day
                        });
                    });
                    const options = [
                        { id: clientId + '~' + 'VIEW_APPOINTMENTS' + '~' + (pageNumber - 1), title: '<-- Previous' },
                        { id: clientId + '~' + 'VIEW_APPOINTMENTS' + '~' + (pageNumber + 1), title: 'Next -->' },
                        { id: clientId + '~' + 'UPDATE_UNAVAILABILITY', title: 'Update availability' }
                    ];
                    const headerMessage = "Here are your booked slots:"
                    await sendInteractiveMessageWithDescription(from, sections, options, headerMessage);
                }
            } else if (action === 'UPDATE_UNAVAILABILITY') {
                // Handle update unavailability logic here  
            }
        } catch (error) {
            console.error("Error fetching appointment details:", error);
            sendWhatsAppMessage(from, "Sorry, an error occurred while fetching the appointment details.");
        }
    }
    res.sendStatus(200);
};