-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2024 at 02:52 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smoothly`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `toko_latitude` varchar(255) DEFAULT NULL,
  `toko_longitude` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id_admin`, `nama`, `username`, `password`, `toko_latitude`, `toko_longitude`, `created_at`, `updated_at`) VALUES
(1, 'Jevon The Prodigy', 'admin', '21232f297a57a5a743894a0e4a801fc3', '-7.7470917706577245', '110.35531642792714', '2024-05-29 06:25:53', '2024-05-30 00:49:59');

-- --------------------------------------------------------

--
-- Table structure for table `akses_token`
--

CREATE TABLE `akses_token` (
  `id` int(11) NOT NULL,
  `id_pelanggan` int(11) DEFAULT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `token` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `layanan`
--

CREATE TABLE `layanan` (
  `id_layanan` int(11) NOT NULL,
  `nama_layanan` varchar(100) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `layanan`
--

INSERT INTO `layanan` (`id_layanan`, `nama_layanan`, `deskripsi`, `harga`, `created_at`, `updated_at`) VALUES
(1, 'Cuci Sepatu Reguler', 'Layanan cuci sepatu standar dengan estimasi waktu 3-5 hari kerja.', '50000.00', '2024-05-29 06:29:34', '2024-05-29 06:29:34'),
(2, 'Cuci Sepatu Kilat', 'Layanan cuci sepatu cepat dengan estimasi waktu 1-2 hari kerja.', '75000.00', '2024-05-29 06:29:34', '2024-05-29 06:29:34'),
(3, 'Cuci Sepatu Premium', 'Layanan cuci sepatu dengan perawatan tambahan dan bahan pembersih premium.', '100000.00', '2024-05-29 06:29:34', '2024-05-29 06:29:34'),
(4, 'Cuci Sepatu Express', 'Layanan cuci sepatu super cepat dengan estimasi waktu 6-12 jam.', '90000.00', '2024-05-29 06:29:34', '2024-05-29 06:29:34'),
(5, 'Cuci Sepatu Deep Clean', 'Layanan cuci sepatu menyeluruh hingga ke bagian dalam sepatu.', '120000.00', '2024-05-29 06:29:34', '2024-05-29 06:29:34');

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `id_pelanggan` int(11) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `no_telepon` varchar(15) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `foto_profil` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id_pembayaran` int(11) NOT NULL,
  `id_pemesanan` int(11) DEFAULT NULL,
  `bukti_pembayaran` varchar(255) DEFAULT NULL,
  `metode_pembayaran` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pemesanan`
--

CREATE TABLE `pemesanan` (
  `id_pemesanan` int(11) NOT NULL,
  `id_pelanggan` int(11) DEFAULT NULL,
  `id_layanan` int(11) DEFAULT NULL,
  `jumlah_sepatu` int(11) DEFAULT NULL,
  `total_biaya` int(11) NOT NULL,
  `catatan_pelanggan` text DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `status_pemesanan` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int(11) NOT NULL,
  `id_pemesanan` int(11) DEFAULT NULL,
  `tanggal_masuk` date DEFAULT NULL,
  `tanggal_keluar` date DEFAULT NULL,
  `tanggal_transaksi` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `akses_token`
--
ALTER TABLE `akses_token`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `layanan`
--
ALTER TABLE `layanan`
  ADD PRIMARY KEY (`id_layanan`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`id_pelanggan`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id_pembayaran`),
  ADD KEY `pembayaran_ibfk_1` (`id_pemesanan`);

--
-- Indexes for table `pemesanan`
--
ALTER TABLE `pemesanan`
  ADD PRIMARY KEY (`id_pemesanan`),
  ADD KEY `pemesanan_ibfk_1` (`id_pelanggan`),
  ADD KEY `pemesanan_ibfk_2` (`id_layanan`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`),
  ADD KEY `transaksi_ibfk_1` (`id_pemesanan`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `akses_token`
--
ALTER TABLE `akses_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `layanan`
--
ALTER TABLE `layanan`
  MODIFY `id_layanan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pelanggan`
--
ALTER TABLE `pelanggan`
  MODIFY `id_pelanggan` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id_pembayaran` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pemesanan`
--
ALTER TABLE `pemesanan`
  MODIFY `id_pemesanan` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`id_pemesanan`) REFERENCES `pemesanan` (`id_pemesanan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pemesanan`
--
ALTER TABLE `pemesanan`
  ADD CONSTRAINT `fk_layanan` FOREIGN KEY (`id_layanan`) REFERENCES `layanan` (`id_layanan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pelanggan` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pemesanan_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pemesanan_ibfk_2` FOREIGN KEY (`id_layanan`) REFERENCES `layanan` (`id_layanan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `fk_pemesanan` FOREIGN KEY (`id_pemesanan`) REFERENCES `pemesanan` (`id_pemesanan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`id_pemesanan`) REFERENCES `pemesanan` (`id_pemesanan`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
