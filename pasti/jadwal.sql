create table jadwal
(
    id_jadwal   int auto_increment
        primary key,
    id_kelas    int                                                         not null,
    id_mapel    int                                                         not null,
    hari        enum ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') not null,
    jam_mulai   time                                                        null,
    jam_selesai time                                                        null,
    constraint jadwal_ibfk_1
        foreign key (id_kelas) references kelas (kelas_id),
    constraint jadwal_ibfk_2
        foreign key (id_mapel) references mapel (id_mapel)
);

create index id_kelas
    on jadwal (id_kelas);

create index id_mapel
    on jadwal (id_mapel);

