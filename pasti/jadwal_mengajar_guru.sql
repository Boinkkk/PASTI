create definer = root@localhost view jadwal_mengajar_guru as
select `j`.`jadwal_id`                         AS `jadwal_id`,
       `j`.`kelas_id`                          AS `kelas_id`,
       `m`.`nama_mapel`                        AS `nama_mapel`,
       `k`.`nama_kelas`                        AS `nama_kelas`,
       `j`.`hari`                              AS `hari`,
       `j`.`guru_id`                           AS `guru_id`,
       time_format(`j`.`jam_mulai`, '%H:%i')   AS `waktu_mulai`,
       time_format(`j`.`jam_selesai`, '%H:%i') AS `waktu_selesai`,
       `j`.`ruang`                             AS `ruang`
from ((`pasti`.`jadwalpelajaran` `j` join `pasti`.`kelas` `k`
       on ((`j`.`kelas_id` = `k`.`kelas_id`))) join `pasti`.`mapel` `m` on ((`j`.`mapel_id` = `m`.`id_mapel`)))
order by field(`j`.`hari`, 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'), `j`.`jam_mulai`;

