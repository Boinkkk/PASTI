package models

import (
	"time"
)

// Siswa model
type Siswa struct {
	SiswaID         int       `gorm:"column:siswa_id;primaryKey;autoIncrement" json:"siswa_id"`
	NIS             string    `gorm:"column:nis;size:20;unique;not null" json:"nis"`
	NamaLengkap     string    `gorm:"column:nama_lengkap;size:100;not null" json:"nama_lengkap"`
	KelasID         int       `gorm:"column:kelas_id;not null" json:"kelas_id"`
	Email           string    `gorm:"column:email;size:100;unique" json:"email"`
	PasswordHash    string    `gorm:"column:password_hash;size:255;not null" json:"-"`
	PoinMotivasi    int       `gorm:"column:poin_motivasi;default:0" json:"poin_motivasi"`
	TingkatDisiplin string    `gorm:"column:tingkat_disiplin;type:enum('Sangat Baik','Baik','Cukup','Kurang','Sangat Kurang');default:'Baik'" json:"tingkat_disiplin"`
	FotoProfil      string    `gorm:"column:foto_profil;size:255" json:"foto_profil"`
	CreatedAt       time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`

	// Relasi
	Kelas Kelas `gorm:"foreignKey:KelasID;references:KelasID" json:"kelas,omitempty"`
}

// Guru model
type Guru struct {
	GuruID       int       `gorm:"column:guru_id;primaryKey;autoIncrement" json:"guru_id"`
	NIP          string    `gorm:"column:nip;size:20;unique;not null" json:"nip"`
	NamaLengkap  string    `gorm:"column:nama_lengkap;size:100;not null" json:"nama_lengkap"`
	Email        string    `gorm:"column:email;size:100;unique;not null" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;size:255;not null" json:"-"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

// Kelas model
type Kelas struct {
	KelasID      int       `gorm:"column:kelas_id;primaryKey;autoIncrement" json:"kelas_id"`
	NamaKelas    string    `gorm:"column:nama_kelas;size:50;not null" json:"nama_kelas"`
	WaliKelasID  *int      `gorm:"column:wali_kelas_id" json:"wali_kelas_id"`
	IDJurusan    int       `gorm:"column:id_jurusan;not null" json:"id_jurusan"`
	CreatedAt    time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`

	// Relasi
	WaliKelas *Guru   `gorm:"foreignKey:WaliKelasID;references:GuruID" json:"wali_kelas,omitempty"`
	Jurusan   Jurusan `gorm:"foreignKey:IDJurusan;references:IDJurusan" json:"jurusan,omitempty"`
}

// Jurusan model
type Jurusan struct {
	IDJurusan   int    `gorm:"column:id_jurusan;primaryKey;autoIncrement" json:"id_jurusan"`
	NamaJurusan string `gorm:"column:nama_jurusan;size:50;not null" json:"nama_jurusan"`
}

// MataPelajaran model
type MataPelajaran struct {
	MapelID   int       `gorm:"column:mapel_id;primaryKey;autoIncrement" json:"mapel_id"`
	KodeMapel string    `gorm:"column:kode_mapel;size:10;not null" json:"kode_mapel"`
	NamaMapel string    `gorm:"column:nama_mapel;size:100;not null" json:"nama_mapel"`
	Deskripsi string    `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	CreatedAt time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`
}

// Mapel model (tabel lama)
type Mapel struct {
	IDMapel   int    `gorm:"column:id_mapel;primaryKey;autoIncrement" json:"id_mapel"`
	NamaMapel string `gorm:"column:nama_mapel;size:100;not null" json:"nama_mapel"`
}

// JadwalPelajaran model
type JadwalPelajaran struct {
	JadwalID   int       `gorm:"column:jadwal_id;primaryKey;autoIncrement" json:"jadwal_id"`
	KelasID    int       `gorm:"column:kelas_id;not null" json:"kelas_id"`
	MapelID    int       `gorm:"column:mapel_id;not null" json:"mapel_id"`
	GuruID     int       `gorm:"column:guru_id;not null" json:"guru_id"`
	Hari       string    `gorm:"column:hari;size:20;not null" json:"hari"`
	JamMulai   string    `gorm:"column:jam_mulai;type:time;not null" json:"jam_mulai"`
	JamSelesai string    `gorm:"column:jam_selesai;type:time;not null" json:"jam_selesai"`
	Ruang      string    `gorm:"column:ruang;size:50" json:"ruang"`
	CreatedAt  time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`

	// Relasi
	Kelas        Kelas         `gorm:"foreignKey:KelasID;references:KelasID" json:"kelas,omitempty"`
	MataPelajaran MataPelajaran `gorm:"foreignKey:MapelID;references:MapelID" json:"mata_pelajaran,omitempty"`
	Guru         Guru          `gorm:"foreignKey:GuruID;references:GuruID" json:"guru,omitempty"`
}

// Jadwal model (tabel lama)
type Jadwal struct {
	IDJadwal int `gorm:"column:id_jadwal;primaryKey;autoIncrement" json:"id_jadwal"`
	IDMapel  int `gorm:"column:id_mapel;not null" json:"id_mapel"`

	// Relasi
	Mapel Mapel `gorm:"foreignKey:IDMapel;references:IDMapel" json:"mapel,omitempty"`
}

// Pertemuan model
type Pertemuan struct {
	IDPertemuan  int    `gorm:"column:id_pertemuan;primaryKey;autoIncrement" json:"id_pertemuan"`
	IDJadwal     int    `gorm:"column:id_jadwal;not null" json:"id_jadwal"`
	PertemuanKe  int    `gorm:"column:pertemuan_ke;not null" json:"pertemuan_ke"`
	TokenAbsen   string `gorm:"column:token_absen;size:30;unique;not null" json:"token_absen"`
	Tanggal      string `gorm:"column:tanggal;type:date;not null" json:"tanggal"`
	Materi       string `gorm:"column:materi;size:3000" json:"materi"`

	// Relasi
	Jadwal Jadwal `gorm:"foreignKey:IDJadwal;references:IDJadwal" json:"jadwal,omitempty"`
}

// Absensi model
type Absensi struct {
	IDAbsensi   int       `gorm:"column:id_absensi;primaryKey;autoIncrement" json:"id_absensi"`
	IDPertemuan int       `gorm:"column:id_pertemuan;not null" json:"id_pertemuan"`
	IDSiswa     int       `gorm:"column:id_siswa;not null" json:"id_siswa"`
	WaktuAbsen  time.Time `gorm:"column:waktu_absen;not null" json:"waktu_absen"`
	Status      string    `gorm:"column:status;type:enum('Hadir','Izin','Sakit','Alpha');default:'Hadir'" json:"status"`
	Keterangan  string    `gorm:"column:keterangan;type:text" json:"keterangan"`

	// Relasi
	Pertemuan Pertemuan `gorm:"foreignKey:IDPertemuan;references:IDPertemuan" json:"pertemuan,omitempty"`
	Siswa     Siswa     `gorm:"foreignKey:IDSiswa;references:SiswaID" json:"siswa,omitempty"`
}

// Achievement model
type Achievement struct {
	AchievementID       int       `gorm:"column:achievement_id;primaryKey;autoIncrement" json:"achievement_id"`
	NamaAchievement     string    `gorm:"column:nama_achievement;size:100;not null" json:"nama_achievement"`
	Deskripsi           string    `gorm:"column:deskripsi;type:text" json:"deskripsi"`
	Icon                string    `gorm:"column:icon;size:255" json:"icon"`
	PoinBonus           int       `gorm:"column:poin_bonus;default:0" json:"poin_bonus"`
	KriteriaPencapaian  string    `gorm:"column:kriteria_pencapaian;type:text" json:"kriteria_pencapaian"`
	CreatedAt           time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
}

// SiswaAchievement model
type SiswaAchievement struct {
	SiswaAchievementID int       `gorm:"column:siswa_achievement_id;primaryKey;autoIncrement" json:"siswa_achievement_id"`
	SiswaID            int       `gorm:"column:siswa_id;not null" json:"siswa_id"`
	AchievementID      int       `gorm:"column:achievement_id;not null" json:"achievement_id"`
	TanggalDiraih      time.Time `gorm:"column:tanggal_diraih;default:CURRENT_TIMESTAMP" json:"tanggal_diraih"`
	CreatedAt          time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relasi
	Siswa       Siswa       `gorm:"foreignKey:SiswaID;references:SiswaID" json:"siswa,omitempty"`
	Achievement Achievement `gorm:"foreignKey:AchievementID;references:AchievementID" json:"achievement,omitempty"`
}

// Tugas model
type Tugas struct {
	TugasID            int       `gorm:"column:tugas_id;primaryKey;autoIncrement" json:"tugas_id"`
	JadwalID           int       `gorm:"column:jadwal_id;not null" json:"jadwal_id"`
	JudulTugas         string    `gorm:"column:judul_tugas;size:255;not null" json:"judul_tugas"`
	DeskripsiTugas     string    `gorm:"column:deskripsi_tugas;type:text" json:"deskripsi_tugas"`
	TanggalPenugasan   time.Time `gorm:"column:tanggal_penugasan;default:CURRENT_TIMESTAMP" json:"tanggal_penugasan"`
	DeadlinePengumpulan time.Time `gorm:"column:deadline_pengumpulan;not null" json:"deadline_pengumpulan"`
	FileSoal           string    `gorm:"column:file_soal;size:255" json:"file_soal"`
	PoinMaksimal       int       `gorm:"column:poin_maksimal;default:100" json:"poin_maksimal"`
	StatusTugas        string    `gorm:"column:status_tugas;type:enum('Draft','Aktif','Berakhir');default:'Draft'" json:"status_tugas"`
	CreatedAt          time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`

	// Relasi
	JadwalPelajaran JadwalPelajaran `gorm:"foreignKey:JadwalID;references:JadwalID" json:"jadwal_pelajaran,omitempty"`
}

// PengumpulanTugas model
type PengumpulanTugas struct {
	PengumpulanID        int       `gorm:"column:pengumpulan_id;primaryKey;autoIncrement" json:"pengumpulan_id"`
	TugasID              int       `gorm:"column:tugas_id;not null" json:"tugas_id"`
	SiswaID              int       `gorm:"column:siswa_id;not null" json:"siswa_id"`
	FileJawabanSiswa     string    `gorm:"column:file_jawaban_siswa;size:255" json:"file_jawaban_siswa"`
	CatatanSiswa         string    `gorm:"column:catatan_siswa;type:text" json:"catatan_siswa"`
	TanggalPengumpulan   time.Time `gorm:"column:tanggal_pengumpulan;default:CURRENT_TIMESTAMP" json:"tanggal_pengumpulan"`
	Nilai                *float64  `gorm:"column:nilai;type:decimal(5,2)" json:"nilai"`
	CatatanGuru          string    `gorm:"column:catatan_guru;type:text" json:"catatan_guru"`
	StatusPengumpulan    string    `gorm:"column:status_pengumpulan;type:enum('Belum Mengerjakan','Mengerjakan','Terlambat','Dinilai');default:'Belum Mengerjakan'" json:"status_pengumpulan"`
	PoinDidapat          int       `gorm:"column:poin_didapat;default:0" json:"poin_didapat"`
	CreatedAt            time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt            time.Time `gorm:"column:updated_at;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_at"`

	// Relasi
	Tugas Tugas `gorm:"foreignKey:TugasID;references:TugasID" json:"tugas,omitempty"`
	Siswa Siswa `gorm:"foreignKey:SiswaID;references:SiswaID" json:"siswa,omitempty"`
}

// Notifikasi model
type Notifikasi struct {
	NotifikasiID     int       `gorm:"column:notifikasi_id;primaryKey;autoIncrement" json:"notifikasi_id"`
	UserID           int       `gorm:"column:user_id;not null" json:"user_id"`
	TipeUser         string    `gorm:"column:tipe_user;type:enum('Siswa','Guru');not null" json:"tipe_user"`
	JudulNotifikasi  string    `gorm:"column:judul_notifikasi;size:255;not null" json:"judul_notifikasi"`
	PesanNotifikasi  string    `gorm:"column:pesan_notifikasi;type:text;not null" json:"pesan_notifikasi"`
	LinkTerkait      string    `gorm:"column:link_terkait;size:255" json:"link_terkait"`
	StatusBaca       bool      `gorm:"column:status_baca;default:0" json:"status_baca"`
	CreatedAt        time.Time `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
}

// TableName methods untuk menentukan nama tabel yang benar
func (Siswa) TableName() string {
	return "siswa"
}

func (Guru) TableName() string {
	return "guru"
}

func (Kelas) TableName() string {
	return "kelas"
}

func (Jurusan) TableName() string {
	return "jurusan"
}

func (MataPelajaran) TableName() string {
	return "matapelajaran"
}

func (Mapel) TableName() string {
	return "mapel"
}

func (JadwalPelajaran) TableName() string {
	return "jadwalpelajaran"
}

func (Jadwal) TableName() string {
	return "jadwal"
}

func (Pertemuan) TableName() string {
	return "pertemuan"
}

func (Absensi) TableName() string {
	return "absensi"
}

func (Achievement) TableName() string {
	return "achievement"
}

func (SiswaAchievement) TableName() string {
	return "siswaachievement"
}

func (Tugas) TableName() string {
	return "tugas"
}

func (PengumpulanTugas) TableName() string {
	return "pengumpulantugas"
}

func (Notifikasi) TableName() string {
	return "notifikasi"
}
