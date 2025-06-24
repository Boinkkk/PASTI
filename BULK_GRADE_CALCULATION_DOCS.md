# Bulk Grade Calculation Implementation Guide

## Overview

Fitur Bulk Grade Calculation adalah implementasi SQL cursor (procedural) untuk menghitung nilai siswa secara bulk pada sistem PASTI. Fitur ini menggunakan stored procedure MySQL untuk memproses data dalam jumlah besar dengan efisien.

## Architecture

### Backend (Go)
- **File**: `controllers/dashboardcontroller.go`
- **Endpoints**:
  - `POST /api/admin/analytics/bulk-grade-calculation` - Menjalankan bulk grade calculation
  - `GET /api/admin/analytics/bulk-grade-history` - Melihat history calculation

### Frontend (React)
- **File**: `my-app/src/pages/BulkGradeCalculation.tsx`
- **Route**: `/admin/analytics/bulk-grade-calculation`

### Database
- **Stored Procedure**: `CalculateBulkStudentGrades`
- **Log Table**: `bulk_grade_calculation_log`
- **Migration**: `migrations/create_bulk_grade_calculation.sql`

## Implementation Details

### 1. Stored Procedure (SQL Cursor)

```sql
DELIMITER //
CREATE PROCEDURE CalculateBulkStudentGrades(
    IN p_class_id INT,
    IN p_subject_id INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_student_id INT;
    DECLARE v_student_name VARCHAR(255);
    DECLARE v_class_name VARCHAR(100);
    DECLARE v_total_assignments INT DEFAULT 0;
    DECLARE v_completed_assignments INT DEFAULT 0;
    DECLARE v_total_points INT DEFAULT 0;
    DECLARE v_earned_points INT DEFAULT 0;
    DECLARE v_average_grade DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_status VARCHAR(50);
    DECLARE v_log_id INT;
    
    -- Cursor untuk iterasi siswa
    DECLARE student_cursor CURSOR FOR
        SELECT DISTINCT 
            s.siswa_id,
            s.nama_siswa,
            k.nama_kelas
        FROM siswa s
        JOIN kelas k ON s.kelas_id = k.kelas_id
        WHERE (p_class_id IS NULL OR s.kelas_id = p_class_id);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Insert log entry
    INSERT INTO bulk_grade_calculation_log (
        calculated_at,
        parameters_used,
        calculation_summary
    ) VALUES (
        NOW(),
        CONCAT('class_id: ', IFNULL(p_class_id, 'ALL'), ', subject_id: ', IFNULL(p_subject_id, 'ALL')),
        'Bulk grade calculation in progress'
    );
    
    SET v_log_id = LAST_INSERT_ID();
    
    -- Open cursor
    OPEN student_cursor;
    
    student_loop: LOOP
        FETCH student_cursor INTO v_student_id, v_student_name, v_class_name;
        
        IF done THEN
            LEAVE student_loop;
        END IF;
        
        -- Calculate assignments and grades for this student
        SELECT 
            COUNT(*) as total_assignments,
            SUM(CASE WHEN pt.nilai IS NOT NULL THEN 1 ELSE 0 END) as completed_assignments,
            SUM(t.poin_maksimal) as total_points,
            SUM(IFNULL(pt.nilai, 0)) as earned_points
        INTO 
            v_total_assignments,
            v_completed_assignments,
            v_total_points,
            v_earned_points
        FROM tugas t
        LEFT JOIN pengumpulan_tugas pt ON t.tugas_id = pt.tugas_id AND pt.siswa_id = v_student_id
        WHERE (p_subject_id IS NULL OR t.mapel_id = p_subject_id);
        
        -- Calculate average grade
        IF v_total_points > 0 THEN
            SET v_average_grade = (v_earned_points / v_total_points) * 100;
        ELSE
            SET v_average_grade = 0;
        END IF;
        
        -- Determine status
        IF v_average_grade >= 85 THEN
            SET v_status = 'Excellent';
        ELSEIF v_average_grade >= 75 THEN
            SET v_status = 'Good';
        ELSEIF v_average_grade >= 60 THEN
            SET v_status = 'Average';
        ELSE
            SET v_status = 'Needs Improvement';
        END IF;
        
        -- Return result for this student
        SELECT 
            v_student_id as student_id,
            v_student_name as student_name,
            v_class_name as class_name,
            v_total_assignments as total_assignments,
            v_completed_assignments as completed_assignments,
            v_total_points as total_points,
            v_earned_points as earned_points,
            v_average_grade as average_grade,
            v_status as status;
        
    END LOOP student_loop;
    
    CLOSE student_cursor;
    
    -- Update log with completion
    UPDATE bulk_grade_calculation_log 
    SET 
        calculation_summary = 'Bulk grade calculation completed successfully',
        total_students_processed = (
            SELECT COUNT(DISTINCT s.siswa_id)
            FROM siswa s 
            WHERE (p_class_id IS NULL OR s.kelas_id = p_class_id)
        ),
        total_assignments_processed = (
            SELECT COUNT(*)
            FROM tugas t
            WHERE (p_subject_id IS NULL OR t.mapel_id = p_subject_id)
        )
    WHERE id = v_log_id;
    
END //
DELIMITER ;
```

