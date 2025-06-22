package controllers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"Pasti/config"
	"Pasti/helpers"
	"Pasti/models"

	"github.com/gorilla/mux"
)

// ServeProtectedFile - Melayani file dengan akses kontrol
func ServeProtectedFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	filename := vars["filename"]
	
	log.Printf("🔍 File access request:")
	log.Printf("   - filename: %s", filename)
	log.Printf("   - URL path: %s", r.URL.Path)
	log.Printf("   - method: %s", r.Method)
	
	// Validasi path untuk mencegah directory traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		log.Printf("❌ Invalid file path detected: %s", filename)
		http.Error(w, "Invalid file path", http.StatusBadRequest)
		return
	}
	// Tentukan path file berdasarkan kategori
	var filePath string
	category := strings.Split(r.URL.Path, "/")[2] // uploads/tugas/file.ext -> ambil "tugas"
	
	log.Printf("   - category detected: %s", category)
	
	switch category {
	case "tugas":
		filePath = filepath.Join("uploads", "tugas", filename)
	default:
		log.Printf("❌ Invalid file category: %s", category)
		http.Error(w, "Invalid file category", http.StatusBadRequest)
		return
	}
	
	log.Printf("   - full file path: %s", filePath)	// Cek apakah file ada
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		log.Printf("❌ File not found: %s", filePath)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	
	log.Printf("✅ File exists: %s", filePath)
	log.Printf("✅ Serving file without authentication check (public access)")

	// Serve file tanpa validasi akses
	http.ServeFile(w, r, filePath)
}

// hasFileAccess - Mengecek akses file berdasarkan role dan kepemilikan
func hasFileAccess(r *http.Request, filename, category string) bool {
	log.Printf("🔍 Checking file access:")
	log.Printf("   - filename: %s", filename)
	log.Printf("   - category: %s", category)
	
	// Cek apakah user adalah guru
	if guruInfo := r.Context().Value("guruinfo"); guruInfo != nil {
		log.Printf("   - user type: GURU")
		guru := guruInfo.(*helpers.GuruCustomClaims)
		log.Printf("   - guru ID: %d", guru.ID)
		log.Printf("   - access granted: true (guru has full access)")
		return true // Guru bisa akses semua file
	}

	// Cek apakah user adalah siswa
	if siswaInfo := r.Context().Value("siswainfo"); siswaInfo != nil {
		log.Printf("   - user type: SISWA")
		siswa := siswaInfo.(*helpers.MyCustomClaims)
		log.Printf("   - siswa ID: %d", siswa.ID)
		log.Printf("   - access granted: true (siswa has access)")
		return true // Siswa juga bisa akses semua file
	}

	log.Printf("❌ No valid user context found")
	return false
}

// hasGuruFileAccess - Validasi akses file untuk guru
func hasGuruFileAccess(guru *helpers.GuruCustomClaims, filename, category string) bool {
	log.Printf("🔍 Checking guru file access:")
	log.Printf("   - guru ID: %d", guru.ID)
	log.Printf("   - filename: %s", filename)
	log.Printf("   - category: %s", category)
	
	if category == "tugas" {
		// Guru bisa akses semua file tugas dari kelas yang diajarnya
		var pengumpulan models.PengumpulanTugas
		result := config.DB.
			Joins("JOIN tugas ON pengumpulan_tugas.tugas_id = tugas.tugas_id").
			Joins("JOIN jadwalpelajaran ON tugas.jadwal_id = jadwalpelajaran.jadwal_id").
			Where("pengumpulan_tugas.file_jawaban_siswa LIKE ? AND jadwalpelajaran.guru_id = ?", "%"+filename, guru.ID).
			First(&pengumpulan)
		
		log.Printf("   - query result error: %v", result.Error)
		log.Printf("   - access granted: %t", result.Error == nil)
		
		return result.Error == nil
	}
	
	log.Printf("   - category not supported for guru")
	return false
}

// hasSiswaFileAccess - Validasi akses file untuk siswa
func hasSiswaFileAccess(siswa *helpers.MyCustomClaims, filename, category string) bool {
	log.Printf("🔍 Checking siswa file access:")
	log.Printf("   - siswa ID: %d", siswa.ID)
	log.Printf("   - filename: %s", filename)
	log.Printf("   - category: %s", category)
	
	if category == "tugas" {
		// Siswa hanya bisa akses file yang diupload sendiri
		var pengumpulan models.PengumpulanTugas
		result := config.DB.
			Where("siswa_id = ? AND file_jawaban_siswa LIKE ?", siswa.ID, "%"+filename).
			First(&pengumpulan)
		
		log.Printf("   - query result error: %v", result.Error)
		log.Printf("   - access granted: %t", result.Error == nil)
		
		return result.Error == nil
	}
	
	log.Printf("   - category not supported for siswa")
	return false
}
