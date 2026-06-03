-- Insert all PJA Block Rooms matching the Phase 1 Schema
-- Schema Columns: room_name, block_name, capacity, room_type
-- ALL capacities set to 75.

INSERT INTO public.rooms (room_name, block_name, capacity, room_type)
VALUES 
  -- ==========================================
  -- 1ST FLOOR
  -- ==========================================
  ('C-101', 'PJA', 75, 'Classroom'),
  ('C-102', 'PJA', 75, 'Classroom'),
  ('C-103', 'PJA', 75, 'Classroom'),
  ('C-104', 'PJA', 75, 'Classroom'),
  ('C-105', 'PJA', 75, 'Classroom'),
  ('C-106', 'PJA', 75, 'Classroom'),

  -- ==========================================
  -- 2ND FLOOR
  -- ==========================================
  ('C-201', 'PJA', 75, 'Classroom'),
  ('C-204', 'PJA', 75, 'Classroom'),
  ('C-205', 'PJA', 75, 'Classroom'),
  ('C-206', 'PJA', 75, 'Classroom'),
  ('C-207', 'PJA', 75, 'Classroom'),
  ('C-208', 'PJA', 75, 'Classroom'),
  ('C-209', 'PJA', 75, 'Classroom'),
  ('C-210', 'PJA', 75, 'Classroom'),
  ('C-213', 'PJA', 75, 'Classroom'),
  ('C-214', 'PJA', 75, 'Classroom'),
  ('C-215', 'PJA', 75, 'Classroom'),
  ('C-216', 'PJA', 75, 'Classroom'),
  ('C-217', 'PJA', 75, 'Classroom'),
  ('C-220', 'PJA', 75, 'Classroom'),
  ('L-203', 'PJA', 75, 'Lab'),
  ('L-211', 'PJA', 75, 'Lab'),
  ('L-212', 'PJA', 75, 'Lab'),
  ('L-218', 'PJA', 75, 'Lab'),

  -- ==========================================
  -- 3RD FLOOR
  -- ==========================================
  ('C-301', 'PJA', 75, 'Classroom'),
  ('C-302', 'PJA', 75, 'Classroom'),
  ('C-303', 'PJA', 75, 'Classroom'),
  ('C-304', 'PJA', 75, 'Classroom'),
  ('C-305', 'PJA', 75, 'Classroom'),
  ('C-306', 'PJA', 75, 'Classroom'),
  ('C-307', 'PJA', 75, 'Classroom'),
  ('L-301', 'PJA', 75, 'Lab'),
  ('L-302', 'PJA', 75, 'Lab'),
  ('L-303', 'PJA', 75, 'Lab'),
  ('L-304', 'PJA', 75, 'Lab'),
  ('L-305', 'PJA', 75, 'Lab'),
  ('L-306', 'PJA', 75, 'Lab'),
  ('L-307', 'PJA', 75, 'Lab'),
  ('L-308', 'PJA', 75, 'Lab'),
  ('T-301', 'PJA', 75, 'Tutorial Room'),
  ('T-302', 'PJA', 75, 'Tutorial Room'),
  ('T-303', 'PJA', 75, 'Tutorial Room'),
  ('ECE Seminar Hall', 'PJA', 75, 'Seminar Hall'),

  -- ==========================================
  -- 4TH FLOOR
  -- ==========================================
  ('PG-Lab-1', 'PJA', 75, 'Lab'),
  ('PG-Lab-2', 'PJA', 75, 'Lab'),
  ('PG-CR-1', 'PJA', 75, 'Classroom'),
  ('PG-CR-2', 'PJA', 75, 'Classroom'),
  ('R&D Room', 'PJA', 75, 'Lab'),
  ('BSN-LAB', 'PJA', 75, 'Seminar Hall'),
  ('C-401', 'PJA', 75, 'Classroom'),
  ('Innovation Lab (C-402)', 'PJA', 75, 'Lab'),
  ('C-403', 'PJA', 75, 'Classroom'),
  ('C-404', 'PJA', 75, 'Classroom'),
  ('C-405', 'PJA', 75, 'Classroom'),
  ('C-406', 'PJA', 75, 'Classroom'),
  ('C-407', 'PJA', 75, 'Classroom'),
  ('C-408', 'PJA', 75, 'Classroom'),
  ('CSE-T-1', 'PJA', 75, 'Tutorial Room'),
  ('CSE-T-2', 'PJA', 75, 'Tutorial Room'),
  ('CSE-Lab-1', 'PJA', 75, 'Lab'),
  ('CSE-Lab-2', 'PJA', 75, 'Lab'),
  ('CSE-Lab-3', 'PJA', 75, 'Lab'),  --seminar hall

  -- ==========================================
  -- 5TH FLOOR
  -- ==========================================
  ('PG-CR-1', 'PJA', 75, 'Classroom'),
  ('PG-CR-2', 'PJA', 75, 'Classroom'),
  ('PG-Lab-1', 'PJA', 75, 'Lab'),
  ('ISE Seminar Hall', 'PJA', 75, 'Seminar Hall'),
  ('ISE-Lab-1', 'PJA', 75, 'Lab'),
  ('ISE-Lab-2', 'PJA', 75, 'Lab'),
  ('ISE-Lab-3', 'PJA', 75, 'Lab'),
  ('ISE-Lab-4', 'PJA', 75, 'Lab'),
  ('C-501', 'PJA', 75, 'Classroom'),
  ('C-502', 'PJA', 75, 'Classroom'),
  ('C-503', 'PJA', 75, 'Classroom'),
  ('C-504', 'PJA', 75, 'Classroom'),
  ('C-505', 'PJA', 75, 'Classroom'),
  ('C-506', 'PJA', 75, 'Classroom'),
  ('C-507', 'PJA', 75, 'Classroom'),
  ('C-508', 'PJA', 75, 'Classroom'),
  ('T-501', 'PJA', 75, 'Tutorial Room'),

  -- ==========================================
  -- 6TH FLOOR
  -- ==========================================
  ('C-601', 'PJA', 75, 'Classroom'),
  ('C-602', 'PJA', 75, 'Classroom'),
  ('C-603', 'PJA', 75, 'Classroom'),
  ('C-605', 'PJA', 75, 'Classroom'),
  ('C-606', 'PJA', 75, 'Classroom'),
  ('C-607', 'PJA', 75, 'Classroom'),
  ('CSBS Lab', 'PJA', 75, 'Lab'),
  ('CSDS Lab', 'PJA', 75, 'Lab'),
  ('ML-Lab-1', 'PJA', 75, 'Lab'),   --C-604
  ('Digital Electronics Lab', 'PJA', 75, 'Lab'),
  ('Project Lab', 'PJA', 75, 'Lab'),
  ('ICB Cyber Lab', 'PJA', 75, 'Lab'),
  ('IoT Lab', 'PJA', 75, 'Lab'),
  ('AIML Lab', 'PJA', 75, 'Lab'),
  ('AIDS,DS Lab', 'PJA', 75, 'Lab'),

  -- ==========================================
  -- 7TH FLOOR
  -- ==========================================
  ('MBA CR-1', 'PJA', 75, 'Classroom'),
  ('MBA CR-2', 'PJA', 75, 'Classroom'),
  ('MBA CR-3', 'PJA', 75, 'Classroom'),
  ('MBA CR-4', 'PJA', 75, 'Classroom'),
  ('MBA CR-5', 'PJA', 75, 'Classroom'),
  ('Placement Cell', 'PJA', 75, 'Office'),
  ('Comp Lab-1', 'PJA', 75, 'Lab'),
  ('MEL Lab-1', 'PJA', 75, 'Lab'),
  ('MEL Lab-2', 'PJA', 75, 'Lab'),
  ('MEL-CR-1', 'PJA', 75, 'Classroom'),
  ('MEL-CR-2', 'PJA', 75, 'Classroom'),
  ('MEL-CR-3', 'PJA', 75, 'Classroom'),
  ('Comp Intelligence Lab', 'PJA', 75, 'Lab');