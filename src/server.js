// route utama = untuk server utama, seperti menyimpan API, create, Update, Delete

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// untk menggunakan dotenv
dotenv.config();

// untuk kerangka kerja express = harus di simpan di dalam variabel (karena express menggunakan function ())
const app = express();

// untuk cors berjalan di dalam express = untuk bisa running di sisi browser (menangani data yang masuk dan data yang keluar)
app.use(cors());

// untuk mengubah tipe jadi json
app.use(express.json());

// mengakses port dari env
const PORT = process.env.PORT || 3001;

// untuk menampilkan di gitbash jika server sudah berjalan
app.listen(() => console.log(`
    ====================
    RUNNING PORT : ${PORT}
    ====================
    `))
