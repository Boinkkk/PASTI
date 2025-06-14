-- Migration: Create notifikasi_tugas table
-- This table is used to track WhatsApp notifications sent to students about assignments

CREATE TABLE IF NOT EXISTS `notifikasi_tugas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tugas_id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `jenis_notifikasi` enum('3_hari','1_hari','2_jam','lewat_deadline') NOT NULL,
  `tanggal_kirim` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('terkirim','gagal') DEFAULT 'terkirim',
  `response_api` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_notifikasi_tugas_unique` (`tugas_id`, `siswa_id`, `jenis_notifikasi`, `tanggal_kirim`),
  KEY `idx_tugas_id` (`tugas_id`),
  KEY `idx_siswa_id` (`siswa_id`),
  KEY `idx_jenis_notifikasi` (`jenis_notifikasi`),
  KEY `idx_tanggal_kirim` (`tanggal_kirim`),
  CONSTRAINT `fk_notifikasi_tugas_tugas` FOREIGN KEY (`tugas_id`) REFERENCES `tugas` (`tugas_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifikasi_tugas_siswa` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`siswa_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Index for efficient querying of notifications sent on specific date
CREATE INDEX idx_notifikasi_date_type ON notifikasi_tugas (DATE(tanggal_kirim), jenis_notifikasi);
