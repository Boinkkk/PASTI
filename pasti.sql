-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: pasti
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `absensi`
--

DROP TABLE IF EXISTS `absensi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `absensi` (
  `id_absensi` int NOT NULL AUTO_INCREMENT,
  `id_pertemuan` int NOT NULL,
  `id_siswa` int NOT NULL,
  `waktu_absen` datetime NOT NULL,
  `status` enum('Hadir','Izin','Sakit','Alpha') DEFAULT 'Hadir',
  `keterangan` text,
  PRIMARY KEY (`id_absensi`),
  UNIQUE KEY `uk_absensi_pertemuan_siswa` (`id_pertemuan`,`id_siswa`),
  KEY `id_siswa` (`id_siswa`),
  CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`id_pertemuan`) REFERENCES `pertemuan` (`id_pertemuan`),
  CONSTRAINT `absensi_ibfk_2` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`siswa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `absensi`
--

LOCK TABLES `absensi` WRITE;
/*!40000 ALTER TABLE `absensi` DISABLE KEYS */;
INSERT INTO `absensi` (`id_absensi`, `id_pertemuan`, `id_siswa`, `waktu_absen`, `status`, `keterangan`) VALUES (1,1,1,'2025-05-01 07:05:00','Hadir',NULL),(2,1,2,'2025-05-01 07:03:00','Hadir',NULL),(3,1,3,'2025-05-01 07:10:00','Hadir',NULL),(4,1,4,'2025-05-01 07:02:00','Hadir',NULL),(5,1,5,'2025-05-01 07:15:00','Alpha',NULL),(6,1,6,'2025-05-01 07:04:00','Hadir',NULL),(7,1,7,'2025-05-01 07:08:00','Hadir',NULL),(8,1,8,'2025-05-01 07:06:00','Hadir',NULL),(9,1,9,'2025-05-01 07:12:00','Sakit',NULL),(10,1,10,'2025-05-01 07:01:00','Hadir',NULL),(11,2,1,'2025-05-08 07:04:00','Hadir',NULL),(12,2,2,'2025-05-08 07:02:00','Hadir',NULL),(13,2,3,'2025-05-08 07:07:00','Hadir',NULL),(14,2,4,'2025-05-08 07:05:00','Hadir',NULL),(15,2,5,'2025-05-08 07:03:00','Hadir',NULL),(16,2,6,'2025-05-08 07:06:00','Hadir',NULL),(17,2,7,'2025-05-08 07:09:00','Hadir',NULL),(18,2,8,'2025-05-08 07:08:00','Izin',NULL),(19,2,9,'2025-05-08 07:04:00','Hadir',NULL),(20,2,10,'2025-05-08 07:01:00','Hadir',NULL),(21,6,1,'2025-05-01 08:32:00','Hadir',NULL),(22,6,2,'2025-05-01 08:30:00','Hadir',NULL),(23,6,3,'2025-05-01 08:35:00','Hadir',NULL),(24,6,4,'2025-05-01 08:31:00','Hadir',NULL),(25,6,5,'2025-05-01 08:40:00','Alpha',NULL),(26,6,6,'2025-05-01 08:33:00','Hadir',NULL),(27,6,7,'2025-05-01 08:37:00','Hadir',NULL),(28,6,8,'2025-05-01 08:34:00','Hadir',NULL),(29,6,9,'2025-05-01 08:38:00','Hadir',NULL),(30,6,10,'2025-05-01 08:29:00','Hadir',NULL),(31,1,16,'2025-06-01 12:44:40','Hadir','Test submission'),(35,6,16,'2025-06-01 13:06:19','Hadir','Auto-absensi via link oleh Ivan Roisus Salam'),(37,2,16,'2025-06-01 13:07:06','Hadir','Auto-absensi via link oleh Ivan Roisus Salam'),(39,7,16,'2025-06-01 13:18:41','Hadir','Auto-absensi via link oleh Ivan Roisus Salam');
/*!40000 ALTER TABLE `absensi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievement`
--

DROP TABLE IF EXISTS `achievement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievement` (
  `achievement_id` int NOT NULL AUTO_INCREMENT,
  `nama_achievement` varchar(100) NOT NULL,
  `deskripsi` text,
  `icon` varchar(255) DEFAULT NULL,
  `poin_bonus` int DEFAULT '0',
  `kriteria_pencapaian` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`achievement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievement`
--

LOCK TABLES `achievement` WRITE;
/*!40000 ALTER TABLE `achievement` DISABLE KEYS */;
INSERT INTO `achievement` (`achievement_id`, `nama_achievement`, `deskripsi`, `icon`, `poin_bonus`, `kriteria_pencapaian`, `created_at`) VALUES (1,'Rajin Pangkal Pandai','Mengumpulkan 5 tugas tepat waktu berturut-turut.','icon_star.png',20,'5 tugas tepat waktu beruntun','2025-05-30 03:03:03'),(2,'Absensi Sempurna','Tidak ada alpa selama 1 bulan penuh.','icon_calendar.png',30,'0 alpa dalam 30 hari','2025-05-30 03:03:03'),(3,'Murid Teladan','Mendapatkan nilai rata-rata di atas 90 dan absensi sempurna selama 1 semester.','icon_medal.png',100,'Rata-rata nilai > 90 & 0 alpa/semester','2025-05-30 03:03:03');
/*!40000 ALTER TABLE `achievement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guru`
--

DROP TABLE IF EXISTS `guru`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guru` (
  `guru_id` int NOT NULL AUTO_INCREMENT,
  `nip` varchar(191) DEFAULT NULL,
  `nama_lengkap` longtext,
  `email` varchar(191) DEFAULT NULL,
  `password_hash` longtext,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`guru_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `nip_UNIQUE` (`nip`),
  UNIQUE KEY `nip` (`nip`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guru`
--

LOCK TABLES `guru` WRITE;
/*!40000 ALTER TABLE `guru` DISABLE KEYS */;
INSERT INTO `guru` (`guru_id`, `nip`, `nama_lengkap`, `email`, `password_hash`, `created_at`, `updated_at`) VALUES (1,'196501011990031001','Dr. Ahmad Syarif, S.Ag., M.Pd.I','ahmad.syarif@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:08.000','2025-06-01 20:39:33.000'),(2,'196803151991032002','Dra. Siti Fatimah, M.Pd','siti.fatimah@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:08.000','2025-06-01 20:39:33.000'),(3,'197205101995121001','Dr. Bambang Sutrisno, S.Pd., M.Pd','bambang.sutrisno@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:08.000','2025-06-01 20:39:33.000'),(4,'196812201992032003','Prof. Dr. Endang Sari, S.Si., M.Pd','endang.sari@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:08.000','2025-06-01 20:39:33.000'),(5,'198203151999031002','James Richardson, S.Pd., M.Hum','james.richardson@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:08.000','2025-06-01 20:39:33.000'),(6,'197409082000032001','Dra. Kartini Dewi, M.Sn','kartini.dewi@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:16.000','2025-06-01 20:39:33.000'),(7,'196911121994121001','Drs. Agus Salim, M.Pd','agus.salim@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:16.000','2025-06-01 20:39:33.000'),(8,'197801052003032002','Ir. Ratna Sari, M.T','ratna.sari@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:16.000','2025-06-01 20:39:33.000'),(9,'197506201998031001','Dr. Budi Santoso, S.Si., M.Si','budi.santoso@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:16.000','2025-06-01 20:39:33.000'),(10,'197812152001032003','Dr. Dewi Kusuma, S.Si., M.Si','dewi.kusuma@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:16.000','2025-06-01 20:39:33.000'),(11,'197003101995121002','Drs. Hendra Wijaya, M.Pd','hendra.wijaya@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:26.000','2025-06-01 20:39:33.000'),(12,'197707252002032001','Dr. Indira Sari, S.Pd., M.Hum','indira.sari@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:26.000','2025-06-01 20:39:33.000'),(13,'196805141993032002','Dra. Lestari Wati, M.Si','lestari.wati@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:26.000','2025-06-01 20:39:33.000'),(14,'197404101999031001','Dr. Muhammad Iqbal, S.E., M.Pd','muhammad.iqbal@sman1.sch.id','$2b$10$GMI2poyXKcSoAzXB23N4zuR0LeMQZ7BSMNqMLTo0vO8EJeAo5cRWG','2025-06-01 17:57:26.000','2025-06-01 20:39:33.000'),(15,'TEST001','Ahmad Fajar, S.Pd.','ahmad.fajar@test.com','$2a$10$Lqwp8.xKj94Adw.GuurBCuYHUvSj7Fl3G6cBgzsdFOJ0FdBlo5.Aq','2025-06-01 20:45:56.000','2025-06-01 20:45:56.000'),(16,'TEST002','Maya Sari, M.Kom.','maya.sari@test.com','$2a$10$Lqwp8.xKj94Adw.GuurBCuYHUvSj7Fl3G6cBgzsdFOJ0FdBlo5.Aq','2025-06-01 20:45:56.000','2025-06-01 20:45:56.000');
/*!40000 ALTER TABLE `guru` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jadwal`
--

DROP TABLE IF EXISTS `jadwal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jadwal` (
  `id_jadwal` int NOT NULL AUTO_INCREMENT,
  `id_kelas` int NOT NULL,
  `id_mapel` int NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` time DEFAULT NULL,
  `jam_selesai` time DEFAULT NULL,
  PRIMARY KEY (`id_jadwal`),
  KEY `id_kelas` (`id_kelas`),
  KEY `id_mapel` (`id_mapel`),
  CONSTRAINT `jadwal_ibfk_1` FOREIGN KEY (`id_kelas`) REFERENCES `kelas` (`kelas_id`),
  CONSTRAINT `jadwal_ibfk_2` FOREIGN KEY (`id_mapel`) REFERENCES `mapel` (`id_mapel`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jadwal`
--

LOCK TABLES `jadwal` WRITE;
/*!40000 ALTER TABLE `jadwal` DISABLE KEYS */;
/*!40000 ALTER TABLE `jadwal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jadwalpelajaran`
--

DROP TABLE IF EXISTS `jadwalpelajaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jadwalpelajaran` (
  `jadwal_id` int NOT NULL AUTO_INCREMENT,
  `kelas_id` int NOT NULL,
  `mapel_id` int NOT NULL,
  `guru_id` int NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `ruang` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`jadwal_id`),
  KEY `fk_JadwalPelajaran_Kelas1_idx` (`kelas_id`),
  KEY `fk_JadwalPelajaran_MataPelajaran1_idx` (`mapel_id`),
  KEY `fk_JadwalPelajaran_Guru1_idx` (`guru_id`),
  CONSTRAINT `fk_JadwalPelajaran_Guru1` FOREIGN KEY (`guru_id`) REFERENCES `guru` (`guru_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_JadwalPelajaran_Kelas1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`kelas_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_JadwalPelajaran_MataPelajaran1` FOREIGN KEY (`mapel_id`) REFERENCES `matapelajaran` (`mapel_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jadwalpelajaran`
--

LOCK TABLES `jadwalpelajaran` WRITE;
/*!40000 ALTER TABLE `jadwalpelajaran` DISABLE KEYS */;
INSERT INTO `jadwalpelajaran` (`jadwal_id`, `kelas_id`, `mapel_id`, `guru_id`, `hari`, `jam_mulai`, `jam_selesai`, `ruang`, `created_at`, `updated_at`) VALUES (1,1,4,4,'Senin','07:00:00','08:30:00','R101','2025-06-01 10:58:35','2025-06-01 10:58:35'),(2,1,9,9,'Senin','08:30:00','10:00:00','Lab Fisika','2025-06-01 10:58:35','2025-06-01 10:58:35'),(3,1,3,3,'Selasa','07:00:00','08:30:00','R101','2025-06-01 10:58:35','2025-06-01 10:58:35'),(4,1,5,5,'Selasa','08:30:00','10:00:00','R102','2025-06-01 10:58:35','2025-06-01 10:58:35'),(5,1,10,10,'Rabu','07:00:00','08:30:00','Lab Kimia','2025-06-01 10:58:35','2025-06-01 10:58:35'),(6,2,4,4,'Senin','10:30:00','12:00:00','R201','2025-06-01 10:58:47','2025-06-01 10:58:47'),(7,2,9,9,'Senin','13:00:00','14:30:00','Lab Fisika','2025-06-01 10:58:47','2025-06-01 10:58:47'),(8,2,3,3,'Selasa','10:30:00','12:00:00','R201','2025-06-01 10:58:47','2025-06-01 10:58:47'),(9,2,5,5,'Selasa','13:00:00','14:30:00','R202','2025-06-01 10:58:47','2025-06-01 10:58:47'),(10,2,10,10,'Rabu','10:30:00','12:00:00','Lab Kimia','2025-06-01 10:58:47','2025-06-01 10:58:47');
/*!40000 ALTER TABLE `jadwalpelajaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jurusan`
--

DROP TABLE IF EXISTS `jurusan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jurusan` (
  `id_jurusan` int NOT NULL AUTO_INCREMENT,
  `nama_jurusan` varchar(50) NOT NULL,
  PRIMARY KEY (`id_jurusan`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jurusan`
--

LOCK TABLES `jurusan` WRITE;
/*!40000 ALTER TABLE `jurusan` DISABLE KEYS */;
INSERT INTO `jurusan` (`id_jurusan`, `nama_jurusan`) VALUES (1,'IPA'),(2,'IPS');
/*!40000 ALTER TABLE `jurusan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kelas`
--

DROP TABLE IF EXISTS `kelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kelas` (
  `kelas_id` int NOT NULL AUTO_INCREMENT,
  `nama_kelas` longtext,
  `wali_kelas_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_jurusan` int NOT NULL,
  PRIMARY KEY (`kelas_id`),
  KEY `fk_Kelas_Guru1_idx` (`wali_kelas_id`),
  KEY `id_jurusan` (`id_jurusan`),
  CONSTRAINT `fk_Kelas_Guru1` FOREIGN KEY (`wali_kelas_id`) REFERENCES `guru` (`guru_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`id_jurusan`) REFERENCES `jurusan` (`id_jurusan`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kelas`
--

LOCK TABLES `kelas` WRITE;
/*!40000 ALTER TABLE `kelas` DISABLE KEYS */;
INSERT INTO `kelas` (`kelas_id`, `nama_kelas`, `wali_kelas_id`, `created_at`, `updated_at`, `id_jurusan`) VALUES (1,'X IPA 1',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',1),(2,'X IPA 2',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',1),(3,'X IPS 1',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',2),(4,'X IPS 2',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',2),(5,'XI IPA 1',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',1),(6,'XI IPA 2',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',1),(7,'XI IPS 1',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',2),(8,'XI IPS 2',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',2),(9,'XII IPA 1',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',1),(10,'XII IPA 2',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',1),(11,'XII IPS 1',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',2),(12,'XII IPS 2',NULL,'2025-06-01 10:56:40','2025-06-01 10:56:40',2);
/*!40000 ALTER TABLE `kelas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mapel`
--

DROP TABLE IF EXISTS `mapel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mapel` (
  `id_mapel` int NOT NULL AUTO_INCREMENT,
  `nama_mapel` varchar(100) NOT NULL,
  PRIMARY KEY (`id_mapel`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapel`
--

LOCK TABLES `mapel` WRITE;
/*!40000 ALTER TABLE `mapel` DISABLE KEYS */;
INSERT INTO `mapel` (`id_mapel`, `nama_mapel`) VALUES (1,'Pendidikan Agama'),(2,'Pendidikan Pancasila'),(3,'Bahasa Indonesia'),(4,'Matematika'),(5,'Bahasa Inggris'),(6,'Seni Budaya'),(7,'Pendidikan Jasmani'),(8,'Prakarya'),(9,'Fisika Kimia'),(10,'Geografi'),(11,'Sejarah'),(12,'Sosiologi'),(13,'Ekonomi');
/*!40000 ALTER TABLE `mapel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matapelajaran`
--

DROP TABLE IF EXISTS `matapelajaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matapelajaran` (
  `mapel_id` int NOT NULL AUTO_INCREMENT,
  `kode_mapel` varchar(191) DEFAULT NULL,
  `nama_mapel` longtext,
  `deskripsi` longtext,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`mapel_id`),
  UNIQUE KEY `kode_mapel_UNIQUE` (`kode_mapel`),
  UNIQUE KEY `kode_mapel` (`kode_mapel`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matapelajaran`
--

LOCK TABLES `matapelajaran` WRITE;
/*!40000 ALTER TABLE `matapelajaran` DISABLE KEYS */;
INSERT INTO `matapelajaran` (`mapel_id`, `kode_mapel`, `nama_mapel`, `deskripsi`, `created_at`, `updated_at`) VALUES (1,'PAI','Pendidikan Agama Islam','Mata pelajaran agama Islam','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(2,'PKN','Pendidikan Pancasila','Mata pelajaran Pancasila dan Kewarganegaraan','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(3,'IND','Bahasa Indonesia','Mata pelajaran Bahasa Indonesia','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(4,'MAT','Matematika','Mata pelajaran Matematika','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(5,'ENG','Bahasa Inggris','Mata pelajaran Bahasa Inggris','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(6,'SBU','Seni Budaya','Mata pelajaran Seni Budaya','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(7,'PJO','Pendidikan Jasmani','Mata pelajaran Pendidikan Jasmani dan Olahraga','2025-06-01 17:57:38.000','2025-06-01 17:57:38.000'),(8,'PKA','Prakarya','Mata pelajaran Prakarya dan Kewirausahaan','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000'),(9,'FIS','Fisika','Mata pelajaran Fisika','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000'),(10,'KIM','Kimia','Mata pelajaran Kimia','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000'),(11,'GEO','Geografi','Mata pelajaran Geografi','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000'),(12,'SEJ','Sejarah','Mata pelajaran Sejarah','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000'),(13,'SOS','Sosiologi','Mata pelajaran Sosiologi','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000'),(14,'EKO','Ekonomi','Mata pelajaran Ekonomi','2025-06-01 17:57:45.000','2025-06-01 17:57:45.000');
/*!40000 ALTER TABLE `matapelajaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifikasi`
--

DROP TABLE IF EXISTS `notifikasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifikasi` (
  `notifikasi_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'Bisa siswa_id atau guru_id',
  `tipe_user` enum('Siswa','Guru') NOT NULL,
  `judul_notifikasi` varchar(255) NOT NULL,
  `pesan_notifikasi` text NOT NULL,
  `link_terkait` varchar(255) DEFAULT NULL,
  `status_baca` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notifikasi_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifikasi`
--

LOCK TABLES `notifikasi` WRITE;
/*!40000 ALTER TABLE `notifikasi` DISABLE KEYS */;
INSERT INTO `notifikasi` (`notifikasi_id`, `user_id`, `tipe_user`, `judul_notifikasi`, `pesan_notifikasi`, `link_terkait`, `status_baca`, `created_at`) VALUES (1,1,'Siswa','Tugas Baru: Latihan Soal Aljabar','Ada tugas baru Matematika, deadline 2025-06-05.','/tugas/1',0,'2025-05-30 03:03:03'),(2,1,'Guru','Pengumpulan Tugas','Ahmad Farhan telah mengumpulkan tugas \"Latihan Soal Aljabar\".','/tugas/1/pengumpulan/1',0,'2025-05-30 03:03:03'),(3,3,'Siswa','Peringatan Absensi','Anda tercatat alpa pada mata pelajaran Ekonomi tanggal 2025-05-28.','/absensi/siswa/3',0,'2025-05-30 03:03:03');
/*!40000 ALTER TABLE `notifikasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengumpulantugas`
--

DROP TABLE IF EXISTS `pengumpulantugas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengumpulantugas` (
  `pengumpulan_id` int NOT NULL AUTO_INCREMENT,
  `tugas_id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `file_jawaban_siswa` varchar(255) DEFAULT NULL,
  `catatan_siswa` text,
  `tanggal_pengumpulan` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `nilai` decimal(5,2) DEFAULT NULL,
  `catatan_guru` text,
  `status_pengumpulan` enum('Belum Mengerjakan','Mengerjakan','Terlambat','Dinilai') DEFAULT 'Belum Mengerjakan',
  `poin_didapat` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`pengumpulan_id`),
  UNIQUE KEY `tugas_siswa_unique` (`tugas_id`,`siswa_id`),
  KEY `fk_PengumpulanTugas_Tugas1_idx` (`tugas_id`),
  KEY `fk_PengumpulanTugas_Siswa1_idx` (`siswa_id`),
  CONSTRAINT `fk_PengumpulanTugas_Siswa1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`siswa_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_PengumpulanTugas_Tugas1` FOREIGN KEY (`tugas_id`) REFERENCES `tugas` (`tugas_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengumpulantugas`
--

LOCK TABLES `pengumpulantugas` WRITE;
/*!40000 ALTER TABLE `pengumpulantugas` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengumpulantugas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pertemuan`
--

DROP TABLE IF EXISTS `pertemuan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pertemuan` (
  `id_pertemuan` int NOT NULL AUTO_INCREMENT,
  `id_jadwal` int NOT NULL,
  `pertemuan_ke` int NOT NULL,
  `token_absen` varchar(30) NOT NULL,
  `tanggal` date NOT NULL,
  `materi` varchar(3000) DEFAULT NULL,
  PRIMARY KEY (`id_pertemuan`),
  UNIQUE KEY `token_absen` (`token_absen`),
  KEY `id_jadwal` (`id_jadwal`),
  CONSTRAINT `id_jadwal` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwalpelajaran` (`jadwal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pertemuan`
--

LOCK TABLES `pertemuan` WRITE;
/*!40000 ALTER TABLE `pertemuan` DISABLE KEYS */;
INSERT INTO `pertemuan` (`id_pertemuan`, `id_jadwal`, `pertemuan_ke`, `token_absen`, `tanggal`, `materi`) VALUES (1,1,1,'MAT001X1','2025-05-01','Pengenalan Aljabar dan Operasi Bilangan'),(2,1,2,'MAT002X1','2025-05-08','Persamaan Linear Satu Variabel'),(3,1,3,'MAT003X1','2025-05-15','Pertidaksamaan Linear'),(4,1,4,'MAT004X1','2025-05-22','Sistem Persamaan Linear Dua Variabel'),(5,1,5,'MAT005X1','2025-05-29','Fungsi Linear dan Grafik'),(6,2,1,'FIS001X1','2025-05-01','Besaran dan Satuan dalam Fisika'),(7,2,2,'FIS002X1','2025-05-08','Pengukuran dan Ketidakpastian'),(8,2,3,'FIS003X1','2025-05-15','Gerak Lurus Beraturan'),(9,2,4,'FIS004X1','2025-05-22','Gerak Lurus Berubah Beraturan'),(10,2,5,'FIS005X1','2025-05-29','Gerak Jatuh Bebas dan Gerak Vertikal');
/*!40000 ALTER TABLE `pertemuan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siswa`
--

DROP TABLE IF EXISTS `siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siswa` (
  `siswa_id` int NOT NULL AUTO_INCREMENT,
  `nis` varchar(20) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `kelas_id` int NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `poin_motivasi` int DEFAULT '0',
  `tingkat_disiplin` enum('Sangat Baik','Baik','Cukup','Kurang','Sangat Kurang') DEFAULT 'Baik',
  `foto_profil` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `no_telepon` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`siswa_id`),
  UNIQUE KEY `nis_UNIQUE` (`nis`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `fk_Siswa_Kelas1_idx` (`kelas_id`),
  CONSTRAINT `fk_Siswa_Kelas1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`kelas_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siswa`
--

LOCK TABLES `siswa` WRITE;
/*!40000 ALTER TABLE `siswa` DISABLE KEYS */;
INSERT INTO `siswa` (`siswa_id`, `nis`, `nama_lengkap`, `kelas_id`, `email`, `password_hash`, `poin_motivasi`, `tingkat_disiplin`, `foto_profil`, `created_at`, `updated_at`, `no_telepon`) VALUES (1,'2025001','Ahmad Rizki Pratama',1,'ahmad.rizki@student.sch.id','hashed_password_123',85,'Baik',NULL,'2025-06-01 10:57:54','2025-06-09 05:42:00','081230238972'),(2,'2025002','Siti Nur Aisyah',1,'siti.aisyah@student.sch.id','hashed_password_123',92,'Sangat Baik',NULL,'2025-06-01 10:57:54','2025-06-01 11:13:11',NULL),(3,'2025003','Budi Santoso',1,'budi.santoso@student.sch.id','hashed_password_123',78,'Baik',NULL,'2025-06-01 10:57:54','2025-06-01 11:13:11',NULL),(4,'2025004','Dewi Lestari',1,'dewi.lestari@student.sch.id','hashed_password_123',88,'Baik',NULL,'2025-06-01 10:57:54','2025-06-01 11:13:11',NULL),(5,'2025005','Eko Prasetyo',1,'eko.prasetyo@student.sch.id','hashed_password_123',75,'Cukup',NULL,'2025-06-01 10:57:54','2025-06-01 11:13:11',NULL),(6,'2025006','Fatimah Zahra',1,'fatimah.zahra@student.sch.id','hashed_password_123',90,'Sangat Baik',NULL,'2025-06-01 10:58:03','2025-06-01 11:13:11',NULL),(7,'2025007','Gilang Ramadhan',1,'gilang.ramadhan@student.sch.id','hashed_password_123',82,'Baik',NULL,'2025-06-01 10:58:03','2025-06-01 11:13:11',NULL),(8,'2025008','Hana Safitri',1,'hana.safitri@student.sch.id','hashed_password_123',87,'Baik',NULL,'2025-06-01 10:58:03','2025-06-01 11:13:11',NULL),(9,'2025009','Indra Kurniawan',1,'indra.kurniawan@student.sch.id','hashed_password_123',79,'Baik',NULL,'2025-06-01 10:58:03','2025-06-01 11:13:11',NULL),(10,'2025010','Jihan Putri',1,'jihan.putri@student.sch.id','hashed_password_123',94,'Sangat Baik',NULL,'2025-06-01 10:58:03','2025-06-01 11:13:11',NULL),(11,'2025031','Adinda Maharani',2,'adinda.maharani@student.sch.id','hashed_password_123',86,'Baik',NULL,'2025-06-01 10:58:11','2025-06-01 11:13:11',NULL),(12,'2025032','Bagas Firmansyah',2,'bagas.firmansyah@student.sch.id','hashed_password_123',81,'Baik',NULL,'2025-06-01 10:58:11','2025-06-01 11:13:11',NULL),(13,'2025033','Citra Dewi',2,'citra.dewi@student.sch.id','hashed_password_123',89,'Baik',NULL,'2025-06-01 10:58:11','2025-06-01 11:13:11',NULL),(14,'2025034','Dani Pratama',2,'dani.pratama@student.sch.id','hashed_password_123',77,'Cukup',NULL,'2025-06-01 10:58:11','2025-06-01 11:13:11',NULL),(15,'2025035','Eka Sari',2,'eka.sari@student.sch.id','hashed_password_123',93,'Sangat Baik',NULL,'2025-06-01 10:58:11','2025-06-01 11:13:11',NULL),(16,'20250368','Ivan Roisus Salam',1,'ivanroisussalam1234@gmail.com','$2a$10$pAi35MjrFdXzALarfn.wtuCHt5t4cf.OL0bcLHeoR1XVkUpJQjV.2',0,'Baik',NULL,'2025-06-01 11:06:46','2025-06-09 05:42:00','081230238972'),(17,'9817271112','Ami Kemala Putri',1,'rahmawati4064@gmail.com','$2a$10$xtewcpWwYpJULPv1gWJRnOsFYyW6b4g1C9SveBYCHVab2g4APvl.q',0,'Baik','','2025-06-08 22:43:15','2025-06-08 22:43:15','08889281221'),(20,'981727111222','Ami Kemala Putri',1,'ivan1739@gmail.com','$2a$10$a5LtUzhQEjXuqxTA3CmtTec2toZw8QaWn9zU6tHHO59JoMweHRYCG',0,'Baik','','2025-06-08 22:43:41','2025-06-08 22:43:41','08889281221'),(23,'1872662','',1,'ivanroisussalam@gmail.com','$2a$10$kX6CIQohrnSOvpMAySfTweB6L6kFPLobVqdzY6VwMZ.WjF8JokZNy',0,'Baik','','2025-06-08 22:45:55','2025-06-08 22:45:55','081230238972'),(24,'99271831','Ami Kemala Putris',1,'ivan17329@gmail.com','$2a$10$uU6Nfh4Q94LAnXiPnzbPduQ7LbD9wZcErHqTSQamIFJ6vlAA3o99y',0,'Baik','','2025-06-08 22:46:55','2025-06-08 22:46:55','08889281211'),(25,'98271000','Kola Kola',2,'ihunsh@gmail.com','$2a$10$ejpgGAUxDdkqgMZj9//JceGjBGC.aJeevgCJ9TSDPa1kc09P3F2Ju',0,'Baik','','2025-06-08 22:54:31','2025-06-08 22:54:31','0819283221'),(26,'982710001','Kola Kola',2,'ihunsh2@gmail.com','$2a$10$x43xy.vhe3w9gKje203GZOi2sOrwNz9q8qOmGxb18QkONh6xzLkea',0,'Baik','','2025-06-08 22:54:49','2025-06-08 22:54:49','0819283221'),(27,'08172122','Cupidatat voluptatib',1,'vohyzihosi@mailinator.com','$2a$10$z4aAH9NEGgYWhNbY12IZneXm0J.MsNCViuDNCTTkHuaHgUx5/iAEy',0,'Baik','','2025-06-08 23:01:12','2025-06-08 23:01:12','0812392812');
/*!40000 ALTER TABLE `siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siswaachievement`
--

DROP TABLE IF EXISTS `siswaachievement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siswaachievement` (
  `siswa_achievement_id` int NOT NULL AUTO_INCREMENT,
  `siswa_id` int NOT NULL,
  `achievement_id` int NOT NULL,
  `tanggal_diraih` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`siswa_achievement_id`),
  UNIQUE KEY `siswa_achievement_unique` (`siswa_id`,`achievement_id`),
  KEY `fk_SiswaAchievement_Siswa1_idx` (`siswa_id`),
  KEY `fk_SiswaAchievement_Achievement1_idx` (`achievement_id`),
  CONSTRAINT `fk_SiswaAchievement_Achievement1` FOREIGN KEY (`achievement_id`) REFERENCES `achievement` (`achievement_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_SiswaAchievement_Siswa1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`siswa_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siswaachievement`
--

LOCK TABLES `siswaachievement` WRITE;
/*!40000 ALTER TABLE `siswaachievement` DISABLE KEYS */;
INSERT INTO `siswaachievement` (`siswa_achievement_id`, `siswa_id`, `achievement_id`, `tanggal_diraih`, `created_at`) VALUES (1,2,1,'2025-05-20 03:00:00','2025-05-30 03:03:03');
/*!40000 ALTER TABLE `siswaachievement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tugas`
--

DROP TABLE IF EXISTS `tugas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tugas` (
  `tugas_id` int NOT NULL AUTO_INCREMENT,
  `jadwal_id` int NOT NULL,
  `judul_tugas` varchar(255) NOT NULL,
  `deskripsi_tugas` text,
  `file_tugas_guru` varchar(255) DEFAULT NULL,
  `tanggal_dibuat` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deadline_pengumpulan` timestamp NOT NULL,
  `poin_maksimal` int DEFAULT '100',
  `tipe_tugas` enum('Individu','Kelompok') DEFAULT 'Individu',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tugas_id`),
  KEY `fk_Tugas_JadwalPelajaran1_idx` (`jadwal_id`),
  CONSTRAINT `fk_Tugas_JadwalPelajaran1` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwalpelajaran` (`jadwal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tugas`
--

LOCK TABLES `tugas` WRITE;
/*!40000 ALTER TABLE `tugas` DISABLE KEYS */;
/*!40000 ALTER TABLE `tugas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `view_daftar_matapelajaran_per_kelas`
--

DROP TABLE IF EXISTS `view_daftar_matapelajaran_per_kelas`;
/*!50001 DROP VIEW IF EXISTS `view_daftar_matapelajaran_per_kelas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_daftar_matapelajaran_per_kelas` AS SELECT 
 1 AS `id_jadwal_pelajaran`,
 1 AS `kelas_id`,
 1 AS `nama_kelas`,
 1 AS `id_mapel`,
 1 AS `nama_mapel`,
 1 AS `kode_mapel`,
 1 AS `guru_id`,
 1 AS `nama_guru`,
 1 AS `nip_guru`,
 1 AS `jadwal_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_detail_absensi`
--

DROP TABLE IF EXISTS `view_detail_absensi`;
/*!50001 DROP VIEW IF EXISTS `view_detail_absensi`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_detail_absensi` AS SELECT 
 1 AS `id_jadwal_pelajaran`,
 1 AS `nama_mapel`,
 1 AS `nama_kelas`,
 1 AS `guru_pengampu`,
 1 AS `nip_guru`,
 1 AS `id_pertemuan`,
 1 AS `pertemuan_ke`,
 1 AS `tanggal_pertemuan`,
 1 AS `materi_pertemuan`,
 1 AS `token_absen`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_detail_pertemuan_matakuliah`
--

DROP TABLE IF EXISTS `view_detail_pertemuan_matakuliah`;
/*!50001 DROP VIEW IF EXISTS `view_detail_pertemuan_matakuliah`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_detail_pertemuan_matakuliah` AS SELECT 
 1 AS `id_jadwal_pelajaran`,
 1 AS `nama_mapel`,
 1 AS `nama_kelas`,
 1 AS `dosen_pengampu`,
 1 AS `nip_dosen`,
 1 AS `id_pertemuan`,
 1 AS `pertemuan_ke`,
 1 AS `tanggal_pertemuan`,
 1 AS `materi_pertemuan`,
 1 AS `token_absen`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `view_daftar_matapelajaran_per_kelas`
--

/*!50001 DROP VIEW IF EXISTS `view_daftar_matapelajaran_per_kelas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_daftar_matapelajaran_per_kelas` AS select `jp`.`jadwal_id` AS `id_jadwal_pelajaran`,`k`.`kelas_id` AS `kelas_id`,`k`.`nama_kelas` AS `nama_kelas`,`mp`.`mapel_id` AS `id_mapel`,`mp`.`nama_mapel` AS `nama_mapel`,`mp`.`kode_mapel` AS `kode_mapel`,`g`.`guru_id` AS `guru_id`,`g`.`nama_lengkap` AS `nama_guru`,`g`.`nip` AS `nip_guru`,`jp`.`jadwal_id` AS `jadwal_id` from ((((`jadwalpelajaran` `jp` join `kelas` `k` on((`jp`.`kelas_id` = `k`.`kelas_id`))) join `matapelajaran` `mp` on((`jp`.`mapel_id` = `mp`.`mapel_id`))) join `guru` `g` on((`jp`.`guru_id` = `g`.`guru_id`))) left join `jadwal` `j` on((`jp`.`jadwal_id` = `j`.`id_jadwal`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_detail_absensi`
--

/*!50001 DROP VIEW IF EXISTS `view_detail_absensi`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_detail_absensi` AS select `jp`.`jadwal_id` AS `id_jadwal_pelajaran`,`mp`.`nama_mapel` AS `nama_mapel`,`k`.`nama_kelas` AS `nama_kelas`,`g`.`nama_lengkap` AS `guru_pengampu`,`g`.`nip` AS `nip_guru`,`p`.`id_pertemuan` AS `id_pertemuan`,`p`.`pertemuan_ke` AS `pertemuan_ke`,`p`.`tanggal` AS `tanggal_pertemuan`,`p`.`materi` AS `materi_pertemuan`,`p`.`token_absen` AS `token_absen` from ((((`pertemuan` `p` join `jadwalpelajaran` `jp` on((`p`.`id_jadwal` = `jp`.`jadwal_id`))) join `matapelajaran` `mp` on((`jp`.`mapel_id` = `mp`.`mapel_id`))) join `kelas` `k` on((`jp`.`kelas_id` = `k`.`kelas_id`))) join `guru` `g` on((`jp`.`guru_id` = `g`.`guru_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_detail_pertemuan_matakuliah`
--

/*!50001 DROP VIEW IF EXISTS `view_detail_pertemuan_matakuliah`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_detail_pertemuan_matakuliah` AS select `jp`.`jadwal_id` AS `id_jadwal_pelajaran`,`mp`.`nama_mapel` AS `nama_mapel`,`k`.`nama_kelas` AS `nama_kelas`,`g`.`nama_lengkap` AS `dosen_pengampu`,`g`.`nip` AS `nip_dosen`,`p`.`id_pertemuan` AS `id_pertemuan`,`p`.`pertemuan_ke` AS `pertemuan_ke`,`p`.`tanggal` AS `tanggal_pertemuan`,`p`.`materi` AS `materi_pertemuan`,`p`.`token_absen` AS `token_absen` from ((((`pertemuan` `p` join `jadwalpelajaran` `jp` on((`p`.`id_jadwal` = `jp`.`jadwal_id`))) join `matapelajaran` `mp` on((`jp`.`mapel_id` = `mp`.`mapel_id`))) join `kelas` `k` on((`jp`.`kelas_id` = `k`.`kelas_id`))) join `guru` `g` on((`jp`.`guru_id` = `g`.`guru_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-09 14:22:45
