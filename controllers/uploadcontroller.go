package controllers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"Pasti/helpers"

	"github.com/google/uuid"
)

// UploadFileHandler - Handle file upload untuk tugas siswa
func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	// Limit ukuran file 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		helpers.Response(w, 400, "File terlalu besar (maksimal 10MB)", nil)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		helpers.Response(w, 400, "Error retrieving the file", nil)
		return
	}
	defer file.Close()

	// Validasi tipe file
	allowedExts := map[string]bool{
		".pdf":  true,
		".doc":  true,
		".docx": true,
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".zip":  true,
		".rar":  true,
	}

	ext := filepath.Ext(handler.Filename)
	if !allowedExts[ext] {
		helpers.Response(w, 400, "Format file tidak didukung", nil)
		return
	}

	// Buat nama file unik
	uniqueID := uuid.New().String()
	timestamp := time.Now().Format("20060102_150405")
	filename := timestamp + "_" + uniqueID + ext

	// Buat direktori uploads jika belum ada
	uploadDir := "uploads/tugas"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		helpers.Response(w, 500, "Failed to create upload directory", nil)
		return
	}

	// Simpan file
	filepath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filepath)
	if err != nil {
		helpers.Response(w, 500, "Failed to create file", nil)
		return
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, file); err != nil {
		helpers.Response(w, 500, "Failed to save file", nil)
		return
	}

	// Return URL file
	fileURL := "/uploads/tugas/" + filename
	response := map[string]string{
		"url":      fileURL,
		"filename": filename,
		"original": handler.Filename,
	}

	helpers.Response(w, 200, "File uploaded successfully", response)
}
