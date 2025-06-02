package main

import (
	"fmt"
	"log"

	"d/Pasti/controllers"
	"d/Pasti/models"

	"github.com/Boinkkk/PASTI.git/config"
	"github.com/gin-gonic/gin"
	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Koneksi GORM
	dsn := "root:ivan@tcp(127.0.0.1:3306)/pasti?parseTime=true"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi GORM:", err)
	}
	models.SetDB(db)

	// Setup Gin
	r := gin.Default()
	r.POST("/api/v1/login", controllers.LoginHandler(db))

	go func() {
		r.Run(":8080")
	}()

	// Fiber untuk endpoint lama
	config.ConnectDB()
	fmt.Println("Hello World")

	app := fiber.New()

	app.Get("/", func (c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{"msg": "Hello World"})
	})

	log.Fatal(app.Listen(":4000"))
}