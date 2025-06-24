create table absensi
(
    id_absensi   int auto_increment
        primary key,
    id_pertemuan int                                                      not null,
    id_siswa     int                                                      not null,
    waktu_absen  datetime                                                 not null,
    status       enum ('Hadir', 'Izin', 'Sakit', 'Alpha') default 'Hadir' null,
    keterangan   text                                                     null,
    constraint uk_absensi_pertemuan_siswa
        unique (id_pertemuan, id_siswa),
    constraint absensi_ibfk_1
        foreign key (id_pertemuan) references pertemuan (id_pertemuan),
    constraint absensi_ibfk_2
        foreign key (id_siswa) references siswa (siswa_id)
);

create index id_siswa
    on absensi (id_siswa);