### 2. Backend Controller

```go
// CalculateBulkGrades - Endpoint untuk bulk grade calculation
func CalculateBulkGrades(w http.ResponseWriter, r *http.Request) {
    classID := r.URL.Query().Get("class_id")
    subjectID := r.URL.Query().Get("subject_id")
    
    if classID == "" && subjectID == "" {
        helpers.Response(w, 400, "Parameter class_id atau subject_id harus diisi", nil)
        return
    }
    
    // Build stored procedure call
    var procCall string
    var args []interface{}
    
    if classID != "" && subjectID != "" {
        procCall = "CALL CalculateBulkStudentGrades(?, ?)"
        args = []interface{}{classID, subjectID}
    } else if classID != "" {
        procCall = "CALL CalculateBulkStudentGrades(?, NULL)"
        args = []interface{}{classID}
    } else {
        procCall = "CALL CalculateBulkStudentGrades(NULL, ?)"
        args = []interface{}{subjectID}
    }
    
    // Execute stored procedure with manual cursor processing
    rows, err := config.DB.Raw(procCall, args...).Rows()
    if err != nil {
        helpers.Response(w, 500, "Gagal menjalankan bulk grade calculation: "+err.Error(), nil)
        return
    }
    defer rows.Close()
    
    var studentsProcessed []StudentGradeDetail
    var totalStudents, totalAssignments int
    
    // Manual cursor processing for stored procedure results
    for rows.Next() {
        var student StudentGradeDetail
        var avgGrade *float64
        
        err := rows.Scan(
            &student.StudentID,
            &student.StudentName,
            &student.ClassName,
            &student.TotalAssignments,
            &student.CompletedAssignments,
            &student.TotalPoints,
            &student.EarnedPoints,
            &avgGrade,
            &student.Status,
        )
        if err != nil {
            continue
        }
        
        if avgGrade != nil {
            student.AverageGrade = *avgGrade
        }
        
        studentsProcessed = append(studentsProcessed, student)
        totalStudents++
        if student.TotalAssignments > totalAssignments {
            totalAssignments = student.TotalAssignments
        }
    }
    
    // Build and return response
    result := BulkGradeCalculationResult{
        TotalStudents:      totalStudents,
        TotalAssignments:   totalAssignments,
        CalculationSummary: "Bulk grade calculation completed successfully",
        StudentsProcessed:  studentsProcessed,
    }
    
    helpers.Response(w, 200, "Bulk grade calculation berhasil dijalankan dengan SQL cursor", result)
}
```

### 3. Frontend Component

