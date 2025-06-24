create table pertemuan
(
    id_pertemuan int auto_increment
        primary key,
    id_jadwal    int           not null,
    pertemuan_ke int           not null,
    token_absen  varchar(30)   not null,
    tanggal      date          not null,
    materi       varchar(3000) null,
    is_active    tinyint(1)    null,
    constraint token_absen
        unique (token_absen),
    constraint id_jadwal
        foreign key (id_jadwal) references jadwalpelajaran (jadwal_id)
            on update cascade on delete cascade
);

