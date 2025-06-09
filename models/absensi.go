package models

import "time"

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

type DaftarAbsensi struct {
	IDJadwalPelajaran int    `json:"id_jadwal_pelajaran"`
	KelasID           int    `json:"kelas_id"`
	NamaKelas         string `json:"nama_kelas"`
	IDMapel           int    `json:"id_mapel"`
	NamaMapel         string `json:"nama_mapel"`
	KodeMapel         string `json:"kode_mapel"`
	GuruID            int    `json:"guru_id"`
	NamaGuru          string `json:"nama_guru"`
	NIPGuru           string `json:"nip_guru"`
	JadwalID          int    `json:"jadwal_id"`
}

type AbsensiPertemuan struct {
	IDJadwalPelajaran int       `json:"id_jadwal_pelajaran"`
	NamaMapel		 string    `json:"nama_mapel"`
	NamaKelas		 string    `json:"nama_kelas"`
	NamaGuru		 string    `json:"nama_guru"`
	NIPGuru		  string    `json:"nip_guru"`
	IDPertemuan      int       `json:"id_pertemuan"`
	PertemuanKe      int       `json:"pertemuan_ke"`
	TanggalPertemuan string    `json:"tanggal_pertemuan"`
	MateriPertemuan  string    `json:"materi_pertemuan"`
	TokenAbsen      string    `json:"token_absen"`
	StatusKehadiran string    `json:"status_kehadiran"`
	WaktuAbsen      time.Time `json:"waktu_absen"`
	IDAbsensi	   int       `json:"id_absensi"`
}

type InfoMapel struct {
	IDJadwalPelajaran uint   `json:"id_jadwal_pelajaran"`
	NamaMapel         string `json:"nama_mapel"`
	NamaKelas         string `json:"nama_kelas"`
	NamaGuru          string `json:"nama_guru"`
	NipGuru           string `json:"nip_guru"`
}

type PertemuanItem struct {
	IDPertemuan      uint      `json:"id_pertemuan"`
	PertemuanKe      int       `json:"pertemuan_ke"`
	TanggalPertemuan time.Time `json:"tanggal_pertemuan"`
	MateriPertemuan  string    `json:"materi_pertemuan"`
	TokenAbsen       string    `json:"token_absen"`
	StatusKehadiran  string    `json:"status_kehadiran"`
	WaktuAbsen       *time.Time `json:"waktu_absen,omitempty"`
	IDAbsensi        *uint     `json:"id_absensi,omitempty"`
}

type ResponsePertemuan struct {
	Mapel     InfoMapel       `json:"mapel"`
	Pertemuan []PertemuanItem `json:"pertemuan"`
}




// TableName method untuk menentukan nama tabel yang benar
func (Absensi) TableName() string {
	return "absensi"
}
