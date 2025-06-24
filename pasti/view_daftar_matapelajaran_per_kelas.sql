create definer = root@localhost view view_daftar_matapelajaran_per_kelas as
select `jp`.`jadwal_id`   AS `id_jadwal_pelajaran`,
       `k`.`kelas_id`     AS `kelas_id`,
       `k`.`nama_kelas`   AS `nama_kelas`,
       `mp`.`mapel_id`    AS `id_mapel`,
       `mp`.`nama_mapel`  AS `nama_mapel`,
       `mp`.`kode_mapel`  AS `kode_mapel`,
       `g`.`guru_id`      AS `guru_id`,
       `g`.`nama_lengkap` AS `nama_guru`,
       `g`.`nip`          AS `nip_guru`,
       `jp`.`jadwal_id`   AS `jadwal_id`
from ((((`pasti`.`jadwalpelajaran` `jp` join `pasti`.`kelas` `k`
         on ((`jp`.`kelas_id` = `k`.`kelas_id`))) join `pasti`.`matapelajaran` `mp`
        on ((`jp`.`mapel_id` = `mp`.`mapel_id`))) join `pasti`.`guru` `g`
       on ((`jp`.`guru_id` = `g`.`guru_id`))) left join `pasti`.`jadwal` `j` on ((`jp`.`jadwal_id` = `j`.`id_jadwal`)));

