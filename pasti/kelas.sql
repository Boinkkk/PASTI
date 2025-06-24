create table kelas
(
    kelas_id      int auto_increment
        primary key,
    nama_kelas    longtext                            null,
    wali_kelas_id int                                 null,
    created_at    timestamp default CURRENT_TIMESTAMP null,
    updated_at    timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    id_jurusan    int                                 not null,
    constraint fk_Kelas_Guru1
        foreign key (wali_kelas_id) references guru (guru_id)
            on update cascade on delete set null,
    constraint kelas_ibfk_1
        foreign key (id_jurusan) references jurusan (id_jurusan)
);

create index fk_Kelas_Guru1_idx
    on kelas (wali_kelas_id);

create index id_jurusan
    on kelas (id_jurusan);

