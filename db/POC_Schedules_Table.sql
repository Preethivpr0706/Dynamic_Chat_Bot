CREATE TABLE POC_Schedules (
    Schedule_ID INT PRIMARY KEY AUTO_INCREMENT,
    POC_ID INT,
    Day_of_Week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    Start_Time TIME,
    End_Time TIME,
    appointments_per_slot INT,
    slot_duration INT,
    FOREIGN KEY (POC_ID) REFERENCES POC(POC_ID) ON DELETE CASCADE
);
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(1, 'Monday', '10:00:00', '12:00:00', 30, 3), 
(1, 'Monday', '14:00:00', '17:00:00', 30, 3), 
(1, 'Tuesday', '10:00:00', '12:00:00', 30, 3),
(1, 'Tuesday', '14:00:00', '17:00:00', 30, 3),
(1, 'wednesday', '10:00:00', '12:00:00', 30, 3),
(1, 'wednesday', '14:00:00', '17:00:00', 30, 3),
(1, 'Thursday', '10:00:00', '12:00:00', 30, 3),
(1, 'Thursday', '14:00:00', '17:00:00', 30, 3),
(1, 'Friday', '10:00:00', '12:00:00', 30, 3),
(1, 'Friday', '14:00:00', '17:00:00', 30, 3);
-- Doctor 2: Dr. Preet Jones (Orthopedics)
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(2, 'Monday', '10:00:00', '12:00:00', 30, 6), 
(2, 'Monday', '14:00:00', '17:00:00', 30, 6), 
(2, 'Tuesday', '10:00:00', '12:00:00', 30, 6),
(2, 'Tuesday', '14:00:00', '17:00:00', 30, 6),
(2, 'wednesday', '10:00:00', '12:00:00', 30, 6),
(2, 'wednesday', '14:00:00', '17:00:00', 30, 6),
(2, 'Thursday', '10:00:00', '12:00:00', 30, 6),
(2, 'Thursday', '14:00:00', '17:00:00', 30, 6);

-- Doctor 3: Dr. Praggy Davis (Pediatrics)
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(3, 'Monday', '10:00:00', '12:00:00', 30, 2), 
(3, 'Monday', '14:00:00', '17:00:00', 30, 2), 
(3, 'Tuesday', '10:00:00', '12:00:00', 30, 2),
(3, 'Tuesday', '14:00:00', '17:00:00', 30, 2),
(3, 'wednesday', '10:00:00', '12:00:00', 30, 2),
(3, 'wednesday', '14:00:00', '17:00:00', 30, 2),
(3, 'Thursday', '10:00:00', '12:00:00', 30, 2),
(3, 'Thursday', '14:00:00', '17:00:00', 30, 2),
(3, 'Friday', '10:00:00', '12:00:00', 30, 2),
(3, 'Friday', '14:00:00', '17:00:00', 30, 2);

-- Checkup
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(4, 'Monday', '10:00:00', '12:00:00', 60, 10), 
(4, 'Monday', '14:00:00', '17:00:00', 60, 10), 
(4, 'Tuesday', '10:00:00', '12:00:00', 60, 10),
(4, 'Tuesday', '14:00:00', '17:00:00', 60, 10),
(4, 'wednesday', '10:00:00', '12:00:00', 60, 10),
(4, 'wednesday', '14:00:00', '17:00:00', 60, 10),
(4, 'Thursday', '10:00:00', '12:00:00', 60, 10),
(4, 'Thursday', '14:00:00', '17:00:00', 60, 10),
(4, 'Friday', '10:00:00', '12:00:00', 60, 10),
(4, 'Friday', '14:00:00', '17:00:00', 60, 10);

-- Dr. Bob
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(5, 'Monday', '10:00:00', '12:00:00', 30, 3), 
(5, 'Monday', '14:00:00', '17:00:00', 30, 3), 
(5, 'Tuesday', '10:00:00', '12:00:00', 30, 3),
(5, 'Tuesday', '14:00:00', '17:00:00', 30, 3),
(5, 'wednesday', '10:00:00', '12:00:00', 30, 3),
(5, 'wednesday', '14:00:00', '17:00:00', 30, 3),
(5, 'Thursday', '10:00:00', '12:00:00', 30, 3),
(5, 'Thursday', '14:00:00', '17:00:00', 30, 3),
(5, 'Friday', '10:00:00', '12:00:00', 30, 3),
(5, 'Friday', '14:00:00', '17:00:00', 30, 3);
-- Doctor 2: Dr. Alice (Orthopedics)
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(6, 'Monday', '10:00:00', '12:00:00', 30, 6), 
(6, 'Monday', '14:00:00', '17:00:00', 30, 6), 
(6, 'Tuesday', '10:00:00', '12:00:00', 30, 6),
(6, 'Tuesday', '14:00:00', '17:00:00', 30, 6),
(6, 'wednesday', '10:00:00', '12:00:00', 30, 6),
(6, 'wednesday', '14:00:00', '17:00:00', 30, 6),
(6, 'Thursday', '10:00:00', '12:00:00', 30, 6),
(6, 'Thursday', '14:00:00', '17:00:00', 30, 6),
(6, 'Friday', '10:00:00', '12:00:00', 30, 3),
(6, 'Friday', '14:00:00', '17:00:00', 30, 3);
-- Doctor 3: Dr. Rakesh (Pediatrics)
INSERT INTO POC_Schedules (POC_ID, Day_of_Week, start_time, end_time, slot_duration, appointments_per_slot)
VALUES
(7, 'Monday', '10:00:00', '12:00:00', 30, 6), 
(7, 'Monday', '14:00:00', '17:00:00', 30, 6), 
(7, 'Tuesday', '10:00:00', '12:00:00', 30, 6),
(7, 'Tuesday', '14:00:00', '17:00:00', 30, 6),
(7, 'wednesday', '10:00:00', '12:00:00', 30, 6),
(7, 'wednesday', '14:00:00', '17:00:00', 30, 6),
(7, 'Thursday', '10:00:00', '12:00:00', 30, 6),
(7, 'Thursday', '14:00:00', '17:00:00', 30, 6),
(7, 'Friday', '10:00:00', '12:00:00', 30, 3),
(7, 'Friday', '14:00:00', '17:00:00', 30, 3);