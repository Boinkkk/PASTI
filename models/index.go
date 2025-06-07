package models

// This file serves as an index for all models
// Import this package to get access to all model structs

// Core entities
// - Siswa: Student model with authentication and profile data
// - Guru: Teacher model with authentication data
// - Kelas: Class model with relationships to teachers and majors
// - Jurusan: Major/Department model
// - MataPelajaran: Subject model (new schema)
// - Mapel: Subject model (legacy schema)

// Schedule and attendance
// - JadwalPelajaran: Class schedule model (new schema)
// - Jadwal: Schedule model (legacy schema)
// - Pertemuan: Meeting/session model
// - Absensi: Attendance record model

// Assignments and achievements
// - Tugas: Assignment model
// - PengumpulanTugas: Assignment submission model
// - Achievement: Achievement/badge model
// - SiswaAchievement: Student achievement junction model

// Notifications
// - Notifikasi: Notification model for students and teachers

// Usage example:
// import "Pasti/models"
//
// var siswa models.Siswa
// var guru models.Guru
// etc.
