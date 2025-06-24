create definer = root@localhost view jadwal_pertemuan_guru_pelajaran as
select `p`.`id_pertemuan`             AS `id_pertemuan`,
       `pasti`.`j`.`guru_id`          AS `guru_id`,
       `pasti`.`j`.`jadwal_id`        AS `jadwal_id`,
       `p`.`pertemuan_ke`             AS `pertemuan_ke`,
       `p`.`materi`                   AS `materi`,
       `p`.`tanggal`                  AS `tanggal`,
       `p`.`token_absen`              AS `token_absen`,
       `p`.`is_active`                AS `is_active`,
       count(`a`.`id_absensi`)        AS `total_hadir`,
       count(distinct `s`.`siswa_id`) AS `total_siswa`
from (((`pasti`.`pertemuan` `p` join `pasti`.`jadwal_mengajar_guru` `j`
        on ((`p`.`id_jadwal` = `pasti`.`j`.`jadwal_id`))) left join `pasti`.`absensi` `a`
       on (((`a`.`id_pertemuan` = `p`.`id_pertemuan`) and (`a`.`status` = 'Hadir')))) left join `pasti`.`siswa` `s`
      on ((`s`.`kelas_id` = `pasti`.`j`.`jadwal_id`)))
group by `p`.`id_pertemuan`;

