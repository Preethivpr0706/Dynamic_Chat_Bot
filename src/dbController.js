const { getConnection } = require('./db');
const { sendWhatsAppMessage } = require('./utils');

function getClientID(displayPhoneNumber) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT Client_ID FROM Client WHERE Contact_Number = ?';
        const connection = getConnection();
        console.log(`displayPhoneNumber"${displayPhoneNumber}`);
        console.log(`displayPhoneNumber"${displayPhoneNumber}`);
        connection.execute(query, [displayPhoneNumber], async(err, results) => {
            if (err) {
                console.error('error running query:', err);
                return;
            }
            if (results.length > 0) {
                const clientId = results[0].Client_ID;
                resolve(clientId);
            } else {
                await sendWhatsAppMessage(from, `There is no client with ID ${displayPhoneNumber}`);
                reject(new Error(`There is no client with ID ${displayPhoneNumber}`));
            }
        });
    });
}

function getWelcomeMessage(clientId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT Value_name FROM List WHERE Client_ID =? AND Key_name = "GREETINGS"';
        const connection = getConnection();
        connection.execute(query, [clientId], (err, results) => {
            if (err) {
                console.error('error running query:', err);
                return;
            }
            const welcomeMessage = results[0].Value_name;
            resolve(welcomeMessage);
        });
    });
}

async function getMainMenu(clientId, parentMenuID) {
    return new Promise(async(resolve, reject) => {
        const query = `
        SELECT 
            Client_ID as CLIENT_ID,
            Menu_ID as MENU_ID,
            Menu_Name AS MENU_NAME, 
            Header_Message AS HEADER_MESSAGE,
            Action as ACTION
        FROM menu 
        WHERE Client_ID = ? AND Language = 'ENG' AND Parent_Menu_ID = ?
        ORDER BY Display_Order;
    `;

        const connection = getConnection();

        connection.execute(query, [clientId, parentMenuID], (err, rows) => {
            if (err) {
                console.error('error running query:', err);
                return;
            }

            resolve(rows);
        });
    });
}


function getFromList(iClientId, iMenuId, iKey, iLang) {
    return new Promise((resolve, reject) => {
        console.log(`getFromList: iClientId:${iClientId} , iMenuId:${iMenuId} ,iKey:${iKey} , iLang:${iLang}`);
        const query = `SELECT 
                            Client_ID as CLIENT_ID,
                            ? MENU_ID,
                            Item_ID as ITEM_ID,
                            Value_name as MENU_NAME 
                        FROM LIST 
                        WHERE   Client_ID= ?
                            AND Key_name = ?
                            AND Lang = ?
                        ORDER BY Display_order
                        LIMIT 10`;
        const connection = getConnection();
        connection.execute(query, [iMenuId, iClientId, iKey, iLang], (err, results) => {
            if (err) {
                console.error('error running query:', err);
                return;
            }
            console.log('Query results:', results);

            resolve(results);
        });
    });
}

function getPocFromPoc(iClientId, iMenuId, iKey) {
    return new Promise((resolve, reject) => {
        console.log(`getFromPOC: iClientId:${iClientId} , iMenuId:${iMenuId} ,iKey:${iKey}`);
        const query = `SELECT 
                            Client_ID as CLIENT_ID,
                            ? MENU_ID,
                            POC_ID as ITEM_ID,
                            POC_Name as MENU_NAME 
                        FROM POC 
                        WHERE   Client_ID= ?
                            AND Specialization = ?
                            LIMIT 10`;
        const connection = getConnection();
        connection.execute(query, [iMenuId, iClientId, iKey], (err, results) => {
            if (err) {
                console.error('error running query:', err);
                return;
            }
            console.log('Query results:', results);

            resolve(results);
        });
    });
}

