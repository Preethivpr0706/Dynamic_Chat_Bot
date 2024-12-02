CREATE TABLE Templates (
    TEMPLATE_ID INT AUTO_INCREMENT PRIMARY KEY,
    CLIENT_ID INT NOT NULL,
    TEMPLATE_NAME VARCHAR(255) NOT NULL,
    TEMPLATE_TEXT TEXT NOT NULL,
    FOREIGN KEY (CLIENT_ID) REFERENCES Client(CLIENT_ID)
);

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'CONFIRM', 'Here are your appointment details:\n\nName: [User_Name]\nEmail: [User_Email]\nLocation: [User_Location]\nAppointment Type: [Appointment_Type]\nDepartment: [Department]\nDoctor: [POC]\nAppointment Date: [Appointment_Date]\nAppointment Time: [Appointment_Time]'),
(1, 'FINALIZE', 'Appointment confirmed. Your Appointment ID: [Appointment_ID]');

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'CONFIRM_EMERGENCY', 'Here are your appointment details:\n\nName: [User_Name]\nEmail: [User_Email]\nLocation: [User_Location]\nAppointment Type: [Appointment_Type]\nEmergency Reason: [Emergency_Reason]'),
(1, 'FINALIZE_EMERGENCY', 'Appointment confirmed. We are waiting for your arrival!!!');

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'FINALIZE_TELE', 'Appointment confirmed. Your Appointment ID: [Appointment_ID]\n Your G-meet Link is given below!');

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'Cancel_Appointment_Request', "Your appointment request has been canceled. You can start over if you'd like to make a new appointment");


INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'CONFIRM_CHECKUP', 'Here are your appointment details:\n\nName: [User_Name]\nEmail: [User_Email]\nLocation: [User_Location]\nAppointment Type: [Appointment_Type]\nAppointment Date: [Appointment_Date]\nAppointment Time: [Appointment_Time]');

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT) 
VALUES 
(1, 'Live_Location', '📍 To assist you better, please share your live location.\n\nHere’s how to share your location on WhatsApp:\n1️⃣ Open your chat with us.\n2️⃣ Tap the 📎 (Attachment) icon.\n3️⃣ Select "Location."\n4️⃣ Choose "Share Live Location" and select the duration you\'d like to share for.\n\nThank you for helping us serve you better! 😊');

-- 25/11/2024

UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Here are your appointment details:\r\n *Name:* [User_Name]\r\n *Email:* [User_Email]\n\r *Location:* [User_Location]\n\r *Appointment Type:* [Appointment_Type]\n\r *Department:* [Department]\n\r *Doctor:* [POC]\n\r *Appointment Date:* [Appointment_Date]\n\r *Appointment Time:* [Appointment_Time]' WHERE (`TEMPLATE_ID` = '1');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Appointment confirmed. *Your Appointment ID:* [Appointment_ID]' WHERE (`TEMPLATE_ID` = '2');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Here are your appointment details:\n\r \r*Name:* [User_Name]\n\r *Email:* [User_Email]\n\r *Location:* [User_Location]\n\r *Appointment Type:* [Appointment_Type]\n\r *Emergency Reason:* [Emergency_Reason]' WHERE (`TEMPLATE_ID` = '3');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Appointment confirmed. *Your Appointment ID:* [Appointment_ID]\n\r  Your *G-meet Link* is given below!' WHERE (`TEMPLATE_ID` = '5');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Your appointment request has been *cancelled*. You can start over if you\'d like to make a new appointment.' WHERE (`TEMPLATE_ID` = '6');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Here are your appointment details:\r \r\n *Name:* [User_Name]\n\r *Email:* [User_Email]\n\r *Location:* [User_Location]\r\n *Appointment Type:* [Appointment_Type]\r\n *Appointment Date:* [Appointment_Date]\r\n *Appointment Time:* [Appointment_Time]' WHERE (`TEMPLATE_ID` = '7');

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'CONFIRM_RESCHEDULE', 'Here are your appointment details:\r\n \r *Name:* [User_Name]\r\n *Email:* [User_Email]\r\n *Location:* [User_Location]\r\n *Appointment Type:* [Appointment_Type]\n\r *Appointment Date:* [Appointment_Date]\n\r *Appointment Time:* [Appointment_Time]');

INSERT INTO Templates (CLIENT_ID, TEMPLATE_NAME, TEMPLATE_TEXT)
VALUES
(1, 'FINALIZE_RESCHEDULE', 'Appointment rescheduled successfully. Your *New Appointment ID:* [Appointment_ID]');

-- 02/12/24
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_NAME` = 'CONFIRM_DIRECT' WHERE (`TEMPLATE_ID` = '1');
INSERT INTO `chatbotdynamic`.`templates` (`TEMPLATE_ID`, `CLIENT_ID`, `TEMPLATE_NAME`, `TEMPLATE_TEXT`) VALUES ('13', '1', 'CONFIRM_TELE', 'Here are your appointment details:\\r\\n *Name:* [User_Name]\\r\\n *Email:* [User_Email]\\n\\r *Location:* [User_Location]\\n\\r *Appointment Type:* [Appointment_Type]\\n\\r *Department:* [Department]\\n\\r *Doctor:* [POC]\\n\\r *Appointment Date:* [Appointment_Date]\\n\\r *Appointment Time:* [Appointment_Time]');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Here are your appointment details:\r\n *Name:* [User_Name]\r\n *Email:* [User_Email]\n\r *Location:* [User_Location]\n\r *Appointment Type:* [Appointment_Type]\n\r *Department:* [Department]\n\r *Doctor:* [POC]\n\r *Appointment Date:* [Appointment_Date]\n\r *Appointment Time:* [Appointment_Time]' WHERE (`TEMPLATE_ID` = '13');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_TEXT` = 'Appointment confirmed. *Your Appointment ID:* [Appointment_ID]\n\r  Your *G-meet Link* is given below! \n \n [Meet_Link]' WHERE (`TEMPLATE_ID` = '5');
UPDATE `chatbotdynamic`.`templates` SET `TEMPLATE_NAME` = 'FINALIZE_DIRECT' WHERE (`TEMPLATE_ID` = '2');
INSERT INTO `chatbotdynamic`.`templates` (`TEMPLATE_ID`, `CLIENT_ID`, `TEMPLATE_NAME`, `TEMPLATE_TEXT`) VALUES ('14', '1', 'FINALIZE_CHECKUP', 'Appointment confirmed. *Your Appointment ID:* [Appointment_ID]');
