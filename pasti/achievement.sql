create table achievement
(
    achievement_id      int auto_increment
        primary key,
    nama_achievement    varchar(100)                        not null,
    deskripsi           text                                null,
    icon                varchar(255)                        null,
    poin_bonus          int       default 0                 null,
    kriteria_pencapaian text                                null,
    created_at          timestamp default CURRENT_TIMESTAMP null
);

