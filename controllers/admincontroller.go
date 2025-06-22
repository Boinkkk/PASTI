package controllers

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type AdminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AdminLoginResponse struct {
	Username string `json:"username"`
	Token    string `json:"token"`
}

type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func LoginAdmin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Method not allowed",
		})
		return
	}

	var request AdminLoginRequest
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid request format",
		})
		return
	}

	if request.Username == "" || request.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Username dan password harus diisi",
		})
		return
	}

	var admin models.Admin
	
	// Find admin by username
	if err := config.DB.Where("username = ?", request.Username).First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(Response{
				Status:  "error",
				Message: "Username atau password salah",
			})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Database error",
		})
		return
	}

	// Check password (no hashing as requested)
	if admin.Password != request.Password {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Username atau password salah",
		})
		return
	}

	// Generate JWT token
	token, err := helpers.CreateTokenAdmin(&admin)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to generate token",
		})
		return
	}

	response := AdminLoginResponse{
		Username: admin.Username,
		Token:    token,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Login berhasil",
		Data:    response,
	})
}

func GetAdminProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// This would be populated by middleware
	username := r.Header.Get("X-Username")
	role := r.Header.Get("X-Role")
	
	if role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Access denied",
		})
		return
	}

	var admin models.Admin
	if err := config.DB.Where("username = ?", username).First(&admin).Error; err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Admin not found",
		})
		return
	}

	// Don't return password
	adminResponse := map[string]interface{}{
		"username":   admin.Username,
		"created_at": admin.CreatedAt,
		"updated_at": admin.UpdatedAt,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Admin profile retrieved successfully",
		Data:    adminResponse,
	})
}

// UploadSiswaData - Handle upload data siswa untuk admin
func UploadSiswaData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Verify admin role from middleware
	role := r.Header.Get("X-Role")
	if role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Access denied - admin only",
		})
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Method not allowed",
		})
		return
	}

	// Parse multipart form data
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to parse form data",
		})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No file uploaded",
		})
		return
	}
	defer file.Close()

	// Validate file type (CSV or Excel)
	contentType := header.Header.Get("Content-Type")
	if contentType != "text/csv" && contentType != "application/vnd.ms-excel" && contentType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid file type. Only CSV and Excel files are allowed",
		})
		return
	}

	// For now, just return success response
	// In a real implementation, you would parse the CSV/Excel file and insert data to database
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "File uploaded successfully",
		Data: map[string]interface{}{
			"filename": header.Filename,
			"size":     header.Size,
			"type":     contentType,
		},
	})
}

// UploadGuruData - Handle upload data guru untuk admin
func UploadGuruData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Verify admin role from middleware
	role := r.Header.Get("X-Role")
	if role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Access denied - admin only",
		})
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Method not allowed",
		})
		return
	}

	// Parse multipart form data
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to parse form data",
		})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No file uploaded",
		})
		return
	}
	defer file.Close()

	// Validate file type (CSV)
	contentType := header.Header.Get("Content-Type")
	if contentType != "text/csv" && !strings.Contains(header.Filename, ".csv") {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid file type. Only CSV files are allowed",
		})
		return
	}

	// Read and parse CSV data
	csvData, err := parseGuruCSV(file)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: fmt.Sprintf("Failed to parse CSV: %v", err),
		})
		return
	}

	// Process data and insert to database
	successCount, errorCount, errors := processGuruData(csvData)

	// Return response
	response := map[string]interface{}{
		"filename":      header.Filename,
		"total_records": len(csvData),
		"success_count": successCount,
		"error_count":   errorCount,
		"errors":        errors,
	}

	if errorCount > 0 {
		w.WriteHeader(http.StatusPartialContent)
		json.NewEncoder(w).Encode(Response{
			Status:  "partial_success",
			Message: fmt.Sprintf("Upload completed with some errors. Success: %d, Errors: %d", successCount, errorCount),
			Data:    response,
		})
	} else {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(Response{
			Status:  "success",  
			Message: fmt.Sprintf("All %d guru records uploaded successfully", successCount),
			Data:    response,
		})
	}
}

