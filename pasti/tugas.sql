create table tugas
(
    tugas_id             int auto_increment
        primary key,
    jadwal_id            int                                                     not null,
    judul_tugas          varchar(255)                                            not null,
    deskripsi_tugas      text                                                    null,
    file_tugas_guru      varchar(255)                                            null,
    tanggal_dibuat       timestamp                     default CURRENT_TIMESTAMP null,
    deadline_pengumpulan timestamp                                               not null,
    poin_maksimal        int                           default 100               null,
    tipe_tugas           enum ('Individu', 'Kelompok') default 'Individu'        null,
    created_at           timestamp                     default CURRENT_TIMESTAMP null,
    updated_at           timestamp                     default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint fk_Tugas_JadwalPelajaran1
        foreign key (jadwal_id) references jadwalpelajaran (jadwal_id)
            on update cascade on delete cascade
);

create index fk_Tugas_JadwalPelajaran1_idx
    on tugas (jadwal_id);

