create table matapelajaran
(
    mapel_id   int auto_increment
        primary key,
    kode_mapel varchar(191) null,
    nama_mapel longtext     null,
    deskripsi  longtext     null,
    created_at datetime(3)  null,
    updated_at datetime(3)  null,
    constraint kode_mapel
        unique (kode_mapel),
    constraint kode_mapel_UNIQUE
        unique (kode_mapel)
);

