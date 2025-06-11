package models

// Pertemuan model
type Pertemuan struct {
	IDPertemuan int       `gorm:"column:id_pertemuan;primaryKey;autoIncrement" json:"id_pertemuan"`
	IDJadwal    int       `gorm:"column:id_jadwal;not null" json:"id_jadwal"`
	PertemuanKe int       `gorm:"column:pertemuan_ke;not null" json:"pertemuan_ke"`
	TokenAbsen  string    `gorm:"column:token_absen;size:30;unique;not null" json:"token_absen"`
	Tanggal     string    `gorm:"column:tanggal;type:date;not null" json:"tanggal"`
	Materi      string    `gorm:"column:materi;size:3000" json:"materi"`
	IsActive    bool      `gorm:"column:is_active;default:false" json:"is_active"`
	// Relasi
	Jadwal Jadwal `gorm:"foreignKey:IDJadwal;references:IDJadwal" json:"jadwal,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Pertemuan) TableName() string {
	return "pertemuan"
}
