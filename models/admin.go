package models

import (
	"time"
)

type Admin struct {
	Username  string    `gorm:"primaryKey;type:varchar(100)" json:"username"`
	Password  string    `gorm:"type:varchar(255);not null" json:"password"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Admin) TableName() string {
	return "admin"
}
