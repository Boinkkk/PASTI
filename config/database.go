package config

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	db, err := gorm.Open(mysql.Open("root:ivan@tcp(127.0.0.1:3306)/pasti?parseTime=true"), &gorm.Config{})
	if err != nil {
		panic("Failed TO connect database")
	}

	DB = db

	log.Println("Database Connected")
}