```tsx
const BulkGradeCalculation: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<BulkGradeCalculationResult | null>(null);

  const handleCalculateBulkGrades = async () => {
    if (!selectedClass && !selectedSubject) {
      setError('Pilih minimal kelas atau mata pelajaran');
      return;
    }

    setIsCalculating(true);
    
    const params = new URLSearchParams();
    if (selectedClass) params.append('class_id', selectedClass);
    if (selectedSubject) params.append('subject_id', selectedSubject);

    const response = await fetch(`/api/admin/analytics/bulk-grade-calculation?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (response.ok) {
      setCalculationResult(data.data);
    }
    
    setIsCalculating(false);
  };

  // Render form, results, and history...
};
```

## Usage Instructions

### 1. Database Setup
```bash
# Run migration to create stored procedure and log table
mysql -u root -p pasti < migrations/create_bulk_grade_calculation.sql
```

### 2. Backend Testing
```bash
# Run the test script
.\test_bulk_grade_calculation.ps1
```

### 3. Frontend Access
```
# Navigate to the bulk grade calculation page
http://localhost:5173/admin/analytics/bulk-grade-calculation
```

## API Endpoints

### POST /api/admin/analytics/bulk-grade-calculation

**Parameters:**
- `class_id` (optional): ID kelas untuk filter
- `subject_id` (optional): ID mata pelajaran untuk filter

**Response:**
```json
{
  "status": 200,
  "message": "Bulk grade calculation berhasil dijalankan dengan SQL cursor",
  "data": {
    "log_id": 1,
    "calculated_at": "2025-06-25T10:30:00Z",
    "total_students": 25,
    "total_assignments": 10,
    "calculation_summary": "Bulk grade calculation completed successfully",
    "students_processed": [
      {
        "student_id": 1,
        "student_name": "John Doe",
        "class_name": "10A",
        "total_assignments": 10,
        "completed_assignments": 8,
        "total_points": 1000,
        "earned_points": 850,
        "average_grade": 85.0,
        "status": "Excellent"
      }
    ]
  }
}
```

### GET /api/admin/analytics/bulk-grade-history

**Parameters:**
- `page` (optional): Halaman pagination (default: 1)
- `limit` (optional): Jumlah record per halaman (default: 10)

**Response:**
```json
{
  "status": 200,
  "message": "History bulk grade calculation berhasil diambil",
  "data": {
    "history": [
      {
        "id": 1,
        "calculated_at": "2025-06-25T10:30:00Z",
        "total_students_processed": 25,
        "total_assignments_processed": 10,
        "calculation_summary": "Bulk grade calculation completed successfully",
        "parameters_used": "class_id: ALL, subject_id: ALL"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

## Features

### 1. SQL Cursor Implementation
- Menggunakan stored procedure dengan cursor untuk iterasi data siswa
- Efisien untuk pemrosesan data dalam jumlah besar
- Manual cursor processing di backend Go

### 2. Flexible Filtering
- Filter berdasarkan kelas saja
- Filter berdasarkan mata pelajaran saja
- Filter berdasarkan kombinasi kelas dan mata pelajaran
- Pemrosesan semua data jika tidak ada filter

### 3. Grade Calculation Logic
- Total assignments per siswa
- Completed assignments (yang sudah dinilai)
- Total points dan earned points
- Average grade percentage
- Status classification (Excellent, Good, Average, Needs Improvement)

### 4. History Tracking
- Log setiap calculation dengan timestamp
- Parameter yang digunakan
- Jumlah siswa dan assignment yang diproses
- Summary hasil calculation

### 5. Modern UI
- Responsive design dengan Tailwind CSS
- Real-time feedback saat calculation berjalan
- Tabel interaktif untuk hasil dan history
- Pagination untuk history
- Error handling dan success messages

## Performance Considerations

1. **SQL Cursor**: Menggunakan cursor MySQL untuk iterasi efisien
2. **Manual Processing**: Backend Go memproses hasil cursor secara manual
3. **Batch Processing**: Dapat dijalankan untuk subset data (per kelas/mapel)
4. **Logging**: Tracking performa dan parameter setiap calculation

## Security

1. **Authentication**: Endpoint memerlukan admin token
2. **Authorization**: Hanya admin yang dapat mengakses
3. **Input Validation**: Validasi parameter class_id dan subject_id
4. **SQL Injection Protection**: Menggunakan prepared statements

## Future Enhancements

1. **Async Processing**: Implementasi background job untuk dataset besar
2. **Export Feature**: Export hasil ke Excel/PDF
3. **Scheduling**: Penjadwalan automatic calculation
4. **Email Notifications**: Notifikasi setelah calculation selesai
5. **Detailed Analytics**: Grafik dan visualisasi hasil calculation

## Troubleshooting

### Common Issues

1. **Stored Procedure Not Found**
   ```bash
   # Run migration again
   mysql -u root -p pasti < migrations/create_bulk_grade_calculation.sql
   ```

2. **No Data Returned**
   - Check if tugas and pengumpulan_tugas tables have data
   - Verify siswa and kelas relationships

3. **Backend Connection Error**
   - Ensure Go server is running on port 8080
   - Check database connection in config/database.go

4. **Frontend Route Not Found**
   - Verify route is added in main.tsx
   - Check if component is imported correctly

## Conclusion

Implementasi Bulk Grade Calculation menggunakan SQL cursor telah berhasil diterapkan pada sistem PASTI. Fitur ini memberikan kemampuan untuk memproses nilai siswa secara efisien dengan UI yang modern dan user-friendly.
