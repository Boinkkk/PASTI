package entities

type Jadwal struct {
	IDJadwal   int    `gorm:"column:id_jadwal;primaryKey;autoIncrement"`
	IDKelas    int    `gorm:"column:id_kelas;not null"`
	IDMapel    int    `gorm:"column:id_mapel;not null"`
	Hari       string `gorm:"column:hari;type:enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu');not null"`
	JamMulai   string `gorm:"column:jam_mulai;type:time"`
	JamSelesai string `gorm:"column:jam_selesai;type:time"`
}
