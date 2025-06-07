package models

// Jadwal model (tabel lama - legacy)
type Jadwal struct {
	IDJadwal int `gorm:"column:id_jadwal;primaryKey;autoIncrement" json:"id_jadwal"`
	IDMapel  int `gorm:"column:id_mapel;not null" json:"id_mapel"`

	// Relasi
	Mapel Mapel `gorm:"foreignKey:IDMapel;references:IDMapel" json:"mapel,omitempty"`
}

// TableName method untuk menentukan nama tabel yang benar
func (Jadwal) TableName() string {
	return "jadwal"
}