function getAvailableDates(iClientId, iMenuId, iKey) {
    return new Promise((resolve, reject) => {
        console.log(`getAvailableDates: iClientId:${iClientId} ,iMenuId: ${iMenuId}, iKey: ${iKey}`);
        const query = `
            SELECT DISTINCT
                ? AS CLIENT_ID,
                ? AS MENU_ID,
                CONCAT(POC_ID, '-', DATE_FORMAT(Schedule_Date, '%Y-%m-%d')) AS ITEM_ID,
                DATE_FORMAT(Schedule_Date, '%Y-%m-%d') AS MENU_NAME,
                Schedule_Date
            FROM poc_available_slots
            WHERE POC_ID = ?
                AND Schedule_Date >= CURDATE()
                AND appointments_per_slot > 0
                AND EXISTS (
                    SELECT 1 
                    FROM poc_available_slots AS slots
                    WHERE slots.POC_ID = poc_available_slots.POC_ID 
                        AND slots.Schedule_Date = poc_available_slots.Schedule_Date 
                        AND (slots.Schedule_Date > CURDATE() OR (slots.Schedule_Date = CURDATE() AND slots.Start_Time >= CURTIME()))
                )
            ORDER BY Schedule_Date
            LIMIT 10
        `;

        const connection = getConnection();

        connection.execute(query, [iClientId, iMenuId, iKey], (err, results) => {
            if (err) {
                console.error('Error fetching available dates:', err.message);
                reject(err);
            } else {
                // Return only available dates, excluding Schedule_Date from the final output if needed
                const formattedResults = results.map(({ CLIENT_ID, MENU_ID, ITEM_ID, MENU_NAME }) => ({
                    CLIENT_ID,
                    MENU_ID,
                    ITEM_ID,
                    MENU_NAME
                }));
                resolve(formattedResults);
            }
        });
    });
}


function getAvailableTimes(iClientId, iMenuId, iKey, iValue) {
    return new Promise((resolve, reject) => {
        console.log(`getAvailableTimes: iClientId:${iClientId} ,iMenuId: ${iMenuId}, iKey: ${iKey}, iValue: ${iValue}`);
        const query = `
            SELECT DISTINCT
                ? AS CLIENT_ID,
                ? AS MENU_ID,
                CONCAT(POC_ID, '-', DATE_FORMAT(Schedule_Date, '%Y-%m-%d'), '-', Start_Time) AS ITEM_ID,
                Start_Time AS MENU_NAME
            FROM poc_available_slots
            WHERE POC_ID = ?
                AND Schedule_Date = STR_TO_DATE(?, '%Y-%m-%d')
                AND appointments_per_slot > 0
                AND (Schedule_Date > CURDATE() OR (Schedule_Date = CURDATE() AND Start_Time >= CURTIME()))
            ORDER BY Start_Time
            LIMIT 10
        `;

        const connection = getConnection();

        connection.execute(query, [iClientId, iMenuId, iKey, iValue], (err, results) => {
            if (err) {
                console.error('Error fetching available times:', err.message);
                reject(err);
            } else {
                resolve(results); // Return only available times
            }
        });
    });
}


// Get user data by contact number
function getUserData(userContact) {
    return new Promise(async(resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE User_Contact = ?';
        const connection = getConnection();

        connection.execute(query, [userContact], (err, results) => {
            if (err) {
                console.error('Error fetching user data:', err.message);
                reject(err);
            } else {
                // Check if results contain any rows, if not, resolve with null
                resolve(results.length > 0 ? results[0] : null);
            }
        });
    });
}

