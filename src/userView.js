// userView.js
const {
  getPocDetails,
  getAppointmentDetailsByAppointmentId,
  getAppointmentDetailsByUserID,
  increaseAvailableSlots,
  getMeetLink,
  getTemplateMessage,
  insertAppointment,
  updateAppointment,
  updateAvailableSlots,
  insertUserData,
  getUserData,
  updateUserField,
  getClientID,
  getWelcomeMessage,
  getMainMenu,
  getFromList,
  getPocFromPoc,
  getAvailableDates,
  getAvailableTimes,
  getAppointmentJsonDataByKey,
  getAppointmentJsonData,
  updateAppointmentJsonData,
} = require("./dbController");
const {
  sendWhatsAppMessage,
  sendInteractiveMessage,
  sendInteractiveMessageWithImage,
  sendCancelRescheduleInteractiveMessage,
  sendRadioButtonMessage,
  sendBackButtonMessage,
} = require("./utils");
const { isValidEmail, isValidPhoneNumber } = require("./validate");
const { connectDB } = require("./db");

connectDB();
let userData;

exports.handleUserView = async (req, res) => {
  const body = req.body;
  const changes =
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0].value.messages;
  const displayPhoneNumber =
    body.entry[0].changes[0].value.metadata.display_phone_number;
  const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
  const from = changes[0].from;
  const messageBody = changes[0].text ? changes[0].text.body : null;
  console.log(`Received message: ${messageBody} from: ${from}`);

  const messageType = changes[0].text ? changes[0].type : null;
  console.log(`Received message type: ${messageType}`);

  if (messageType === "text") {
    // Get client ID based on the display phone number
    const clientId = await getClientID(displayPhoneNumber, from);
    if (clientId) {
      // Check user status (new or returning)
      userData = await getUserData(from);

      //Ashok:moved else to main if to give good understaning
      if (!userData) {
        // New user - insert user record and ask for name
        await insertUserData(from);
        await sendWhatsAppMessage(from, "Welcome! Please enter your name:");
      } else {
        // User exists - check for missing fields and prompt accordingly
        if (!userData.User_Name) {
          await updateUserField(from, "User_Name", messageBody);
          await sendWhatsAppMessage(
            from,
            "Thank you! Please enter your email:"
          );
        } else if (!userData.User_Email) {
          // Validate the email before updating
          if (isValidEmail(messageBody)) {
            await updateUserField(from, "User_Email", messageBody);
            await sendWhatsAppMessage(
              from,
              "Thank you! Please share your location:"
            );
          } else {
            // Invalid email format - prompt user to enter a valid email
            await sendWhatsAppMessage(
              from,
              "The email you entered is invalid. Please enter a valid email address:"
            );
          }
        } else if (!userData.User_Location) {
          await updateUserField(from, "User_Location", messageBody);
          await sendWhatsAppMessage(
            from,
            "Thank you for completing your details."
          );
          //Ashok:create method to make beloww welcome and first interactive as single method and reuse.
          // Show main menu after completing registration
          await sendWelcomeMessage(from, clientId);
        } else {
          // Fully registered user - display main menu
          await sendWelcomeMessage(from, clientId);
        }
      }
    }
  } else {
    // Extract the title from the JSON data
    const message = body.entry[0].changes[0].value.messages[0];
    let title = [];
    let Response_id = [];

    if (message.interactive) {
      const interactiveType = message.interactive.type;
      if (
        interactiveType === "button_reply" &&
        message.interactive.button_reply
      ) {
        title = message.interactive.button_reply.title;
        Response_id = message.interactive.button_reply.id.split("|");
      } else if (
        interactiveType === "list_reply" &&
        message.interactive.list_reply
      ) {
        title = message.interactive.list_reply.title;
        Response_id = message.interactive.list_reply.id.split("|");
      }
    }

    console.log(`Title: ${title} ID: ${Response_id}`);
    const previousId = Response_id[1];
    Response_id = Response_id[0].split("~");
    const clientId = Response_id[0];
    const menuId = Response_id[1];
    const selectId = Response_id[2];
    let Appointment_ID = Response_id[3];

    try {
      if (title.toLowerCase() === "book appointment") {
        Appointment_ID = await insertAppointment(clientId, userData.User_ID);
        console.log(`Appointment id: ${Appointment_ID}`);
      }

      // Get the main menu for initial interaction
      const mainMenuItems = await getMainMenu(clientId, menuId);

      if (mainMenuItems.length === 0) {
        sendWhatsAppMessage(from, "No menu options available.");
        return;
      } else if (mainMenuItems.length === 1 && mainMenuItems[0].ACTION) {
        const actionMenuNames = await handleAction(
          mainMenuItems[0].ACTION.split("~"),
          clientId,
          mainMenuItems[0].MENU_ID,
          title,
          selectId,
          from,
          Appointment_ID
        );

        // Retrieve the first menu item's HEADER_MESSAGE (assuming only one HEADER_MESSAGE for the main menu)
        let headerMessage = mainMenuItems[0].HEADER_MESSAGE;
        if (actionMenuNames !== null) {
          let menuNames;
          // Extract MENU_NAME items for interactive message
          //console.log(actionMenuNames[0].Appointment_ID)
          //Ashok: in what scenario, actionMenuNames[0].Appointment_ID is null??
          if (actionMenuNames[0].Appointment_ID) {
            menuNames = actionMenuNames.map((item) => ({
              id:
                item.CLIENT_ID +
                "~" +
                item.MENU_ID +
                "~" +
                item.ITEM_ID +
                "~" +
                item.Appointment_ID +
                "|" +
                clientId +
                "~" +
                menuId +
                "~" +
                selectId,
              title: item.MENU_NAME,
            }));
          } else {
            menuNames = actionMenuNames.map((item) => ({
              id:
                item.CLIENT_ID +
                "~" +
                item.MENU_ID +
                "~" +
                item.ITEM_ID +
                "~" +
                Appointment_ID +
                "|" +
                clientId +
                "~" +
                menuId +
                "~" +
                selectId,
              title: item.MENU_NAME,
            }));
          }
          await sendRadioButtonMessage(from, headerMessage, menuNames);
          //Ashok: Create method for sending backbutton message
          await sendBackButton(from, previousId, Appointment_ID, mainMenuItems);
        }
      } else {
        // Retrieve the first menu item's HEADER_MESSAGE (assuming only one HEADER_MESSAGE for the main menu)
        const headerMessage = mainMenuItems[0].HEADER_MESSAGE;
        // Extract MENU_NAME items for interactive message
        const menuNames = mainMenuItems.map((item) => ({
          id:
            item.CLIENT_ID +
            "~" +
            item.MENU_ID +
            "~" +
            item.ITEM_ID +
            "~" +
            Appointment_ID +
            "|" +
            clientId +
            "~" +
            menuId +
            "~" +
            selectId,
          title: item.MENU_NAME,
        }));
        await sendRadioButtonMessage(from, headerMessage, menuNames);
        await sendBackButton(from, previousId, Appointment_ID, mainMenuItems);
      }
    } catch (error) {
      console.error("Error fetching main menu:", error);
      sendWhatsAppMessage(
        from,
        "Sorry, an error occurred while fetching the menu."
      );
    }
  }
  res.sendStatus(200);
};

