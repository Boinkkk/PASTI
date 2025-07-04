package controllers

import (
	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

// GetGuruProfile mendapatkan profil guru berdasarkan token
func GetGuruProfile(w http.ResponseWriter, r *http.Request) {
	// Ambil info guru dari context (dari middleware)
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}

	// Ambil data guru lengkap dari database
	var fullGuru models.Guru
	if err := config.DB.First(&fullGuru, "guru_id = ?", guru.ID).Error; err != nil {
		helpers.Response(w, 404, "Guru tidak ditemukan", nil)
		return
	}

	// Response tanpa password
	responseData := map[string]interface{}{
		"guru_id":      fullGuru.GuruID,
		"nip":          fullGuru.NIP,
		"nama_lengkap": fullGuru.NamaLengkap,
		"email":        fullGuru.Email,
		"role":         "guru",
		"created_at":   fullGuru.CreatedAt,
		"updated_at":   fullGuru.UpdatedAt,
	}

	helpers.Response(w, 200, "Profile guru berhasil diambil", responseData)
}

// GetAllSiswa mendapatkan daftar semua siswa (untuk guru)
func GetAllSiswa(w http.ResponseWriter, r *http.Request) {
	// Verifikasi guru dari context
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	var siswaList []models.Siswa
	if err := config.DB.Preload("Kelas.Jurusan").Find(&siswaList).Error; err != nil {
		helpers.Response(w, 500, "Gagal mengambil data siswa", nil)
		return
	}

	helpers.Response(w, 200, "Daftar siswa berhasil diambil", siswaList)
}

// UpdatePertemuan mengupdate materi dan tanggal pertemuan
func UpdatePertemuan(w http.ResponseWriter, r *http.Request) {
	// Set header untuk JSON response
	w.Header().Set("Content-Type", "application/json")
	// Get guru info from context
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}

	// Parse JSON body
	var request struct {
		Materi  string `json:"materi"`
		Tanggal string `json:"tanggal"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Format JSON tidak valid", nil)
		return
	}

	// Get pertemuan ID from URL path using mux
	vars := mux.Vars(r)
	pertemuanID := vars["id"]
	if pertemuanID == "" {
		helpers.Response(w, 400, "ID pertemuan diperlukan", nil)
		return
	}

	// Validate required fields
	if request.Materi == "" || request.Tanggal == "" {
		helpers.Response(w, 400, "Materi dan tanggal diperlukan", nil)
		return
	}	// Verify that the pertemuan belongs to the guru
	var pertemuan models.Pertemuan
	err := config.DB.
		Joins("JOIN jadwalpelajaran jp ON pertemuan.id_jadwal = jp.jadwal_id").
		Where("pertemuan.id_pertemuan = ? AND jp.guru_id = ?", pertemuanID, guru.ID).
		First(&pertemuan).Error

	if err != nil {
		helpers.Response(w, 404, "Pertemuan tidak ditemukan atau Anda tidak memiliki akses", nil)
		return
	}

	// Update pertemuan
	err = config.DB.Model(&pertemuan).Updates(map[string]interface{}{
		"materi":  request.Materi,
		"tanggal": request.Tanggal,
	}).Error

	if err != nil {
		helpers.Response(w, 500, "Gagal mengupdate pertemuan", nil)
		return
	}

	// Get updated pertemuan data
	config.DB.First(&pertemuan, pertemuanID)
	helpers.Response(w, 200, "Pertemuan berhasil diupdate", map[string]interface{}{
		"pertemuan": pertemuan,
	})
}

// UpdateStatusPertemuan mengubah status aktif/tidak aktif pertemuan
func UpdateStatusPertemuan(w http.ResponseWriter, r *http.Request) {
	// Get guru info from middleware
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}
	// Get pertemuan ID from URL path using mux
	vars := mux.Vars(r)
	pertemuanID := vars["id"]
	if pertemuanID == "" {
		helpers.Response(w, 400, "ID pertemuan diperlukan", nil)
		return
	}

	// Parse request body
	var request struct {
		IsActive bool `json:"is_active"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Format JSON tidak valid", nil)
		return
	}

	// Verify that the pertemuan belongs to the guru
	var pertemuan models.Pertemuan
	err := config.DB.
		Joins("JOIN jadwalpelajaran jp ON pertemuan.id_jadwal = jp.jadwal_id").
		Where("pertemuan.id_pertemuan = ? AND jp.guru_id = ?", pertemuanID, guru.ID).
		First(&pertemuan).Error
	
	if err != nil {
		helpers.Response(w, 404, "Pertemuan tidak ditemukan atau Anda tidak memiliki akses", nil)
		return
	}
	// Update status
	err = config.DB.Model(&pertemuan).Update("is_active", request.IsActive).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengubah status pertemuan", nil)
		return
	}

	// Return updated data
	config.DB.First(&pertemuan, pertemuanID)
		helpers.Response(w, 200, "Status pertemuan berhasil diubah", map[string]interface{}{
		"id_pertemuan": pertemuan.IDPertemuan,
		"is_active":    pertemuan.IsActive,
	})
}

