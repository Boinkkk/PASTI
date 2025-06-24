create table pengumpulantugas
(
    pengumpulan_id      int auto_increment
        primary key,
    tugas_id            int                                                                                           not null,
    siswa_id            int                                                                                           not null,
    file_jawaban_siswa  varchar(255)                                                                                  null,
    catatan_siswa       text                                                                                          null,
    tanggal_pengumpulan timestamp                                                         default CURRENT_TIMESTAMP   null,
    nilai               decimal(5, 2)                                                                                 null,
    catatan_guru        text                                                                                          null,
    status_pengumpulan  enum ('Belum Mengerjakan', 'Mengerjakan', 'Terlambat', 'Dinilai') default 'Belum Mengerjakan' null,
    poin_didapat        int                                                               default 0                   null,
    created_at          timestamp                                                         default CURRENT_TIMESTAMP   null,
    updated_at          timestamp                                                         default CURRENT_TIMESTAMP   null on update CURRENT_TIMESTAMP,
    constraint tugas_siswa_unique
        unique (tugas_id, siswa_id),
    constraint fk_PengumpulanTugas_Siswa1
        foreign key (siswa_id) references siswa (siswa_id)
            on update cascade on delete cascade,
    constraint fk_PengumpulanTugas_Tugas1
        foreign key (tugas_id) references tugas (tugas_id)
            on update cascade on delete cascade
);

create index fk_PengumpulanTugas_Siswa1_idx
    on pengumpulantugas (siswa_id);

create index fk_PengumpulanTugas_Tugas1_idx
    on pengumpulantugas (tugas_id);

