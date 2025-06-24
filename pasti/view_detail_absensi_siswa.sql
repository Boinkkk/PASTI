create definer = root@localhost view view_detail_absensi_siswa as
select `pasti`.`v`.`id_jadwal_pelajaran`     AS `id_jadwal_pelajaran`,
       `pasti`.`v`.`nama_mapel`              AS `nama_mapel`,
       `pasti`.`v`.`nama_kelas`              AS `nama_kelas`,
       `pasti`.`v`.`nama_guru`               AS `nama_guru`,
       `pasti`.`v`.`nip_guru`                AS `nip_guru`,
       `pasti`.`v`.`id_pertemuan`            AS `id_pertemuan`,
       `pasti`.`v`.`pertemuan_ke`            AS `pertemuan_ke`,
       `pasti`.`v`.`tanggal_pertemuan`       AS `tanggal_pertemuan`,
       `pasti`.`v`.`materi_pertemuan`        AS `materi_pertemuan`,
       `pasti`.`v`.`token_absen`             AS `token_absen`,
       coalesce(`a`.`status`, 'Belum Absen') AS `status_kehadiran`,
       `a`.`waktu_absen`                     AS `waktu_absen`,
       `a`.`id_absensi`                      AS `id_absensi`
from (`pasti`.`view_detail_pertemuan_matakuliah` `v` left join `pasti`.`absensi` `a`
      on (((`pasti`.`v`.`id_pertemuan` = `a`.`id_pertemuan`) and (`a`.`id_siswa` = 1))))
where (`pasti`.`v`.`id_jadwal_pelajaran` = 1)
order by `pasti`.`v`.`tanggal_pertemuan`;