// GuruCSVRecord represents a guru record from CSV
type GuruCSVRecord struct {
	NIP          string `csv:"nip"`
	NamaLengkap  string `csv:"nama_lengkap"`
	Email        string `csv:"email"`
	PasswordHash string `csv:"password"` // Plain text password from CSV, will be hashed automatically
}

// parseGuruCSV parses CSV file containing guru data
func parseGuruCSV(file multipart.File) ([]GuruCSVRecord, error) {
	// Reset file pointer to beginning
	file.Seek(0, 0)
	
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV: %v", err)
	}
	
	if len(records) < 2 {
		return nil, fmt.Errorf("CSV file must contain at least a header row and one data row")
	}
		// Expected header: nip, nama_lengkap, email, password
	header := records[0]
	expectedColumns := []string{"nip", "nama_lengkap", "email", "password"}
	
	// Validate header
	if len(header) != len(expectedColumns) {
		return nil, fmt.Errorf("CSV must have exactly %d columns: %v", len(expectedColumns), expectedColumns)
	}
	
	// Parse data rows
	var guruRecords []GuruCSVRecord
	for i, record := range records[1:] {
		if len(record) != len(expectedColumns) {
			return nil, fmt.Errorf("row %d has %d columns, expected %d", i+2, len(record), len(expectedColumns))
		}
		
		guruRecord := GuruCSVRecord{
			NIP:          strings.TrimSpace(record[0]),
			NamaLengkap:  strings.TrimSpace(record[1]),
			Email:        strings.TrimSpace(record[2]),
			PasswordHash: strings.TrimSpace(record[3]),
		}
		
		// Basic validation
		if guruRecord.NIP == "" || guruRecord.NamaLengkap == "" || guruRecord.Email == "" || guruRecord.PasswordHash == "" {
			return nil, fmt.Errorf("row %d has empty required fields", i+2)
		}
		
		guruRecords = append(guruRecords, guruRecord)
	}
	
	return guruRecords, nil
}

// processGuruData processes guru CSV data and inserts into database
func processGuruData(csvData []GuruCSVRecord) (int, int, []string) {
	successCount := 0
	errorCount := 0
	var errors []string
	
	for _, record := range csvData {
		// Hash password before saving
		hashedPassword, err := helpers.HassPassword(record.PasswordHash)
		if err != nil {
			errorCount++
			errors = append(errors, fmt.Sprintf("NIP %s: failed to hash password - %v", record.NIP, err))
			continue
		}
		
		// Create guru model
		guru := models.Guru{
			NIP:          record.NIP,
			NamaLengkap:  record.NamaLengkap,
			Email:        record.Email,
			PasswordHash: hashedPassword, // Use hashed password
		}
		
		// Insert into database
		if err := config.DB.Create(&guru).Error; err != nil {
			errorCount++
			if strings.Contains(err.Error(), "Duplicate entry") {
				errors = append(errors, fmt.Sprintf("NIP %s: already exists", record.NIP))
			} else {
				errors = append(errors, fmt.Sprintf("NIP %s: %v", record.NIP, err))
			}
		} else {
			successCount++
		}
	}
	
	return successCount, errorCount, errors
}