// UpdateStatusAbsensi mengubah status kehadiran siswa
func UpdateStatusAbsensi(w http.ResponseWriter, r *http.Request) {
	// Get guru info from middleware
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}

	// Get absensi ID from URL path using mux
	vars := mux.Vars(r)
	absensiID := vars["id"]
	if absensiID == "" {
		helpers.Response(w, 400, "ID absensi diperlukan", nil)
		return
	}

	// Parse request body
	var request struct {
		StatusKehadiran string `json:"status_kehadiran"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Format JSON tidak valid", nil)
		return
	}

	// Validate status kehadiran
	validStatuses := []string{"Hadir", "Alpha", "Sakit", "Izin"}
	isValidStatus := false
	for _, status := range validStatuses {
		if request.StatusKehadiran == status {
			isValidStatus = true
			break
		}
	}
	
	if !isValidStatus {
		helpers.Response(w, 400, "Status kehadiran tidak valid. Harus salah satu dari: Hadir, Alpha, Sakit, Izin", nil)
		return
	}

	// Verify that the absensi belongs to the guru's pertemuan
	var absensi models.Absensi
	err := config.DB.
		Joins("JOIN pertemuan p ON absensi.id_pertemuan = p.id_pertemuan").
		Joins("JOIN jadwalpelajaran jp ON p.id_jadwal = jp.jadwal_id").
		Where("absensi.id_absensi = ? AND jp.guru_id = ?", absensiID, guru.ID).
		First(&absensi).Error
	
	if err != nil {
		helpers.Response(w, 404, "Absensi tidak ditemukan atau Anda tidak memiliki akses", nil)
		return
	}
	// Update status kehadiran
	err = config.DB.Model(&absensi).Update("status", request.StatusKehadiran).Error
	if err != nil {
		helpers.Response(w, 500, "Gagal mengubah status kehadiran", nil)
		return
	}

	// Return updated data
	config.DB.First(&absensi, absensiID)
	
	helpers.Response(w, 200, "Status kehadiran berhasil diubah", map[string]interface{}{
		"id_absensi": absensi.IDAbsensi,
		"status":     absensi.Status,
	})
}

// CreateManualAbsensi membuat absensi manual untuk siswa
func CreateManualAbsensi(w http.ResponseWriter, r *http.Request) {
	// Get guru info from middleware
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}

	// Parse request body
	var request struct {
		IDPertemuan     int    `json:"id_pertemuan"`
		IDSiswa         int    `json:"id_siswa"`
		StatusKehadiran string `json:"status_kehadiran"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Format JSON tidak valid", nil)
		return
	}

	// Validate required fields
	if request.IDPertemuan == 0 || request.IDSiswa == 0 || request.StatusKehadiran == "" {
		helpers.Response(w, 400, "ID pertemuan, ID siswa, dan status kehadiran wajib diisi", nil)
		return
	}

	// Validate status kehadiran
	validStatuses := []string{"Hadir", "Alpha", "Sakit", "Izin"}
	isValidStatus := false
	for _, status := range validStatuses {
		if request.StatusKehadiran == status {
			isValidStatus = true
			break
		}
	}
	
	if !isValidStatus {
		helpers.Response(w, 400, "Status kehadiran tidak valid. Harus salah satu dari: Hadir, Alpha, Sakit, Izin", nil)
		return
	}

	// Verify that the pertemuan belongs to the guru
	var pertemuan models.Pertemuan
	err := config.DB.
		Joins("JOIN jadwalpelajaran jp ON pertemuan.id_jadwal = jp.jadwal_id").
		Where("pertemuan.id_pertemuan = ? AND jp.guru_id = ?", request.IDPertemuan, guru.ID).
		First(&pertemuan).Error
	
	if err != nil {
		helpers.Response(w, 404, "Pertemuan tidak ditemukan atau Anda tidak memiliki akses", nil)
		return
	}
	// Check if absensi already exists
	var existingAbsensi models.Absensi
	err = config.DB.Where("id_pertemuan = ? AND id_siswa = ?", request.IDPertemuan, request.IDSiswa).First(&existingAbsensi).Error
	if err == nil {
		// Absensi sudah ada, update statusnya
		existingAbsensi.Status = request.StatusKehadiran
		existingAbsensi.WaktuAbsen = time.Now() // Update waktu jika diperlukan
		
		if err := config.DB.Save(&existingAbsensi).Error; err != nil {
			helpers.Response(w, 500, "Gagal memperbarui absensi", nil)
			return
		}
		
		helpers.Response(w, 200, "Absensi berhasil diperbarui", map[string]interface{}{
			"id_absensi":   existingAbsensi.IDAbsensi,
			"id_pertemuan": existingAbsensi.IDPertemuan,
			"id_siswa":     existingAbsensi.IDSiswa,
			"status":       existingAbsensi.Status,
			"waktu_absen":  existingAbsensi.WaktuAbsen,
		})
		return
	}
	// Create new absensi
	newAbsensi := models.Absensi{
		IDPertemuan: request.IDPertemuan,
		IDSiswa:     request.IDSiswa,
		Status:      request.StatusKehadiran,
		WaktuAbsen:  time.Now(), // Set current time for manual absensi
	}

	if err := config.DB.Create(&newAbsensi).Error; err != nil {
		helpers.Response(w, 500, "Gagal membuat absensi manual", nil)
		return
	}

	helpers.Response(w, 201, "Absensi manual berhasil dibuat", map[string]interface{}{
		"id_absensi":   newAbsensi.IDAbsensi,
		"id_pertemuan": newAbsensi.IDPertemuan,
		"id_siswa":     newAbsensi.IDSiswa,
		"status":       newAbsensi.Status,
		"waktu_absen":  newAbsensi.WaktuAbsen,
	})
}

