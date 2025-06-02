package entities

import "time"

type SiswaAchievement struct {
	SiswaAchievementID int       `gorm:"column:siswa_achievement_id;primaryKey;autoIncrement"`
	SiswaID            int       `gorm:"column:siswa_id;not null"`
	AchievementID      int       `gorm:"column:achievement_id;not null"`
	TanggalDiraih      time.Time `gorm:"column:tanggal_diraih"`
	CreatedAt          time.Time `gorm:"column:created_at"`
}