// GetAllSiswaData - Get all siswa data for admin
func GetAllSiswaData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Verify admin role from middleware
	role := r.Header.Get("X-Role")
	if role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Access denied - admin only",
		})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Method not allowed",
		})
		return
	}

	var siswaList []models.Siswa
	
	// Get all siswa with their kelas information
	if err := config.DB.Preload("Kelas").Find(&siswaList).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to fetch siswa data",
		})
		return
	}

	// Format response data
	var siswaData []map[string]interface{}
	for _, siswa := range siswaList {
		kelasNama := "N/A"
		if siswa.Kelas.KelasID != 0 {
			kelasNama = siswa.Kelas.NamaKelas
		}
				siswaInfo := map[string]interface{}{
			"siswa_id":     siswa.SiswaID,
			"nis":          siswa.NIS,
			"nama":         siswa.NamaLengkap,
			"kelas":        kelasNama,
			"kelas_id":     siswa.KelasID,
			"no_telepon":   siswa.NoTelepon,
			"email":        siswa.Email,
			"created_at":   siswa.CreatedAt,
		}
		siswaData = append(siswaData, siswaInfo)
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: fmt.Sprintf("Found %d siswa records", len(siswaData)),
		Data:    siswaData,
	})
}

// UpdateSiswa - Update siswa data by ID


// GetAllKelas - Get all kelas data for dropdown
func GetAllKelas(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Verify admin role from middleware
	role := r.Header.Get("X-Role")
	if role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Access denied - admin only",
		})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Method not allowed",
		})
		return
	}

	var kelasList []models.Kelas
	
	// Get all kelas with jurusan information
	if err := config.DB.Preload("Jurusan").Find(&kelasList).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to fetch kelas data",
		})
		return
	}

	// Format response data
	var kelasData []map[string]interface{}
	for _, kelas := range kelasList {
		jurusanNama := "N/A"
		if kelas.Jurusan.IDJurusan != 0 {
			jurusanNama = kelas.Jurusan.NamaJurusan
		}
		
		kelasInfo := map[string]interface{}{
			"kelas_id":    kelas.KelasID,
			"nama_kelas":  kelas.NamaKelas,
			"id_jurusan":  kelas.IDJurusan,
			"jurusan":     jurusanNama,
		}
		kelasData = append(kelasData, kelasInfo)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: fmt.Sprintf("Found %d kelas records", len(kelasData)),
		Data:    kelasData,
	})
}

// UpdateSiswa - Update siswa data by ID
func UpdateSiswa(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Verify admin role from middleware
	role := r.Header.Get("X-Role")
	if role != "admin" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Access denied - admin only",
		})
		return
	}

	if r.Method != "PUT" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Method not allowed",
		})
		return
	}

	// Get siswa ID from URL
	vars := mux.Vars(r)
	siswaID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid siswa ID",
		})
		return
	}

	// Parse request body
	var updateData struct {
		NIS        string `json:"nis"`
		Nama       string `json:"nama"`
		KelasID    int    `json:"kelas_id"`
		NoTelepon  string `json:"no_telepon"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid request data",
		})
		return
	}

	// Find existing siswa
	var siswa models.Siswa
	if err := config.DB.First(&siswa, siswaID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(Response{
				Status:  "error",
				Message: "Siswa not found",
			})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Database error",
		})
		return
	}

	// Update siswa data
	siswa.NIS = updateData.NIS
	siswa.NamaLengkap = updateData.Nama
	siswa.KelasID = updateData.KelasID
	siswa.NoTelepon = updateData.NoTelepon

	// Save changes
	if err := config.DB.Save(&siswa).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to update siswa",
		})
		return
	}

	// Return updated data
	if err := config.DB.Preload("Kelas").First(&siswa, siswaID).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to fetch updated data",
		})
		return
	}

	kelasNama := "N/A"
	if siswa.Kelas.KelasID != 0 {
		kelasNama = siswa.Kelas.NamaKelas
	}

	siswaInfo := map[string]interface{}{
		"siswa_id":   siswa.SiswaID,
		"nis":        siswa.NIS,
		"nama":       siswa.NamaLengkap,
		"kelas":      kelasNama,
		"kelas_id":   siswa.KelasID,
		"no_telepon": siswa.NoTelepon,
		"email":      siswa.Email,
		"created_at": siswa.CreatedAt,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Siswa updated successfully",
		Data:    siswaInfo,
	})
}