// UpdateGuruPassword memperbarui password guru
func UpdateGuruPassword(w http.ResponseWriter, r *http.Request) {
	// Ambil info guru dari context (dari middleware)
	guruInfo := r.Context().Value("guruinfo")
	if guruInfo == nil {
		helpers.Response(w, 401, "Unauthorized: no guru info in context", nil)
		return
	}

	guru, ok := guruInfo.(*helpers.GuruCustomClaims)
	if !ok {
		helpers.Response(w, 401, "Unauthorized: invalid guru info format", nil)
		return
	}

	// Parse request body
	var request struct {
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		helpers.Response(w, 400, "Invalid request body", nil)
		return
	}

	// Validasi password
	if len(request.Password) < 6 {
		helpers.Response(w, 400, "Password minimal 6 karakter", nil)
		return
	}

	// Hash password baru
	hashedPassword, err := helpers.HassPassword(request.Password)
	if err != nil {
		helpers.Response(w, 500, "Gagal mengenkripsi password", nil)
		return
	}

	// Update password di database
	if err := config.DB.Model(&models.Guru{}).Where("guru_id = ?", guru.ID).Update("password_hash", hashedPassword).Error; err != nil {
		helpers.Response(w, 500, "Gagal memperbarui password", nil)
		return
	}

	helpers.Response(w, 200, "Password berhasil diperbarui", nil)
}


