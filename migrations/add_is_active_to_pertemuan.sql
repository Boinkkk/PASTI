-- Migration script untuk menambahkan kolom is_active ke tabel pertemuan
-- Jalankan script ini di database MySQL

-- Tambahkan kolom is_active ke tabel pertemuan
ALTER TABLE `pertemuan` 
ADD COLUMN `is_active` BOOLEAN DEFAULT FALSE AFTER `materi`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `is_active`,
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Update existing records (opsional - set default values)
UPDATE `pertemuan` SET `is_active` = FALSE WHERE `is_active` IS NULL;

-- Verify the changes
DESCRIBE `pertemuan`;