// Insert a new user into the Users table
async function insertUserData(userContact) {
    const query = 'INSERT IGNORE INTO Users (User_Contact) VALUES (?)';
    await getConnection().execute(query, [userContact]);
    return new Promise((resolve, reject) => {
        getConnection().execute(query, [userContact], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
// Update specific user field (name, email, or location)
async function updateUserField(userContact, field, value) {
    const query = `UPDATE Users SET ${field} = ? WHERE User_Contact = ?`;
    await getConnection().execute(query, [value, userContact]);
    return new Promise((resolve, reject) => {
        getConnection().execute(query, [value, userContact], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function insertAppointment(clientId, userId) {
    const query = 'INSERT INTO Appointments (Client_ID, User_ID, POC_ID, Appointment_Date, Appointment_Time, Appointment_Type, Status, Is_Active, JSON_DATA) VALUES (?,?,?,?,?,?,?,?,?)';
    const connection = getConnection();
    return new Promise((resolve, reject) => {
        connection.execute(query, [clientId, userId, null, null, null, null, 'Pending', false, JSON.stringify({})], (err, result) => {
            if (err) {
                reject(err);
            } else {
                const appointmentId = result.insertId;
                resolve(appointmentId);
            }
        });
    });
}

async function updateAppointment(column_name, value, appointmentId) {
    const query = `UPDATE Appointments SET ${column_name} =? WHERE Appointment_ID =? AND Status <> "Rescheduled"`;
    const connection = getConnection();
    return new Promise((resolve, reject) => {
        connection.execute(query, [value, appointmentId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}





// fetch appointment details using userId for cancel and reschedule
function getAppointmentDetailsByUserID(userId) {
    return new Promise((resolve, reject) => {
        console.log(userId);
        const query = `SELECT Appointment_Type, POC_ID, Appointment_ID, DATE_FORMAT(Appointment_Date, '%Y-%m-%d') as Appointment_Date, Appointment_Time FROM appointments WHERE User_ID = ? AND Appointment_Type <> "Emergency" AND Is_Active=1 AND(Appointment_Date > CURDATE() OR (Appointment_Date = CURDATE() AND Appointment_Time >= CURTIME()))`;
        const connection = getConnection();
        connection.execute(query, [userId], (err, rows) => {
            if (err) {
                reject(err); // Reject the Promise if there is an error
            } else {

                console.log(rows);
                resolve(rows);

            }
        });
    });
}

function getAppointmentDetailsByAppointmentId(appointmentId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT Appointment_Type, POC_ID,DATE_FORMAT(Appointment_Date, '%Y-%m-%d') as Appointment_Date, Appointment_Time FROM appointments WHERE Appointment_ID = ?`;
        const connection = getConnection();
        connection.execute(query, [appointmentId], (err, rows) => {
            if (err) {
                reject(err); // Reject the Promise if there is an error
            } else {
                if (rows.length > 0) {
                    console.log(rows);
                    resolve(rows);
                } else {
                    reject(new Error(`Error in fetching appointment`));
                }
            }
        });
    });
}




function getTemplateMessage(clientId, templateName) {
    return new Promise((resolve, reject) => {
        // Fetch the template text based on CLIENT_ID and TEMPLATE_NAME
        const query = `SELECT TEMPLATE_TEXT FROM Templates WHERE CLIENT_ID = ? AND TEMPLATE_NAME = ?`;
        const connection = getConnection();
        connection.execute(query, [clientId, templateName], (err, rows) => {
            if (err) {
                reject(err); // Reject the Promise if there is an error
            } else {
                if (rows.length > 0) {
                    resolve(rows[0].TEMPLATE_TEXT); // Resolve the Promise with the template text
                } else {
                    reject(new Error(`Template for ${templateName} not found for client ${clientId}`)); // Reject the Promise if the template is not found
                }
            }
        });
    });
}


async function getMeetLink(pocId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT Meet_Link FROM POC WHERE POC_ID = ?';
        const connection = getConnection();

        connection.execute(query, [pocId], (err, results) => {
            if (err) {
                console.error('Error fetching Meet_Link:', err.message);
                reject(err);
            } else {
                // Check if results contain any rows, if not, resolve with null
                resolve(results.length > 0 ? results[0].Meet_Link : null);
            }
        });
    });
}

const updateAppointmentJsonData = (appointmentId, key, value) => {
    return new Promise((resolve, reject) => {
        const connection = getConnection();

        // MySQL query to append new data to the JSON object directly  
        const updateQuery = `  
         UPDATE Appointments  
         SET JSON_DATA = JSON_SET(JSON_DATA, '$.${key}', ?)  
         WHERE Appointment_ID = ?  
       `;

        // Execute the update query  
        connection.execute(updateQuery, [value, appointmentId], (err) => {
            if (err) {
                console.error('Error updating JSON data:', err.message);
                reject(err);
            } else {
                console.log('JSON data updated successfully');
                resolve();
            }
        });
    });
};


const getAppointmentJsonDataByKey = (appointmentId, key) => {
    return new Promise((resolve, reject) => {
        const connection = getConnection();

        // MySQL query to retrieve a specific value from the JSON data  
        const query = `  
         SELECT JSON_EXTRACT(JSON_DATA, '$.${key}') AS value  
         FROM Appointments  
         WHERE Appointment_ID = ?  
       `;

        // Execute the query  
        connection.execute(query, [appointmentId], (err, results) => {
            if (err) {
                console.error('Error retrieving JSON data:', err.message);
                reject(err);
            } else {
                const value = results[0].value;
                resolve(value);
            }
        });
    });
};

const getAppointmentJsonData = (appointmentId) => {
    return new Promise((resolve, reject) => {
        const connection = getConnection();
        console.log(appointmentId);
        // MySQL query to retrieve the JSON data   
        const query = `   
      SELECT JSON_DATA   
      FROM Appointments   
      WHERE Appointment_ID = ?   
    `;

        // Execute the query   
        connection.execute(query, [appointmentId], (err, results) => {
            if (err) {
                console.error('Error retrieving JSON data:', err.message);
                reject(err);
            } else {
                const jsonData = results[0];
                console.log('getAppointmentJsonData:', jsonData); // Add this log  
                resolve(jsonData);
            }
        });
    });
};

const updateAvailableSlots = async(jsonData) => {
    console.log('updateAvailableSlots:', jsonData);

    if (jsonData === null || jsonData === undefined) {
        console.log('No appointment found');
        return;
    }

    const query = `  
     UPDATE POC_Available_Slots  
     SET appointments_per_slot = appointments_per_slot - 1  
     WHERE POC_ID = ? AND Schedule_Date = ? AND Start_Time = ? AND appointments_per_slot > 0;  
    `;

    // Access the nested `JSON_DATA` object  
    const data = jsonData.JSON_DATA;

    // Access specific properties inside `JSON_DATA`  
    const doctorId = data.Poc_ID;
    const appointmentDate = data.Appointment_Date;
    const appointmentTime = data.Appointment_Time;

    const connection = getConnection();
    await connection.execute(query, [doctorId, appointmentDate, appointmentTime]);
};

const increaseAvailableSlots = async(jsonData) => {
    console.log('increaseAvailableSlots:', jsonData);

    if (jsonData === null || jsonData === undefined) {
        console.log('No appointment found');
        return;
    }
    // Access the nested `JSON_DATA` object  
    const data = jsonData.JSON_DATA;

    // Access specific properties inside `JSON_DATA`  
    const pocId = data.Poc_ID;
    const appointmentDate = data.Appointment_Date;
    const appointmentTime = data.Appointment_Time;
    const query = `UPDATE POC_Available_Slots SET appointments_per_slot = appointments_per_slot + 1 WHERE POC_ID = ? AND Schedule_Date = ? AND Start_Time = ?`;
    const connection = getConnection();
    await connection.execute(query, [pocId, appointmentDate, appointmentTime]);
};

module.exports = { getAppointmentDetailsByAppointmentId, getAppointmentDetailsByUserID, increaseAvailableSlots, getMeetLink, getTemplateMessage, insertAppointment, updateAppointment, updateAvailableSlots, insertUserData, getUserData, updateUserField, getClientID, getWelcomeMessage, getMainMenu, getFromList, getPocFromPoc, getAvailableDates, getAvailableTimes, getAppointmentJsonDataByKey, getAppointmentJsonData, updateAppointmentJsonData };