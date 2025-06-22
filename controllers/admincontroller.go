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
		Email      string `json:"email"`
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
	siswa.Email = updateData.Email

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

// UpdateSiswaPassword - Update siswa password by ID
func UpdateSiswaPassword(w http.ResponseWriter, r *http.Request) {
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
	var passwordData struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&passwordData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid request data",
		})
		return
	}

	// Validate password
	if len(passwordData.Password) < 6 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Password must be at least 6 characters long",
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

	// Hash new password
	hashedPassword, err := helpers.HassPassword(passwordData.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to hash password",
		})
		return
	}

	// Update password
	siswa.PasswordHash = hashedPassword

	// Save changes
	if err := config.DB.Save(&siswa).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to update password",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Password updated successfully",
	})
}

// GetAllGuruData - Get all guru data for admin
func GetAllGuruData(w http.ResponseWriter, r *http.Request) {
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

	var guruList []models.Guru
		// Get all guru data (excluding password)
	if err := config.DB.Select("guru_id, nip, nama_lengkap, email, created_at").Find(&guruList).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to fetch guru data",
		})
		return
	}

	// Format response data
	var guruData []map[string]interface{}
	for _, guru := range guruList {
		guruInfo := map[string]interface{}{
			"guru_id":      guru.GuruID,
			"nip":          guru.NIP,
			"nama_lengkap": guru.NamaLengkap,
			"email":        guru.Email,
			"no_telepon":   "", // Field not available in current model
			"created_at":   guru.CreatedAt,
		}
		guruData = append(guruData, guruInfo)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: fmt.Sprintf("Found %d guru records", len(guruData)),
		Data:    guruData,
	})
}

// UpdateGuru - Update guru data by ID
func UpdateGuru(w http.ResponseWriter, r *http.Request) {
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

	// Get guru ID from URL
	vars := mux.Vars(r)
	guruID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid guru ID",
		})
		return
	}

	// Parse request body
	var updateData struct {
		NIP         string `json:"nip"`
		NamaLengkap string `json:"nama_lengkap"`
		Email       string `json:"email"`
		NoTelepon   string `json:"no_telepon"` // Will be ignored for now since model doesn't have it
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid request data",
		})
		return
	}

	// Find existing guru
	var guru models.Guru
	if err := config.DB.First(&guru, guruID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(Response{
				Status:  "error",
				Message: "Guru not found",
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

	// Update guru data
	guru.NIP = updateData.NIP
	guru.NamaLengkap = updateData.NamaLengkap
	guru.Email = updateData.Email

	// Save changes
	if err := config.DB.Save(&guru).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to update guru",
		})
		return
	}

	// Return updated data
	guruInfo := map[string]interface{}{
		"guru_id":      guru.GuruID,
		"nip":          guru.NIP,
		"nama_lengkap": guru.NamaLengkap,
		"email":        guru.Email,
		"no_telepon":   "", // Field not available in current model
		"created_at":   guru.CreatedAt,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Guru updated successfully",
		Data:    guruInfo,
	})
}

// UpdateGuruPasswordByAdmin - Update guru password by ID (Admin only)
func UpdateGuruPasswordByAdmin(w http.ResponseWriter, r *http.Request) {
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

	// Get guru ID from URL
	vars := mux.Vars(r)
	guruID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid guru ID",
		})
		return
	}

	// Parse request body
	var passwordData struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&passwordData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid request data",
		})
		return
	}

	// Validate password
	if len(passwordData.Password) < 6 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Password must be at least 6 characters long",
		})
		return
	}

	// Find existing guru
	var guru models.Guru
	if err := config.DB.First(&guru, guruID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(Response{
				Status:  "error",
				Message: "Guru not found",
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

	// Hash new password
	hashedPassword, err := helpers.HassPassword(passwordData.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to hash password",
		})
		return
	}

	// Update password
	guru.PasswordHash = hashedPassword

	// Save changes
	if err := config.DB.Save(&guru).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to update password",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: "Password updated successfully",
	})
}

