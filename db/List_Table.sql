CREATE TABLE List (
    Client_ID INT,
    Item_ID INT PRIMARY KEY AUTO_INCREMENT,
    Key_name VARCHAR(50),  -- e.g., 'EMERGENCY_REASON', 'DEPARTMENT'
    Lang VARCHAR(10),  -- e.g., 'ENG'
    Value_name VARCHAR(255),
    Display_Order INT,
    UNIQUE (Client_ID, Key_name, Lang, Value_name)
);

-- Insert Departments into List Table
INSERT INTO List (Client_ID, Key_name, Lang, Value_name, Display_Order)
VALUES
(1, 'DEPARTMENT', 'ENG', 'Cardiology', 1),
(1, 'DEPARTMENT', 'ENG', 'Orthopedics', 2),
(1, 'DEPARTMENT', 'ENG', 'Pediatrics', 3);

-- Insert Emergency Reasons into List Table
INSERT INTO List (Client_ID, Key_name, Lang, Value_name, Display_Order)
VALUES
(1, 'EMERGENCY_REASON', 'ENG', 'Heart Attack', 1),
(1, 'EMERGENCY_REASON', 'ENG', 'Accident', 2),
(1, 'EMERGENCY_REASON', 'ENG', 'Choking', 3);
INSERT INTO List (Client_ID, Key_name, Lang, Value_name, Display_Order)
VALUES (1, 'GREETINGS','ENG','Welcome_Message',1);

UPDATE `chatbotdynamic`.`list` SET `Value_name` = 'Welcome to Miot Hospital😊' WHERE (`Item_ID` = '7');

INSERT INTO List (Client_ID, Key_name, Lang, Value_name, Display_Order)
VALUES (1, 'HEALTH_CHECKUP','ENG','Master_Health_Checkup',1);


-- client 2
INSERT INTO `chatbotdynamic`.`list` (`Client_ID`, `Item_ID`, `Key_name`, `Lang`, `Value_name`, `Display_Order`) VALUES ('2', '9', 'GREETINGS', 'ENG', 'Welcome to HK Hospital😊', '1');
