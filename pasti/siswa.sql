create table siswa
(
    siswa_id         int auto_increment
        primary key,
    nis              varchar(20)                                                                                not null,
    nama_lengkap     varchar(100)                                                                               not null,
    kelas_id         int                                                                                        not null,
    email            varchar(100)                                                                               null,
    password_hash    varchar(255)                                                                               not null,
    poin_motivasi    int                                                              default 0                 null,
    tingkat_disiplin enum ('Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Sangat Kurang') default 'Baik'            null,
    foto_profil      varchar(255)                                                                               null,
    created_at       timestamp                                                        default CURRENT_TIMESTAMP null,
    updated_at       timestamp                                                        default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    no_telepon       varchar(50)                                                                                null,
    constraint email_UNIQUE
        unique (email),
    constraint nis_UNIQUE
        unique (nis),
    constraint fk_Siswa_Kelas1
        foreign key (kelas_id) references kelas (kelas_id)
            on update cascade
);

create index fk_Siswa_Kelas1_idx
    on siswa (kelas_id);