// GetAllMapel - Get all mata pelajaran data for admin
func GetAllMapel(w http.ResponseWriter, r *http.Request) {
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

	var mapelList []models.MataPelajaran
	
	// Get all mata pelajaran data
	if err := config.DB.Find(&mapelList).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to fetch mata pelajaran data",
		})
		return
	}

	// Format response data
	var mapelData []map[string]interface{}
	for _, mapel := range mapelList {
		mapelInfo := map[string]interface{}{
			"mapel_id":   mapel.MapelID,
			"nama_mapel": mapel.NamaMapel,
			"created_at": mapel.CreatedAt,
		}
		mapelData = append(mapelData, mapelInfo)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: fmt.Sprintf("Found %d mata pelajaran records", len(mapelData)),
		Data:    mapelData,
	})
}

// UploadJadwalData - Upload jadwal pelajaran data (manual entry)
func UploadJadwalData(w http.ResponseWriter, r *http.Request) {
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

	// Parse request body
	var requestData struct {
		JadwalEntries []struct {
			KelasID    int    `json:"kelas_id"`
			MapelID    int    `json:"mapel_id"`
			GuruID     int    `json:"guru_id"`
			Hari       string `json:"hari"`
			JamMulai   string `json:"jam_mulai"`
			JamSelesai string `json:"jam_selesai"`
			Ruang      string `json:"ruang"`
		} `json:"jadwal_entries"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Invalid request format",
		})
		return
	}

	if len(requestData.JadwalEntries) == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No jadwal entries provided",
		})
		return
	}

	// Begin transaction
	tx := config.DB.Begin()

	var createdCount int
	var errors []string

	for i, entry := range requestData.JadwalEntries {
		// Validate required fields
		if entry.KelasID == 0 || entry.MapelID == 0 || entry.GuruID == 0 || 
		   entry.Hari == "" || entry.JamMulai == "" || entry.JamSelesai == "" {
			errors = append(errors, fmt.Sprintf("Entry %d: Missing required fields", i+1))
			continue
		}

		// Check if kelas, mapel, and guru exist
		var kelas models.Kelas
		if err := tx.First(&kelas, entry.KelasID).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Entry %d: Kelas ID %d not found", i+1, entry.KelasID))
			continue
		}

		var mapel models.MataPelajaran
		if err := tx.First(&mapel, entry.MapelID).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Entry %d: Mapel ID %d not found", i+1, entry.MapelID))
			continue
		}

		var guru models.Guru
		if err := tx.First(&guru, entry.GuruID).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Entry %d: Guru ID %d not found", i+1, entry.GuruID))
			continue
		}

		// Check for schedule conflicts
		var existingJadwal models.JadwalPelajaran
		if err := tx.Where("kelas_id = ? AND hari = ? AND ((jam_mulai <= ? AND jam_selesai > ?) OR (jam_mulai < ? AND jam_selesai >= ?))", 
			entry.KelasID, entry.Hari, entry.JamMulai, entry.JamMulai, entry.JamSelesai, entry.JamSelesai).First(&existingJadwal).Error; err == nil {
			errors = append(errors, fmt.Sprintf("Entry %d: Schedule conflict for kelas %s on %s", i+1, kelas.NamaKelas, entry.Hari))
			continue
		}

		// Create jadwal entry
		jadwal := models.JadwalPelajaran{
			KelasID:    entry.KelasID,
			MapelID:    entry.MapelID,
			GuruID:     entry.GuruID,
			Hari:       entry.Hari,
			JamMulai:   entry.JamMulai,
			JamSelesai: entry.JamSelesai,
			Ruang:      entry.Ruang,
		}

		if err := tx.Create(&jadwal).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Entry %d: Failed to create jadwal - %v", i+1, err))
			continue
		}

		createdCount++
	}

	// Check if we have any successful entries
	if createdCount == 0 {
		tx.Rollback()
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No jadwal entries were created",
			Data:    map[string]interface{}{"errors": errors},
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to commit transaction",
		})
		return
	}

	// Prepare response
	responseData := map[string]interface{}{
		"created_count": createdCount,
		"total_entries": len(requestData.JadwalEntries),
	}
	
	if len(errors) > 0 {
		responseData["errors"] = errors
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: fmt.Sprintf("Successfully created %d jadwal entries", createdCount),
		Data:    responseData,
	})
}

// UploadJadwalCSV - Upload jadwal pelajaran data from CSV file
func UploadJadwalCSV(w http.ResponseWriter, r *http.Request) {
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

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to parse form data",
		})
		return
	}

	// Get file from form
	file, _, err := r.FormFile("jadwalFile")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No file provided or invalid file",
		})
		return
	}
	defer file.Close()

	// Read CSV
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to read CSV file",
		})
		return
	}

	if len(records) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "CSV file must contain header and at least one data row",
		})
		return
	}

	// Validate header
	expectedHeaders := []string{"kelas_id", "mapel_id", "guru_id", "hari", "jam_mulai", "jam_selesai", "ruang"}
	headers := records[0]
	for i, expected := range expectedHeaders {
		if i >= len(headers) || strings.TrimSpace(headers[i]) != expected {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(Response{
				Status:  "error",
				Message: fmt.Sprintf("Invalid CSV header. Expected: %s", strings.Join(expectedHeaders, ",")),
			})
			return
		}
	}

	// Begin transaction
	tx := config.DB.Begin()

	var createdCount int
	var errors []string

	// Process each record
	for i, record := range records[1:] {
		rowNum := i + 2 // +2 because we skip header and arrays are 0-indexed

		if len(record) < 7 {
			errors = append(errors, fmt.Sprintf("Row %d: Insufficient columns", rowNum))
			continue
		}

		// Parse fields
		kelasID, err := strconv.Atoi(strings.TrimSpace(record[0]))
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Invalid kelas_id", rowNum))
			continue
		}

		mapelID, err := strconv.Atoi(strings.TrimSpace(record[1]))
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Invalid mapel_id", rowNum))
			continue
		}

		guruID, err := strconv.Atoi(strings.TrimSpace(record[2]))
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Invalid guru_id", rowNum))
			continue
		}

		hari := strings.TrimSpace(record[3])
		jamMulai := strings.TrimSpace(record[4])
		jamSelesai := strings.TrimSpace(record[5])
		ruang := strings.TrimSpace(record[6])

		// Validate required fields
		if kelasID == 0 || mapelID == 0 || guruID == 0 || hari == "" || jamMulai == "" || jamSelesai == "" {
			errors = append(errors, fmt.Sprintf("Row %d: Missing required fields", rowNum))
			continue
		}

		// Check if references exist
		var kelas models.Kelas
		if err := tx.First(&kelas, kelasID).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Kelas ID %d not found", rowNum, kelasID))
			continue
		}

		var mapel models.MataPelajaran
		if err := tx.First(&mapel, mapelID).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Mapel ID %d not found", rowNum, mapelID))
			continue
		}

		var guru models.Guru
		if err := tx.First(&guru, guruID).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Guru ID %d not found", rowNum, guruID))
			continue
		}

		// Check for schedule conflicts
		var existingJadwal models.JadwalPelajaran
		if err := tx.Where("kelas_id = ? AND hari = ? AND ((jam_mulai <= ? AND jam_selesai > ?) OR (jam_mulai < ? AND jam_selesai >= ?))", 
			kelasID, hari, jamMulai, jamMulai, jamSelesai, jamSelesai).First(&existingJadwal).Error; err == nil {
			errors = append(errors, fmt.Sprintf("Row %d: Schedule conflict for kelas %s on %s", rowNum, kelas.NamaKelas, hari))
			continue
		}

		// Create jadwal entry
		jadwal := models.JadwalPelajaran{
			KelasID:    kelasID,
			MapelID:    mapelID,
			GuruID:     guruID,
			Hari:       hari,
			JamMulai:   jamMulai,
			JamSelesai: jamSelesai,
			Ruang:      ruang,
		}

		if err := tx.Create(&jadwal).Error; err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: Failed to create jadwal - %v", rowNum, err))
			continue
		}

		createdCount++
	}

	// Check if we have any successful entries
	if createdCount == 0 {
		tx.Rollback()
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "No jadwal entries were created from CSV",
			Data:    map[string]interface{}{"errors": errors},
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Status:  "error",
			Message: "Failed to commit transaction",
		})
		return
	}

	// Prepare response
	responseData := map[string]interface{}{
		"created_count": createdCount,
		"total_rows":    len(records) - 1, // Exclude header
	}
	
	if len(errors) > 0 {
		responseData["errors"] = errors
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Status:  "success",
		Message: fmt.Sprintf("Successfully created %d jadwal entries from CSV", createdCount),
		Data:    responseData,
	})
}

