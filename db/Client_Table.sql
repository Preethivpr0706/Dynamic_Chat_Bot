create database chatbotdynamic;
use chatbotdynamic;
CREATE TABLE Client (
    Client_ID INT PRIMARY KEY AUTO_INCREMENT,
    Client_Name VARCHAR(100),
    Location VARCHAR(255),
    Contact_Number VARCHAR(20),
    Email VARCHAR(100)
);

INSERT INTO Client (Client_Name, Location, Contact_Number, Email)
VALUES ('MIOT Hospital', 'Anna Nagar, Chennai', '+15551834745', 'contact@cityhospital.com');


UPDATE `chatbotdynamic`.`client` SET `Contact_Number` = '15551834745' WHERE (`Client_ID` = '1');
