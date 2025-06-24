create table guru
(
    guru_id       int auto_increment
        primary key,
    nip           varchar(191) null,
    nama_lengkap  longtext     null,
    email         varchar(191) null,
    password_hash longtext     null,
    created_at    datetime(3)  null,
    updated_at    datetime(3)  null,
    constraint email
        unique (email),
    constraint email_UNIQUE
        unique (email),
    constraint nip
        unique (nip),
    constraint nip_UNIQUE
        unique (nip)
);

