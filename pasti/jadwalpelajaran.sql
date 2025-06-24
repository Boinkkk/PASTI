create table jadwalpelajaran
(
    jadwal_id   int auto_increment
        primary key,
    kelas_id    int                                                                   not null,
    mapel_id    int                                                                   not null,
    guru_id     int                                                                   not null,
    hari        enum ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu') not null,
    jam_mulai   time                                                                  not null,
    jam_selesai time                                                                  not null,
    ruang       varchar(20)                                                           null,
    created_at  timestamp default CURRENT_TIMESTAMP                                   null,
    updated_at  timestamp default CURRENT_TIMESTAMP                                   null on update CURRENT_TIMESTAMP,
    constraint fk_JadwalPelajaran_Guru1
        foreign key (guru_id) references guru (guru_id)
            on update cascade,
    constraint fk_JadwalPelajaran_Kelas1
        foreign key (kelas_id) references kelas (kelas_id)
            on update cascade on delete cascade,
    constraint fk_JadwalPelajaran_MataPelajaran1
        foreign key (mapel_id) references matapelajaran (mapel_id)
            on update cascade
);

create index fk_JadwalPelajaran_Guru1_idx
    on jadwalpelajaran (guru_id);

create index fk_JadwalPelajaran_Kelas1_idx
    on jadwalpelajaran (kelas_id);

create index fk_JadwalPelajaran_MataPelajaran1_idx
    on jadwalpelajaran (mapel_id);

