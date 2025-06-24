-- Migration: Create Bulk Grade Calculation with SQL Cursor
-- Created: 2025-06-25

-- Drop existing procedure if exists
DROP PROCEDURE IF EXISTS CalculateBulkStudentGrades;

-- Create stored procedure with SQL cursor
DELIMITER //
CREATE PROCEDURE CalculateBulkStudentGrades(
    IN p_kelas_id INT,
    OUT p_processed_count INT,
    OUT p_error_count INT
)
BEGIN
    -- Variables untuk cursor
    DECLARE v_siswa_id INT;
    DECLARE v_jadwal_id INT;
    DECLARE v_nama_siswa VARCHAR(100);
    DECLARE v_nama_mapel VARCHAR(255);
    DECLARE v_final_grade DECIMAL(5,2);
    DECLARE v_letter_grade VARCHAR(2);
    DECLARE v_attendance_rate DECIMAL(5,2);
    DECLARE v_task_average DECIMAL(5,2);
    DECLARE v_total_tasks INT;
    DECLARE v_completed_tasks INT;
    
    -- Control variables
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_error_occurred INT DEFAULT 0;
    
    -- 🔥 CURSOR untuk iterate semua siswa dan jadwal di kelas tertentu
    DECLARE student_grade_cursor CURSOR FOR
        SELECT DISTINCT 
            s.siswa_id,
            s.nama_lengkap,
            jp.jadwal_id,
            mp.nama_mapel
        FROM siswa s
        JOIN jadwalpelajaran jp ON s.kelas_id = jp.kelas_id
        JOIN matapelajaran mp ON jp.mapel_id = mp.mapel_id
        WHERE s.kelas_id = p_kelas_id
        ORDER BY s.siswa_id, jp.jadwal_id;
    
    -- Handler untuk cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error_occurred = 1;
    
    -- Initialize counters
    SET p_processed_count = 0;
    SET p_error_count = 0;
    
    -- Create temporary table untuk menyimpan hasil
    DROP TEMPORARY TABLE IF EXISTS temp_grades;
    CREATE TEMPORARY TABLE temp_grades (
        siswa_id INT,
        nama_siswa VARCHAR(100),
        jadwal_id INT,
        nama_mapel VARCHAR(255),
        attendance_rate DECIMAL(5,2),
        task_average DECIMAL(5,2),
        total_tasks INT,
        completed_tasks INT,
        final_grade DECIMAL(5,2),
        letter_grade VARCHAR(2),
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Start transaction
    START TRANSACTION;
    
    -- 🔥 OPEN CURSOR
    OPEN student_grade_cursor;
    
    -- 🔥 CURSOR LOOP - Process setiap siswa per mata pelajaran
    student_loop: LOOP
        FETCH student_grade_cursor INTO v_siswa_id, v_nama_siswa, v_jadwal_id, v_nama_mapel;
        
        IF done THEN
            LEAVE student_loop;
        END IF;
        
        -- Reset error flag dan variables
        SET v_error_occurred = 0;
        SET v_attendance_rate = 0;
        SET v_task_average = 0;
        SET v_total_tasks = 0;
        SET v_completed_tasks = 0;
        
        -- 🔥 CALCULATE ATTENDANCE RATE
        SELECT 
            COALESCE(
                (SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)),
                0
            ) INTO v_attendance_rate
        FROM absensi a
        JOIN pertemuan p ON a.id_pertemuan = p.id_pertemuan
        WHERE a.id_siswa = v_siswa_id 
        AND p.id_jadwal = v_jadwal_id;
        
        -- 🔥 CALCULATE TASK PERFORMANCE
        SELECT 
            COUNT(t.tugas_id) as total_tasks,
            COUNT(pt.pengumpulan_id) as completed_tasks,
            COALESCE(AVG(pt.poin_didapat), 0) as avg_score
        INTO v_total_tasks, v_completed_tasks, v_task_average
        FROM tugas t
        LEFT JOIN pengumpulantugas pt ON t.tugas_id = pt.tugas_id AND pt.siswa_id = v_siswa_id
        WHERE t.jadwal_id = v_jadwal_id;
        
        -- 🔥 CALCULATE FINAL GRADE (70% task + 30% attendance)
        SET v_final_grade = (v_task_average * 0.7) + (v_attendance_rate * 0.3);
        
        -- 🔥 DETERMINE LETTER GRADE
        CASE 
            WHEN v_final_grade >= 85 THEN SET v_letter_grade = 'A';
            WHEN v_final_grade >= 70 THEN SET v_letter_grade = 'B';
            WHEN v_final_grade >= 60 THEN SET v_letter_grade = 'C';
            WHEN v_final_grade >= 50 THEN SET v_letter_grade = 'D';
            ELSE SET v_letter_grade = 'E';
        END CASE;
        
        -- 🔥 INSERT INTO TEMPORARY TABLE
        INSERT INTO temp_grades (
            siswa_id, nama_siswa, jadwal_id, nama_mapel,
            attendance_rate, task_average, total_tasks, completed_tasks,
            final_grade, letter_grade
        ) VALUES (
            v_siswa_id, v_nama_siswa, v_jadwal_id, v_nama_mapel,
            v_attendance_rate, v_task_average, v_total_tasks, v_completed_tasks,
            v_final_grade, v_letter_grade
        );
        
        -- Update counters
        IF v_error_occurred = 1 THEN
            SET p_error_count = p_error_count + 1;
        ELSE
            SET p_processed_count = p_processed_count + 1;
        END IF;
        
    END LOOP;
    
    -- 🔥 CLOSE CURSOR
    CLOSE student_grade_cursor;
    
    -- Commit transaction
    COMMIT;
    
    -- Return results dari temporary table
    SELECT 
        siswa_id,
        nama_siswa,
        jadwal_id,
        nama_mapel,
        attendance_rate,
        task_average,
        total_tasks,
        completed_tasks,
        final_grade,
        letter_grade,
        calculated_at
    FROM temp_grades
    ORDER BY siswa_id, jadwal_id;
    
END //
DELIMITER ;

-- Create log table for bulk calculation
CREATE TABLE IF NOT EXISTS bulk_grade_calculation_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    kelas_id INT NOT NULL,
    processed_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    executed_by VARCHAR(100),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (kelas_id) REFERENCES kelas(kelas_id) ON DELETE CASCADE
);
