create definer = root@localhost view view_detail_pertemuan_matakuliah as
select `jp`.`jadwal_id`   AS `id_jadwal_pelajaran`,
       `mp`.`nama_mapel`  AS `nama_mapel`,
       `k`.`nama_kelas`   AS `nama_kelas`,
       `g`.`nama_lengkap` AS `nama_guru`,
       `g`.`nip`          AS `nip_guru`,
       `p`.`id_pertemuan` AS `id_pertemuan`,
       `p`.`pertemuan_ke` AS `pertemuan_ke`,
       `p`.`tanggal`      AS `tanggal_pertemuan`,
       `p`.`materi`       AS `materi_pertemuan`,
       `p`.`token_absen`  AS `token_absen`
from ((((`pasti`.`pertemuan` `p` join `pasti`.`jadwalpelajaran` `jp`
         on ((`p`.`id_jadwal` = `jp`.`jadwal_id`))) join `pasti`.`matapelajaran` `mp`
        on ((`jp`.`mapel_id` = `mp`.`mapel_id`))) join `pasti`.`kelas` `k`
       on ((`jp`.`kelas_id` = `k`.`kelas_id`))) join `pasti`.`guru` `g` on ((`jp`.`guru_id` = `g`.`guru_id`)));

