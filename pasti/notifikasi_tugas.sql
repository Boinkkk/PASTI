create table notifikasi_tugas
(
    id               int auto_increment
        primary key,
    tugas_id         int                                                  not null,
    siswa_id         int                                                  not null,
    jenis_notifikasi enum ('3_hari', '1_hari', '2_jam', 'lewat_deadline') not null,
    tanggal_kirim    datetime                   default CURRENT_TIMESTAMP null,
    status           enum ('terkirim', 'gagal') default 'terkirim'        null,
    response_api     text                                                 null,
    created_at       timestamp                  default CURRENT_TIMESTAMP null,
    constraint unique_notif
        unique (tugas_id, siswa_id, jenis_notifikasi),
    constraint notifikasi_tugas_ibfk_1
        foreign key (tugas_id) references tugas (tugas_id),
    constraint notifikasi_tugas_ibfk_2
        foreign key (siswa_id) references siswa (siswa_id)
);

create index siswa_id
    on notifikasi_tugas (siswa_id);

