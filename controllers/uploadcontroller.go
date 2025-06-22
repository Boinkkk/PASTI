package controllers

import (
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"Pasti/helpers"

	"github.com/google/uuid"
)

// UploadFileHandler - Handle file upload untuk tugas siswa
func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("📁 Upload request received")
	
	// Limit ukuran file 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Printf("❌ Error parsing multipart form: %v", err)
		helpers.Response(w, 400, "File terlalu besar (maksimal 10MB)", nil)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		log.Printf("❌ Error retrieving file: %v", err)
		helpers.Response(w, 400, "Error retrieving the file", nil)
		return
	}
	defer file.Close()

	log.Printf("📄 File received: %s (size: %d bytes)", handler.Filename, handler.Size)

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
		log.Printf("❌ File extension not allowed: %s", ext)
		helpers.Response(w, 400, "Format file tidak didukung", nil)
		return
	}

	// Buat nama file unik
	uniqueID := uuid.New().String()
	timestamp := time.Now().Format("20060102_150405")
	filename := timestamp + "_" + uniqueID + ext
	log.Printf("✅ Generated unique filename: %s", filename)

	// Buat direktori uploads jika belum ada
	uploadDir := "uploads/tugas"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("❌ Failed to create directory %s: %v", uploadDir, err)
		helpers.Response(w, 500, "Failed to create upload directory", nil)
		return
	}
	log.Printf("📁 Upload directory ready: %s", uploadDir)

	// Simpan file
	filePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("❌ Failed to create file %s: %v", filePath, err)
		helpers.Response(w, 500, "Failed to create file", nil)
		return
	}
	defer dst.Close()

	// Copy file content
	bytesWritten, err := io.Copy(dst, file)
	if err != nil {
		log.Printf("❌ Failed to write file content: %v", err)
		helpers.Response(w, 500, "Failed to save file", nil)
		return
	}
	
	log.Printf("✅ File saved successfully: %s (%d bytes)", filePath, bytesWritten)
	// Return URL file
	fileURL := "/uploads/tugas/" + filename
	response := map[string]string{
		"url":      fileURL,
		"filename": filename,
		"original": handler.Filename,
	}

	log.Printf("🎉 Upload completed - URL: %s", fileURL)
	helpers.Response(w, 200, "File uploaded successfully", response)
}
