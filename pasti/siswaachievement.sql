create table siswaachievement
(
    siswa_achievement_id int auto_increment
        primary key,
    siswa_id             int                                 not null,
    achievement_id       int                                 not null,
    tanggal_diraih       timestamp default CURRENT_TIMESTAMP not null,
    created_at           timestamp default CURRENT_TIMESTAMP null,
    constraint siswa_achievement_unique
        unique (siswa_id, achievement_id),
    constraint fk_SiswaAchievement_Achievement1
        foreign key (achievement_id) references achievement (achievement_id)
            on update cascade on delete cascade,
    constraint fk_SiswaAchievement_Siswa1
        foreign key (siswa_id) references siswa (siswa_id)
            on update cascade on delete cascade
);

create index fk_SiswaAchievement_Achievement1_idx
    on siswaachievement (achievement_id);

create index fk_SiswaAchievement_Siswa1_idx
    on siswaachievement (siswa_id);