// This will be used to store appointment data in the database
async function handleAction(
  iAction,
  iClientId,
  iMenuId,
  iUserValue,
  iSelectId,
  from,
  Appointment_ID
) {
  const iLang = "ENG";
  console.log(
    `handleAction: iAction:${iAction} ,iClientID:${iClientId} ,iMenuId:${iMenuId}, iUserValue:${iUserValue} iSelectId: ${iSelectId} appointment_id: ${Appointment_ID}`
  );
  //Ashok:Why we need this below if else conditions to update appoinment and json?
  if (
    iUserValue != "Back" &&
    iUserValue != "Cancel Appointment" &&
    iUserValue != "Reschedule"
  ) {
    if (iAction[0].split("~")[0] === "Poc_name") {
      await updateAppointment("POC_ID", iSelectId, Appointment_ID);
      await updateAppointmentJsonData(Appointment_ID, "Poc_name", iUserValue);
      await updateAppointmentJsonData(Appointment_ID, "Poc_ID", iSelectId);
    } else if (
      iAction[0].split("~")[0] === "Department" ||
      iAction[0].split("~")[0] === "Confirm_Status" ||
      iAction[0].split("~")[0] === "Emergency_Reason"
    ) {
      await updateAppointmentJsonData(
        Appointment_ID,
        iAction[0].split("~")[0],
        iUserValue
      );
    } else {
      await updateAppointment(iAction[0], iUserValue, Appointment_ID);
      await updateAppointmentJsonData(
        Appointment_ID,
        iAction[0].split("~")[0],
        iUserValue
      );
    }
  }

  if (iAction[1] === "LIST") {
    return await getFromList(iClientId, iMenuId, iAction[2], iLang);
  } else if (iAction[1] === "POC") {
    return await getPocFromPoc(
      iClientId,
      iMenuId,
      await getAppointmentJsonDataByKey(Appointment_ID, "Department")
    );
  } else if (iAction[1] === "FETCH_AVAILABLE_DATES_DIRECT") {
    //Ashok: Why we have to update again?
    return await getAvailableDates(iClientId, iMenuId, iSelectId);
  } else if (iAction[1] === "FETCH_AVAILABLE_DATES_CHECKUP") {
    let poc_details = await getPocFromPoc(
      iClientId,
      iMenuId,
      await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Type")
    );
    poc_details = poc_details[0];
    //Ashok: Why we have to update again?
    await updateAppointmentJsonData(
      Appointment_ID,
      "Poc_ID",
      poc_details.ITEM_ID
    );
    await updateAppointment("POC_ID", poc_details.ITEM_ID, Appointment_ID);
    console.log(`Poc_ID: ${poc_details.ITEM_ID}`);
    return await getAvailableDates(iClientId, iMenuId, poc_details.ITEM_ID);
  } else if (iAction[1] === "FETCH_AVAILABLE_TIMES_DIRECT") {
    return await getAvailableTimes(
      iClientId,
      iMenuId,
      iSelectId,
      await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Date")
    );
  } else if (iAction[1] === "CONFIRM") {
    //Ashok: Move the below replace section to a method, also do not use multiple hits to get json key. Get the json once and get the values from retrived json

    const confirmationMessage = await confirmAppointment(
      iClientId,
      iAction,
      Appointment_ID
    );
    // Send confirmation message to user
    await sendWhatsAppMessage(from, confirmationMessage);

    // Create confirmation options with unique placeholders
    const confirmationOptions = [
      {
        CLIENT_ID: iClientId,
        MENU_ID: iMenuId,
        ITEM_ID: "Confirm",
        MENU_NAME: "Confirm",
      },
      {
        CLIENT_ID: iClientId,
        MENU_ID: iMenuId,
        ITEM_ID: "Cancel_Appointment_Request",
        MENU_NAME: "Cancel Request",
      },
    ];
    // Return formatted list of options
    return confirmationOptions;
  } else if (iAction[1] === "FINALIZE") {
    if (iUserValue === "Confirm") {
      const finalizeMessage = await finalizeAppointment(
        iClientId,
        iAction,
        Appointment_ID
      );
      await sendWhatsAppMessage(from, finalizeMessage);
    } else if (iUserValue === "Cancel Request") {
      let cancel_message = await getTemplateMessage(iClientId, iSelectId);
      await sendWhatsAppMessage(from, cancel_message);
    }
    return null;
  } else if (iAction[1] === "FETCH_APPOINTMENT_DETAILS") {
    const appointmentDetails = await getAppointmentDetailsByUserID(
      userData.User_ID
    );
    console.log(appointmentDetails);
    if (appointmentDetails && appointmentDetails.length > 0) {
      const appointments = appointmentDetails.map((appointment, index) => {
        Appointment_ID = appointment.Appointment_ID;
        return {
          id: appointment.Appointment_ID,
          text: `Appointment ID: ${appointment.Appointment_ID},Appointment Type: ${appointment.Appointment_Type}, Date: ${appointment.Appointment_Date}, Time: ${appointment.Appointment_Time}`,
          cancelOptions: [
            {
              CLIENT_ID: iClientId,
              MENU_ID: iMenuId,
              ITEM_ID: "Cancel",
              MENU_NAME: "Cancel",
            },
            {
              CLIENT_ID: iClientId,
              MENU_ID: 0,
              ITEM_ID: "Back",
              MENU_NAME: "Back",
            },
          ],
        };
      });

      for (const appointment of appointments) {
        const cancelItems = appointment.cancelOptions.map((item) => ({
          id:
            item.CLIENT_ID +
            "~" +
            item.MENU_ID +
            "~" +
            item.ITEM_ID +
            "~" +
            appointment.id +
            "|" +
            iClientId +
            "~" +
            iMenuId +
            "~" +
            iSelectId,
          title: item.MENU_NAME,
        }));
        //Ashok: Why we need separate method for this?
        await sendCancelRescheduleInteractiveMessage(
          from,
          appointment.text,
          cancelItems
        );
      }
    } else {
      await sendWhatsAppMessage(from, "No appointment found.");
    }
    return null;
  } else if (iAction[1] === "FINALIZE_CANCEL") {
    if (iUserValue === "Cancel") {
      await updateAppointment("Status", "Cancelled", Appointment_ID);
      await updateAppointment("Is_Active", 0, Appointment_ID);
      // Get the POC ID, appointment date, and time from the appointment details
      const appointmentDetails = await getAppointmentDetailsByAppointmentId(
        Appointment_ID
      );
      const jsonData = await getAppointmentJsonData(Appointment_ID);
      jsonData["Poc_ID"] = appointmentDetails[0].POC_ID;
      jsonData["Appointment_Date"] = appointmentDetails[0].Appointment_Date;
      jsonData["Appointment_Time"] = appointmentDetails[0].Appointment_Time;
      console.log(
        ` ${jsonData["Poc_ID"]}  ${jsonData["Appointment_Date"]} ${jsonData["Appointment_Time"]}`
      );
      // Increase the appointments_per_slot available by one
      await increaseAvailableSlots(jsonData);
      await sendWhatsAppMessage(from, "Appointment cancelled successfully.");
    }
    return null;
  } else if (iAction[1] === "FETCH_APPOINTMENT_DETAILS_RESCHEDULE") {
    //Ashok: Why we need separate fetch appointment for Cancel and resudule?
    const appointmentDetails = await getAppointmentDetailsByUserID(
      userData.User_ID
    );
    console.log(appointmentDetails);
    if (appointmentDetails && appointmentDetails.length > 0) {
      const appointments = appointmentDetails.map((appointment, index) => {
        Appointment_ID = appointment.Appointment_ID;
        return {
          id: appointment.Appointment_ID,
          text: `Appointment ID: ${appointment.Appointment_ID}, Appointment Type: ${appointment.Appointment_Type}, Date: ${appointment.Appointment_Date}, Time: ${appointment.Appointment_Time}`,
          rescheduleOptions: [
            {
              CLIENT_ID: iClientId,
              MENU_ID: iMenuId,
              ITEM_ID: "Reschedule",
              MENU_NAME: "Reschedule",
            },
            {
              CLIENT_ID: iClientId,
              MENU_ID: 0,
              ITEM_ID: "Back",
              MENU_NAME: "Back",
            },
          ],
        };
      });

      for (const appointment of appointments) {
        const rescheduleItems = appointment.rescheduleOptions.map((item) => ({
          id:
            item.CLIENT_ID +
            "~" +
            item.MENU_ID +
            "~" +
            item.ITEM_ID +
            "~" +
            appointment.id +
            "|" +
            iClientId +
            "~" +
            iMenuId +
            "~" +
            iSelectId,
          title: item.MENU_NAME,
        }));
        await sendCancelRescheduleInteractiveMessage(
          from,
          appointment.text,
          rescheduleItems
        );
      }
    } else {
      await sendWhatsAppMessage(from, "No appointment found.");
    }
    return null;
  } else if (iAction[1] === "RESCHEDULE_DATE") {
    // Get the appointment details
    const appointmentDetails = await getAppointmentDetailsByAppointmentId(
      Appointment_ID
    );
    console.log(appointmentDetails);
    const jsonData = await getAppointmentJsonData(Appointment_ID);
    jsonData["Poc_ID"] = appointmentDetails[0].POC_ID;
    jsonData["Appointment_Type"] = appointmentDetails[0].Appointment_Type;
    jsonData["Appointment_Date"] = appointmentDetails[0].Appointment_Date;
    jsonData["Appointment_Time"] = appointmentDetails[0].Appointment_Time;

    // Update the existing appointment status as rescheduled and make it inactive
    await updateAppointment("Is_Active", 0, Appointment_ID);
    await updateAppointment("Status", "Rescheduled", Appointment_ID);

    //Update the available slots
    await increaseAvailableSlots(jsonData);

    // Create a new appointment with the new time and date
    Appointment_ID = await insertAppointment(iClientId, userData.User_ID);
    console.log("New Appointment id : " + Appointment_ID);
    console.log(
      `Appointment Type: ${jsonData["Appointment_Type"]} POC_ID: '${jsonData["Poc_ID"]}`
    );
    await updateAppointment(
      "Appointment_Type",
      jsonData["Appointment_Type"],
      Appointment_ID
    );
    await updateAppointmentJsonData(
      Appointment_ID,
      "Appointment_Type",
      jsonData["Appointment_Type"]
    );
    await updateAppointment("POC_ID", jsonData["Poc_ID"], Appointment_ID);
    await updateAppointmentJsonData(
      Appointment_ID,
      "Poc_ID",
      jsonData["Poc_ID"]
    );

    // Get the available dates for rescheduling
    const availableDates = await getAvailableDates(
      iClientId,
      iMenuId,
      await getAppointmentJsonDataByKey(Appointment_ID, "Poc_ID")
    );

    // Send the available dates to the user
    const dateOptions = availableDates.map((date) => ({
      id:
        date.CLIENT_ID +
        "~" +
        date.MENU_ID +
        "~" +
        date.ITEM_ID +
        "~" +
        Appointment_ID +
        "|" +
        iClientId +
        "~" +
        iMenuId +
        "~" +
        iSelectId,
      title: date.MENU_NAME,
    }));
    await sendRadioButtonMessage(from, "Select a new date:", dateOptions);

    return null;
  } else if (iAction[1] === "CONFIRM_RESCHEDULE") {
    await updateAppointment(
      "Appointment_Date",
      await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Date"),
      Appointment_ID
    );
    await updateAppointment(
      "Appointment_Time",
      await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Time"),
      Appointment_ID
    );
    let confirmationMessage = await getTemplateMessage(iClientId, iAction[1]);
    confirmationMessage = confirmationMessage.replace(
      "[User_Name]",
      userData.User_Name || ""
    );
    confirmationMessage = confirmationMessage.replace(
      "[User_Email]",
      userData.User_Email || ""
    );
    confirmationMessage = confirmationMessage.replace(
      "[User_Location]",
      userData.User_Location || ""
    );
    confirmationMessage = confirmationMessage.replace(
      "[Appointment_Type]",
      (await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Type")) ||
        ""
    );
    confirmationMessage = confirmationMessage.replace(
      "[Appointment_Date]",
      (await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Date")) ||
        ""
    );
    confirmationMessage = confirmationMessage.replace(
      "[Appointment_Time]",
      (await getAppointmentJsonDataByKey(Appointment_ID, "Appointment_Time")) ||
        ""
    );
    await sendWhatsAppMessage(from, confirmationMessage);
    const confirmationOptions = [
      {
        CLIENT_ID: iClientId,
        MENU_ID: iMenuId,
        ITEM_ID: "Confirm",
        Appointment_ID: Appointment_ID,
        MENU_NAME: "Confirm",
      },
      {
        CLIENT_ID: iClientId,
        MENU_ID: iMenuId,
        ITEM_ID: "Cancel_Reschedule_Request",
        Appointment_ID: Appointment_ID,
        MENU_NAME: "Cancel Request",
      },
    ];
    // Return formatted list of options
    return confirmationOptions;
  } else if (iAction[1] === "FINALIZE_RESCHEDULE") {
    if (iUserValue === "Confirm") {
      await updateAppointment("Status", "Confirmed", Appointment_ID);
      await updateAppointment("Is_Active", 1, Appointment_ID);
      // Update the appointments_per_slot
      await updateAvailableSlots(await getAppointmentJsonData(Appointment_ID));
      let finalizeMessage = await getTemplateMessage(iClientId, iAction[1]);
      finalizeMessage = finalizeMessage.replace(
        "[Appointment_ID]",
        Appointment_ID || ""
      );
      // Send a confirmation message to the user
      await sendWhatsAppMessage(from, finalizeMessage);
    } else if (iUserValue === "Cancel Request") {
      let cancel_message = await getTemplateMessage(iClientId, iSelectId);
      await sendWhatsAppMessage(from, cancel_message);
    }
    return null;
  } else {
    console.log("handleAction:inside Else");
  }
}

//Function to send a confirmation message to the user
async function confirmAppointment(iClientId, iAction, Appointment_ID) {
  let confirmationMessage = await getTemplateMessage(iClientId, iAction[2]);
  const jsonData = await getAppointmentJsonData(Appointment_ID);
  console.log("Before replacements:", confirmationMessage);

  // Replace each placeholder
  confirmationMessage = confirmationMessage.replace(
    "[User_Name]",
    userData.User_Name || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[User_Email]",
    userData.User_Email || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[User_Location]",
    userData.User_Location || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[Appointment_Type]",
    jsonData["JSON_DATA"]["Appointment_Type"] || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[Department]",
    jsonData["JSON_DATA"]["Department"] || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[POC]",
    jsonData["JSON_DATA"]["Poc_name"] || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[Appointment_Date]",
    jsonData["JSON_DATA"]["Appointment_Date"] || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[Appointment_Time]",
    jsonData["JSON_DATA"]["Appointment_Time"] || ""
  );
  confirmationMessage = confirmationMessage.replace(
    "[Emergency_Reason]",
    jsonData["JSON_DATA"]["Emergency_Reason"] || ""
  );

  return confirmationMessage;
}

// Function to send a final confirmation message to the user
async function finalizeAppointment(iClientId, iAction, Appointment_ID) {
  await updateAppointment("Status", "Confirmed", Appointment_ID);
  await updateAppointment("Is_Active", 1, Appointment_ID);
  const jsonData = await getAppointmentJsonData(Appointment_ID);
  //Ashok: There is a possiblility of more then allowed number of peron booking a slot.
  if (jsonData["JSON_DATA"]["Appointment_Type"] != "Emergency") {
    await updateAvailableSlots(await getAppointmentJsonData(Appointment_ID));
  }
  let finalizeMessage = await getTemplateMessage(iClientId, iAction[2]);
  finalizeMessage = finalizeMessage.replace(
    "[Appointment_ID]",
    Appointment_ID || ""
  );
  finalizeMessage = finalizeMessage.replace(
    "[Meet_Link]",
    (await getMeetLink(jsonData["JSON_DATA"]["Poc_ID"])) || ""
  );
  return finalizeMessage;
}

async function sendWelcomeMessage(from, clientId) {
  const welcomeMessage = await getWelcomeMessage(clientId);
  await sendWhatsAppMessage(
    from,
    `Hi ${userData.User_Name}, ${welcomeMessage}`
  );

  const mainMenuItems = await getMainMenu(clientId, 0);
  const headerMessage = mainMenuItems[0].HEADER_MESSAGE;
  const menuNames = mainMenuItems.map((item) => ({
    id:
      item.CLIENT_ID +
      "~" +
      item.MENU_ID +
      "~" +
      item.MENU_ID +
      "|" +
      item.CLIENT_ID +
      "~" +
      item.MENU_ID +
      "~" +
      item.MENU_ID,
    title: item.MENU_NAME,
  }));
  await sendInteractiveMessageWithImage(
    from,
    headerMessage,
    menuNames,
    "./../images/welcome.jpg"
  );
  console.log(`user Id: ${userData.User_ID}`);
}

//Method to send Back Button message
async function sendBackButton(from, previousId, Appointment_ID, mainMenuItems) {
  const backmessage = [
    {
      id:
        previousId +
        "~" +
        Appointment_ID +
        "|" +
        mainMenuItems[0].CLIENT_ID +
        "~" +
        mainMenuItems[0].MENU_ID +
        "~" +
        mainMenuItems[0].ITEM_ID,
      title: "Back",
    },
  ];
  await sendBackButtonMessage(from, backmessage);
}
