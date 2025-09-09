-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 09, 2025 at 06:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `logicworks_crm_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_conversations`
--

CREATE TABLE `ai_chat_conversations` (
  `id` varchar(36) NOT NULL,
  `user_id` text DEFAULT NULL,
  `title` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT NULL,
  `archived_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_chat_conversations`
--

INSERT INTO `ai_chat_conversations` (`id`, `user_id`, `title`, `created_at`, `updated_at`, `is_archived`, `archived_at`) VALUES
('0e62fc01-6b62-4ffe-ba91-b16533a0cee0', 'ad828522-a32f-4512-9e17-bc5d65bee506', 'New Chat', '2025-08-26T18:53:45.960414+00:00', '2025-08-26T18:53:45.960414+00:00', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_messages`
--

CREATE TABLE `ai_chat_messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_chat_messages`
--

INSERT INTO `ai_chat_messages` (`id`, `conversation_id`, `role`, `content`, `created_at`, `updated_at`) VALUES
('61735cfc-4421-4396-b09f-0d10d2f00b81', '0e62fc01-6b62-4ffe-ba91-b16533a0cee0', 'system', 'Error: Function error: Edge Function returned a non-2xx status code', '2025-08-26T18:53:55.204239+00:00', '2025-08-26T18:53:55.204239+00:00'),
('d831ffa9-797f-4750-ad23-2e1d6e34ec93', '0e62fc01-6b62-4ffe-ba91-b16533a0cee0', 'system', 'Welcome to Better Ask Saul! Ask me anything about your leads, projects, or tasks and I\'ll help you find the information you need.', '2025-08-26T18:53:55.204239+00:00', '2025-08-26T18:53:55.204239+00:00'),
('ee657f55-e54d-4fde-b4e0-0a8e63663066', '0e62fc01-6b62-4ffe-ba91-b16533a0cee0', 'user', 'hi', '2025-08-26T18:53:55.204239+00:00', '2025-08-26T18:53:55.204239+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` varchar(36) NOT NULL,
  `action` text DEFAULT NULL,
  `table_name` text DEFAULT NULL,
  `record_id` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `created_by` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `action`, `table_name`, `record_id`, `details`, `created_at`, `created_by`) VALUES
('41', 'lead_converted', 'leads', 'd013eebd-562f-452b-90a2-c4ca331b2442', '{\"converted_at\":\"2025-08-06T23:50:46.741+00:00\",\"sales_disposition_id\":\"cf323b9c-997d-4d66-a5c8-3e392105571e\"}', '2025-08-06T23:50:46.911782+00:00', NULL),
('42', 'lead_converted', 'leads', 'ba0e647e-6da7-4b7a-a726-d8c0f276b672', '{\"converted_at\":\"2025-08-13T16:39:06.862+00:00\",\"sales_disposition_id\":\"47f200a4-4801-40c9-81eb-0890b2d714f9\"}', '2025-08-13T16:39:07.024754+00:00', NULL),
('43', 'lead_converted', 'leads', '702cfe5d-5aa9-400e-b6a7-878fd26e4509', '{\"converted_at\":\"2025-08-13T21:20:17.837+00:00\",\"sales_disposition_id\":\"26c39644-8053-4053-bfae-11ea46b3ce6f\"}', '2025-08-13T21:20:17.927413+00:00', NULL),
('44', 'lead_converted', 'leads', '3f95a000-76b9-4e67-93e7-212c759d00c8', '{\"converted_at\":\"2025-08-18T19:35:23.605+00:00\",\"sales_disposition_id\":\"c742f389-2a9c-44d9-9c2e-b74939d9ca15\"}', '2025-08-18T19:35:23.62784+00:00', NULL),
('45', 'lead_converted', 'leads', '52f9aadb-0460-4a8e-9a7f-e07b451d8f41', '{\"converted_at\":\"2025-08-18T20:07:12.908+00:00\",\"sales_disposition_id\":\"d676ab4f-eed3-4820-b5cb-86239c86daf0\"}', '2025-08-18T20:07:12.698339+00:00', NULL),
('46', 'lead_converted', 'leads', '6a8baab9-4f17-470e-9c07-ac8aada2dd88', '{\"converted_at\":\"2025-08-25T20:29:18.193+00:00\",\"sales_disposition_id\":\"05a82562-c573-422d-8a65-72ffe86d8a9d\"}', '2025-08-25T20:29:16.990904+00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `auth_audit_log`
--

CREATE TABLE `auth_audit_log` (
  `id` bigint(20) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` varchar(36) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_audit_log`
--

INSERT INTO `auth_audit_log` (`id`, `user_id`, `action`, `table_name`, `record_id`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(2, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:46:00.852Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:46:00'),
(3, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:46:09.723Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:46:09'),
(4, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:46:16.708Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:46:16'),
(5, '722d6008-7cec-43d3-8648-926a14f765c9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T16:46:16.764Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:46:16'),
(6, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:52:44.949Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:52:44'),
(7, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:52:51.967Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:52:51'),
(8, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:53:24.125Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:53:24'),
(9, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T16:53:32.761Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 16:53:32'),
(10, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:18:15.585Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 17:18:15'),
(11, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:21:01.150Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 17:21:01'),
(12, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:21:22.137Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 17:21:22'),
(13, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:21:51.325Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 17:21:51'),
(14, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:22:58.526Z\"}', '::1', 'node-fetch', '2025-08-28 17:22:58'),
(15, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:26:02.793Z\"}', '::1', 'node-fetch', '2025-08-28 17:26:02'),
(16, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:27:56.868Z\"}', '::1', 'node-fetch', '2025-08-28 17:27:56'),
(17, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T17:30:08.657Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:30:08'),
(18, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T17:30:15.592Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:30:15'),
(19, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T17:30:27.016Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:30:27'),
(20, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:30:42.569Z\"}', '::1', 'node-fetch', '2025-08-28 17:30:42'),
(21, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:31:01.739Z\"}', '::1', 'node-fetch', '2025-08-28 17:31:01'),
(22, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:32:29.408Z\"}', '::1', 'node-fetch', '2025-08-28 17:32:29'),
(23, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:32:36.936Z\"}', '::1', 'node-fetch', '2025-08-28 17:32:36'),
(24, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T17:34:28.758Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:34:28'),
(25, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T17:34:39.155Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:34:39'),
(26, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:38:02.870Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:38:02'),
(27, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:54:12.932Z\"}', '::1', 'node-fetch', '2025-08-28 17:54:12'),
(28, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:54:38.324Z\"}', '::1', 'node-fetch', '2025-08-28 17:54:38'),
(29, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:55:03.280Z\"}', '::1', 'node-fetch', '2025-08-28 17:55:03'),
(30, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:55:32.438Z\"}', '::1', 'node-fetch', '2025-08-28 17:55:32'),
(31, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:57:10.468Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 17:57:10'),
(32, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T17:59:45.282Z\"}', '::1', 'node-fetch', '2025-08-28 17:59:45'),
(33, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:00:37.361Z\"}', '::1', 'node-fetch', '2025-08-28 18:00:37'),
(34, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:01:46.002Z\"}', '::1', 'node-fetch', '2025-08-28 18:01:46'),
(35, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:02:17.103Z\"}', '::1', 'node-fetch', '2025-08-28 18:02:17'),
(36, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:04:18.458Z\"}', '::1', 'node-fetch', '2025-08-28 18:04:18'),
(37, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:08:15.941Z\"}', '::1', 'node-fetch', '2025-08-28 18:08:15'),
(38, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:14:53.329Z\"}', '::1', 'node-fetch', '2025-08-28 18:14:53'),
(39, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T18:27:58.732Z\"}', '::1', 'node-fetch', '2025-08-28 18:27:58'),
(40, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T18:30:49.224Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 18:30:49'),
(41, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:31:40.370Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 18:31:40'),
(42, '722d6008-7cec-43d3-8648-926a14f765c9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T18:31:45.407Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 18:31:45'),
(43, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:31:47.836Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 18:31:47'),
(44, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:31:49.131Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 18:31:49'),
(45, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:31:53.028Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 18:31:53'),
(46, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:32:00.084Z\"}', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.19041.6216', '2025-08-28 18:32:00'),
(47, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T18:48:51.566Z\"}', '::1', 'node-fetch', '2025-08-28 18:48:51'),
(48, '722d6008-7cec-43d3-8648-926a14f765c9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T19:05:51.491Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 19:05:51'),
(49, '767f0551-06aa-40b1-9113-b710250165c1', 'login_success', NULL, NULL, '{\"email\":\"ali@logicworks.ai\",\"success\":true,\"timestamp\":\"2025-08-28T19:06:07.419Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 19:06:07'),
(50, NULL, 'login_failed', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T20:31:36.929Z\"}', '::1', 'node-fetch', '2025-08-28 20:31:36'),
(51, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:33:20.681Z\"}', '::1', 'node-fetch', '2025-08-28 20:33:20'),
(52, '767f0551-06aa-40b1-9113-b710250165c1', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T20:34:43.478Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:34:43'),
(53, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:35:14.248Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:35:14'),
(54, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T20:36:24.938Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:36:24'),
(55, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:36:35.374Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:36:35'),
(56, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T20:36:39.926Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:36:39'),
(57, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:36:47.455Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:36:47'),
(58, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-28T20:37:40.843Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:37:40'),
(59, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-28T20:37:53.067Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:37:53'),
(60, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:37:59.068Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 20:37:59'),
(61, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:42:04.963Z\"}', '::1', 'node-fetch', '2025-08-28 20:42:04'),
(62, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:44:50.003Z\"}', '::1', 'node-fetch', '2025-08-28 20:44:50'),
(63, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:48:13.685Z\"}', '::1', 'node-fetch', '2025-08-28 20:48:13'),
(64, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:48:42.427Z\"}', '::1', 'node-fetch', '2025-08-28 20:48:42'),
(65, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T20:51:58.945Z\"}', '::1', 'node-fetch', '2025-08-28 20:51:58'),
(66, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T21:03:34.088Z\"}', '::1', 'node-fetch', '2025-08-28 21:03:34'),
(67, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T21:05:29.492Z\"}', '::1', 'node-fetch', '2025-08-28 21:05:29'),
(68, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-28T21:40:32.613Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 21:40:32'),
(69, NULL, 'login_failed', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-29T16:19:22.251Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 16:19:22'),
(70, NULL, 'login_failed', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-29T16:19:26.947Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 16:19:26'),
(71, NULL, 'login_failed', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-29T16:22:47.980Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 16:22:47'),
(72, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T16:22:53.226Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 16:22:53'),
(73, '722d6008-7cec-43d3-8648-926a14f765c9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-29T19:14:29.010Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 19:14:29'),
(74, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-29T19:14:33.978Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 19:14:33'),
(75, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-29T19:14:44.287Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 19:14:44'),
(76, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T19:14:58.732Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 19:14:58'),
(77, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T21:40:11.685Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 21:40:11'),
(78, NULL, 'login_failed', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":false,\"timestamp\":\"2025-08-29T22:11:26.201Z\"}', '::1', 'node-fetch', '2025-08-29 22:11:26'),
(79, '722d6008-7cec-43d3-8648-926a14f765c9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-08-29T22:12:04.880Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 22:12:04'),
(80, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:12:07.983Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 22:12:07'),
(81, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:12:49.407Z\"}', '::1', 'node-fetch', '2025-08-29 22:12:49'),
(82, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:13:11.638Z\"}', '::1', 'node-fetch', '2025-08-29 22:13:11'),
(83, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:13:36.147Z\"}', '::1', 'node-fetch', '2025-08-29 22:13:36'),
(84, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:14:14.831Z\"}', '::1', 'node-fetch', '2025-08-29 22:14:14'),
(85, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:14:53.195Z\"}', '::1', 'node-fetch', '2025-08-29 22:14:53'),
(86, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:15:36.282Z\"}', '::1', 'node-fetch', '2025-08-29 22:15:36'),
(87, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:18:35.140Z\"}', '::1', 'node-fetch', '2025-08-29 22:18:35'),
(88, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:19:15.466Z\"}', '::1', 'node-fetch', '2025-08-29 22:19:15'),
(89, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-08-29T22:24:22.982Z\"}', '::1', 'node-fetch', '2025-08-29 22:24:22'),
(90, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:22:02.194Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 16:22:02'),
(91, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:22:38.578Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 16:22:38'),
(92, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:22:52.037Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 16:22:52'),
(93, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:32:46.195Z\"}', '::1', 'node-fetch', '2025-09-01 16:32:46'),
(94, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:33:34.157Z\"}', '::1', 'node-fetch', '2025-09-01 16:33:34'),
(95, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:35:04.696Z\"}', '::1', 'node-fetch', '2025-09-01 16:35:04'),
(96, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:37:21.001Z\"}', '::1', 'node-fetch', '2025-09-01 16:37:21'),
(97, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:44:31.143Z\"}', '::1', 'node-fetch', '2025-09-01 16:44:31'),
(98, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:44:50.044Z\"}', '::1', 'node-fetch', '2025-09-01 16:44:50'),
(99, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:45:17.711Z\"}', '::1', 'node-fetch', '2025-09-01 16:45:17'),
(100, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:46:21.595Z\"}', '::1', 'node-fetch', '2025-09-01 16:46:21'),
(101, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:53:01.789Z\"}', '::1', 'node-fetch', '2025-09-01 16:53:01'),
(102, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:53:55.051Z\"}', '::1', 'node-fetch', '2025-09-01 16:53:55'),
(103, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:58:30.299Z\"}', '::1', 'node-fetch', '2025-09-01 16:58:30'),
(104, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T16:59:26.608Z\"}', '::1', 'node-fetch', '2025-09-01 16:59:26'),
(105, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:07:33.850Z\"}', '::1', 'node-fetch', '2025-09-01 17:07:33'),
(106, NULL, 'login_failed', NULL, NULL, '{\"email\":\"ali@logicworks.ai\",\"success\":false,\"timestamp\":\"2025-09-01T17:09:55.370Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 17:09:55'),
(107, NULL, 'login_failed', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":false,\"timestamp\":\"2025-09-01T17:09:59.262Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 17:09:59'),
(108, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:10:12.257Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 17:10:12'),
(109, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:10:50.813Z\"}', '::1', 'node-fetch', '2025-09-01 17:10:50'),
(110, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:11:07.707Z\"}', '::1', 'node-fetch', '2025-09-01 17:11:07'),
(111, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:11:25.792Z\"}', '::1', 'node-fetch', '2025-09-01 17:11:25'),
(112, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:13:08.392Z\"}', '::1', 'node-fetch', '2025-09-01 17:13:08'),
(113, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:13:30.644Z\"}', '::1', 'node-fetch', '2025-09-01 17:13:30'),
(114, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:13:56.367Z\"}', '::1', 'node-fetch', '2025-09-01 17:13:56'),
(115, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:15:06.867Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 17:15:06'),
(116, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:17:25.707Z\"}', '::1', 'node-fetch', '2025-09-01 17:17:25'),
(117, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:17:57.417Z\"}', '::1', 'node-fetch', '2025-09-01 17:17:57'),
(118, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:25:44.368Z\"}', '::1', 'node-fetch', '2025-09-01 17:25:44'),
(119, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:32:07.143Z\"}', '::1', 'node-fetch', '2025-09-01 17:32:07'),
(120, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:35:48.042Z\"}', '::1', 'node-fetch', '2025-09-01 17:35:48'),
(121, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:35:56.852Z\"}', '::1', 'node-fetch', '2025-09-01 17:35:56'),
(122, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:36:10.271Z\"}', '::1', 'node-fetch', '2025-09-01 17:36:10'),
(123, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:37:08.952Z\"}', '::1', 'node-fetch', '2025-09-01 17:37:08'),
(124, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T17:39:17.776Z\"}', '::1', 'node-fetch', '2025-09-01 17:39:17'),
(125, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:15:59.935Z\"}', '::1', 'node-fetch', '2025-09-01 18:15:59'),
(126, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:16:40.658Z\"}', '::1', 'node-fetch', '2025-09-01 18:16:40'),
(127, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:18:08.508Z\"}', '::1', 'node-fetch', '2025-09-01 18:18:08'),
(128, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:23:36.674Z\"}', '::1', 'node-fetch', '2025-09-01 18:23:36'),
(129, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:24:11.848Z\"}', '::1', 'node-fetch', '2025-09-01 18:24:11'),
(130, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:30:19.082Z\"}', '::1', 'node-fetch', '2025-09-01 18:30:19'),
(131, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:31:09.581Z\"}', '::1', 'node-fetch', '2025-09-01 18:31:09'),
(132, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:38:33.406Z\"}', '::1', 'node-fetch', '2025-09-01 18:38:33'),
(133, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:50:39.301Z\"}', '::1', 'node-fetch', '2025-09-01 18:50:39'),
(134, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:51:08.136Z\"}', '::1', 'node-fetch', '2025-09-01 18:51:08'),
(135, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T18:51:28.680Z\"}', '::1', 'node-fetch', '2025-09-01 18:51:28'),
(136, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T19:11:22.651Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 19:11:22'),
(137, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:06:59.943Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 22:06:59'),
(138, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:16:32.547Z\"}', '::1', 'node-fetch', '2025-09-01 22:16:32'),
(139, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:16:32.691Z\"}', '::1', 'node-fetch', '2025-09-01 22:16:32'),
(140, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:16:54.332Z\"}', '::1', 'node-fetch', '2025-09-01 22:16:54'),
(141, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:16:54.521Z\"}', '::1', 'node-fetch', '2025-09-01 22:16:54'),
(142, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:23:12.676Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-01 22:23:12'),
(143, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:28:48.235Z\"}', '::1', 'node-fetch', '2025-09-01 22:28:48'),
(144, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:28:48.397Z\"}', '::1', 'node-fetch', '2025-09-01 22:28:48'),
(145, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:28:57.171Z\"}', '::1', 'node-fetch', '2025-09-01 22:28:57'),
(146, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:28:57.318Z\"}', '::1', 'node-fetch', '2025-09-01 22:28:57'),
(147, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:32:17.475Z\"}', '::1', 'node-fetch', '2025-09-01 22:32:17'),
(148, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:32:35.083Z\"}', '::1', 'node-fetch', '2025-09-01 22:32:35'),
(149, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:34:40.865Z\"}', '::1', 'node-fetch', '2025-09-01 22:34:40'),
(150, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:35:16.839Z\"}', '::1', 'node-fetch', '2025-09-01 22:35:16'),
(151, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:36:39.456Z\"}', '::1', 'node-fetch', '2025-09-01 22:36:39'),
(152, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:37:20.131Z\"}', '::1', 'node-fetch', '2025-09-01 22:37:20'),
(153, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:38:30.501Z\"}', '::1', 'node-fetch', '2025-09-01 22:38:30'),
(154, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:45:04.731Z\"}', '::1', 'node-fetch', '2025-09-01 22:45:04'),
(155, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:45:46.892Z\"}', '::1', 'node-fetch', '2025-09-01 22:45:46'),
(156, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:49:29.400Z\"}', '::1', 'node-fetch', '2025-09-01 22:49:29'),
(157, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T22:52:06.851Z\"}', '::1', 'node-fetch', '2025-09-01 22:52:06'),
(158, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-01T23:04:17.999Z\"}', '::1', 'node-fetch', '2025-09-01 23:04:18'),
(159, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-03T22:41:41.074Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-03 22:41:41'),
(160, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-03T22:48:54.807Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-03 22:48:54'),
(161, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-03T22:49:02.021Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-03 22:49:02'),
(162, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T17:36:41.921Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 17:36:41'),
(163, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T17:37:23.838Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 17:37:23'),
(164, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T17:37:31.577Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 17:37:31'),
(165, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T17:37:37.606Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 17:37:37'),
(166, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T17:56:12.866Z\"}', '::1', 'node-fetch', '2025-09-05 17:56:12'),
(167, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T17:58:35.508Z\"}', '::1', 'node-fetch', '2025-09-05 17:58:35'),
(168, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:04:04.168Z\"}', '::1', 'node-fetch', '2025-09-05 18:04:04'),
(169, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:04:30.313Z\"}', '::1', 'node-fetch', '2025-09-05 18:04:30'),
(170, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:04:56.560Z\"}', '::1', 'node-fetch', '2025-09-05 18:04:56'),
(171, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:08:15.359Z\"}', '::1', 'node-fetch', '2025-09-05 18:08:15'),
(172, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:12:59.546Z\"}', '::1', 'node-fetch', '2025-09-05 18:12:59'),
(173, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:17:43.532Z\"}', '::1', 'node-fetch', '2025-09-05 18:17:43'),
(174, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:29:54.127Z\"}', '::1', 'node-fetch', '2025-09-05 18:29:54'),
(175, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:30:20.841Z\"}', '::1', 'node-fetch', '2025-09-05 18:30:20'),
(176, 'a1791be0-b633-41bf-adce-fe1a1390b640', 'login_success', NULL, NULL, '{\"email\":\"aghawasif.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:31:58.588Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 18:31:58'),
(177, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:33:24.222Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 18:33:24'),
(178, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:35:05.786Z\"}', '::1', 'node-fetch', '2025-09-05 18:35:05'),
(179, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:38:29.702Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 18:38:29'),
(180, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-09-05T18:38:54.856Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 18:38:54'),
(181, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:38:58.055Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 18:38:58'),
(182, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:43:25.430Z\"}', '::1', 'node-fetch', '2025-09-05 18:43:25'),
(183, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:44:29.763Z\"}', '::1', 'node-fetch', '2025-09-05 18:44:29'),
(184, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:46:29.444Z\"}', '::1', 'node-fetch', '2025-09-05 18:46:29'),
(185, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:47:19.186Z\"}', '::1', 'node-fetch', '2025-09-05 18:47:19'),
(186, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:51:34.952Z\"}', '::1', 'node-fetch', '2025-09-05 18:51:34'),
(187, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T18:57:48.085Z\"}', '::1', 'node-fetch', '2025-09-05 18:57:48'),
(188, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T19:03:38.277Z\"}', '::1', 'node-fetch', '2025-09-05 19:03:38'),
(189, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T19:30:19.973Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 19:30:19'),
(190, '722d6008-7cec-43d3-8648-926a14f765c9', 'login_success', NULL, NULL, '{\"email\":\"admin@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T19:30:29.002Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 19:30:29'),
(191, '722d6008-7cec-43d3-8648-926a14f765c9', 'logout', NULL, NULL, '{\"timestamp\":\"2025-09-05T19:30:31.869Z\",\"token_revoked\":true}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 19:30:31'),
(192, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'login_success', NULL, NULL, '{\"email\":\"adamzainnasir.fro@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T19:30:51.955Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 19:30:51'),
(193, '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'login_success', NULL, NULL, '{\"email\":\"muhammadalisheikh.ups@logicworks.com\",\"success\":true,\"timestamp\":\"2025-09-05T22:09:48.221Z\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-05 22:09:48');

-- --------------------------------------------------------

--
-- Table structure for table `auth_password_reset_tokens`
--

CREATE TABLE `auth_password_reset_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_users`
--

CREATE TABLE `auth_users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `email_confirmed_at` timestamp NULL DEFAULT NULL,
  `last_sign_in_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_users`
--

INSERT INTO `auth_users` (`id`, `email`, `password_hash`, `display_name`, `is_admin`, `is_active`, `email_confirmed_at`, `last_sign_in_at`, `created_at`, `updated_at`) VALUES
('307b981c-46bb-4c23-8eca-aa5a065a7fca', 'muhammadalisheikh.ups@logicworks.com', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'Muhammad Ali Sheikh', 0, 1, '2025-08-11 14:43:46', '2025-09-05 22:09:48', '2025-08-11 14:43:46', '2025-09-05 22:09:48'),
('32ecaf78-c507-4140-bb07-a0cf57f6c813', 'adnanshafaqat.fro@logicworks.com', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'Adnan Shafaqat', 0, 1, '2025-07-31 11:41:12', NULL, '2025-07-31 11:41:12', '2025-08-28 20:33:07'),
('52e63558-b2ae-4661-97c7-47ca56a1cf7b', 'inactive_1753920693888@inactive.com', '$2b$10$default.hash.for.supabase.user', NULL, 0, 1, NULL, NULL, '2025-07-28 16:28:12', '2025-08-28 17:43:02'),
('722d6008-7cec-43d3-8648-926a14f765c9', 'admin@logicworks.com', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'CRM Admin', 1, 1, '2025-07-30 17:21:07', '2025-09-05 19:30:28', '2025-07-30 17:21:07', '2025-09-05 19:30:28'),
('767f0551-06aa-40b1-9113-b710250165c1', 'ali@logicworks.ai', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'ali@logicworks.ai', 0, 1, '2025-07-30 17:51:22', '2025-08-28 19:06:07', '2025-07-30 17:51:22', '2025-08-28 20:33:07'),
('a1791be0-b633-41bf-adce-fe1a1390b640', 'aghawasif.ups@logicworks.com', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'Agha Wasif ', 0, 1, '2025-08-15 12:19:05', '2025-09-05 18:31:58', '2025-08-15 12:19:05', '2025-09-05 18:31:58'),
('c056b5e5-874a-4f0c-a3ed-9d4565728451', 'adam@americandigitalagency.us', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'adam@americandigitalagency.us', 0, 1, '2025-07-30 17:51:22', NULL, '2025-07-30 17:51:22', '2025-08-28 20:33:07'),
('f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'adamzainnasir.fro@logicworks.com', '$2b$10$pl4/09lWNCJjZZc815TxSOeUN0lVz/BElcYgJzBL2OhbcYqTVzrVm', 'Adam Zain Nasir', 0, 1, '2025-07-31 12:11:38', '2025-09-05 19:30:51', '2025-07-31 12:11:38', '2025-09-05 19:30:51'),
('fd5e837a-c05e-44da-beaf-824b5b26a8b8', 'deleted_1753981643943@deleted.com', '$2b$10$default.hash.for.supabase.user', NULL, 0, 1, NULL, NULL, '2025-07-31 11:14:26', '2025-08-28 17:43:02');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_sessions`
--

CREATE TABLE `auth_user_sessions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `is_revoked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_user_sessions`
--

INSERT INTO `auth_user_sessions` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`, `last_used_at`, `user_agent`, `ip_address`, `is_revoked`) VALUES
('146592d9-844f-11f0-a2e9-3448ed0ea1e2', 'a1791be0-b633-41bf-adce-fe1a1390b640', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImExNzkxYmUwLWI2MzMtNDFiZi1hZGNlLWZlMWExMzkwYjY0MCIsImVtYWlsIjoiYWdoYXdhc2lmLnVwc0Bsb2dpY3dvcmtzLmNvbSIsImRpc3BsYXlfbmFtZSI6IkFnaGEgV2FzaWYgIiwiaXNfYWRtaW4iOjAsImlhdCI6MTc1NjQxMzMxNCwiZXhwIjoxNzU2NDk5NzE0fQ.XlM', '2025-08-29 20:36:24', '2025-08-28 20:36:24', '2025-08-28 20:36:24', NULL, NULL, 1),
('1d55e20c-844f-11f0-a2e9-3448ed0ea1e2', '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMwN2I5ODFjLTQ2YmItNGMyMy04ZWNhLWFhNWEwNjVhN2ZjYSIsImVtYWlsIjoibXVoYW1tYWRhbGlzaGVpa2gudXBzQGxvZ2ljd29ya3MuY29tIiwiZGlzcGxheV9uYW1lIjoiTXVoYW1tYWQgQWxpIFNoZWlraCIsImlzX2FkbWluIjowLCJpYXQiOjE3NTY0MTMzOTUsImV4cC', '2025-08-29 20:36:39', '2025-08-28 20:36:39', '2025-08-28 20:36:39', NULL, NULL, 1),
('2ad3317d-8a88-11f0-a2e9-3448ed0ea1e2', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYzZWZkMDEyLTVlNGItNGVhNC05MTdhLWE5ZGViM2EyNzJhOSIsImVtYWlsIjoiYWRhbXphaW5uYXNpci5mcm9AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJBZGFtIFphaW4gTmFzaXIiLCJpc19hZG1pbiI6MCwiaWF0IjoxNzU3MDk3NTA5LCJleHAiOjE3NTcxOD', '2025-09-06 18:38:54', '2025-09-05 18:38:54', '2025-09-05 18:38:54', NULL, NULL, 1),
('41a52aa8-844f-11f0-a2e9-3448ed0ea1e2', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYzZWZkMDEyLTVlNGItNGVhNC05MTdhLWE5ZGViM2EyNzJhOSIsImVtYWlsIjoiYWRhbXphaW5uYXNpci5mcm9AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJBZGFtIFphaW4gTmFzaXIiLCJpc19hZG1pbiI6MCwiaWF0IjoxNzU2NDEzNDA3LCJleHAiOjE3NTY0OT', '2025-08-29 20:37:40', '2025-08-28 20:37:40', '2025-08-28 20:37:40', NULL, NULL, 1),
('60ca20bf-8a8f-11f0-a2e9-3448ed0ea1e2', '722d6008-7cec-43d3-8648-926a14f765c9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyMmQ2MDA4LTdjZWMtNDNkMy04NjQ4LTkyNmExNGY3NjVjOSIsImVtYWlsIjoiYWRtaW5AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJDUk0gQWRtaW4iLCJpc19hZG1pbiI6MSwiaWF0IjoxNzU3MTAwNjE5LCJleHAiOjE3NTcxODcwMTl9.D8RoGLxA5Yb6rFGaz', '2025-09-06 19:30:31', '2025-09-05 19:30:31', '2025-09-05 19:30:31', NULL, NULL, 1),
('6dc7722c-8442-11f0-a2e9-3448ed0ea1e2', '722d6008-7cec-43d3-8648-926a14f765c9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyMmQ2MDA4LTdjZWMtNDNkMy04NjQ4LTkyNmExNGY3NjVjOSIsImVtYWlsIjoiYWRtaW5AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJDUk0gQWRtaW4iLCJpc19hZG1pbiI6MSwiaWF0IjoxNzU2NDA1OTA5LCJleHAiOjE3NTY0OTIzMDl9.IhQ1VfKOeuQk-u6Or', '2025-08-29 19:05:51', '2025-08-28 19:05:51', '2025-08-28 19:05:51', NULL, NULL, 1),
('a0da76c4-8525-11f0-a2e9-3448ed0ea1e2', '722d6008-7cec-43d3-8648-926a14f765c9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyMmQ2MDA4LTdjZWMtNDNkMy04NjQ4LTkyNmExNGY3NjVjOSIsImVtYWlsIjoiYWRtaW5AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJDUk0gQWRtaW4iLCJpc19hZG1pbiI6MSwiaWF0IjoxNzU2NTAzNjExLCJleHAiOjE3NTY1OTAwMTF9.K7iRtyBKf8nGUKREc', '2025-08-30 22:12:04', '2025-08-29 22:12:04', '2025-08-29 22:12:04', NULL, NULL, 1),
('aa38b757-843d-11f0-a2e9-3448ed0ea1e2', '722d6008-7cec-43d3-8648-926a14f765c9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyMmQ2MDA4LTdjZWMtNDNkMy04NjQ4LTkyNmExNGY3NjVjOSIsImVtYWlsIjoiYWRtaW5AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJDUk0gQWRtaW4iLCJpc19hZG1pbiI6MSwiaWF0IjoxNzU2NDAzODMwLCJleHAiOjE3NTY0OTAyMzB9.R4mXxqWhHTIoIwnTY', '2025-08-29 18:31:45', '2025-08-28 18:31:45', '2025-08-28 18:31:45', NULL, NULL, 1),
('d16d1c71-850c-11f0-a2e9-3448ed0ea1e2', '722d6008-7cec-43d3-8648-926a14f765c9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyMmQ2MDA4LTdjZWMtNDNkMy04NjQ4LTkyNmExNGY3NjVjOSIsImVtYWlsIjoiYWRtaW5AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJDUk0gQWRtaW4iLCJpc19hZG1pbiI6MSwiaWF0IjoxNzU2NDEzNDc5LCJleHAiOjE3NTY0OTk4Nzl9.SyVyaa43olGRj5Qrb', '2025-08-30 19:14:29', '2025-08-29 19:14:29', '2025-08-29 19:14:29', NULL, NULL, 1),
('d7ed7ed7-844e-11f0-a2e9-3448ed0ea1e2', '767f0551-06aa-40b1-9113-b710250165c1', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2N2YwNTUxLTA2YWEtNDBiMS05MTEzLWI3MTAyNTAxNjVjMSIsImVtYWlsIjoiYWxpQGxvZ2ljd29ya3MuYWkiLCJkaXNwbGF5X25hbWUiOiJhbGlAbG9naWN3b3Jrcy5haSIsImlzX2FkbWluIjowLCJpYXQiOjE3NTY0MDc5NjcsImV4cCI6MTc1NjQ5NDM2N30.cnyzfEC96S', '2025-08-29 20:34:43', '2025-08-28 20:34:43', '2025-08-28 20:34:43', NULL, NULL, 1),
('ee0ee23d-842e-11f0-a2e9-3448ed0ea1e2', '722d6008-7cec-43d3-8648-926a14f765c9', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyMmQ2MDA4LTdjZWMtNDNkMy04NjQ4LTkyNmExNGY3NjVjOSIsImVtYWlsIjoiYWRtaW5AbG9naWN3b3Jrcy5jb20iLCJkaXNwbGF5X25hbWUiOiJDUk0gQWRtaW4iLCJpc19hZG1pbiI6MCwiaWF0IjoxNzU2Mzk5NTc2LCJleHAiOjE3NTY0ODU5NzZ9.5twwRKi-0LpU3wO70', '2025-08-29 16:46:16', '2025-08-28 16:46:16', '2025-08-28 16:46:16', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` varchar(36) NOT NULL,
  `user_id` text DEFAULT NULL,
  `title` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `start_date` text DEFAULT NULL,
  `end_date` text DEFAULT NULL,
  `all_day` tinyint(1) DEFAULT NULL,
  `type` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `priority` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `color` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `user_id`, `title`, `description`, `start_date`, `end_date`, `all_day`, `type`, `status`, `priority`, `location`, `color`, `created_at`, `updated_at`) VALUES
('3c60b2f6-f815-44d2-ae1c-d1327b003067', '78294d98-4280-40c1-bb6d-b85b7203b370', 'Call at 6pm', 'Call with Andrew at 6pm', '2025-08-05T20:37:22.097+00:00', '2025-08-05T20:37:22.097+00:00', 0, 'meeting', 'pending', 'low', '', '#3b82f6', '2025-08-05T20:37:57.396955+00:00', '2025-08-05T20:37:57.396955+00:00'),
('97033e02-6d1e-4827-aac1-4a3a4089a06c', '78294d98-4280-40c1-bb6d-b85b7203b370', 'Meeting at 4th floor', 'Business development meeting with Seo team at 4th floor', '2025-08-06T19:00:00+00:00', '2025-08-06T19:00:00+00:00', 0, 'meeting', 'pending', 'high', '', '#3b82f6', '2025-08-05T20:41:37.786751+00:00', '2025-08-05T20:41:37.786751+00:00'),
('cddd103f-152f-4b70-8ff4-a6b027d7dd9b', '8c9c203b-28ca-4af0-a381-0f809e791155', 'Meeting', 'Call with Samantha at 8pm', '2025-08-05T20:36:25.967+00:00', '2025-08-05T20:36:25.967+00:00', 0, 'reminder', 'pending', 'high', '', '#3b82f6', '2025-08-05T20:36:47.793899+00:00', '2025-08-05T20:36:47.793899+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` varchar(36) NOT NULL,
  `content` text DEFAULT NULL,
  `sender_id` varchar(36) DEFAULT NULL,
  `conversation_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` varchar(36) NOT NULL,
  `workspace_id` text DEFAULT NULL,
  `name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` text DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT NULL,
  `created_by` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL,
  `last_message_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `workspace_id`, `name`, `description`, `type`, `is_private`, `is_archived`, `created_by`, `created_at`, `updated_at`, `last_message_at`) VALUES
('5aa9da4a-4499-4be7-90eb-063229f4db0b', '00000000-0000-0000-0000-000000000000', 'Direct Message with Adnan Shafaqat', NULL, 'direct', 0, 0, '78294d98-4280-40c1-bb6d-b85b7203b370', '2025-08-06T00:53:12.239145+00:00', '2025-08-06T00:53:12.239145+00:00', '2025-08-06T00:53:12.239145+00:00'),
('8c6e25fb-a92e-4850-92b6-bb9cbc8d7d62', '00000000-0000-0000-0000-000000000000', 'Direct Message with Adam Zain Nasir', NULL, 'direct', 0, 0, 'ad828522-a32f-4512-9e17-bc5d65bee506', '2025-08-11T19:46:01.816796+00:00', '2025-08-11T19:46:01.816796+00:00', '2025-08-11T19:46:01.816796+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT NULL,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_files`
--

CREATE TABLE `customer_files` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_name` text DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_notes`
--

CREATE TABLE `customer_notes` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `note_text` text DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_tags`
--

CREATE TABLE `customer_tags` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `tag` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_tasks`
--

CREATE TABLE `customer_tasks` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL,
  `department` text NOT NULL,
  `email` text NOT NULL,
  `performance` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `full_name` text DEFAULT NULL,
  `father_name` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` text DEFAULT NULL,
  `marital_status` text DEFAULT NULL,
  `cnic_number` text DEFAULT NULL,
  `current_residential_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `contact_number` text DEFAULT NULL,
  `personal_email_address` text DEFAULT NULL,
  `total_dependents_covered` int(11) DEFAULT NULL,
  `job_title` text DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `reporting_manager` text DEFAULT NULL,
  `work_module` text DEFAULT NULL,
  `work_hours` text DEFAULT NULL,
  `bank_name` text DEFAULT NULL,
  `account_holder_name` text DEFAULT NULL,
  `account_number` text DEFAULT NULL,
  `iban_number` text DEFAULT NULL,
  `user_management_email` text DEFAULT NULL,
  `personal_email` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `department`, `email`, `performance`, `created_at`, `updated_at`, `full_name`, `father_name`, `date_of_birth`, `gender`, `marital_status`, `cnic_number`, `current_residential_address`, `permanent_address`, `contact_number`, `personal_email_address`, `total_dependents_covered`, `job_title`, `date_of_joining`, `reporting_manager`, `work_module`, `work_hours`, `bank_name`, `account_holder_name`, `account_number`, `iban_number`, `user_management_email`, `personal_email`) VALUES
('049d524d-d108-4458-8671-386b53934010', 'Production', 'asjadmmc67@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:41', '2025-08-18 14:59:42', 'Muhammad Asjad', 'Ashfaque Akhtar', '1997-01-02', 'Male', 'Married', '37405-4161529-5', 'Manzoor colony near city hospital', 'Manzoor colony near city hospital', '03070138065', 'asjadmmc67@gmail.com', NULL, 'Sr.Laravel Developer', '2024-11-15', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Allied Bank', 'Muhammad Asjad', '11630010107443840014', 'null', NULL, 'asjadmmc67@gmail.com'),
('0bb1cbad-0ffd-4de1-8cb9-aa30d0035bd0', 'Production', 'arsalanahmeddev1@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:12', '2025-08-18 14:59:42', 'Arsalan Ahmed', 'Abdul Shakoor', '1998-08-01', 'Male', 'Single', '4230148230657', 'Street No#09 nizamani building moosalane karachi', 'Street No#09 nizamani building moosalane karachi', '03172794252', 'arsalanahmeddev1@gmail.com', NULL, 'Frontend React Developer', '2025-04-03', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Arsalan Ahmed', 'Nill', 'Nill', NULL, 'arsalanahmeddev1@gmail.com'),
('0eba0589-0e65-4b3a-8f3f-6aee0f143732', 'Production', 'bilalzafar.cs@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:12', '2025-08-18 14:59:42', 'Bilal Zafar', 'Zafar Iqbal', '1995-07-13', 'Male', 'Married', '4220113961525', 'House D/318, street 9, bhitai colony korangi crossing', 'House D/318, street 9, bhitai colony korangi crossing', '03077152425', 'bilalzafar.cs@gmail.com', NULL, 'Senior Wordpress Developer', '2025-04-07', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Muhammad Bilal Zafar', '99380109413701', 'PK31MEZN0099380109413701', NULL, 'bilalzafar.cs@gmail.com'),
('14bbdef9-cd60-4ca9-8af4-b2b45ab2d1ed', 'Other', 'bmehmoodk@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:57', '2025-08-18 14:59:42', 'Bilal Mehmood Khan Sultan', 'Mehmood Khan Sultan', '1988-04-25', 'Male', 'Married', '4210151998869', 'House R86, Sector 11-C/1, North Karachi, Karachi', 'House R86, Sector 11-C/1, North Karachi, Karachi', '03322336449', 'bmehmoodk@gmail.com', NULL, 'VP recurring', '2025-02-24', 'Salman Waria', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Bilal Mehmood Khan', '01170102407341', 'IBAN # PK56MEZN0001170102407341', NULL, 'bmehmoodk@gmail.com'),
('14d4edad-a775-4708-99a5-ce3241faef66', 'Front Sales', 'adnanshafaqat9@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:01', '2025-08-18 14:59:42', 'Adnan Shafaqat', 'Chaudhary Shafaqat Ali', '1988-11-02', 'Male', 'Married', '4250144731913', 'House # 51/2 Sheet 24 Near Rana Lawn Model Colony Karachi', 'House 100 Humaira Town Model Colony Karachi', '03120074615', 'adnanshafaqat9@gmail.com', NULL, 'Sr. Sales Executive ', '2024-08-01', 'Adam Zain', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan Bank', 'Adnan Shafaqat', '01830101971121', 'PK44MEZN0001830101971121', 'adnanshafaqat.fro@logicworks.com', NULL),
('157adb76-f383-4f4d-935f-0bd7369809e5', 'Production', 'fameboy2002@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:52', '2025-08-18 14:59:42', 'Hamza Amjad', 'Amjad Majeed', '2002-12-21', 'Male', 'Single', '42201-7469785-7', 'gulistan-e-johar, munawwar chowrangi, block11, house no# A4', 'gulistan-e-johar, munawwar chowrangi, block11, house no# A4', '03265876085', 'fameboy2002@gmail.com', NULL, 'Graphic Designer (intern)', '2025-03-05', 'Kamran butt', 'On-Site', '8:00 PM to 5:00 AM', 'N/A', 'N/A', 'N/A', 'N/A', NULL, 'fameboy2002@gmail.com'),
('2335cf9e-a970-475a-af34-bf59ca680288', 'Production', 'syedaliraza0223@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:18', '2025-08-18 14:59:42', 'Ali Raza', 'Javed Ali', '2004-06-17', 'Male', 'Single', '42604-0417428-7', 'House R/77 Sector 32/A Korangi Karachi', 'House R/77 Sector 32/A Korangi Karachi', '03182705523', 'syedaliraza0223@gmail.com', NULL, 'Frontend WordPress Developer', '2025-04-08', 'Haris', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan bank', 'Ali Raza', '99010108438772', 'PK93 MEZN 0099 0101 0843 8772', NULL, 'syedaliraza0223@gmail.com'),
('278b0b7a-f617-4b7b-be03-443b8bf47a94', 'Upseller', 'tamkeenhanif@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:20', '2025-08-18 14:59:42', 'Tamkeen ', 'Muhammad Hanif ', '1998-07-10', 'Female', 'Single, Widowed', '3520069357514', 'B-12, Cantt Bazar, Malir Cantt, Karachi ', 'B-12, Cantt Bazar, Malir Cantt, Karachi ', '0335443303', 'tamkeenhanif@gmail.com', NULL, 'Project Manager ', '2023-05-01', 'Oscar Steve ', 'On-Site', '8:00 PM to 5:00 AM', 'HBL', 'Tamkeen Hanif ', '12177991898703', 'PK82HABB0012177991898703', NULL, 'tamkeenhanif@gmail.com'),
('29c3b285-2175-4631-b913-70962387b651', 'Production', 'sa46086@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:27', '2025-08-18 14:59:42', 'Sheraz Ahmed', 'Raja Aftab Ahmed', '1997-12-28', 'Male', 'Single', '42201-5478680-7', 'Diamond Residency Defence View Phase 2 Near Qayumabad', 'Azad  Kashmir Pallandri', '03112239376', 'sa46086@gmail.com', NULL, 'Developer', '2022-12-22', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Mezaan Bank', 'Sheraz Ahmed', '01380103604049', 'PK84MEZN0001380103604049', NULL, 'sa46086@gmail.com'),
('2ad7fe4f-92f6-435c-b186-7e4ede3d1d2b', 'Front Sales', 'vwelfred@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:07', '2025-08-18 14:59:42', 'Vincent Welfred Khan', 'Yousuf Khan', '1994-09-08', 'Male', 'Single', '42201-5472534-5', 'House # A-7, Area-I, Korangi # 05, Karachi', 'House # A-7, Area-I, Korangi # 05, Karachi', '0314-2074766', 'vwelfred@gmail.com', NULL, 'Sales Executive', '2024-11-02', 'Iftikhar', 'On-Site', '12:00 AM to 9:00 AM', 'Habib Bank Limited', 'VINCENT', '24437901411003', 'PK15HABB0024437901411003', NULL, NULL),
('2ce598ee-e655-4715-a1e5-e6b78d3e3e47', 'Front Sales', 'musawirrasouli@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:05', '2025-08-18 14:59:42', 'Musawir Rasoli', 'Gholam Mohmmad ', '2005-12-02', 'Male', 'Single', '1400-0900-96638', 'PLT GK 2/8 SACH WANI MANZIL, Agha Khan Road, Nawab Mahabat Khanji Rd, Dharamsala Kharadar, Karachi', 'PLT GK 2/8 SACH WANI MANZIL Agha Khan Road, Nawab Mahabat Khanji Rd, Dharamsala Kharadar, Karachi', '+92 316 3650063', 'musawirrasouli@gmail.com', NULL, 'Lead scraping', '2023-11-05', 'Iftikhar Ahmed', 'On-Site', '5:00 PM to 2:00 AM', 'N/A', 'N/A', 'N/A', 'N/A', NULL, NULL),
('2ec09323-d324-4bd6-aed5-4ea67af38924', 'Front Sales', 'xaineexo@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-31 12:10:26', '2025-08-18 14:59:42', 'Adam Zain Nasir', 'Muhammad Nasir', '1986-08-21', 'Male', 'Divorced', '4230162911225', '3rd floor, Yaqoob Plaza, E/11, Chandio village, Karachi', '3rd floor, Yaqoob Plaza, E/11, Chandio village, Karachi', '03330217780', 'xaineexo@gmail.com', NULL, 'Assistant Vice President', '2024-11-02', 'Iftikhar Ahmed', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan Bank ', 'Adam Zain Nasir', '99240102979770', 'PK27MEZ00992402979770', 'adamzainnasir.fro@logicworks.com', NULL),
('3143859d-a209-4429-a750-dfbf62d5cab9', 'Other', 'oliviapatrick075@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:45', '2025-08-18 14:59:42', 'Malik Balach Ali', 'Malik Muhammad Azam Awan', '2005-05-17', 'Male', 'Single', '33103-7467931-9', 'street no 1 Baldia town swat colony Karachi Pakistan', 'street no 1 Baldia town swat colony Karachi Pakistan', '03152076045', 'oliviapatrick075@gmail.com', 0, 'Link Builder', '2024-11-22', 'Muhammad Haris / Taha Khan', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Malik Balach Ali', '99300110872037', 'PK83MEZN0099300110872037', NULL, 'oliviapatrick075@gmail.com'),
('31fd0ae4-d76e-468c-a85c-3595034b31aa', 'Front Sales', 'jahanrasoli55@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:03', '2025-08-18 14:59:42', 'Jahan Bakhsh Rasoli', 'Gholam Mohammad Rasoli', '2003-07-24', 'Male', 'Married', '1400-0900-35940', ' Agha Khan Road, Nawab Mahabat Khanji Rd, Dharamsala Kharadar, Karachi, Pakistan', 'PLT GK 2/8 SACH WANI MANZIL Agha Khan Road, Nawab Mahabat Khanji Rd, Dharamsala Kharadar, Karachi', '+92 316 3650063', 'jahanrasoli55@gmail.com', NULL, 'Lead Scraping', '2023-03-01', 'Iftikhar ', 'On-Site', '5:00 PM to 2:00 AM', 'N/A', 'N/A', 'N/A', 'N/A', NULL, NULL),
('35073d61-67a3-4c8c-b449-5f70aa535867', 'Production', 'akhunzadaabdulrehman333@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:35', '2025-08-18 14:59:42', 'Rehman khan', 'sharif ullah', '2006-09-04', 'Male', 'Single', '42301-2310427-5', 'New pnt colony near Altamash dental hospital ', 'New pnt colony near Altamash dental hospital ', '03243828447', 'akhunzadaabdulrehman333@gmail.com', NULL, 'link builder', '2024-01-12', 'Taha/Haris', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan bank', 'Rehman khan', '99300111223329', 'PK53MEZN0099300111223329', NULL, 'akhunzadaabdulrehman333@gmail.com'),
('3c47dff5-abb6-49c0-89f6-044d94aa8608', 'Production', 'hturk0009@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:11', '2025-08-18 14:59:42', 'M.Hamza', 'Tariq', '2003-07-22', 'Male', 'Single', '42301-0797672-9', 'mehmoodabad #6 street #13', 'mehmoodabad #6 street #13', '03131141116', 'hturk0009@gmail.com', NULL, 'wordpress developer', '2024-03-16', 'Raja', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan', 'MUHAMMAD HAMZA', '01380110504673', 'PK60MEZN0001380110504673', NULL, 'hturk0009@gmail.com'),
('4294deed-e945-4942-bdc2-69740a9f0eeb', 'Marketing', 'aiman.wahaj88@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:15', '2025-08-18 14:59:42', 'Ayman', 'Wahaj', '1988-01-27', 'Female', 'Married', '4250115508822', 'D-72 First Floor Alfalah Housing Society street of raja bakers malir halt karachi', 'D-72 First Floor Alfalah Housing Society street of raja bakers malir halt karachi', '03158352705', 'aiman.wahaj88@gmail.com', NULL, 'Content Writer', '2024-10-07', 'Taha Khan', 'Remote', '7:00 PM to 4:00 AM', 'Standard Chartered Bank ', 'Ayman Wahaj', '01995545301', 'PK30SCBL0000001995545301', NULL, 'aiman.wahaj88@gmail.com'),
('44d5134d-f1a9-42e6-a37e-7f56bcadd02b', 'Production', 'faheemkhangraphics@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:17', '2025-08-18 14:59:42', 'Muhammad Faheem Khan ', 'Muhammad Saleem Khan ', '1992-07-05', 'Male', 'Married', '42101-0538041-1', 'Nazimabad No #2, Block 126, House No# 05,  karachi, ', 'Nazimabad No #2, Block 126, House No# 05,  karachi, ', '03111093021', 'faheemkhangraphics@gmail.com', NULL, 'Senior 2D Animator ', '2023-10-09', 'Kamran Butt ', 'On-Site', '8:00 PM to 5:00 AM', 'UBL', 'Muhammad Faheem khan ', '0149315300143', 'PK28UNIL0109000315300143', NULL, 'faheemkhangraphics@gmail.com'),
('4639731b-b548-4a16-871d-3e97064ebcfb', 'Production', 'remvil37@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:21', '2025-08-18 14:59:42', 'SHAHZAIB ALAM', 'AFTAB ALAM', '2002-09-08', 'Male', 'Married', '42501-5611984-7', 'Defence view phase 2, house NO. g-63, Karachi', 'Block Y, DG Khan', '0321-5995209', 'remvil37@gmail.com', NULL, 'Python Developer', '2025-05-12', NULL, 'On-Site', '4:00 PM to 1:00 AM', 'Allied Bank Limited (ABL)', 'Shahzaib Alam', '01410010110094320018', 'PK22ABPA0010110094320018', NULL, 'remvil37@gmail.com'),
('46918914-c1d5-4bf6-8e72-c7e8f706382a', 'Production', 'maryamaziz435@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:08', '2025-08-18 14:59:42', 'Maryam Aziz', 'Abdul Aziz ', '2000-01-14', 'Female', 'Single', '4240296488714', 'House No L-377, sector 4/A, Surjani Town, Karachi, Pakistan. ', '-', '03465524301', 'maryamaziz435@gmail.com', NULL, 'Seo', '2025-01-13', 'Mr Haris ', 'Hybrid', '3:00 PM to 12:00 AM', 'Meezan Bank', 'Maryam Aziz', '99080104716813', 'PK67MEZN0099080104716813', NULL, 'maryamaziz435@gmail.com'),
('484d3d36-559f-425e-9ef2-3af7488a2ba0', 'Production', 'syedrizwankhan78@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:23', '2025-08-18 14:59:42', 'Syed Rizwan Khan', 'Amir Khan', '1998-10-23', 'Male', 'Single', '42000-9745758-5', 'R74, Falaknaz Dreams, Near Memon Goth, Malir, Karachi', 'R74, Falaknaz Dreams, Near Memon Goth, Malir, Karachi', '03132505278', 'syedrizwankhan78@gmail.com', NULL, 'Senior CMS Developer', '2022-05-23', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'United Bank Limited', 'Syed Rizwan Khan', '0395259828093', 'PK97UNIL0109000259828093', NULL, 'syedrizwankhan78@gmail.com'),
('4c74f743-fa52-470d-ba55-8343f2099041', 'Upseller', 'aghawasirf1@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:18', '2025-08-18 14:59:42', 'Agha Wasif ', 'Sohail Asif ', '1991-12-26', 'Male', 'Single', '42201-5810435-1', '134/H Street 30 Askari 4', '134/H Street 30 Askari 4', '03323578995', 'aghawasirf1@gmail.com', NULL, 'Up Seller ', '2025-03-17', 'Oscar ', 'On-Site', '8:00 PM to 5:00 AM', 'HBL ', 'Agha Wasif ', '24627000199401', 'PK94HABB0024627000199401', 'aghawasif.ups@logicworks.com', 'aghawasirf1@gmail.com'),
('5c39b76a-2c89-4c30-8139-51b179c092c0', 'Production', 'muhammadmadni1102@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:26', '2025-08-18 14:59:42', 'Muhammad Madni', 'Riaz Hussain ', '1986-10-21', 'Male', 'Married', '42101-2908474-5', 'k 529 Kusar Niyazi Colony Block H North Nazimabad Karachi ', 'Plot # 09 Nussrat Bhutto Colony North Nazimabad Karachi ', '0308-2769477', 'muhammadmadni1102@gmail.com', NULL, 'Sr Animator', '2025-07-07', 'Asad Benjamin', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Muhammad Madni', '99910103010275', 'PK36MEZN0099910103010275', NULL, 'muhammadmadni1102@gmail.com'),
('6befe951-bdab-45d0-9925-2281272f8ce2', 'Front Sales', 'ali@logicworks.ai', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-04-20 05:42:58', '2025-08-18 14:59:42', 'Ali', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Administrator', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('6eda3ade-1275-47c0-8c6d-1a73898080d7', 'Production', 'moez94810ma8848917@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:37', '2025-08-18 14:59:42', 'Moez Ahmed', 'Muneer Ahmed', '2000-09-28', 'Male', 'Single', '4230139271567', 'punjab colony karachi', 'punjab colony  karachi', '03148129562', 'moez94810ma8848917@gmail.com', NULL, 'Seo Executive', '2024-01-14', 'Taha/Haris', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan Bank', 'Moez Ahmed', '00300108565802', 'PK38MEZN0000300108565802', NULL, 'moez94810ma8848917@gmail.com'),
('6f5e1db3-c0f6-4f2b-beaa-aa24935337b4', 'Other', 'oscarsteve92@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:44', '2025-08-18 14:59:42', 'Oscar Steve Khan', 'Rashid Khan', '1992-09-22', 'Male', 'Married', '42201-9506574-3', 'House A-138, Saima Luxury Homes, Awami Colony Sector 10 Shah Faisal Colony, Karachi, 75160', 'House No A-8, Plot F-19, Korangi 6, Karachi', '03472069234', 'oscarsteve92@gmail.com', NULL, 'President ', '2023-10-17', NULL, 'On-Site', '9:00 PM to 6:00 AM', 'Meezan Bank ', 'Oscar Steve Khan', '013701099522034', 'PK59MEZ0001370109952034', NULL, 'oscarsteve92@gmail.com'),
('720c71f1-3d24-40aa-bb45-3f69e1259aac', 'Upseller', 'erickhan105@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:43', '2025-08-18 14:59:42', 'Eric Harold Khan', 'Rashid Khan', '1998-04-01', 'Male', 'Married', '42201-7726873-5', 'House #A -138, Saima Luxury Homes, Bagh-e-Korangi, Karachi', '-', '03121091905', 'erickhan105@gmail.com', NULL, 'Sales Executive ', '2025-01-07', 'Oscar Steve', 'On-Site', '8:00 PM to 5:00 AM', 'MCB Bank ', 'Eric Harold Khan', '1049010541000134', 'PK96MUCB1049010541000134', NULL, 'erickhan105@gmail.com'),
('79805b10-7c1f-40e0-9956-afc5c5ce3fb5', 'HR', 'abeerzain_15@hotmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:29', '2025-08-18 14:59:42', 'Abeer Zain', 'Zain ul Abideen', '1993-11-15', 'Female', 'Married', '42101-7916370-8', 'Falcon Complex', 'Saim Residency, Block 13D/2, Gulshan e Iqbal, Karachi', '0334-0366645', 'abeerzain_15@hotmail.com', NULL, 'HR Manager', '2025-02-17', 'Salman Waria', 'Hybrid', '8:00 PM to 5:00 AM', 'United Bank Limited', 'Abeer Zain', '314914372', 'PK82UNIL0109000314914372', NULL, 'abeerzain_15@hotmail.com'),
('80ad0f12-b2a2-46e5-9b51-2fb8624f6631', 'Marketing', 'huzaifayameen438@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:32', '2025-08-18 14:59:42', 'Huzaifa Yameen Kukda', 'Yameen Wali Kukda', '1995-04-27', 'Male', 'Single', '42201-9884443-1', 'A-84/2 kukda house near kashmir road', 'A-84/2 kukda house near kashmir road', '03361879918', 'huzaifayameen438@gmail.com', NULL, 'SR Seo executive', '2023-08-22', 'Haris bhai and Taha bhai', 'On-Site', '1:00 AM to 10:00 AM', 'Bank Al Habib', 'HUZAIFA YAMIN KUKDA', '50280081001148010', 'PK27BAHL5028008100114801', NULL, 'huzaifayameen438@gmail.com'),
('86f80dea-829a-4632-8560-0770c715c271', 'Front Sales', 'mohammedsajidb@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:14', '2025-08-18 14:59:42', 'Mohammed Sajid', 'Sajid Munir', '1998-02-21', 'Male', 'Married', '35200-6408844-1', '135/2 Main Khayaban-e-Badban Phase 5 DHA Karachi', '135/2 Main Khayaban-e-Badban Phase 5 DHA Karachi', '03456008564', 'mohammedsajidb@gmail.com', NULL, 'Account Manager', '2025-02-24', NULL, 'On-Site', '7:00 PM to 4:00 AM', 'United Bank Limited', 'Mohammed Sajid', '0578297682411', 'PK07UNIL0109000297682411', 'mohammedsajid.fro@logicworks.com', NULL),
('8dba2641-493c-4c9a-b44c-ccf0be46c1c9', 'Marketing', 'rehmanjamil021@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:30', '2025-08-18 14:59:42', 'Abdul Rehman ', 'Jamil ahmed', '2000-02-18', 'Male', 'Single', '4210136165901', 'North nazimabad Block - H street  6 - near 1st step shop ', 'North nazimabad Block - H street  6 - near 1st step shop ', '03410217876', 'rehmanjamil021@gmail.com', NULL, 'Sr. SEO Specialist', '2024-09-23', 'muhammad haris', 'On-Site', '1:00 AM to 10:00 AM', 'Bank al falah', 'muhammad abdul rehman jamil', '03491008114727', 'PK49ALFH0349001008114724', NULL, 'rehmanjamil021@gmail.com'),
('8ed0673d-330e-404d-9513-d3b33394f17a', 'Upseller', 'amanali8503@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:24', '2025-08-18 14:59:42', 'Syed Aman Ali', 'Syed Imran Ali', '2000-11-26', 'Male', 'Single', '42101-4320539-3', '3f 9/3 Nazimabad no:3 karachi', '3f 9/3 Nazimabad no:3 karachi', '03121141477', 'amanali8503@gmail.com', NULL, 'Project Manager', '2025-06-25', 'Mohammed Sajid', 'On-Site', '8:00 PM to 5:00 AM', 'Bank Al Habib', 'Syed Aman Ali', '10730081008679017', 'PK31 BAHL 1073 0081 0086 7901', NULL, 'amanali8503@gmail.com'),
('8f254a92-237e-4633-9ef5-0b389318bcfc', 'Front Sales', 'hassaan.ansari52@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:07', '2025-08-18 14:59:42', 'Hassaan Umer Ansari ', 'Sohail Kamran', '1995-08-29', 'Male', 'Married', '3120296842635', 'R8 park view apt gulshan E Iqbal block 10A', 'House 94/A trust colony Bahawalpur ', '0333-3635220', 'hassaan.ansari52@gmail.com', NULL, 'Assistant Vice president ', '2025-03-17', 'Iftikhar ', 'On-Site', '12:00 AM to 9:00 AM', 'Habib Bank Limited HBL', 'HASSAAN', '07867918325703', 'PK78HABB0007867918325703', NULL, NULL),
('9270af7c-ee99-419a-873c-d9b004b33908', 'Production', 'muhammadhamza3437@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:28', '2025-08-18 14:59:42', 'Muhammad Hamza', 'Muhammad Hamid', '1998-05-25', 'Male', 'Single', '42101-3777936-7', 'House No 632 Block 14 Fb Area Near Water Pump Karachi', 'House No 632 Block 14 Fb Area Near Water Pump Karachi', '03042334904', 'muhammadhamza3437@gmail.com', NULL, 'UI UX Designer', '2025-02-10', 'Kamran Butt', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'MUHAMMAD HAMZA', '01280102494012', 'PK61MEZN0001280102494012', NULL, 'muhammadhamza3437@gmail.com'),
('9494e0b3-9791-47ec-ab2d-072532574920', 'Front Sales', 'Bilalmamon12345@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:06', '2025-08-18 14:59:42', 'Bilal Ahmed ', 'Ghullam Abbas ', '2002-06-05', 'Male', 'Single', '4220113498695', 'St 14/5 SEC 32-E korangi Karachi ', 'St 14/5 SEC 32-E korangi Karachi ', '03162811576', 'Bilalmamon12345@gmail.com', NULL, 'Sales Executive ', '2024-07-15', 'Iftikhar Ahmed ', 'On-Site', '5:00 PM to 2:00 AM', 'Meezan ', 'Bilal Ahmed ', '99380108803321', 'PK88MEZN0099380108803321', NULL, NULL),
('9584a4c4-2c73-410f-8216-428738034d45', 'Production', 'asadbhatti258@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:51', '2025-08-18 14:59:42', 'Asad', 'Sajjad', '1995-08-29', 'Male', 'Married', '42201-9204933-7', 'House No 120 Al-Madina Society near Christian Town Korangi, Karachi', 'House No 120 Al-Madina Society near Christian Town Korangi, Karachi', '03402711721', 'asadbhatti258@gmail.com', NULL, 'Lead UI UX', '2024-12-09', 'Kamran', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Asad Sajjad', '99280103545913', 'PK51MEZN0099280103545913', NULL, 'asadbhatti258@gmail.com'),
('9606d2e4-271b-4baa-b500-c8e1bc0338ac', 'Other', 'sabeerrariq@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:02', '2025-08-18 14:59:42', 'Sabeer Tariq', 'Tariq Mehmood', '2000-10-08', 'Male', 'Single', '42301-0753219-7', 'House no C-60/15, 5th Floor, National Square, Block 8 Khayaban-e-Jami, Block 8 Clifton, Karachi, 75600', 'House no C-60/15, 5th Floor, National Square, Block 8 Khayaban-e-Jami, Block 8 Clifton, Karachi, 75600', '+923070153511', 'sabeerrariq@gmail.com', NULL, 'Business Analyst', '2025-02-17', NULL, 'On-Site', '8:00 PM to 5:00 AM', 'NayaPay', 'Sabeer', '03070153511', 'PK42NAYA1234503070153511', NULL, 'sabeerrariq@gmail.com'),
('96e998b8-a796-46b4-96e7-04de9c3569ca', 'Marketing', 'muhammadharis1795@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:40', '2025-08-18 14:59:42', 'Muhammad Haris Khan', 'Aizazullah', '2003-05-16', 'Male', 'Single', '42401-064095-3', 'Punjab Colony Karachi', 'Punjab Colony Karachi', '03000171795', 'muhammadharis1795@gmail.com', NULL, 'Digital Marketing Manager', '2025-01-01', 'Bilal Sultan', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan Bank', 'Muhammad Haris Khan', '01070107907950', 'PK60MEZN0001070107907950', NULL, 'muhammadharis1795@gmail.com'),
('9bac0e4b-affb-45a3-a0ca-e1f5fddd965c', 'Marketing', 'Emaazbari99@gmail.com ', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:16', '2025-08-18 14:59:42', 'Emaaz Bari', 'Abdul Bari ', '1999-01-11', 'Male', 'Single', '4240122346181', 'House number 295, block 5, Saadi town', 'House number 295, block 5 , Saadi town', '03072279139', 'Emaazbari99@gmail.com ', NULL, 'Content Writer', '2024-08-16', 'SEO Team', 'Remote', '3:00 PM to 12:00 AM', 'Meezan Bank ', 'EMAAZ BARI', '10350108571249', 'PK82MEZN0010350108571249', NULL, 'Emaazbari99@gmail.com '),
('9ede11d8-f992-4414-a41c-6a397dcc4d10', 'Production', 'masadoff12@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:53', '2025-08-18 14:59:42', 'Asad', 'Saleem Akhtar', '2005-08-14', 'Male', 'Single', '44203-0842709-9', 'mehmodabad manzoor colony gujjar chok near city hospital ', 'Chak no#09 district Sanghar  ', '03194132506', 'masadoff12@gmail.com', NULL, 'graphic designer (intern)', '2025-03-05', 'Kamran Butt', 'On-Site', '8:00 PM to 5:00 AM', 'N/A', 'N/A', 'N/A', 'N/A', NULL, 'masadoff12@gmail.com'),
('a179354b-2003-4127-abb9-c8025c8a376d', 'Production', 'nabeel.bts@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:20', '2025-08-18 14:59:42', 'Nabeel Raza', 'M. Edrees', '1995-11-19', 'Male', 'Married', '4250168833675', 'Labour squair landhi karachi house number 33', 'Labour squair landhi karachi house number 33', '03343765963', 'nabeel.bts@gmail.com', NULL, 'WordPress backend developer ', '2025-05-01', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan bank', 'Nabeel raza', '99410103784031', 'PK92MEZN0099410103784031', NULL, 'nabeel.bts@gmail.com'),
('b12717e1-7376-48e9-a9e7-0d895e5d9dbe', 'Upseller', 'muhammadfaizansaif@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:50', '2025-08-18 14:59:42', 'Muhammad Faizan Saif', 'Saif ur Rehman', '1996-07-15', 'Male', 'Single', '42301-7247251-3', 'Plot 18-C, Lane 5, Seher Comm Area, Phase 7, DHA, Karachi', 'Plot 18-C, Lane 5, Seher Comm Area, Phase 7, DHA, Karachi', '03072775504', 'muhammadfaizansaif@gmail.com', NULL, 'Assistant President ', '2022-09-01', 'Oscar Steve', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Muhammad Faizan Saif', '99420102006615', 'PK94MEZN0099420102006615', NULL, 'muhammadfaizansaif@gmail.com'),
('b21e3548-b5b9-460a-a818-80b23660e414', 'Production', 'kamibuttt01@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:34', '2025-08-18 14:59:42', 'Kamran Butt', 'Abdul Waheed Butt (Late)', '1975-10-04', 'Male', 'Single', '42301-3059-666-9', 'Flat No. A1, Data Apartment, SB47-48, Block 13-C, Gulshan-e-Iqbal, Karachi-75300.', 'Flat No. A1, Data Apartment, SB47-48, Block 13-C, Gulshan-e-Iqbal, Karachi-75300.', '0335-2388-097', 'kamibuttt01@gmail.com', NULL, 'Lead Designer', '2022-12-09', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Mezan Bank', 'Kamran Butt', '01370109952664', 'PK24MEZN0001370109952664', NULL, 'kamibuttt01@gmail.com'),
('b767eaee-e79b-4769-8cae-0214b1ebb336', 'Production', 'moizkhan1209@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:15', '2025-08-18 14:59:42', 'Moiz Khan', 'Faraz Hussain Khan', '1998-08-19', 'Male', 'Single', '42201-6762843-7', 'D-11 Al Ahram Plaza Block 13/A Gulshan-E-Iqbal Karachi.', 'D-11 Al Ahram Plaza Block 13/A Gulshan-E-Iqbal Karachi.', '0336-3020726', 'moizkhan1209@gmail.com', NULL, 'Wordpress Developer', '2023-08-01', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'meezan bank', 'moiz khan', '01370109958395', 'PK02MEZN0001370109958395', NULL, 'moizkhan1209@gmail.com'),
('b925eda8-8763-44a4-92f1-f7bfeb4c0080', 'Production', 'bilalanwar.5812@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:46', '2025-08-18 14:59:42', 'Bilal Anwar', 'Muhammad Anwar khan', '1998-08-07', 'Male', 'Single', '82303-3010981-9', 'House no 557 sec E Bhittai Colony Korangi Crossing Karachi', 'District punch Tahsil Rawalakot P/O Alisojal Azad Kashmir', '0347-5029433', 'bilalanwar.5812@gmail.com', NULL, 'Wordpress Developer', '2025-03-21', 'Raja Ahsan', 'On-Site', '8:00 PM to 5:00 AM', 'Naya Pay', 'Bilal Anwar', '03475029433', 'PK82NAYA1234503475029433', NULL, 'bilalanwar.5812@gmail.com'),
('bd184728-c482-48a8-9ff3-6bad9d75f3c0', 'Upseller', 'jacoballiet40@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:48', '2025-08-18 14:59:42', 'Syed Muzammil', 'Syed Hussain Mian', '1990-10-19', 'Male', 'Married', '4230119316365', 'Nara Heights, Flat-203, Block C, Opposite CNG World Pump, Near AAJ News Office, Gurumandir, Karachi. ', 'Nara Heights, Flat-203, Block C, Opposite CNG World Pump, Near AAJ News Office, Gurumandir, Karachi. ', '03452578581', 'jacoballiet40@gmail.com', NULL, 'Sales Executive', '2024-06-21', 'Oscar Steve', 'On-Site', '9:00 PM to 6:00 AM', 'Meezan Bank ', 'Syeda Kiran Zia', '99170110959548', 'PK42MEZN0099170110959548', NULL, 'jacoballiet40@gmail.com'),
('be0c70d7-68b0-4d9a-b648-95b3bba6c4fc', 'Marketing', 'owaisali1747@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:39', '2025-08-18 14:59:42', 'Owais Ali Siddiqui', 'Azhar Ali Siddiqui', '2002-03-02', 'Male', 'Single', '42401-6635-152-5', 'Sec/4-a, Surjani Town, Karachi', 'Sec/4-a, Surjani Town, Karachi', '03142781747', 'owaisali1747@gmail.com', NULL, 'Sr SEO Executive', '2024-11-11', 'Muhammad Haris and Taha Khan', 'On-Site', '9:00 PM to 6:00 AM', 'United Bank Limited (UBL)', 'Owais Ali Siddiqui', '0149313958744', 'PK38UNIL0109000313958744', NULL, 'owaisali1747@gmail.com'),
('c03345a8-e1dc-424e-b835-f4b1002ee8af', 'Front Sales', 'shahbazyouknow@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:10', '2025-08-18 14:59:42', 'Shahbaz khan', 'Khanzada Sajjad ', '2013-04-08', 'Male', 'Married', '4230165484341', 'Country club apartments flat v73', 'DHA 5', '03333475911', 'shahbazyouknow@gmail.com', NULL, 'Vp', '2024-11-25', NULL, 'On-Site', '12:00 AM to 9:00 AM', 'Mezaan bank', 'Khanzada shahbaz', '01240108067287', 'PK21MEZN0001240108067287', NULL, NULL),
('c081d26e-626e-489e-a458-9e3f5530ac40', 'Upseller', 'syedjafrymohsin@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:19', '2025-08-18 14:59:42', 'Syed Mohsin Shahzad', 'Syed Mehdi Shahzad', '2001-07-22', 'Male', 'Single', '42201-74596241', 'DHA phase7 Khyban e Jami house no 85/C Karachi ', 'Same', '0332-2451784', 'syedjafrymohsin@gmail.com', NULL, 'Sales Manager', '2025-05-01', 'Shahbaz', 'On-Site', '8:00 PM to 5:00 AM', 'Bank Alfalah', 'Syed Mohsin Shahzad', '03041007040196', 'PK21ALFH0304001007040196', NULL, 'syedjafrymohsin@gmail.com'),
('c68193f0-bb0e-47d3-bdd7-a717acd775f6', 'Upseller', 'aliz799@icloud.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:59', '2025-08-18 14:59:42', 'Muhammad Ali Sheikh', 'M Zaheerudin Sheikh (Late)', '1979-08-16', 'Male', 'Married', '4210182939249', 'House no. 538, Dastagir Society, F.B Area block 15, Karachi', 'Same as above', '0333-2431633', 'aliz799@icloud.com', NULL, 'Account Manager', '2024-03-01', 'Oscar Steve', 'On-Site', '9:00 PM to 6:00 AM', 'Meezan Bank ', 'Muhammad Ali Sheikh', '01330105841242', 'PK23MEZN0001330105841242', 'muhammadalisheikh.ups@logicworks.com', 'aliz799@icloud.com'),
('ccbfc080-1840-4f8a-9d3c-0da3eee928ee', 'Production', 'adilraees911@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:25', '2025-08-18 14:59:42', 'Muhammad Adil', 'Farasat Hussain ', '2004-02-05', 'Male', 'Single', '3610236239717', 'Noor E Bahar Restaurant Near Passport Office saddar Karachi', 'Post office 25pull Chack No 12G.H Tehsil Kabirwala District khanewal', '03078068476', 'adilraees911@gmail.com', NULL, 'Jr React js Developer', '2025-07-01', NULL, 'On-Site', '8:00 PM to 5:00 AM', 'Allied Bank', 'Muhammad Adil', '01270010137308930014', 'PK67ABPA0010137308930014', NULL, 'adilraees911@gmail.com'),
('cffe3120-364a-4667-9bce-515fed4ecf92', 'Marketing', 'nabeel033533@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:17', '2025-08-18 14:59:42', 'Nabeel Ali Khan', 'M. Yaseen', '1995-07-29', 'Male', 'Single', '42201-3252690-9', 'Shah Faisal Colony no 3 Karachi', 'Shah Faisal Colony no 3 Karachi', '03353383295', 'nabeel033533@gmail.com', NULL, 'SEO Specialist', '2025-04-14', 'Haris', 'On-Site', '3:00 PM to 12:00 AM', 'Meezan Bank', 'Nabeel Ali Khan', '01420104110905', 'PK66MEZN0001420104110905', NULL, 'nabeel033533@gmail.com'),
('cfff3a8e-f61f-4cb9-a950-82c054451e78', 'Marketing', 'jhonsmithdenver@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:33', '2025-08-18 14:59:42', 'Muhammad Kamran', 'Muhammad Naseer', '2005-06-30', 'Male', 'Single', '42101-3062027-7', 'House no 1094, Kausar Niazi Colony North Nazimabad Karachi', 'House no 1094, Kausar Niazi Colony North Nazimabad Karachi', '03273751760', 'jhonsmithdenver@gmail.com', NULL, 'Seo Link Builder', '2024-05-10', 'Haris Bhai and Taha Bhai', 'On-Site', '1:00 AM to 10:00 AM', 'Naya Pay', 'Muhammad Kamran', '03273751760', 'PK85 NAYA 1234 5032 7375 1760', NULL, 'jhonsmithdenver@gmail.com'),
('d0620bb5-9478-4b96-aabc-16cb128feaca', 'Front Sales', 'technologist.asad@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:56', '2025-08-18 14:59:42', 'Asad Ullah Khan', 'Akhtar Ullah Khan', '1988-12-15', 'Male', 'Married', '4220126222029', 'R-1300, Block-2, Azizabad, Karachi', 'A-154, 13D-1, Gulshan e Iqbal, Karachi', '0335-2398958', 'technologist.asad@gmail.com', NULL, 'Lead Generation Specialist', '2024-07-15', 'Iftikhar', 'On-Site', '10:00 PM to 7:00 AM', 'Meezan Bank Ltd.', 'Asad Ullah Khan', '01410105686303', 'PK46MEZN0001410105686303', NULL, NULL),
('d0ee2ed9-c058-4ba7-99af-ac7ad6b4bd5e', 'Production', 'rehmataliinnocent@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:00', '2025-08-18 14:59:42', 'Rehmat Ali', 'Mian Muzaffar', '2000-01-14', 'Male', 'Married', '42401-4554196-7', 'House No 183-184, Street No 8 Sector 5J Saeedabad Baldia Town Karachi ', 'House No 183-184, Street No 8 Sector 5J Saeedabad Baldia Town Karachi ', '03122527288', 'rehmataliinnocent@gmail.com', NULL, 'Graphic Designer', '2025-06-01', 'TAHA KHAN', 'On-Site', '9:00 PM to 6:00 AM', 'Allied Bank Limited', 'Rehmat Ali', '0010069803030013', 'PK80ABPA0010069803030013', NULL, 'rehmataliinnocent@gmail.com'),
('d324c937-e125-4415-860e-dcb1fae2c3a4', 'Marketing', 'rabisha.asim017@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:13', '2025-08-18 14:59:42', 'Rabisha Asim', 'Aziz Muhammad Asim', '2002-07-17', 'Female', 'Single', '42101-2173380-2', 'Bufferzone 15-B', '-', '0333-3095234', 'rabisha.asim017@gmail.com', NULL, 'Content writing Intern', '2025-04-14', NULL, 'Remote', '6:00 PM to 3:00 AM', 'meezan bank', 'RABISHA ASIM', '10510111390725', 'PK02 MEZN 0010 5101 1139 0725', NULL, 'rabisha.asim017@gmail.com'),
('d7d6e215-ca30-4529-90a3-836d7235b61e', 'Production', 'ta1310041@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:47', '2025-08-18 14:59:42', 'Taha Ali Siddiqui', 'Muhammad Ikram', '2002-10-18', 'Male', 'Single', '42101-7020449-1', 'liaquatabad Sindhi hotel, B-1 Area Karachi.', 'liaquatabad Sindhi hotel, B-1 Area Karachi.', '03177698135', 'ta1310041@gmail.com', NULL, 'UI UX & Graphic Designer', '2025-01-27', 'Kamran Butt', 'On-Site', '8:00 PM to 5:00 AM', 'JS Bank', 'TALHA ALI SIDDIQUI', '1954482', 'PK07JSBL9520000001954482', NULL, 'ta1310041@gmail.com'),
('e002c433-df80-4286-9be9-fa394eca57bb', 'Other', 'laikhan369@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:14', '2025-08-18 14:59:42', 'Laiba Khan', 'Faraz Khan', '1998-05-31', 'Female', 'Single', '1730184248810', 'DHA PHASE 5 KARACHI DARAKHSHAN VILLAS ', 'DHA PHASE 5 KARACHI DARAKHSHAN VILLAS C22', '03362509222', 'laikhan369@gmail.com', NULL, 'Content Writer ', '2025-04-14', 'Emaaz/Haris ', 'Remote', '8:00 PM to 5:00 AM', 'UBL ', 'Naila Gulistan ', '212565553', '212565553', NULL, 'laikhan369@gmail.com'),
('e1619c50-54a5-4046-98ff-acd45055dd68', 'Production', 'm.salmanprog@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:22', '2025-08-18 14:59:42', 'Salman', 'Rais', '1983-12-24', 'Male', 'Married', '4210162518153', 'HNO L735, sector 5L North Karachi', 'HNO L735, sector 5L North Karachi', '03212114216', 'm.salmanprog@gmail.com', NULL, 'Senior Software engineer', '2025-05-19', 'Mr. Raja', 'On-Site', '8:00 PM to 5:00 AM', 'UBL', 'Salman Rais', '257461081', 'PK98UNIL0109000257461081', NULL, 'm.salmanprog@gmail.com'),
('e3f783a9-b3ce-46b0-805b-5845584e447b', 'Front Sales', 'fahadmuhsib@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:01:23', '2025-08-18 14:59:42', 'Muhammad Fahad ', 'Farrukh Javed', '2003-10-11', 'Male', 'Single', '42501-25741451-1', 'Block 33, Noor Deen Khan Rd, Kemari, Karachi.', 'H.no B-144, Shad Bagh, Malir Halt, Karachi.', '03302544149', 'fahadmuhsib@gmail.com', NULL, 'Front Sales Jr', '2025-06-11', 'Iftkhar Ahmad', 'On-Site', '10:00 PM to 7:00 AM', 'JS Bank', 'Muhammad Fahad', '0002158443', '0002158443', NULL, NULL),
('e97532f0-cc1d-4807-9b0e-f2eb2116fabf', 'Front Sales', 'iftikharkhnn@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:58', '2025-08-18 14:59:42', 'Iftikhar', 'Muhammad Aizazullah', '1994-06-13', 'Male', 'Married', '42301-5997444-7', 'House no 175, st# 09, punjab colony, Karachi.', 'House no 175, st# 09, punjab colony, Karachi.', '03168636668', 'iftikharkhnn@gmail.com', NULL, 'VP Sales', '2024-05-01', 'Salman', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan', 'Iftikhar', '2414', '512', NULL, NULL),
('ed57c924-b825-4c8d-86db-d6bc6942a51f', 'Marketing', 'ttaha.a.k.@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:49', '2025-08-18 14:59:42', 'Taha Ahmed Khan', 'Afaq Ahmed Khan', '1992-04-08', 'Male', 'Married', '4220197580349', 'E9 Block 10A, Gulshan-e-Iqbal', 'E9 Block 10A, Gulshan-e-Iqbal', '+923453090313', 'ttaha.a.k.@gmail.com', NULL, 'Marketing', '2023-06-15', 'Bilal ', 'On-Site', '7:00 PM to 4:00 AM', 'Al Habib', 'Taha Ahmed Khan', '11090078006750013', '11090078006750013', NULL, 'ttaha.a.k.@gmail.com'),
('ed671bf5-4133-476e-be13-bd2414827d93', 'Marketing', 'asdbasit@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:42', '2025-08-18 14:59:42', 'Abdul', 'Basit', '1990-06-26', 'Male', 'Single', '4210167574385', 'Shop# 2 Friend Apartment Block \"F\" North.Nazimabad Karachi', 'Shop# 2 Friend Apartment Block \"F\" North.Nazimabad Karachi', '03032663341', 'asdbasit@gmail.com', NULL, 'Seo Assistant Manager', '2023-10-09', 'Taha Khan', 'On-Site', '9:00 PM to 6:00 AM', 'Meezan Bank', 'Abdul Basit', '01310103019498', 'PK40MEZN0001310103019498', NULL, 'asdbasit@gmail.com'),
('ee8a5494-a0a7-4413-b656-3013a17b14d7', 'Production', 'ahsan_93raja@yahoo.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:54', '2025-08-18 14:59:42', 'Raja Ahsan', 'Ishfaq Akhter', '1993-10-20', 'Male', 'Married', '3740540750795', 'Mehmoodabad No6 Karcachi', 'Mehmoodabad No6 Karcachi', '03331287496', 'ahsan_93raja@yahoo.com', NULL, 'Production Head', '2025-03-25', 'Oscar', 'On-Site', '8:00 PM to 5:00 AM', 'Meezan Bank', 'Raja Muhammad Ahsan', '1590103186459', 'PK81MEZN0001590103186459', NULL, 'ahsan_93raja@yahoo.com'),
('fd507d30-f0bc-4032-90c7-9abc49dc3fcb', 'Production', 'khalidsikander066@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:55', '2025-08-18 14:59:42', 'Abdullah khalid ', 'Muhammad khalid', '2005-05-20', 'Male', 'Single', '42301-0475414-5', 'House number 1354 street no 13 mehmodabad karachi', 'House number 1354 street no 13 mehmodabad karachi', '03152939311', 'khalidsikander066@gmail.com', NULL, 'SEO Content writter ', '2025-03-05', 'Muhammad Haris', 'On-Site', '8:00 PM to 5:00 AM', 'NA', 'NA', 'NA', 'NA', NULL, 'khalidsikander066@gmail.com'),
('ffca38d3-ac86-434e-a791-44045a7f0839', 'Upseller', 'hassansiddiquiaus@gmail.com', '{\"salesTarget\":0,\"salesAchieved\":0,\"tasksCompleted\":0,\"projectsCompleted\":0,\"customerSatisfaction\":0,\"avgTaskCompletionTime\":0}', '2025-07-17 11:00:53', '2025-08-18 14:59:42', 'Hassan Ahmed Siddiqui', 'Saghir-ul-Hasan Siddiqui', '1996-02-20', 'Male', 'Single', '42201-9740463-7', 'R-9 Saleem Town, Bagh-e-Malir, Karachi 43', 'R-9 Saleem Town, Bagh-e-Malir, Karachi 43', '03430217545', 'hassansiddiquiaus@gmail.com', NULL, 'Project Coordinator', '2025-02-17', 'Oscar', 'On-Site', '9:00 PM to 6:00 AM', 'Meezan Bank', 'Hassan Ahmed Siddiqui', '99130107764599', 'PK67MEZN0099130107764599', NULL, 'hassansiddiquiaus@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `employee_dependents`
--

CREATE TABLE `employee_dependents` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `full_name` text DEFAULT NULL,
  `relationship` text DEFAULT NULL,
  `gender` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `cnic_bform_number` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_emergency_contacts`
--

CREATE TABLE `employee_emergency_contacts` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `name` text DEFAULT NULL,
  `relationship` text DEFAULT NULL,
  `contact_number` text DEFAULT NULL,
  `type` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_performance_history`
--

CREATE TABLE `employee_performance_history` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `month` date DEFAULT NULL,
  `performance` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `error_logs`
--

CREATE TABLE `error_logs` (
  `id` varchar(36) NOT NULL,
  `error_message` text DEFAULT NULL,
  `stack_trace` text DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  `severity` varchar(20) DEFAULT NULL,
  `context` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `front_seller_performance`
--

CREATE TABLE `front_seller_performance` (
  `id` varchar(36) NOT NULL,
  `seller_id` text DEFAULT NULL,
  `month` text DEFAULT NULL,
  `accounts_achieved` int(11) DEFAULT NULL,
  `total_gross` int(11) DEFAULT NULL,
  `total_cash_in` int(11) DEFAULT NULL,
  `total_remaining` int(11) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `front_seller_performance`
--

INSERT INTO `front_seller_performance` (`id`, `seller_id`, `month`, `accounts_achieved`, `total_gross`, `total_cash_in`, `total_remaining`, `created_at`, `updated_at`) VALUES
('', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', '2025-09', 1, 1000, 500, 500, NULL, NULL),
('677151e9-265f-4541-a057-a970ddc12aa7', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-01', 6, 23500, 21500, 2000, '2025-08-25T22:07:51.265941+00:00', '2025-08-26T16:14:05.885145+00:00'),
('67a2d132-f40c-4e50-b1d4-ecc15d554a75', '78294d98-4280-40c1-bb6d-b85b7203b370', '2025-08-01', 2, 7500, 3500, 4000, '2025-08-18T20:07:12.170291+00:00', '2025-08-26T16:14:09.47065+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `front_seller_targets`
--

CREATE TABLE `front_seller_targets` (
  `id` varchar(36) NOT NULL,
  `seller_id` text DEFAULT NULL,
  `month` text DEFAULT NULL,
  `target_accounts` int(11) DEFAULT NULL,
  `target_gross` int(11) DEFAULT NULL,
  `target_cash_in` int(11) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `front_seller_targets`
--

INSERT INTO `front_seller_targets` (`id`, `seller_id`, `month`, `target_accounts`, `target_gross`, `target_cash_in`, `created_at`, `updated_at`) VALUES
('34404df4-af54-4bb1-a302-b910e9fdf8e6', '14d4edad-a775-4708-99a5-ce3241faef66', '2025-09-01', 20, 0, 0, '2025-09-05 23:59:53', '2025-09-05 23:59:53'),
('4da77f87-76b8-4ccf-9441-c23c37051c1d', '2ec09323-d324-4bd6-aed5-4ea67af38924', '2025-09-01', 15, 0, 0, '2025-09-05 23:57:48', '2025-09-05 23:59:44'),
('4f77502c-d04d-44e5-bdaf-763c5eab5e89', '14d4edad-a775-4708-99a5-ce3241faef66', '2025-08-01', 20, 0, 0, '2025-08-18T20:00:47.969383+00:00', '2025-08-18T20:00:47.969383+00:00'),
('ab3950d0-0529-4ed3-8fb4-220ee0f1c69e', '2ec09323-d324-4bd6-aed5-4ea67af38924', '2025-08-01', 15, 0, 0, '2025-08-18T20:00:34.073282+00:00', '2025-08-18T20:00:34.073282+00:00'),
('b485ea44-2a8a-4c61-b6e7-7ba9e32d5508', '2ec09323-d324-4bd6-aed5-4ea67af38924', '2025-09-01', 30, 0, 0, '2025-09-06 00:03:38', '2025-09-06 00:03:38');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` varchar(36) NOT NULL,
  `client_name` text DEFAULT NULL,
  `email_address` text DEFAULT NULL,
  `contact_number` text DEFAULT NULL,
  `city_state` text DEFAULT NULL,
  `business_description` text DEFAULT NULL,
  `services_required` text DEFAULT NULL,
  `budget` text DEFAULT NULL,
  `additional_info` text DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'new',
  `source` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `priority` text DEFAULT NULL,
  `lead_score` int(11) DEFAULT NULL,
  `last_contact` timestamp NULL DEFAULT NULL,
  `next_follow_up` date DEFAULT NULL,
  `converted_at` timestamp NULL DEFAULT NULL,
  `sales_disposition_id` varchar(36) DEFAULT NULL,
  `agent` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `client_name`, `email_address`, `contact_number`, `city_state`, `business_description`, `services_required`, `budget`, `additional_info`, `user_id`, `created_at`, `updated_at`, `date`, `status`, `source`, `price`, `priority`, `lead_score`, `last_contact`, `next_follow_up`, `converted_at`, `sales_disposition_id`, `agent`) VALUES
('00036e27-dddb-4e7d-86a7-47f55dff3849', 'Gary', '', NULL, 'Kissimmee, FL, 34744', NULL, 'Web Design ', 'Less than $500', 'A website for writers. The concept: Visitors view the beginning of a story. From that story they may click on a character’s name and it will allow them to continue that character’s story in any genre they choose.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('00083c33-212b-4233-9251-f09e6704fcba', 'Justin', 'cmo.nootropiq@gmail.com', '(561) 6033752', 'Orlando, FL, 32826', NULL, 'Logo Design', NULL, 'Advertising, Marketing/PR agencies, Web Design', NULL, '2025-08-27 23:38:03', '2025-09-05 19:25:07', '2025-03-17', 'converted', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('00314f02-73ae-4e80-9734-a9ad148cb1c5', 'Bryce', 'brycebrand01@gmail.com', '(517) 993-4331', 'Atlanta, GA, 30318', 'Barbar and social media app', 'Mobile Software Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('00721e5e-6a77-4421-9175-9a879de72dfe', 'Julia', 'juliaadams67@hotmail.com', '(229) 319-0835', 'Pelham, Georgia', NULL, 'Web Design ', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0098a6d7-95b8-4176-84ab-ebc19a0f72a7', 'Chandler', 'chandlerjwilliams@icloud.com', '(903) 221-3020', 'Jacksonville, TX, 75766 ', 'hoodie website', 'Web Development', '$500 - $999', 'hoodie website ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('012ecf08-cc80-4135-ba72-95c7f0ea5242', 'Kelsey', 'kelseysjolund@gmail.com', '(732) 841-3291', 'New York, NY, 10005', NULL, 'Web Design', 'Less than $500', 'Pediatric speech language pathologist that offers home based therapy sessions for children Created a website already but just got a new logo, website not finished or functional, I think I made it on wix and I’m paying for random website subscriptions I’m confused about Just looking for a very cute, holistic inviting website that captures my passion for helping families and children in a unique way. Important that it is correctly connected to my LinkedIn and google so I can get more google reviews from clients. I use simple practice EHR Website is Kozycornerspeech.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('01a0daf8-d10b-4510-9b54-ea73b9e1cd85', 'Kristin', 'Kristin@lemasterelectric.com ', ' (206) 914-1261', 'Marysville, WA, 98270', 'Electrical Contractor', 'Website Revamp', '$500 - $999', 'I\'m looking to build out a website that outlines our full suite of residential and commercial services. I want to also enhance our SEO. Our current website and SEO is not serving us well.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('02687208-3937-4b20-a6c2-c94361641d3a', 'Hayden', 'stevendibella@bellair.net', '7045626940', 'Charlotte, NC, 28269', 'stevendibella@bellair.net', 'Web Design ', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('02b3f892-187f-4862-8585-22835daff405', 'Robert', 'rwrice7782@yahoo.com', '(786) 626-0423', 'Fort Lauderdale, FL, 33304', 'Mobile Mechanic', 'Web Design', 'More than $5000', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('02eac82b-0b4e-475a-a60e-c59126a92f69', 'Donald', '', '502-416-8429', 'Louisville, KY, 40243', ' Advanced contractors', 'Web Design', '$1,000 - $1,999', 'Company name is Advanced contractors services, We specialize in multi-family renovations also senior living facilities and commercial build outs. Main reason for the website is basically to add a digital footprint to let people know about us and our services.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('034e85b3-be11-4166-9703-04fcdd20397d', 'Noelle', 'nlindgren003@gmail.com', '(508) 801-2319', 'Durham, NH, 03824', NULL, 'Web Design', '$500 - $999', 'Research', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('03cb22b6-d9d1-4770-b956-50f902116782', 'Kavita Patel', 'kavitap@gmail.com', '(321) 693-4209 / (321) 759-4752', 'Nutley, NJ, 07110', 'Health & fitness', 'Web Design', 'Less than $500', 'I operate in Health & fitness', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('03f9c50f-136e-44a5-b4f0-5cf2646e0d43', 'Harold', 'hnoeller@islandinsun.com ', '(727) 744-3181 / (727) 523-1810', 'Largo, FL, 33771', 'Real estate', 'Major changes', '', 'islandinsun.com ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('03fad0f4-83c2-4bbf-b710-fbf95526b2ef', 'Lawrence', 'johnnymlawrence206@gmail.com', '(959) 221-5949', 'East Hartford, CT, 06108', NULL, 'Web Design', '$500 - $999\r', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('04224c81-a11e-49e1-8474-59cd5ad464d1', 'Sasha Daucus', 'sasha.goldenlight@gmail.com', '(573) 996-3339', 'Doniphan, MO, 63935', 'susanacruzdesign.com', 'Web Design', '$500 - $999', 'Create a new website. I\'m a professional herbalist and educator with years of experience, a large archive of written materials and organized photos, and am now looking to expand my minimal online presence. I\'ve started teaching apprenticeships and want to make my materials more accessible, including republishing my local newspaper articles in a blog format for my Facebook audience. I have basic skills in HTML, WordPress, and some experience with Squarespace and my main business contact is currently through Facebook.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('04a0f7ff-4780-43c1-8a37-fa25e6739e27', 'Angeliana', 'angelinatran131@yahoo.com', '(503) 422-2113', 'Troutdale, OR, 97060', 'Dating site', 'Web Design', '$1,000 - $1,999', 'Advertising my personal dating\r', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('04e2d7b2-8aa2-4068-bfc7-b45215c3777b', 'Anthony', 'tcmancinos@yahoo.com', '231-943-4844 /  (231) 933-4544', 'Traverse City, MI, 49685', 'Restaurant', 'Mobile Software Development', 'No - I need guidance from the pro', 'We have an I Phone app and we had an app on android phones but the app must have expired and now it is gone. I Phone updated our app for another year but would not update our app on Android phones. They said we had to do it. I have no clue how to do this. Help!', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('04fbae4b-bafd-4113-98b6-e90122657e91', 'Allison', 'iiamsmyra@gmail.com', NULL, 'Clementon, NJ, 08021', NULL, 'Logo Design', NULL, 'https://www.tiktok.com/@sumgirlnamedsmyra', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('06ef4d55-b992-4261-bd93-aaa93bc77105', 'Joe', 'advancedmower.rs@gmail.com', '607 218 7070', NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('07698b34-917b-4b40-bd73-c8b7fde4f14d', 'Kamaal', 'handsfreetransportation@gmail.com', '209-328-6283', 'Stockton, CA', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('08e21388-fd73-4e77-8ce5-a728743a5e09', 'Todd', 'todd@proimagesign.com', '(216) 403-7727', NULL, 'https://www.proimagesign.com/', 'Graphic Design', NULL, 'We\'re a local sign company with overflow artwork for signs, banners, architecture,etc.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('09740508-008c-40b2-891c-23f31353ca78', 'Phyllis Tolan ', '', '423 740 2402', 'Cleveland, TN, 37312', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0a07d5b2-4b6c-4f84-bb00-2a10e91dfe08', 'Mark', 'matthew10fisherman@hotmail.com ', '(863) 399-1029', 'Valdese, NC, 28690', 'Logo + Website', 'Logo Design', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0ae045e8-cf2b-4f4e-a823-ecd599486bf2', 'Debbie', 'debbie@home2healdist.com', '(330) 284-9156', 'Canton, OH, 44718', NULL, 'Web Design', '$1,000 - $1,999', 'we would like to develop an ecommerce site', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-31', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0ae295d2-130d-4a6f-b30a-def47a8d7ee8', 'Carnes', 'carnes.lord@gmail.com', '401) 849-4089', 'Lorton, VA, 22079', 'Retired academic ', 'Web Design ', ' $2,000 - $2,999', 'Create a new website for Retired academic seeking to make publications, cv, etc. easily available. Not selling anything. Low base of computer skills.\n\n[CONVERTED TO CUSTOMER]\nSale Date: 2025-07-18\nService: Web Design\nValue: $2,000', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 2000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0af46181-9fd6-4ad8-9f53-6fe4d8791f78', 'Crystal', 'crystal.richardson29@gmail.com', '(978) 325-7131', 'Lake Wales, FL', 'Home Services', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0b094ed2-dd0f-4c28-a96e-d6e518276e3c', 'Mandy', 'mandybickerton76@gmail.com ', '(610) 742-6977 ', 'Hague, VA, 22469', 'howling wolf transportation', 'Web Design', 'Less than $500', 'We are the howling wolf transportation we transport cars motorcycle boats atv dirt bike side by sides and furniture', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0b8cf508-249d-49a2-97de-62841c60b652', 'Breen', 'breensmith1959@gmail.com', '(919) 921-1745', 'Goldsboro, NC, 27534', 'Storage', 'Marketing Agencies', '$250 - $499', 'SEO , I want to show up on a google search \"Storage in Goldsboro\" or Storage near Goldsboro and on voice search for Toad Suck Mini Storage', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0bf7b8dc-2a4b-47b5-8a23-990e3e0dfc94', 'Selima', 'sshulerjenkins@gmail.com', '(215) 768-5394 / (267) 296-5580', 'Philadelphia, PA, 19143', NULL, 'Web Design ', '$2,000 - $2,999', 'Create a new website for Health & fitness. Doula website, merchandise, and reading materials available.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0d5b95b5-90da-47ad-95bd-44bc4302c179', 'Caterina', 'caterina@desertwaters.com', '7194295331', 'Florence, CO', NULL, 'Graphic Design', NULL, 'I need a graphics designer to create graphics for a monthly newsletter/magazine. A sample is attached. I also need flyers to be created or revised monthly. Hourly fees as an independent contractor/freelancer.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0e53b7cc-0453-40be-af50-36b04f610eef', 'Justin Harnick', 'jharnick@ft.newyorklife.com', '516-660-6504', 'Nashville, TN', 'Financial Advisor', 'Marketing Agencies', NULL, 'I’m a financial advisor and pretty successful, but since I’m early in my career, I’m in need of new names and cases. I’ve learned I’m pretty bad at anything cold calling, and I don’t have much of a warm market. Like I said, I’ve done well for myself considering I don’t have a warm market and am top in my class. I’ve gotten clients pretty randomly and from working with a senior agent. I’m wondering...the main thing I’m good at at what I do, is when I’m able to explain what I do. I’m very good at articulating and giving value and telling people how they could benefit from what I do. I’m terrible at business canvassing and cold calling. I’m thinking I need to come up with a full marketing strategy involving what Chat GPT told me to do, while staying within compliance. Because I’m still not allowed to broker out, there are more restrictions. And there are more restrictions since I’m year 1. This is what Chat GPT suggested, I’m not saying if it’s right or wrong: ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0e9a7092-d5ed-47d4-8b6a-7ce8de0c3e8c', 'Myra Russell', 'buxodyxut@mailinator.com', '(262) 344-3705', 'Modi exercitation hi', 'Nelson and Lucas Associates', 'Commodo deserunt iru', 'Quia consequatur au', 'Dolorum dolor rerum ', '705ede64-e466-4359-9b7a-e65c2b8debef', '2025-04-18 16:42:29', '2025-08-18 14:57:50', '2025-04-04', 'new', 'LinkedIn', 62.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0f2052c7-c6fa-47bf-b45d-91689d0a56a7', 'Charmayne', 'charmayne@bathnut.com', '(240) 274-1439', 'Bowie, MD, 20716', NULL, 'Web Design', '$1,000 - $1,999', 'New Shopify website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('0fe555e1-3b83-4590-ae1c-f880735df1ad', 'Steve', 'Ltransit5608@yahoo.com', '(248) 860-3292', 'Rochester, MI, 48309', 'Non emergency medical transportation', 'Web Design', '$500 - $999', 'Monday', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('104a5483-79b1-4158-bf48-7495cc19c3fc', 'Rongeo', 'rjackson7383@gmail.com', '(601) 595-0235', 'Meridian, MS, 39301 (Nationwide)', 'credit score approvals and lease', 'Web Design', '$1,000 - $1,999', 'Looking for a webpage that will catch customers attention. Would like to introduce our low credit score approvals and lease to own programs', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('104ed258-b9a6-4c7e-8de0-14352b95b51e', 'Testing', 'test@test.com', '1234567890', 'New Haven, IN, 46774', 'testing', NULL, '2000', NULL, 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', '2025-08-28 16:51:59', '2025-08-29 17:19:02', '2025-08-28', 'converted', 'Referral', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('105291a5-a76d-43b8-bd51-082580555fd1', 'Derek', 'dgatling25@gmail.com', '(609) 332-1057', 'West New York, NJ, 07093', NULL, 'Mobile Software Development', 'No - I need guidance from the pro', 'I have an idea of this app called eventure to Tickets to local minor league or community sports games (e.g., soccer, baseball, roller derby) • Invites to pop-up fitness classes (yoga in the park, boot camps, etc.) • Entry to lifestyle events (breweries, food tastings, art walks) • Perks like free drinks, early entry, or “member-only” lounges • App or website to manage bookings, RSVP to events, and discover new experiences', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('10945378-bdd2-4b65-8936-4f0fb245cb7e', 'Eric hawkins', '', NULL, 'Kutztown, PA, 19530', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('10b5ac73-e139-42e4-963f-c3567a5aee1a', 'Monica', '', NULL, 'Orange, CA, 92863 ', 'Book Selling', 'Web Design', '$500 - $999', 'I want to start out mainly doing a page where public can find me; eventually want to sell a book on this site; also want a scrolling live front page (if you think is good idea) to show free pdf downloads - want to do about 60 downloads for free', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('111c3f34-6d38-4ad0-810b-8351bcf13663', 'Blanc', 'blancjuno@yahoo.com ', '(305) 305-2128 ', 'Fort Lauderdale, FL, 33319 ', 'Website Revamp', 'Web Design', '$1,000 - $1,999', 'Revamping a website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('114108da-cb04-4e72-924d-e7cb05d88790', 'Jim', 'jimparish64@gmail.com', '(737) 346-7067', 'Denver, CO, 80237', NULL, 'Mobile Software Development', 'No - I need guidance from the pro', 'I would like to build a customer data base for contractors to rate customers based on there experience.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('11a0450b-6361-467e-896c-dcfd176d00f9', 'Nichole ', 'nicholeliles232@gmail.com', '(573) 281-1266', 'Qulin, MO, 63961', 'Creative industries / Wood wrok', 'Web Design', '$500 - $999', 'I want to create a website to showcase my woodworking signs and t-shirts and be able to link the website to other streams', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1287dd6f-b787-4981-9044-bc4e965f35c1', 'Todd  ', 'toddambrose@hotmail.com ', '(970) 404-1424', 'Glenwood Springs, CO, 81601', NULL, 'A new website & Social media integration.', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('132489b4-8820-45a0-8e7c-4ffda1963a02', 'Shannon', 'shannon@thedammannteam.com', '(404) 377-9000', 'Decatur, GA', 'https://thedammannteam.com/', 'Web Design', '500-999', 'Updates to word press website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1382e323-976b-4ff5-8e17-63af0199efbb', 'Lisa', 'lfiniki@aol.com', '(716) 444-8979', 'Buffalo, NY, 14228 ', NULL, 'Web Design', 'Less than $500', 'Website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('13fc0d5e-e938-4b1c-aa31-138cfb094866', 'Miranda', 'mprice@simplifyhr.us', '(951) 855-3545', 'Anaheim, CA, 92804', NULL, NULL, NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('14e28dbb-0c55-406e-8b1c-eea957942a90', 'Courtney', 'cnichols@exovitality.net', '4048219687', 'Atlanta, GA, 30328', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1514b908-9892-4f10-ad37-6a1df5ecb3d3', 'Donna', 'burnettdonna0@gmail.com', '(903) 486-8829', 'Bonham, TX, 75418', 'Creative industries', 'Web Design ', 'Less than $500', '', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('151a6a23-91e6-45c0-a941-445873c56f60', 'Pamela', 'pamelaevans56@gmail.com', '(720) 244-5257', 'Boulder, CO, 80305', 'Health & fitness', 'Web Design', '$3,000 - $4,999', 'The website is up but is not interactive and needs to have a major overall., including deleting and adding test, add and subtract pictures etc', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('15b0c86f-cf45-426a-8580-5c97799aae64', 'Shauna', 'shaunabeach@shaunabeach.com', '(713) 331-9955 / 7132542386 /  (281) 772-6588', 'Houston, TX, 77056', NULL, 'Major changes', '$1,000 - $1,999', 'https://www.shaunabeach.com Major changes to my website it was built on Wix', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('15d42309-c784-4e65-8948-17c2711c239d', 'Kc Wright', 'x@seektexas.com', '(682) 367-8568', 'Fort Worth, TX, 76114', 'website tweak', 'web design', '$1000-$2000', 'We have a single book that we sell on our website through Shopify. Our website is up and running and we are happy. However, we require some minor updates asap. Then we need within 4 weeks a registration process for our book. The book will have a unique identification number and will need to be registered. The website is www.seektexas.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('162f741b-98ea-4032-97a1-8a0fed90abcc', 'Aimée', 'acarr@voodoomakeup.com', '(504) 756-4500', 'Katy, TX, 77494 ', 'Cosmetic Shopify STore Changes', 'Web Design', '$500 - $999 ', 'Layering cosmetics updating site', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('169b1805-ddc1-49a6-8ce4-c24a732e0a08', 'Kay', '', NULL, ' Spring, TX, 77379', NULL, 'Marketing Agencies ', '$1,000 - $2,499', 'need word press website built', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('187799d4-a860-4c67-a936-1b79a236d8d9', 'Paul', 'paul@pandjrecords.com', '9852326575', 'Houma, LA, 70364 (Nationwide)', NULL, 'Web Design', '1000-1999', 'I need a website built which is both informative and provides e-commerce. We area small recording company - P&J Records and do no have a huge working budget for this. I already have a rough format for the site, including points for links. There will be a number of graphics. I grow weary of hearing from scam companies or those with sky-high prices. In my company, I believe in an honest dollar for an honest day\'s work, and I seek a firm with the same philosophy. Many photos will be used. We can discuss this when you reply. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('18ba045a-b40c-4958-9472-6a71191b0e8e', 'April Quicksey', '', NULL, 'Pinson, AL, 35126', 'Real estate', 'Web Design', '$1,000 - $1,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('19cbfa98-6c24-41d4-95c5-98f3c4e2ef0d', 'Erin', 'addison.usufruct@gmail.com , addisonusufruct@gmail.com', '5205088455', 'Tucson, AZ, 85701 (Nationwide)', NULL, 'Web Design', '1000-1999', 'I am a landscape architect and writer, marketing my first novel. Agents tell me that I need a website that introduces me, my career, and links to my published work. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1a0db46e-155f-4d9d-a540-4d27e827d8ef', 'Ryan', ' thefirehousefinish@gmail.com', '630-740-4533  ', 'Naperville, IL, 60565', NULL, 'Graphic Design', 'Less than $1,000', 'Graphic design, I need some reworking, creative direction and revisions. As well as format to a door hanger or smaller post card.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1b77b361-8ad4-4638-899f-77e47794aed7', 'Benjamin', 'Bderobles18@gmail.com', '(909) 407-4434 ', 'Colton, CA, 92324', NULL, 'Web Design\r', '$500 - $999', 'Retail & E-commerce', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-10', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1bc6afbb-fb37-4c3a-ad86-e7035e8510f7', 'Brent', 'AirKingsheatandair@gmail.com', '501-365-1167', 'Drasco, AR', 'HVAC', 'SEO', 'Less than $500', 'Very small and just starting out. Looking to increase sales. Creating more leads for HVAC and refrigeration. Commercial and some residential', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1c0bd258-ff47-4e68-9638-5b5dcf3aa572', 'Lydia', 'lydiamaye8@gmail.com', '(615) 972-9144', 'Avondale Estates, GA, 30002', NULL, 'Web Design', 'Less than $500', 'I’m looking to create a website for bookings for my braiding services for people', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1c94e804-b70d-4c07-ab0f-bf78003b7f7a', 'Kimberly', 'seymorelaw7@gmail.com', '(770) 876-5702', ' Lawrenceville, Georgia', NULL, 'Web Design', '$500 - $999', 'I need 100% assistance with building the website because I know nothing about coding or the mechanics of building a website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1db51345-6221-4aca-8a74-0e9d360e815e', 'Christopher', 'ckoehler61@hotmail.com', '(937) 572-1912', 'Sumter, SC, 29150', NULL, 'Web Development', '$1,000 - $2,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1e3faa53-7724-4fe8-b955-448a76431f5b', 'Jeyla', 'Jeyladilbert27@gmail.com', '(414) 238-3031', 'Milwaukee, WI', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1e9b565c-1437-4839-b4cb-0748c2015903', 'Howard', 'howardruffin74@gmail.com', '(936) 207-5453', 'Conroe, TX, 77306', 'Home services', 'Web Design ', '$500 - $999', 'Looking for outside work , mowing lawns and car washes', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1ea397bf-e521-4bdf-a2aa-f8dab394d933', 'Zachary', 'Zackoonge@gmail.com', '(940) 435-8054', 'Arlington, TX, 76013', NULL, 'Mobile Software Development', 'No - I need guidance from the pro', 'Create an app with uber capabilities', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1fa2d7df-13c1-454e-8508-22ca8e6d7271', 'Tiffany', 'paradisepetjets@gmail.com', '9039177004', 'Springfield, MO, 65802', NULL, 'Web Design', '$1,000 - $1,999', 'A bidding website to compete with citizenshipper', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('1fe34dec-3c27-4472-9735-d11d79e101c4', 'Brendan', 'bbelott20@gmail.com', '(518) 813-3914', 'Clifton Park, NY, 12065', 'Business services', 'Web Design', '$500 - $999', 'Let me help you grow your business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('200d3813-6aae-41fc-8688-d26f3162a0d7', 'Joni', 'bestill@maine.rr.com', '(207) 773-3599 / (207) 482-0540 ', 'South Portland, ME, 04106', 'Coaching/psychotherapy', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('201f62af-cef1-4776-be35-decfd65646d2', 'Benito', 'benicp21@gmail.com', '(630) 618-1066', 'Chicago, Illinois (Nationwide)', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('204e208e-2810-4f9b-9cb0-827dd8be71d1', 'Chrsitina', 'crazyrosebud_72305@hotmail.com', '(970) 402-7163', 'Bellvue, CO, 80512', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('20e11d22-2e12-47f8-be24-cdc7fca7f1ce', 'Nadia', 'Missnadiamaria@gmail.com', '516-388-4711', 'Rockville Centre, NY', 'Waxing', 'Web Design', NULL, 'I need a graphic illustrator for a full body waxing business and I need help with graphics on my website I just got redone.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2104f950-a58f-44b5-af46-5ed728cdd5f9', 'David', 'dave@bhsp.co', '(804) 426-2413', 'Richmond VA, 23222', NULL, 'Web Design', 'Less than $500', 'I currently have a poorly designed website on WIX. My other company website GoDaddy based. The site I need worked on is Shockoevalleypictureframing', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('21543068-706e-4018-8764-48be9797c5db', 'Jackson', 'ziggybeard6403@gmail.com', '(919) 720-1544', 'Raleigh, NC, 27614', 'Web Design', 'Web Design ', 'Less than $500', 'My friend and me', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('21d89364-3a3f-4f6e-b72b-979fdb0019f3', 'Japerrione', 'japerrione@gmail.com', '(585) 673-5793', 'Rochester, NY, 14621', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('22159d28-d981-4b29-a69c-b37dab24e637', 'Renee', 'hamlett.renee@yahoo.com', '(804) 309-6893', 'Richmond, VA, 23236 ', NULL, 'Web Design', '$1,000 - $1,999', 'This is something that’s very special to me & I really want a nice eye catcher website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('22bdb26b-3ff6-48a2-be8e-d9bbd41df78e', 'Philip', 'philipc@ghsound.com', '(608) 217-8085', 'Fremont, CA, 94536', NULL, 'Web Design', 'Web Design', 'create a website. thanks', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('23955b2a-84db-40c1-8a07-fa29652e9e8e', 'Albert', '', NULL, 'Riverside, CT, 06878', 'Esays into a book', 'Book ', NULL, 'I have about 100 pages of essays short stories and news articles which I’d like to put into a single book. There are several different headings, all of which are listed in my blog. I’d like the whole blog converted to hardcopy.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('245c8e88-d53a-42fc-9be7-a9fd2d4c3b0e', 'Leah', 'leah.edge33@gmail.com', '(419) 345-9313', 'Perrysburg, OH, 43551', NULL, 'Web Design', 'Less than $500', 'I’m going to make a clothing brand.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('24e30ca1-8d9c-4ed0-92e0-1964fd8a98b1', 'Nadgelyn', 'nadge_ragas@yahoo.com', '(571) 332-1765', 'Chantilly, VA, 20152', NULL, 'Logo design, Social Media Marketing, Web Design', NULL, ' I wanna see 2 designs', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2575b18b-7fbe-4e90-8c4e-4560af4092c2', 'Jennifer', '', NULL, 'Minneapolis, MN, 55430', NULL, 'Web Design', 'Under $1,000', 'Info: Create a new website for Home services. I\'d like to stay under $1,000 if possible.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('25e9c56e-1b53-4a10-8b93-7255aa7d6301', 'Michael', '', NULL, 'Oakdale, NY, 11769', 'Construction', 'Web Design', '$500 - $999', 'I’m looking to create a website for my construction business. Something that is welcoming and gets people excited to do business with me and my team.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('266b1348-69ce-4a56-abfa-15d32a63af79', 'Kieran', 'denningkieran@gmail.com', '(716) 290-2450', 'Lancaster, NY, 14086', NULL, 'Web Design', '$500 - $999', 'I want to make a fishing website to sell stuff', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('269e3afe-4628-445b-9361-a9874bdb8d59', 'Joaquim', 'levyjoaquim0811@gmail.com', '(310) 980-9888', 'Miami, FL, 33180', NULL, 'Web Development', NULL, 'I want to sell pokemon cards', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('27a4b1f8-8523-4ac7-890f-bb705daae9d5', 'Avery', 'petersavery021@gmail.com', '(470) 556-3199', 'Lawrenceville, GA, 30045', NULL, 'Web Design', '$1,000 - $1,999', 'I’m selling Lulu lemon', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('27b638dd-f2b5-4434-841d-2584b02678c1', 'Brian', '', '\n', 'Bondurant, IA', NULL, 'Web Design', NULL, 'Create a new webiste for my business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('292caf56-4c81-4a5c-8028-396e0343f967', 'Wilson ', 'wilson.muraga@gmail.com ', '6176059610', 'Woburn, MA, 01801', 'Transportation Website', '', '$3,000 - $4,999', 'We provide transportation services almost exclusively to the State of Massachusetts. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('299d04a1-36d0-4bf0-af42-21ffc42f71df', 'Johnathan', 'brandonteague101422@gmail.com', '(662) 297-2725', 'Grenada, MS, 38901', 'Entertainment & events', 'Create a new website', NULL, 'I’m trying to create a website to market my music and merchandise', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('29f7a5b5-1a29-4d19-8ec5-653ce3ece272', 'Mike', 'nocokenpo@gmail.com', '(970) 988-5829', 'Loveland, CO, 80538 ', 'Web Design', 'Web Design', '$500 - $999', ' Looking for a website that supports individuals to be able to sign for online (via zoom) or private in-person Kenpo Karate Martial Arts classes', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2af54f54-e82a-4b7a-b085-b575b58b8718', 'Kendall', '', NULL, 'Houston, TX, 77008', NULL, 'Web Design', 'Less than $500', 'I have started a mobile massage business. I would like a website featuring photos, a pricelist and a way to book appointments. Something simple and straight to the point.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2b16c259-a610-42b1-9249-3046acbdefc2', 'Dale', 'dale66@deepsixspecialists.com', '(330) 724-8737 / (330) 864-8556', 'Akron, OH, 44301', 'Scuba Diving', 'Web Changes and graphic design', '2000-3000', 'Advertising materials, Web/digital art for scuba diving.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2be6080b-43c8-4fa2-8e53-6828f576122f', 'Scott ', '', NULL, 'South Charleston, WV, 25309 ', 'Web Design', 'Web Design', '$500 - $999', 'Web site to sell email alerts to owner/operators when certain machines illuminate the \"Out -of-Service Light', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-28', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2c4521cd-e8c3-4ff0-9d45-bbcfa9778a71', 'Kellie', 'kelcam20212@outlook.com ', '(860) 265-5798', 'Southington, CT, 06489', 'Ministery Coaching website', 'Web Design  ', '$500 - $999', 'I need a website for coaching services both executive and life coaching', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2d002abb-2452-47d6-94de-8d97321f2e49', 'Shaw', 'nahomkobe@gmail.com', '(771) 201-0624', 'Washington, DC, 20016', NULL, 'Mobile Software Development', 'Kissimmee, FL, 34744', 'I have a website but I also want have an app for my delivery service company', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2d518f97-dc8f-4da3-8683-79065e2be983', 'Dylan', 'Traeheathcock@yahoo.com', '251-242-1773', 'State Line, MS', NULL, 'Graphic Design', NULL, 'I’m wanting to start a clothing brand named southern hillbilly outdoors. I want some designs made up so I can kick off my own business.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2d7877ea-654c-414d-95bc-2c4493b1d607', 'Brandon', 'konkreterodd@gmail.com', '(803) 915-1835', 'Columbia, SC, 29203', NULL, 'Mobile Software Development', 'Let\'s discuss', 'Application for website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2dbaf36e-d7d0-4b6e-ab3f-39146644d545', 'Jessica', 'jessica@cnyskincare.com', '315-477-1537', 'Syracuse, NY', 'Medspa', 'Mobile Software Development', NULL, 'I am looking to create an app for my clients and patients to utilize when booking an appointment, purhcasing giftcards, packages and memberships. Be able to view their consent and waiver forms.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2dd246ed-8137-4ad4-b596-8f0f0aa0c292', 'Andrea', 'Princessdorasoapco120@gmail.com', '(951) 214-3451', 'Moreno Valley, CA, 92553', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('2ebd1959-4734-4878-b2fe-c23273232de0', 'Amy', 'ajh50ks@yahoo.com', '(316) 641-0060', 'Wichita, KS, 67220', NULL, 'Web Design', 'less than $500', 'Animal Welfare', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('313dabb5-9bf7-4635-b35c-e04ca2f462e2', 'Dylan', 'mehrandylan@gmail.com', '(201) 270-8117', 'Alpine, NJ, 07620', 'Hair stylist', 'Web Design', 'Les than $1000', 'I want to make a haircut business called cutters.com but they will come to your house. When you get onto the website you will see the selective barbers on the website, but I want there to be on the top right corner to be three lines when you press the three lines it will say become a cutter and then they will need to sign up put in there phone number Gmail and password there will be a verification code and then they will need to take a photo of there license by the way the people better have reviews and stars. After they took a photo of there barber license there will need to a check list of things you need like a floor mat and a foldable chair a razor set and stuff like that that a barber needs or shall I say a cutter', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('31bb8b4e-184b-4b09-97cc-8ad8c595fac2', 'Jodi', 'sasszkats@gmail.com', '530-282-0851', 'Dunsmuir, CA, 96025', 'sasszkats.com/contact', 'Major changes', 'As low as possible ... Simple design', 'Major changes to my website it was built on Wordpress I operate in Cattery I have a website I created about 8 years ago ... I need to get it updated where it looks and runs better. Its a bit outdated and I would do it myself but would like to see what a professional could do.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('31df5113-ef77-4621-b056-2765e18584d7', 'Meghan', 'mail@last-hope.org', '651-463-8747', 'Farmington, MN', NULL, 'Web Design', ' 2000-2999', 'I run a nonprofit animal rescue and were looking to create a new website that is user friendly.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('321511fa-4c98-4af4-bfde-84c992c6648f', 'Sharon', 'sharonksmith1466@yahoo.com', '(252) 286-7525', 'Goldsboro, NC, 27534', NULL, 'Web Design ', ' $500 - $999', 'Create a new website To advertise my business/services, To sell products/services e.g. e-commerce', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('32a07b16-25fc-4456-adbb-9c7d9345858b', 'Etienne', 'Etienne@mytworks.com', '212-337-3789', 'Brooklyn, NY, 11232', 'Professional Camera Motion Equipment', 'Minor changes', '$1,000 - $1,999', 'Minor changes to my WordPress website. We would like a we designer who can handle regular updates and suggestions to our website for graphics, animations and information to be added as well as improving the navigation', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('32bca488-7c64-48da-81df-a74979736970', 'Emerson', 'emerson.isaac2012@gmail.com  ', '(346) 605-7225', 'Houston, TX, 77091 ', 'Web Design', 'Web Design', 'less than $500', 'Paint', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('339a6eb6-4d88-422c-b5e5-45e0bd68a347', 'Austin', ' ', '(541) 799-5529', 'Eugene, OR, 97404', NULL, 'Mobile Software Development', NULL, 'I am wanting to see what it would cost to create a high quality construction management application software.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('33c4e178-b930-49f6-8feb-97201dcbee85', 'Leon ', '', NULL, 'San Francisco, CA', 'Graphic Design', 'Graphic Design', 'Less than $1,000', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('33d29558-a067-4c8e-a637-a3e5e11fd5ff', 'Jeffery', 'alkhimia1@gmail.com', '(910) 527-8025', ' Fayetteville, NC, 28314', NULL, 'Mobile Software Development', NULL, 'I need a website with user authentication and profile with three different tiers; website must be connected to a database to receive texts and words; it must have support for Unicode (multiple languages), text to speech and speech recognition, forum, text and video chat, and mobile compatibility. More details after first contact.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('340741f6-522d-4297-a149-bb45f12bedab', 'Ashley', 'sthashley79@gmail.com  ', '(786) 851-2398', 'Miami, FL, 33136', 'Ecommerce store', 'Web Design', '500', 'More than 500 products', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3431a3da-ace8-455c-ad3f-87ac25922303', 'Jay ', 'jaimassageandspa@gmail.com ', '(443) 624-9496 ', 'Hollywood, MD, 20636', 'website As Massage and Spa', 'Web Design', '$500 - $999', 'Building a business website As Massage and Spa', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('346fb29d-c090-4aba-abe7-9dad450e8b2e', ' Darrell ', 'darrell.hugee1@gmail.com', '(803) 981-2766', 'Rock Hill, SC, 29730', 'Pressure Washing', 'Web Design', '$3,000 - $4,999 ', 'I\'m ready to hire now', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('348ab877-d0d4-43b0-850e-d2dcdeb405a2', 'Hailley', 'goodgirlhailey@icloud.com', '(205) 736-4550', 'Saint Paul, MN, ', 'Lash Business', 'Web Design', 'Less than $500', 'LASH business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('34eb236b-b7fd-4e52-8754-5da4a936079b', 'Loy', 'loyjjones@att.net', '(817) 371-0779', 'Denver, Colorado', 'Artist website', 'Web Design ', ' $1,000 - $1,999', 'This is for my son whom is a 24 year old actor and singer songwriter living in Denver', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('356fc68a-08c5-435c-8f58-ff114c127ae8', 'Linda', 'lindakkingsley@gmail.com', '(831) 261-2862', 'Monterey, CA, 93940', 'Creative Industry', 'Web Design', '$500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3589f66f-ab7b-45e9-b870-293d7fc5aa55', 'Don', 'chardonsdad1@hotmail.com', '(501) 249-8050', 'Benton, AR, 72015', 'Political', 'Web Design', '$500 - $999', 'Running for Mayor 2026 in Benton, AR', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('35aa3dac-5251-4b36-b311-e94a1ed22dff', 'Mari Mcdonough', 'mmarijanemcdonough@yahoo.com', '(508) 583-0368', 'East Bridgewater, MA, 02333', NULL, 'SEO', NULL, 'Generate content, Improve Google/Bing ranking, Improve my site structure, Promote my website, Technical SEO, Website audit', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('360ddc90-3e39-4d97-9a77-ea0154279ba6', 'Kenyatta', 'garnerkenyatta@ymail.com', '(929) 402-6891', 'Spring, TX, 77386', NULL, 'Web Development', 'Less than $1,000', 'Updates to an existing Online store website. I have a website ready to go I just want it to sell products and integrate my social media', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('369e6c83-5f01-4919-9068-f4b4dfeb7646', 'Justin', 'jmleipert50@gmail.com', '(267) 240-6225', 'Philadelphia, PA, 19152 ', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('36bc2cd2-d9b9-4c90-8eec-ad6973b2d63a', 'Ramone', 'Admin@queenphee.com', '(719) 465-4061', 'Colorado Springs, CO,', 'creative industries', 'web design', 'less than $500', 'Need a main landing page showing the artist , previous shows, and ways to contact for bookings, shows and consultations for Queen Phee Comedy. Also need second page which would be geared towards health and fitness for personal training and group training bookings for Pheenix Fitness LLC a subsidiary for Queen Phee Productions', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('37884368-26f1-496b-b547-3ff5c853e0b8', 'Fred', 'mrfredssupply@aol.com', '863-449-7647', 'Avon Park, FL', 'https://www.mrfredssupply.com/', NULL, 'Less than $500', 'please check out my web site for a tune up quote.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('37ce13cc-3d38-4235-9646-42cdb8dd0de8', 'Rozell', 'fittedmattress@gmail.com ', '(951) 283-3838 ', 'Riverside, CA, 92504 ', ' Major changes to my website', 'Web Design', '$1,000 - $1,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('38b02183-9d29-4893-9bca-919dcdef602b', 'Chloe', ' psadispatch2016@gmail.com', '(817) 879-9036', 'Arlington, TX, 76013', 'Mobile Software Development', 'Mobile Software Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3a06cef2-3c99-4d82-b645-3f40162773a4', 'Mason ', 'ashevillechainlink@gmail.com ', '(828) 275-2870 ', 'Asheville, NC, 28806', 'Chain Link Fence repair', 'Web Design', '$500 - $999', 'I’m striving to take my chain link repair/ installation service to new heights. I need SEO and ability for customers to find me online when they search for chain link fence install and repair in Asheville. I have been paying Angis/homeadvisor for leads for a couple years now and I want to increase my volume of business and cut out the “middleman “. I have included a website screenshot template I made myself recently as an experiment to see what I m capable of.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3ac75e4d-28c5-4f31-b9ef-31277fbba1a9', 'Nancy', '', NULL, 'Summerfield, NC, 27358', 'Pet Breeding', 'Web Design', NULL, 'My current company is very slow at getting my updates posted and losing customers for that reason.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-31', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown');
INSERT INTO `leads` (`id`, `client_name`, `email_address`, `contact_number`, `city_state`, `business_description`, `services_required`, `budget`, `additional_info`, `user_id`, `created_at`, `updated_at`, `date`, `status`, `source`, `price`, `priority`, `lead_score`, `last_contact`, `next_follow_up`, `converted_at`, `sales_disposition_id`, `agent`) VALUES
('3aec0e14-9335-4189-84be-85a31e34ae07', 'Michael', 'afterdarkproductions@live.com', '(714) 875-4761', 'Anaheim, CA, 92808', 'Entertainment & events', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3b6a3fac-5674-4940-8619-7cba136ee9f4', 'Mercy', 'mercy_fordjour@yahoo.com', '(571) 239-4764 ', 'Oswego, IL, 60543', NULL, 'Web Design', 'Let\'s discuss', 'Create a new website for  IT Consulting & Testing Center. I also offer bootcamp style training and mentorship. I would like a website built up that offer the ability for register for the course. I want multi page website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3c0b5bac-404e-461e-8883-d060a21a6cc6', 'Tracy Wynn', '', '714-202-7213', 'Laguna Niguel, CA', 'Doula Services', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3c516ec6-7d47-46d3-b621-bf90f6b1e05f', 'Anitrell', 'anitrellsmith@gmail.com', '(864) 425-2518', 'Gaffney, SC, 29340', 'Restaurant/food', 'Web Design', 'Less than $500', 'Restaurant/food', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-31', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3caec0fd-9072-40d9-972b-582333e422a7', 'Tania', '', NULL, 'Farmington, MI', 'Logistics', 'Web Design', 'TBD', 'Need an interactive website built with vibrant colors', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3d2b6800-0390-4fa4-9568-6cf67cb2e131', 'Darryl', 'dhenleydbh@gmail.com ', '(305) 575-9514 ', 'Miami, FL, 33170 ', 'Web Design ', 'Web Design  ', 'Less than $500', 'Security Guard Company', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3e13d12d-f0fc-4425-8b27-3fc17a2a09c3', 'Briana', 'cheyennesoloman92@gmail.com', '(256) 503-9246', 'Huntsville, AL, 35801', NULL, 'Web Design', 'Less than $500', 'I was photos of my work a list of the services I provided photos of options for their needs for custom epoxy flooring. A place for them to tell me how big their space is. Possibly a way for them to view the different options in their own space and a contact info form they can submit to request an estimate', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3e2277a4-34d3-4467-9fe6-1cb84a209376', 'Minnette', 'Minimontessoriacademy@gmail.com', '(858)-751-9116', 'Philadelphia, PA', 'Montessori Learning', 'Web Design', '$3,000 - $4,999', 'Montessori early learning program that uses the Montessori currulum to enhance children learning and engage parents in support their child future. Our job is to build life-long learners', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3e5de0ad-3313-4def-94a1-2b6a9d9a8881', 'Jeanne', 'tywardmusic@gmail.com', '(718) 809-1234', 'Brooklyn, NY, 11209', 'Marketing for Childern books', ' ', '$250 - $499 ', 'We are looking for a social media manager for 5 childrens books', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3eb0b2dd-2624-4640-9f33-9871c01b4ab9', 'Sandra', 'sandagon1@yahoo.com', '(503) 233-9355', 'West Linn, OR, 97068', 'Pacific', NULL, 'Less than $500', 'My website is through Network Solutions. I can’t figure out how to modify content. In Wordpress. My Web designer no longer around', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3ed971ca-67bc-405a-befa-a928f76c6df7', 'Jorene', '', NULL, 'Jamaica, New York', NULL, 'Logo Design', NULL, 'Advertising, Marketing/PR agencies, Pay per click (PPC), Search Engine Optimization (SEO), Social Media Marketing, Software & app development, Web Design', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3f03828e-d5d2-44a1-af57-011c105a381b', 'Khaled ', 'tworldmd@gmail.com', '(571) 353-8213', 'Seattle, WA, 98188', 'Transport', 'Web Design', 'Less than $500', 'I need a website for my limo service company', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('3f95a000-76b9-4e67-93e7-212c759d00c8', 'Frank', 'cappart@msn.com', '(301) 467-6004', 'Potomac, MD, 20854', 'https://cappart.tripod.com/', 'Web Design', '500-999', 'I have an outdated page. Needs to be redone, or hosted elsewhere. [url hidden]', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('404cc90b-028e-4deb-a0a5-ae915d623841', '4 Leaf Photo Booth Team', ' 4leafphotobooth@gmail.com', '617-927-9978', 'Brighton, MA, 02135', 'Photography', 'Web Design', '$1,000 - $1,999', 'Photo Booth Company with SEO needs', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-10', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('40aaa286-6c06-4888-86f8-42d2914992cc', 'Sara', 'slebow@ccrny.com', '9179224192', 'New York, NY, 10065', NULL, 'Web Design', '$1,000 - $1,999', 'Health & fitness', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('415b50e0-753d-45d6-8742-af11cba7ee75', 'Travis', 'Travis@corepumping.com', '(803) 374-7429', 'Rock Hill, SC, 29730 ', 'Construction', 'Web Design', '$1,000 - $1,999', 'new construction compnany, we offer mobile concrete pumping services with affordable rates', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4199ebf6-645c-4217-96b8-29e0b55f1056', 'Alex', ' agr.generalservices@gmail.com', '617-470-1873  ', 'Fitchburg, MA, 01420', 'Capintaria', 'Web Design ', '$5,000 or more', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('42b74cfc-2d0a-46c4-957b-a30be082a296', 'Larissa', '', NULL, 'Cheektowaga, New York', NULL, 'Web Design', 'Less than $500', 'Planning to sell books that I write through Amazon but would like to look professional by having a website with the established business name. Just starting out and need something simple yet professional looking. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4348034a-df3b-4b1a-8d4d-e759b41f4dbe', 'Mark', 'mark_colton@icloud.com', '(734) 777-8980', 'Dearborn Heights, MI, 48125', NULL, 'Web Design ', NULL, 'custom t shirts and merchandise and resin art', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('47d63d51-31d6-431f-bbec-e31f04bf32e6', 'David', 'dmeyncke@cloughcapital.com', '(727) 480-2321', 'Tampa, FL, 33613', NULL, 'Graphic Design', NULL, 'Looking to upgrade our fact sheets and sales materials for CloughETFs.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('48680e49-cfeb-4ee4-884b-a96f2c466b80', 'Matt', 'mjmcvay@hotmail.com', '(410) 603-4058', 'Silverdale, WA, 98383 ', 'Saloon website', 'Web Design ', '$500-$999', 'Starting a salon in Bremerton and need to build site to market services offered, allow for booking and payments thank you', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('487f71fc-340c-4d65-bf34-7c3afe5e29e8', 'Grace', 'graceward4635@gmail.com', '(423) 813-6587', 'Chattanooga, TN, 37421', 'Luxury Bedding Company ', 'Web Design', ' $1,000 - $1,999', 'I’m building a luxury bedding company', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('48a47b44-fc0c-44be-b14a-a48981f5d24f', 'Valarie ', 'valariedeford@gmail.com', ' (636) 466-4679', 'Fenton, MO, ', 'Bakery ', 'web design', 'less than $500', 'I am a Micro bakery. I do a lot of pies and cakes. I do requests. I need to price my stuff and be able to post things for holidays. Give advice on baking. Request orders. I also need a logo update with my info. Picture posted.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('49477364-4360-4c4c-8767-a664ddf40037', 'Thomas', 'tomg1324@yahoo.com', '(646) 574-9249', 'Hazlet, NJ, 07730', 'Health & fitness', 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('49caf9f4-b065-441f-88c1-940f730a8c0b', 'Jon', 'jon_henderson@mac.com', '(303) 324-8988', 'Boulder, Colorado', 'Medical Devices', 'Social Media Marketing', '$2,500 - $4,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('49de11db-0926-43d7-8040-5f1f26566c41', 'T. Hisaw', 'thisaw_jam1@comcast.net', '(601) 953-6679 / (601) 517-9651 ', 'Clinton, MS, 39056', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4b0cf752-62ac-4e4d-83c6-460ea314da0e', 'Susanne', 'susannewthomas1@gmail.com', '(919) 491-4979', 'Christiansburg, VA, 24073', 'Fine Art', 'Web Design', '$500 - $999', 'I have sample websites that I\'d like to emulate.', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-04-17 11:55:25', '2025-08-18 14:57:50', '2025-03-03', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Ali Admin'),
('4b3a68cc-b2eb-4ad9-ae81-71f8b6680fbb', 'Michelle', 'Ramirezmichelle0330@gmail.com', '(972) 595-8062', 'Arlington, TX, 76010', 'Construction ', 'Advertising, Social Media Marketing', NULL, 'I just started my LLC, a construction company that has to do with hardscaping ,landscaping, and also carpeting work such as building decks, porches, fences, pergolas, etc. I am looking for ways to grow my company. What I need is help on getting my company out there to start getting in clients. I need professional advice and who I can hire to get me more leads in my work area.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4beaa77e-38d0-4e07-9ed4-762459c4a750', 'Kenyetta', 'klwilliams0322@gmail.com', '(631) 991-5079', 'Alpharetta, GA, 30022', 'Driving school', 'Web Design', 'Less than $500', 'I need advertisement, what the school offering , appointment scheduling and payment options on the website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4cb4a98c-ce48-4cf0-a42c-678ee59b3dc4', 'Cole', 'cole.crampton05@icloud.com', '(681) 200-6029', 'Vanceburg, KY, 41179', NULL, 'Web Design', '$500 - $999', 'help creating a website using wix and help teach me how to create the website.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4e2475a7-d020-4172-bf7e-b0aaca9e8710', 'David Carraway', 'dcarraway@ymail.com', '(941) 518-0550', 'Bradenton, FL, 34209', NULL, 'Web Design ', '$500 - $999', 'Create a new website for Carra Way Creations llc. Looking to quote a website with at least a main page an about us page and an online store. I already have a brand and color scheme. I make cutting/charcuterie boards, coasters, custom furniture and pieces, and also laser engrave.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4e7ca4a7-bb2a-4c04-bf58-a2d960a54403', 'Xaviera', 'xadybug@gmail.com', '(410) 490-1688', 'Greensboro, MD, 21639', NULL, 'Web Design', 'Less than $500', 'Create a new website for Startup home care company looking to design website to attract clients and employees.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('4ef27497-6c52-4727-81ed-0e013c76b128', 'Brad', 'bradly2558@yahoo.com', '(209) 485-8265', 'Turlock, CA, 95382', NULL, 'Web Development', NULL, 'Start up rental business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('503b9a6c-2fab-4a56-9717-c2b723ac5e74', 'Jonathan', 'jcraft@gowitness.net', '(662) 874-4934', 'Manor, TX, 78653', NULL, NULL, NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('50f9f300-d22e-4c3f-9f5d-cc776c77ca26', 'Zoey-Ann', 'henryzoeyann123@gmail.com', '(954) 758-3480', 'East Orange, NJ, 07018', NULL, 'Web Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('51263440-7079-4edf-90be-f477ed4d0fe5', 'Oak', 'cristobal345@gmail.com', '(678) 830-4612', 'Acworth, GA, 30102', NULL, 'Advertising', '$2,500 - $4,999', 'tree removal and more', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('520f0f92-9cf2-475d-8db4-567601b05b82', 'Ziongloria', 'ziongloria54@gmail.com', '(520) 709-5418   /(928) 415-0331', 'Kingsland, GA, 31548', 'Home services', 'Web Design', 'Less than $500', 'I work with individuals that come out of prison that come out of rehab centers and drug treatment facilities I also work with people who are on parole and probation I provide resources and housing for these individuals', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('523227a7-1ef0-4f51-894b-0eaedb27dd88', 'Shonnece', 'shonnece.robinson@bjc.org', '(314) 869-1363', 'Saint Louis, MO, 63121', NULL, 'Develop a new app', 'No - I need guidance from the pro', 'In-app advertising, Sponsorships, Subscription , I need guidance from the pro', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('52615d3b-6413-40a1-83cb-200b437e3ed0', 'Kelitia', 'kelitiadickson@gmail.com', '6624046854', 'Olive Branch, MS', NULL, 'Web Design', '$500 - $999', 'I need to launch a professional website for my business within a week or two.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('52630787-2f8a-4d79-9c4e-9bb8595b1c43', 'Celeste', 'celestemoore119@gmail.com', '(734) 292-7838', 'Inkster, MI, 48141', 'Health & fitness', 'Web Design', 'Less than $500', 'I’m starting a medical courier business and need a website that reflects that. I need all of the certifications received to be included, for it to be welcoming, and direct. Easy to use and follow.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('52a8c74c-17d2-4ca9-9794-e93d4077718e', 'Ilya', 'zamrika@hotmail.com', '(917) 838-1888', 'Putnam Valley, NY, 10579', 'Auto School', 'Web Design', '$1,000 - $1,999', 'BUILD on website Calendar schedule for classes', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('52b0676b-17cc-457d-a846-25dc77586fac', 'Hayk', 'haykboss@yahoo.Com', '(818) 480-2625 / 818-900-3782', 'Burbank, CA', NULL, 'Web Design', '500-999', 'I would like to sit down with some to explain what I need with the website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('52f9aadb-0460-4a8e-9a7f-e07b451d8f41', 'Kendra Quashie', 'kendra.quashie@yahoo.com', '9176673777', 'Brooklyn, NY, 11236', '', 'Web Design ', '$500 - $999', 'Create a new website for our Business services', NULL, '2025-08-27 23:38:03', '2025-08-18 15:07:12', '2025-04-04', 'converted', 'Google Search', 0.00, NULL, NULL, NULL, NULL, '2025-08-18 15:07:12', 'd676ab4f-eed3-4820-b5cb-86239c86daf0', 'Unknown'),
('53b5b816-e422-45a3-ac26-c8df8a28727c', 'Carlos', 'c.galanconsulting@gmail.com', '3057698001', 'Shepherdsville, KY, ', 'online meat store', 'Web Design', '$500 to $999', 'online meet store', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('53fbfe23-3d25-4865-a01d-0998b4f3cc99', 'Maria', 'bemestarvilasnovas@gmail.com ', '(774) 477-9499 ', 'Milford, MA, 01757 ', 'Whole Sale', 'Web Design', '$5,000 or more', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('545ec7b2-2aac-444b-9e51-9c2636b9306c', 'Korrigan', 'korrigancraddock@gmail.com', '17403340402', 'Hebron, OH', NULL, NULL, 'Less than $500', 'It is a portfolio for the articles I have wrote, photos I have taken and films I\'ve done ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('54db5143-440e-4181-9a5b-7ef8be0b9859', 'David', 'doncor69@gmail.com', '(786) 231-8468', 'Hialeah, FL, 33013', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('55931c3c-0308-4596-9c62-80c56b2138ae', 'Christopher', 'ckoehler61@hotmail.com', '(937) 572-1912', 'Sumter, SC, 29150', NULL, 'Web Development', '$1,000 - $2,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5631882b-55e3-49e0-97b4-6ea55a54302f', 'Madison', '1cor1313childcare@gmail.com', '(561) 339-7976', 'Orlando, FL, 32825', NULL, 'Web Design ', 'Less than $500', 'Babysitting by Christian teenagers. During School hours of course and all summer long\r', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('56b5d2b7-9b92-4c63-8226-9b00902f88e4', 'Christine', '', NULL, 'Twinsburg, OH, 44087', 'Restaurant Business', 'Major changes', 'Less than $500', ' Major changes to my Wix Website. It\'s for Restaurant Business. We have decided to reopen the business after 18 months of being closed. Greenbridge Teahouse will be using its established logo , will need redesign to website and issue monthly newsletter', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('57ce67c3-2c95-4ab8-84ac-cf4085c90455', 'Mason', 'masonarthur03@gmail.com', '(949) 992-8446', 'El Dorado Hills, CA, 95762', 'Creative industries', 'Web Design', 'Less than $500', 'The name is Lifestyle make the back round blue with Lifestyle fade-in into different color', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('57ea6c68-b1e0-4f2b-9d66-43640b815440', 'Steven', 'stevenkennedyrealtor@gmail.com', '(260) 336-5479 ', 'New Haven, IN, 46774', NULL, 'Mobile Software Development', 'No - I need guidance from the pro', 'We’re developing a next-generation real estate and investment platform that merges a virtual office environment with an integrated customer management system, AI-driven home matching, and real-time property data. The system allows buyers to explore interactive 360° tours, take personalized quizzes to match with homes, and chat with agents or assistants inside a virtual salesroom. On the backend, agents and investors manage leads, track deals, and review custom dashboards for property insights, new build cost estimates, and fractional investment opportunities. We’re looking for developers skilled in front-end and back-end web technologies, containerization, and API integration to help bring this immersive SaaS platform to life.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('57f89af7-51de-4638-b2ca-5b1db3339a39', 'Adriana', 'vidaartacademy@gmail.com', '(786) 768-0422', 'Homestead, FL, 33033', NULL, 'Web Development', '5,000 - 9,999', 'Updates to an existing website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('58d435f5-b9bc-4dee-bf81-1d016d803d65', 'Wit Ferell', 'witferrell@dominionchemical.com', '804-733-7628', 'Petersburg, VA', 'www.dominionchemical.com', 'Web Design', '$2,000 - $2,999', 'Major changes to my website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('59ecfb30-7bc7-492d-856f-6dc7bad0c101', 'Ten', 'quickten@gmail.com', '(407) 516-1129', 'Marietta, GA, 30067', 'fitness website', 'Web Design', 'Less than $500', 'Fitness business thevitalathletics.com. looking to market and reach out to working adults ages 30-60, deep and comfortable in their career. Looking for less conventional gym personal trainer vibe, and more fitness consultant impression. Looking for assistance overhauling website asap, with a budget. May be flexible with budget, but I still have a limit.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('59f45864-47a6-4bfd-8bd6-4d77309a3b60', 'David Carraway', 'dcarraway@ymail.com', '(941) 518-0550', 'Bradenton, FL, 34209', NULL, 'Web Design ', '$500 - $999', 'Create a new website for Carra Way Creations llc. Looking to quote a website with at least a main page an about us page and an online store. I already have a brand and color scheme. I make cutting/charcuterie boards, coasters, custom furniture and pieces, and also laser engrave.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('59f70119-a8e1-453e-b12a-c73a3f053f10', 'Irene', 'ireneplejdrup@gmail.com', '(951) 813-8995', 'Crestline, CA', NULL, 'Web Design', '$250 - $499', 'help with setting up web (Web/PPC)', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5afb9acd-e7fe-481f-b675-eb516b4bfd66', 'Jt Gabriel', 'nativeheartlife@gmail.com', '(908) 246-7889', 'Frenchtown, NJ, 08825', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5b361e54-f8d9-4631-8bb1-1cd65ab7324e', 'Bernadette', 'bernya77@gmail.com', '(206) 472-3337', 'Seattle, WA, 98119', 'Health & fitness', 'Web Design', NULL, 'I’m the founder of SIMPLIFYhr, a growing HR platform for small businesses. I’m launching a Consultant Leasing Program that connects independently owned HR consultants with clients', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5bb611cd-a07b-4912-9a3c-07c1774862e1', 'James', 'jsellers2021@yahoo.com', '(214) 735-7503', 'Dallas, TX, 75227', NULL, 'Logo Design ', NULL, 'Marketing/PR agencies, Social Media Marketing, Software & app development, Web Design', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5bbc7dea-a1ba-4638-89e6-204e82345566', 'Houda', '', NULL, 'Tampa, FL, 33647', 'Consultancy', 'Web Development ', NULL, 'Website development for consulting startup, 5 pages or more.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5bd461c8-6661-42e9-9d36-d5c919fb148f', ' Kezia', 'keziasmith535@gmail.com', '(870) 771-1541', 'West Memphis, AR, 72301', 'Logo and Website', 'Logo design', NULL, 'My business is a non profit company to help older people it’s called a hand to hold', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5bfd22c1-34fa-46a0-89d3-36ddb1a70bcf', 'Seyyed', 'seyyed800@gmail.com', '(916) 600-3135', 'Stockton, CA', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5d3a8bc9-4f8c-4692-a0e7-bc5ec759457b', 'Minx', 'info@minxlax.com', '(424) 250 8068', NULL, 'Law firm', 'SMM', NULL, 'We are looking for a marketing plan for our law firm. We are aware we are not marketing specialists and, therefore, may not know what we need. As of right now, we would like consistent posting on socials and are working on a newsletter. We do know we do not want SEO.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5db273e1-6f1e-4348-99aa-a2f711eb657a', 'Devonna', 'info.butterbakery@gmail.com', '(626) 283-8247', 'Pasadena, CA, 91103', 'Bakery', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5ea090dd-b48a-4058-8b38-488c803de425', 'Linda', ' Linda@LindaHulberg.com', '(408) 802-1546', 'Morgan Hill, CA', 'Real Estate and Financial', 'Web Design', 'Less than $500 ', 'Real Estate and Financial', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-10', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5f2973d3-81c6-4727-bb62-1bc74e998056', 'Kevin', 'kevinhees@hotmail.com', '760 812 9922', 'Los Angeles, CA, 90028', NULL, 'Web Design', 'Less than $500', 'store setup on my website www.heesart.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('5ffacb2e-0946-4f66-ad93-fe18ca5b40c0', 'Aimee', 'aimeescharcuterie2@yahoo.com', '(540) 391-1152', ' Fredericksburg, VA, 22405', NULL, 'Web Design', 'Less than $500', 'Restaurant/food', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6048745f-ccc7-4d00-a942-20e0a1574a0e', 'Quanaisha', ' qstafford@gmail.com  /  QUANAISHAS@GMAIL.COM ', '(917) 500-8808/  (718) 716-8000', 'New Rochelle, NY, 10801', NULL, 'Major changes', '$500 - $999', 'Major changes to my website it was built on SquareSpace', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6060ef65-d36d-4191-8c36-91d649ba54cb', 'Vicki', 'vickidbrandt@gmail.com', '(330) 410-3155', ' Oxford, OH, ', '', 'Web Design ', 'Under $10000', 'I am looking into this for an existing company, to see if it would be feasible to make changes.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('60d4b81b-b82b-4ae1-9ac2-1798ec1afc36', 'Joffre', 'jrobalino@gmail.com', ' (732) 371-3818 / (732) 297-4209', 'Toms River, NJ, 08757', 'Health Education', 'Web Design ', '$500-$999', 'Create nursing tutoring website manage website make sure my business is on instagram Facebook LinkedIn, Tik tock, next door, YouTube, pintrest and twitter and google also SEO managing and any other services you recommend', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('61a565bb-e114-411f-8e83-4a063a0c5cb9', 'L Lourenco', 'Cemeterycenterfolds@yahoo.com', '(760) 684-5000', 'Phelan, CA, 92371', NULL, 'Web Design', 'Less than $500', 'Having problem finding matches though your business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('61c36b14-1227-40dd-9b4b-163ec11426bf', 'Ed Rosheim', 'erosheim@gmail.com', '(651) 330-9419 / (651) 436-8221', 'Saint Paul, MN, 55129', NULL, 'SEO', '$2,000 - $2,999', 'Seeing who is available locally', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('62a4f180-f80a-4922-aa0d-6e5804ba47a8', 'Jackie', 'administrator@machar.org', ' 202-686-1881', 'Washington, DC, 20015', 'secular humanistic judaism congregation', 'Major changes', '$3,000 - $4,999', 'We have a website that we want to modernize, make more engaging and welcoming. Make is user friendly for potential new members to find our about us and our school. M[url hidden]', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6362382f-b13e-42e2-84ad-a66999aebce5', 'Lisa', 'lros1717@gmail.com', '(646) 925-4245', 'New York, NY, 10128', 'Pet supplement', 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('64824931-a246-4aef-8de3-8c9d263044af', 'Priyanka', 'priya01.sharma@gmail.com', '(908) 208-9742 / (516) 342-9704', 'Huntington Station, NY, 11746', NULL, 'Graphic design', NULL, 'Advertising materials, Brochure/flyer, Print (e.g. cards, posters, artwork)', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('64ad2564-efa4-4eb4-af33-5516f458f2bd', 'Yi', 'yiyanshengxir@gmail.com', '(832) 597-2646', 'Walnut, CA, 91789', 'company sales website', 'Web Design', '$500-$999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('65349981-f000-4b7f-81ec-7b37f47e86d5', 'Gabriel', 'gstepanov2193@gmail.com    ', ' 347-216-9989', 'Staten Island, NY, 10304', NULL, 'Web Design', 'Less than $500', 'To advertise my business/services, To sell products/services e.g. e-commerce, To offer bespoke functionality e.g. logins, forums, CRM', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('659c8c26-d0c2-439a-84d8-93fccef742ec', 'Harmony', '', NULL, 'Dayton, OH, 45449', NULL, 'Web Design', '$1,000 - $1,999', 'Major changes to my Wix website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('659e8821-aed5-40de-977d-632581195d39', 'Alexander', 'alexjkmanning@gmail.com', '(814) 933-2368', 'Wilmington, NC, 28403', 'Education', 'Web Design ', NULL, 'Hello! I am a former professional ballet dancer, and I now teach and coach pre-professional ballet students. I offer private lessons, and also am open to traveling for guest-teaching opportunities. I would like a simple, yet beautiful, single or two page website that would include my resume, contact information, and maybe some photos so that new students and clients can find me.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('65b3372e-c291-40bf-85ec-b4ef93b30286', 'Camille', 'camrae912@icloud.com', '(804) 925-9159', 'Warsaw, VA, 22572', NULL, 'Web Design ', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('669e9a32-ea7b-4e14-b7bf-c910ca741005', 'Elliana', 'elliebug1312@icloud.com', '(803) 719-3376', 'Lexington, South Carolina', NULL, 'Web development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('67cf7674-5b08-4cb5-9247-999d69c3bfdb', 'Lewis', 'fuzziebrain68@gmail.com', '214-207-6152', ' Dallas, TX, 75201', 'Books', 'Web Design', 'Less than $500', 'I am a novelist. I write historical fiction and romance books. My books are listed on Amazon, Barnes & Noble and other book distributors. My name is on Google as are my books. I need a web site to promote my work and my credibility since most of my books are based on a period in my life. I don\'t want to sell online, just a link to the above POS sites. I need to add, delete or change (CMS) content. I need web hosting for a reasonable amount.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('68c52fc4-b1f0-4704-ba86-eb0608307d07', 'John', 'Disneyzackbrown@yahoo.com', '(203) 410-0278', 'West Haven, CT, 06516', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-07', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('68df74d8-82d4-4c07-b5f9-16822fc9e5bf', 'Donald', 'donalddj1173@yahoo.com', '(617) 794-7512', 'Charlestown, MA, 02129', ' www.bostontowncrier.com', 'Web Design', '$3,000 - $4,999', 'Major changes to my Wix website. We are a small walking tour company located downtown Boston', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('69ff0f31-5e5b-4fa7-8d5c-3a4f57cccead', 'Yass', 'hollidayaiyana50@gmail.com', '(407) 548-4593\r', ' Orlando, FL, 32811', 'Home services', 'Web Design', 'Less than $500', 'A trade website for plumbers , electricians and hvac', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6a226b4f-f361-4bfe-a2d6-80084e448588', 'Mackenzie', 'mackburse@gmail.com', '(262) 202-7007', 'Wisconsin Rapids, Wisconsin', 'Creative industries', 'Web Design', 'Less than $500', 'I need a website set up I can sell my online writer\'s course on.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6a8baab9-4f17-470e-9c07-ac8aada2dd88', 'Jack', '', '', 'Lexington, MA, 02421', '', 'Web Design', '$1,000 - $1,999', 'a start up business doing outsource for US companies', NULL, '2025-08-27 23:38:03', '2025-08-25 15:29:16', '2025-04-05', 'converted', '', 1000.00, NULL, NULL, NULL, NULL, '2025-08-25 15:29:18', '05a82562-c573-422d-8a65-72ffe86d8a9d', 'Unknown'),
('6b7aa53f-c291-440b-bad4-7476982a0b48', 'Ernest ', 'ernestmitchell38@gmail.com', '(843) 532-9563', 'Moncks Corner, SC, 29461', 'Remote barbar', ' Web Development', NULL, 'To design a professional website for a mobile barber', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6d1dcaca-d32b-4841-8c78-dfa6fa0c6d28', 'Michael', 'wynnwynnsituations@gmail.com', '(804) 317-6032', 'Richmond, VA, 23223', NULL, 'Web Design', 'Less than $500', 'Create a new website and I would like simple website that features a free 15 min short film', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6d470b88-9ffb-4624-98ff-97d0429b2628', 'Wally ', 'sweetwondersbywally@gmail.com', '(786) 512-8600', ' Howey In The Hills, FL', 'Restaurant/food', 'Web Design ', 'Less than $500', 'Home based baking business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6e006d80-1070-4bc0-af35-5922bd73b098', 'Catherine', 'cathyburgosart@gmail.com', '(906) 203-6759', 'Grand Rapids, MI, 49503', NULL, 'Mobile Software Development', 'No - I need guidance from the pro', 'I have two ideas for apps. One is for a dating app and one is for a business app', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6e085582-eb78-461c-b43e-529e7b7e60a4', 'Laura', 'laura@jasonsmechanicalservices.com', '(940) 735-0769', 'Denton, TX, 76209', 'HVAC Services', 'Web Design', '$500 - $999', 'Need help with google workspace, website, basic it services', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6e3127a6-f8f0-491d-a4f3-cb5d267aa69b', 'Dana', 'dltmancia@yahoo.com', '(571) 328-6790', 'Fairfax, VA, 22031', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6e5ae6b2-1f49-4ae2-92ce-f85ca580bbb9', 'Michelle', 'naturalmodalitiesmd@gmail.com', '580-402-8350', 'Enid, OK', 'Health and Wellness', 'SEO', 'Less than $500', 'new business needs to let the public know we are ready', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6eb85622-34e3-455e-b14e-51fb34dc514a', 'Hallick Lehmann', 'hallicklehmann@gmail.com', '4027419107', 'Merrimack, NH, 03054', 'psychiatric nurse practitioner', 'Web Design', 'Less than $500', 'Info: Create a new website for my private practice psychiatric nurse practitioner business. List services and practitioners along with direct access to patient portal, contact me section. Be inviting and warm. Optimized SEO.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6ee6f9d1-14b8-4f2f-a29a-e1e88095b5ce', 'Michelle', '', NULL, 'Kansas City, MO', 'Charity/non-profit', 'Web design', 'Less than $500', 'help solve community problem veteran ,senior, etc', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6ee8d645-02c6-45f9-89bd-4998f02a2ae6', 'Jeffery', '156godz@gmail.com', '(614) 352-6594', 'Homer, LA', 'Entertainment & Events', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6f792f1a-924b-4f0b-9660-e2d01c1fd5db', 'Shaniece', 'h.shaniece@yahoo.com', '(216) 825-1717', 'Cleveland, OH, 44144', 'www.beautifullychaltic.org', 'Web Design', '$2,000 - $2,999', 'My business is a small new homemade candle business Beautifully Chaotic Candle Co. and I purchased a site from google sites ([url hidden]) but i do not know what I’m doing at all. I want something eye catching', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('6ff9626b-0cf0-469c-a87e-83145a884e60', 'New Lead', 'NewLead@exampl.com', '+1123123123', NULL, 'New Lead', NULL, NULL, NULL, 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-07-16 10:42:20', '2025-08-18 14:57:50', '2025-07-16', 'new', 'website', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Ali Admin'),
('702cfe5d-5aa9-400e-b6a7-878fd26e4509', 'Roel', '', '956-683-5992', 'Mcallen, TX', 'Photography', 'Web Design', 'Less than $500', 'I need a website that showcase my photography services and portfolio as well as booking and taking customers payments.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('70679444-53aa-4870-83a2-d890c5643b38', 'Sheketta', 'info@misteranalyticsgroup.com', '(404) 403-4898', 'Woodstock, GA, 30189', 'Health & fitness\r', 'Web Design', '$500 -$999', 'I am rebranding my current website. I am looking for a great designer who will understand my business and vision as well as I do to build a better online presence. Additionally, you understand the internet well and know who my customers are. You know where customers spend time on the internet and how to attract their attention on the first visit. You understand trends. What are people searching for? Can we benefit from that trend? How quickly can we adapt to that change? Understand the present and future of the Internet by searching for info moving beyond Google and ensuring our web presence is good enough to get listed in ChatGPT or Perplexity because that\'s where the new generation is.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('708df500-ca41-4767-96c3-af8b303c5ad1', 'Brian', 'bri12268@msn.com', '6129635555', 'Minneapolis, MN, 55403', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7095dc44-8cf6-49bd-af92-14ee6333e5a3', 'Gabriel', 'gabe@lepesluxuryliving.com', '(574) 612-8615', 'Elkhart, IN, 46514', NULL, 'Web Design', '$500 - $999', 'update my website, get leads, add videos and prices. add new details\r', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('71d307e2-bf03-4d13-a4b4-67981379f2eb', 'Donna', 'dlvarble2001@yahoo.com', '(443) 761-9706', 'Towson, MD, 21286', 'Fine Artist', 'Web Design', 'Less than $500', 'Want to create website to display my abstract paintings', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('71d8815e-618d-4e2a-ab82-8765dfd2d7ea', 'Nick Seger ', 'Nick@sunscapetx.com / nrseger@gmail.com', '8126307304/ 3033322373  / (512) 326-1126', 'Austin, Texas, United States', 'Commercial landscaping', 'SMM', '$500 - $999', 'Commercial landscaping. Primarily HOA’s, although trying to do more office, industrial, and retail. Currently in Austin and San Antonio. Need to stay top of mind for all Property Managers. Would like to be in the eyeballs of HOA Board Members (Facebook). We already take great photos and have a good repository. Mostly thinking we start small experimenting with frequent social media posts. It’s currently being done ad-hoc by our youngest salesperson.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('72381116-d766-4496-8101-9cb76379eb7f', 'Darryl', 'dajacobs65@gmail.com', '(302) 562-5127', 'Cedar Grove, NJ, 07009', 'Entertainment & events', 'Web Design', 'Less than $500', 'I need a website for a sports membership organization, uploading photos, videos, graphics, newsletter, etc.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('72fa4b79-f462-47d6-93b1-7523227bda58', 'Kelly', 'Hemingwayscats9@gmail.com ', '(206) 214-5874', 'Seattle, WA, 98108', 'Website & Logo design', 'Website Development', NULL, 'Website & Logo design', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('733c7270-ad73-4e27-a914-a011bd5932a9', 'Roosevelt', 'runoffcreamroc08@gmail.com', '(330) 795-1522', 'Warren, OH, 44485', 'Cleaning Service', 'Web Design', 'Less than $500', 'I need help setting up my website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('73d37270-8f5d-4d27-aa6f-7e14a0722928', 'Tony', 'max@tgfyi.com', '(801) 654-3333', 'Salt Lake City, UT, 84123', 'Technology / Software', 'Web Design', '$1,000 - $1,999', 'Major changes to my website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('746a97f3-1956-491f-927b-05145d64ce14', 'Alex', 'codextp@bellsouth.net', '786-438-8411', 'Miami, FL, 33193', NULL, 'Marketing Agencies', 'I\'m not sure yet', 'Marketing Agencies, I operate in Construction, Digital marketing e.g. PPC, SEO', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('750700b8-0248-41d6-a04d-e67dd8d2af54', 'Avery', 'petersavery021@gmail.com', '(470) 556-3199', 'Lawrenceville, GA, 30045', NULL, 'Web Design', '$1,000 - $1,999', 'I’m selling Lulu lemon', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7607e1ce-3956-4358-b110-dd78d5564952', 'Chad', 'chadlgoff@yahoo.com', '(801) 856-6465', 'Bountiful, UT', 'Sports Cards', 'Web design', '$5,000 or more', 'I need a website to sell Sports cards..', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('767ea52a-af31-4c8e-ab21-ef23ed599ed8', 'Adrenne', 'adrennedufraine02@gmail.com', '(781) 330-2777', 'Waltham, MA, 02453 ', 'Web Development', 'Web Development', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('768cc5a5-3dc7-4e47-9999-dafff0d15a75', 'Parker', 'parkerjeanneallen@gmail.com', '(720) 742-5481', 'Boulder, CO, 80302', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-07', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('77ceee5f-d4c7-4d33-8beb-c2e26c908a9a', 'Maryjane', '', NULL, 'Fallon, NV, 89406', 'Mobile Software Development', 'App', 'Less than $1,000\n', 'Mobile Software Development, Bar and restaurant app for VFW post 1002', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('77fbb151-7b00-44d6-b1c4-15a5ae43ac09', 'Andres', 'moneygardenlending@gmail.com', '(714) 363-2060', 'Anaheim, CA, 92808', NULL, 'Web Development', NULL, 'I am starting a business that offers \"options trading\" to the public. I need to develop a website for this business. I will be providing educational training, faq\'s, subscription based and AI directed.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('78babd0f-b84c-41d6-bb3c-6c12e6726e4a', 'Dakota', 'dakota.wilson1475@gmail.com', '(971) 312-7206', 'Sheridan, OR, 97378', 'Construction website', 'Web Design', 'Less than $500', ' I’d really like some to set me up a web site for.l my construction business and to make it completely for me I’m not a computer guy', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('78dd950a-c478-446a-b184-5d8ba3e9407e', 'Costa', 'costatheodoropoulos@yahoo.com', '(321) 506-0456', 'Cocoa, FL, 32926', NULL, 'Web design', '$2,000 - $2,999', 'I\'m opening up a new land surveying company. I need to create a mysql website database that can allow customers to log on and order, check status and download jobs as completed. It should also have administrative logins for.employees to take.orders, dispatch work order to crews and update work status. I also want it to handle.invoicing per.client and total invoicing and accounting reports company wide. I\'m sure there is more. This [url hidden] be cloud based.and.accessible from anywhere', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('79984ce8-0d18-4545-8350-dc0e0ab4133e', 'Jb Alexander', 'wddashad@gmail.com', '(646) 436-6656', 'Long Island City, NY, 11101', NULL, 'Mobile Software Development', NULL, 'Need a CT0 : IT admin partner really. I have over 59 stores ready to activate: already published in the app store.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('79c3c179-9490-45da-b633-90d48d26a5d4', 'Mana', 'mana78cleaning@gmail.com', '757-297-9062', 'Newport News, VA, 23601', 'cleaning services', 'Minor changes', 'Less than $500', 'Minor changes to my website. It\'s for cleaning services business.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('79d58333-ec45-45c0-866e-da41779b1984', 'Julio', 'julio@therojogroup.com', '(702) 863-8267', 'Las Vegas, NV, 89135', NULL, 'Mobile Software Development', NULL, 'Real estate home search App', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7a4a4aa3-6d5a-4f8a-ab96-04d099fdb7bd', 'Isabelle', 'info@allchefsupplies.com', '(818) 231-0218', 'North Hollywood, CA', NULL, 'Web Design', '$150/week once a week', 'WIX - Weekly changes - Ecommerce - Change pix - blogs - In-person - 91605', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7afa9310-f204-4a03-8174-9a6b2f8143ac', 'Kitty', 'kittykayewilson76@gmail.com', '(314) 766-3763', 'Florissant, MO, 63033', 'E-commerce Candles website', 'Web Design', 'Less than $500', 'I would like to sell homemade candles', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown');
INSERT INTO `leads` (`id`, `client_name`, `email_address`, `contact_number`, `city_state`, `business_description`, `services_required`, `budget`, `additional_info`, `user_id`, `created_at`, `updated_at`, `date`, `status`, `source`, `price`, `priority`, `lead_score`, `last_contact`, `next_follow_up`, `converted_at`, `sales_disposition_id`, `agent`) VALUES
('7b385a99-7bb3-4092-bae8-83534a4694c7', 'Chad', 'chadB.FTCA@gmail.com ', '503-231-8209   ', 'Portland, OR, 97214', '  www.fairtradecannabis.net', 'Web Design ', '$500 - $999', 'I want to talk with him,her. I’d like them to be local.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7b3a04bd-a56b-4364-ac0b-c19a1707020f', 'Don', 'donbeall646@gmail.com', '(508) 561-8181', 'Ashland, Massachusetts', NULL, 'Web Design', '$500 - $999', 'This is for a construction web site', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7b6e7353-e7b4-4884-9328-750fe7eb438b', 'Zedric', 'cre8torwear@gmail.com', '(901) 653-9735', NULL, NULL, 'Graphic Design', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7bb7ae3a-93c6-4824-b2bb-89c0bc5b562d', 'Oak', 'cristobal345@gmail.com', '(678) 830-4612', 'Acworth, GA, 30102', NULL, 'Advertising', '$2,500 - $4,999', 'tree removal and more', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7c3c7a74-ec7e-45f4-9c06-5d98e3aefe95', 'Lynn', 'lsdonohue@gmail.com', '8139096212', 'Orlando, Florida', NULL, NULL, NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7cbdbcda-8d22-4b66-be02-22d2dc4ff71e', 'Josh', 'lafavesrepair@gmail.com', '5862246376', 'Winter Park, FL, 32792 ', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7ce353e2-cbd5-432d-95da-6bab595641ee', 'Victoria', 'Victoria@elitenotaryservice.com', '(951) 878-8128', 'Riverside, CA, 92508', 'Legal', 'Web Design', 'Less than $500', ' I provide notary public and apostille services. I want my site to serve as a place people can find when searching for a mobile notary - I come them or their clients in the case of working with estate planning lawyers. Photos. Resources. Menu of services and Price List', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7cff4cee-8812-4f5c-acc5-e6c961397136', 'Sean', 'sean.pfeiff@gmail.com', '(717) 278-4151', 'Manheim, PA,', NULL, 'Web Design', '$500 - $999', 'I am looking for help designing a website for Hidden Oaks Outdoor Company. We specialize in Landscaping, Lawn Maintenance, as well as soft/pressure washing Serivices. In addition, we also offer parking lot line stripping services and are committed to appealing to commercial accounts for all services. I currently have a Go-Daddy site and can provide all essential information to aid you in the design process. I have a marketing background and a keen eye. However, I am short on time to put this project together.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7d466d4e-fa85-45fa-997c-07945d706f9f', 'Emily', 'bodybyemily1@gmail.com', '(516) 330-8220', 'Manor, TX', 'Health and Fitness', 'Video Editing', NULL, 'I am a fitness trainer that created a piece of workout equipment. I already have all the content- I just need someone to put it together and make splashy marketing videos for Instagram', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7d623439-5a33-4556-bf9a-a63dad65f762', 'Jana', 'janahaertl@gmail.com', '(925) 330-5327 / (925) 831-1580', 'Alamo, CA', 'Author', 'Web Design', 'Less than $500', 'I have an live but outdated wordpress website that needs to be updated to highlight my newly published children\'s book', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7d624a6c-cf59-4d1f-aa05-7ae5463a41d5', 'Jacob', 'absolutephotographer@icloud.com', '(646) 866-9102', 'Bronx, NY, 10463', NULL, 'Web Design', '$1,000 - $1,999', 'I need help with drawing my idea out. I have a lot of idea.\r', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7da04b2e-6f08-46f3-a550-2b71693234c5', 'Lydia', 'Lteschera@cortecsheetmetal.com', '(408) 310-9091', 'San Jose, CA, 95112', 'Metal Fabricating', 'Web Design', '$5,000 or more', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7e7b55ab-9f42-46d1-85c1-37f73ef53964', 'Lou Oates  ', ' lou@louoates.com ', '(623) 243-2508', 'Mesa, AZ, 85207', 'photography Business', 'Web Design', '$500 - $999', 'Web Design, I need to migrate my website from Network Solutions to a different host site where I can make changes add items etc. Call me for additional info: Lou Oates . My current site:  louoates.com ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7ec85028-d96f-4bc0-9f0a-4ecc483cd075', 'Moe', '', NULL, 'Paoli, PA, 19301', 'Website on tiktok', 'Graphic Design', NULL, 'I would like to put my website on Tiktok. The website need to be on the engineering section of Tiktok. Website content is already done and needs the following: 1- Page 1 indicates the categories need to be active 2- There are few videos need to be played on a give website page 3- Make the final website active on Tiktok 4- Present website URL ati-smt.com should give you some idea but the modified website added more pages. 5- What is the cost?', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7f015244-275c-4d64-a7bf-9add6d51bdac', 'Nathan', 'nate.peterson@gmail.com', '(605) 553-3971', 'Sioux Falls, SD, 57110', NULL, 'Web Design ', ' $500 - $999', 'Create a new website To advertise my business/services', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('7f902a84-7b7f-4091-ae96-f8fa1cca0b83', 'Kenny', 'kdkconstr@icloud.com', '(516) 924-9941', 'Bay Shore, NY, 11706', NULL, 'Web Design', '$500 - $999', 'Cannabis indoor outdoor automatic magic grow window', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('80bcc443-41ff-4ec3-9c88-3f9bf6551844', 'Justin', 'prinixdigitalmarketing@gmail.com', '(724) 762-9616', 'Largo, FL, 33778', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-07', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('80ccb084-eaeb-4726-904c-50793bcc4792', 'Matt', '', NULL, 'Fort Mill, SC, 29707', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('80ec46d7-71ef-4bd4-9f7c-19157b043272', 'Den', 'dmstylentile@gmail.com', '(786) 893-5369  ', 'Hialeah, FL, 33014 (', 'Construction', 'Marketing Agencies', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8181c8ef-9287-4f0c-be7b-2887b30ca05a', 'Trg', '', '', 'Berlin, NJ, 08009', '', 'Web Design', '$500 - $999', 'Need e-commerce website created sell products except payments … etc. ( no template)', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', '', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('818b4c1f-4259-47da-b067-339fd2da33b7', 'Melinda', 'mendykay1952@gmail.com\r', '(254) 485-4050', 'Meridian, TX, 76665', NULL, 'Web Design', '$500 - $999', 'I’m selling mugs, but also other items that I have like tee shirts, kitchen dish towels, coasters, etc. mainly mugs though', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('81a5afa3-68f7-4620-86f7-54679244f9b6', 'Segdrick ', 'segdrickfarley@gmail.com', '(312) 241-3055 / (715) 835-4977', 'Eau Claire, WI, 54701', 'Peer Support and Recovery.', 'Web Design', NULL, 'Create a new website. I operate in Peer Support and Recovery', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8250b112-1e55-4497-87bf-77c308580e9e', 'Karen', 'karenjustycky@hotmail.com', '(916) 705-1136', 'Citrus Heights, CA, 95621', '', 'Major changes ', '$1,000 - $1,999', 'Major changes to my WordPress website. My existing website is too simple, uninspired, and doesn\'t include my branding colors/logo', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('82685a8d-c68f-4364-9737-758ab3159ba5', 'Tania', 'tania.story@gmail.com', '303-810-4297', 'Buena Vista, CO, 81211', 'Apartment Rentals.', 'Major changes', ' $500 - $999', 'Major changes to my Wix website. It\'s Apartment Rentals', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8269d4d1-6f68-4a1d-b0c3-2f779a04aa0d', 'Kyle', 'andes_kyle@yahoo.com\r', '(912) 441-3566', 'Hinesville, GA,', 'Automotive Repair ', 'Logo design, Advertising, Social Media Marketing', '$30', 'Automotive', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('82a4bc39-7b09-43d9-8f34-08b712b2951c', 'Jason Furrate', 'mediafurrate@gmail.com / jason@mediafurrate.com', '(225) 317-4233  ', 'Baton Rouge, LA, 70817', 'video production company', 'Web Design & SEO', ' $2,000 - $2,999', 'Major changes to my WordPress website. I am a small video production company with very little time to update my website and it needs a refresh. I am also interested in not losing any ground with my current SEO.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('82ddc4fe-7486-4897-b9f5-0739406e9e10', 'John', 'John.wetzel.56@gmail.com', '(386) 264-3770  ', 'Palm Coast, FL, 32137', 'Web Design', 'Web Design ', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('84ae7efc-5be1-42ff-aa50-df81ece4b39f', 'Ashley', 'classy_lady37@icloud.com', '(938) 252-3099', 'Tuscumbia, AL, 35674', NULL, 'Web Design', 'Less than $500', 'I need to create a church website. On this site, I need to be able to allow people to reserve their seats for conference, purchase prayer cloths and oils and purchase tickets', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('85767439-6801-45fe-af28-bf0ab304545b', 'Kevin', '', NULL, 'Temecula, CA, 92592', 'Entertainment & events', 'Web Design', 'Less than $500', 'Transportation Website similar to: https://www.tourdelvinotemecula.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('859d70b4-f172-4989-9573-e8885cb5b3be', 'Julio', '', NULL, 'Watsonville, CA', NULL, 'Marketing/Web Design', NULL, 'We are a company dedicated to Landscaping construction primarily, we do any type of landscaping, that includes: Construction, Maintenance, Water features, irrigation and electrical systems, retaining walls, drainage systems, dry stack walls (rock and blocks), patios, decks, lightings, etc.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('85a151b1-3187-4fdb-9e8d-014fe45ef828', 'George', 'hemified08@yahoo.com', '(917) 423-5688', 'Fort Mill, SC, 29707', 'Eastern', 'Fort Mill, SC, 29707', '$1,000 - $1,999', 'Hi. Interested in website for mobile auto detailing and repairs. Would like to be able to have customers schedule thru site if possible. Also need to set up email addresses.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-07', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('86fa0396-5502-4430-8bea-8be952402d88', 'Lorenzo', 'soakednsmoked865@gmail.com', '(865) 343-9568', 'Easley, SC, 29642', 'Food business BBQ', 'Web Design ', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('878d1442-2285-4e8d-a9b9-046f635410a9', 'Zeljko', 'dvanajscak.zeljko@gmail.com ', '(720) 254-4467 ', 'Delray Beach, FL, 33484', 'Private Practice ', 'Web Design', '$500 - $999 ', 'This would be a healthcare website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8834eae5-48fa-49e8-a260-ae86cb259abe', 'Noel', 'noelsylmo12@gmail.com', '(202) 378-7893', 'Washington, DC, ', 'Logo and website', 'web design', 'Less than $500', 'I am launching a non-profit and I’m looking for a professional website, logo and any other service needed to standout.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('891274bf-1b32-4d6c-84de-29da3143f05f', 'Barry', 'barryruggiero@gmail.com', '(732) 522-0793 ', 'Brick, NJ, 08723', 'Charity/non-profit', 'Web Design ', 'Less than $500', 'Create a new website for Charity/non-profit. I am setting up a coalition of different Paranormal investigators to host events for charities we are 501C.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('89b8c4a3-3cb2-4c60-9e3b-84c4e1c60604', 'Annette', 'susana@susanacruzdesign.com', '(954) 397-2200', ' ', 'https://susanacruzdesign.com/', 'Web Design ', '$5,000 or more', 'Increase Advertsing and Marketing for susanacruzdesign we are on Instagram /Facebook and Linkeddin and', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8a2ab202-964f-4fae-8707-9688361e8f9f', 'Michelle', 'michellerdigitalcoach@gmail.com', '402-650-7951 ', 'Lincoln, NE, 68521', NULL, 'Web Design', '$500 - $999', 'Create a new website To advertise nationwide to order silver and gold at cost with a membership program and have a link to join MLM', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8a8aa9fe-c78c-4bd2-a0c9-729fe5a08143', 'Allen Elisara', 'atelisara@gmail.com', '18083668176', 'Menifee, CA', NULL, 'Graphic Design', 'Less than $1000', 'I need to create a poster board for my wife’s birthday party. It needs to be 1920’s Greet Gatsby themed.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8abe3280-b5f7-4122-9f43-fd74abff372e', 'Colton', 'rhsbaseball4@gmail.com', '(434) 386-1943', 'Chula Vista, CA, 91911', NULL, 'Mobile Software Development ', NULL, 'I need someone to build and develop the app with me', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8ac0dca4-7c2d-45e7-ba9e-7bd094fa2fb2', 'Dana', 'dana@danabulliner.com', '(312) 952-9958', 'Lake Villa, IL, 60046', 'www.danabulliner.com', 'Social Media Marketing', '$1,000 - $4,999', 'Gain visibility (brand recognition), Increase user engagement, Sell more of my product or service', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8b2fba3f-35b1-4846-a234-9238055809ca', 'Kens', 'kensbienaime8@gmail.com', '(864) 603-4334', 'Deltona, FL, 32725', 'Graphic', 'Graphic Design', 'Less than $1,000', 'Advertising materials, Brochure/flyer, Clothing', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8b7b6163-615e-4dbe-a9d9-8e5dde19b81f', 'Fran', 'kidsntraining@gmail.com\n', '(205) 527-0870', 'Birmingham, AL, 35205', NULL, 'Web Design', 'Less than $500', 'I have an html based website and want it converted to something I can migrate to another webhost and be able to make changes myself as I don\'t know html.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8be00554-4a2d-43ad-8339-410b3a7ccea7', 'Kay', 'web3342@gmail.com', '(346) 303-7053', ' Spring, TX, 77379', NULL, 'Marketing Agencies ', '$1,000 - $2,499', 'need word press website built', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8c24cdf8-d498-4132-8f5e-3a8c80c98b64', 'Amy Ahlert', 'ahlert1@verizon.net', '(914) 527-6234', 'Tarrytown, NY, 10591', 'Author', 'Web Design', 'Less than $500', 'I HAVE PUBLISHED A NOVEL WITH MORE TO FOLLOW AND WOULD LIKE A WEBSITE WHERE I CAN PUBLICIZE IT, AND SELL IT AND OTHERS TO COME.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8cb3e536-0db6-4ca1-a187-f6c758994865', 'Mary', 'mf_schultz@yahoo.com', '(262) 206-5172', 'Burlington, WI, 53105', 'Website', 'Web Design Revamp', '$1,000 - $1,999', 'We did a basic website about 15 years ago on GoDaddy it has since expired the site does come up but cannot be updated Etc we want to take that information updated and make it more personal with our pictures or our clients houses perhaps a video add a tab for jobs that are available Etc', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8d19b514-f100-47a5-ad96-8f265bc53bca', 'Jermane', 'theoneinc.c.c@gmail.com', '(971) 326-1512', 'Portland, OR, 97227', NULL, 'Web Design  ', 'Less than $500', 'Website Devolpment', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8d389295-3a15-4462-920d-d714d7b0849e', 'Theodore', 'schdytab@gmail.com', '(518) 496-8116', 'Dallas, TX, 75236', NULL, 'Web Design ', 'Less than $500', 'Create a new website for Spiritual Inspiration', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8d3f14fd-1e49-4e10-803e-faf4f8d4c24e', 'Barry ', 'alkwanzo@gmail.com', '(443) 540-6816', 'Randallstown, MD, 21133', 'Book published', 'Graphic Design', NULL, 'Complete a self-publishing project', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8db5a25f-c3ad-4de4-a02c-4e46154bba5c', 'Andrea', 'andreadsandorskey@yahoo.com', '(512) 599-7877', 'Hutto, TX, 78634', NULL, 'Web Design', '$200', 'Create a new website, it\'s for home services. I started my Website on Square and Wixs. I had a domain paid for and it expired before I could get my website up. I have a vision of what I want I just need help implementing it and some possible advice. My budget is set at $200.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8dc37da8-25a5-43fa-b82c-ece31fd5f01d', 'Tovah', 'theankhway@gmail.com', '(347) 885-2531', 'Bronx, NY, 10456', NULL, 'Web Design', 'Less than $500', 'Mental Health and Personal Development', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8def8072-e50b-4573-87cd-cce464cb4cac', 'Evan', 'evan5070406@gmail.com', '(636) 515-8971', 'Florissant, MO', 'Clothes', 'web design', 'Less than $500', 'clothing brand has a budget of $200', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8e44776e-1a3a-4462-aeaf-949ce6966e8a', 'Kimberly', 'kimberlyferrante@gmail.com', '(248) 842-1855', 'Lake Orion, MI, 48360', 'https://www.orionmastercanvas.com/', 'Web Design', '$500 - $999', 'I had an upwork designer create a website for us. He designed it using Figma and Bootstrap and it\'s currently located in GoDaddy. The designer could not speak English fluently and it was difficult for him to understand what we wanted. I want the ability to make edits to the site and wanted to maybe transfer it to Wix or similar so that I can make edits on my own. website is www.orionmastercanvas.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8e7dbcea-56f9-4a14-958a-62c58dddbdbc', 'Fani', 'selavefani81@gmail.com', '(201) 954-9622', 'Jersey City, NJ, 07307', 'Home services', 'Web Design', 'Less than $500', 'We are a company with more than 10 years of experience in the cleaning sector. Our mission is to provide a clean and healthy environment for you and your family', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('8e9f5123-549a-4890-8a3f-c2c6d0746a33', 'Cindy', 'cindy@niendorff.org', '(865) 227-2388', 'Knoxville, TN, 37922', 'Health & fitness', 'Web Design', '$500 - $999', 'mindwavemedical.com is the current website. My husband built this but does not have time to update or maintain and the others of us don\'t know how to add any info or change without totally messing it up. I would like an easier platform that is useable.', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-04-17 11:55:25', '2025-08-18 14:57:50', '2025-04-04', 'new', 'Referral', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Ali Admin'),
('90409986-ae53-442b-af07-4a9f90f4e9a0', 'Jason', '', NULL, 'Schoolcraft, MI, 49087', NULL, 'Web Design', '$500 - $999', 'I need help designing the Shopify website. Clean look & easy ordering. Have a happy & chill vibe to it.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('90a0fee6-e6d4-4bec-892d-d234908cf6be', 'Garrett', 'garrett.rainey21@gmail.com', '(440) 539-5994', 'North Olmsted, OH, 44070', NULL, 'Web Design', '$2,000 - $2,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-10', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('90db3caf-c8ab-4e4b-b819-c637a36bf9ec', ' Ani', 'ajavardian@gmail.com', '(267) 746-1903', 'New York, NY, 10001', 'Web Design', 'Web Design', '$5,000 or more', 'I am interested in building a shopping marketplace for a niche area of clientele. This will include interactive features for the shopper to organize their wardrobe.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('91832b8c-134e-4044-8067-d526b58ec759', 'Corinne', 'corinnenelson21@gmail.com', '(214) 770-3878', 'Raleigh, NC, 27617', NULL, 'Web Design', '$500 - $999', 'We would like a high quality professional website within a week. We already have a logo and design', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('918a1a00-dcb3-4811-bdf9-e63ee9581f57', 'Otto', 'omarracello@gmail.com', '(516) 702-1937', 'Saint Augustine, FL, 32095', NULL, 'Web Design ', 'Less than $500', 'Create a new website for advertising black car service rides for airports and other events. Would like it liked with a bank account and new phone number and able to take credit card payments also.', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ali Admin'),
('91cf1964-ffc6-41a2-a319-18dd98303890', 'Mirna', '', '908-764-8609', 'Somerset, NJ', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('92b2e46c-a790-40a3-8ef3-013ffb2a4c90', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('93186341-c6ab-4a14-b413-fb18126195e5', 'Isaiah', 'Israelisaiah65@gmail.com ', '(786) 843-9484', 'Clearwater, FL, 33764', 'Book Graphic/Cover', 'Graphics Design', NULL, 'Book', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ali Admin'),
('934b2309-44bc-4edc-8d5f-9ac289390ea8', 'Xavier', 'xself1024@gmail.com', '(914) 882-6266', 'New Rochelle, NY, 10801 ', NULL, 'Web Development', NULL, 'I\'m creating a website for my clothing brand, God Got Me Apparel (GGM). I want something easy for people to use and easy to manage.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('94f5e049-6274-4289-a3b1-713b747cd37f', 'Apurba', 'apurba.bh@gmail.com', '6267106441', 'Corona, CA, 92880', 'Restaurant/food', 'Web Design ', 'Less than $500', 'I am buying an existing boba shop but I can’t use their menu and brand .. Tjey have a nice website and I need almost a copy of the same features on my website without tje same name and menu .. I need. A feature to upload menu and price', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9508e811-c866-4958-b5c2-395cf63d9532', 'Jason Fisher', 'gofishproductions@mac.com', ' 917-999-6075 ', NULL, 'https://stagerunner.net/', 'Major Changes', '$2,000 - $2,999', 'MORE INFO:  on DIal Pad and What\'s app: I will not respond unless you first look at https://stagerunner.net/', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('95292f41-c1b5-4ae6-871c-f2d2ba8d858c', 'Donovan', '', NULL, 'Villa Park, CA, 92861', 'Financial services', 'Web Design', '10,000,000', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('955d930b-b7bb-4f9e-82ca-d0397963c12b', 'Tyree', 'info@blackguysrock.com', '(312) 459-3035', 'Happy to receive service online or remotely', NULL, 'Web Development', NULL, 'I have a tshirt apparel line', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('95b9bdb2-8445-4e2f-9c2b-7ca1de9259ac', 'Bryant', 'AquaVoyageRentals@gmail.com', '(910) 723-0520', 'Fayetteville, NC, 28312', NULL, 'Web Design', 'Less than $500', 'I would like to edit my website in order to have it very visible when people search \"car rentals near me\" or something similar, also i would like them to be able to book the car online fully similar to turo.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('96d5f4ea-8bc4-458e-876c-1ff7f6df04e3', 'Nidah', 'nidah.majid@gmail.com', '(703) 655-3691', 'Centreville, VA', NULL, 'Web Design', 'Less than $500', 'I need a website for Majid Think Tank. Its a niche think tank that focuses on national security issues for the federal government.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('971ae049-4983-437f-b813-beb4b0d1b3d3', 'Salia', 'dunorsalia20@gmail.com', '(585) 471-3444', 'Newark, New Jersey', NULL, 'Web Design', '$500 - $999', 'To create a website for my business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('97f1bce3-a0b6-46c1-b564-d41a73c838f6', 'Shauna Jones', 'shaunaashley@hotmail.com', '(850) 375-0215', 'Pensacola, FL, 32503', NULL, 'Web Design ', 'Less than $500', 'Create a new website to show my inventory descriptions and prices as well as schedule consultations and take payments.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('992d57b6-84ad-4ddf-818a-6c4718d1b3cb', 'Kindra', 'hamillk48@gmail.com', '(303) 807-6658', 'Aurora, Colorado ', 'Cleaning Website', 'Web Design', '$500 - $999', 'We need to have the site built within the next few days and put out everywhere so we get lots of new customers to want to contract with us to clean their businesses', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('99c435b7-5bc6-4776-9a07-99ece1758428', 'Will', 'nester_53vow@icloud.com', '(251) 455-5978', 'Nashville, TN, 37207', NULL, 'Web Design ', '$500 - $999', 'Recording engineer that went from having my own space to working freelance. Also a freelance repair technician. Thinking about selling products as well.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9b568961-78d3-4b8a-b85a-0638661d9adb', 'Richard', 'richard.hk1@verizon.net\r', '(617) 905-7402', 'Chelsea, MA,', 'Bakery', 'Web Design', '$500-$999', 'Bakery website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9bb33791-9af7-4e9f-ae8a-c890c6a233a6', 'Joy', 'joysirotthurwitz@gmail.com', '(310) 729-9241', 'Los Angeles, CA, 90048', NULL, 'Graphic Design', '$1,000 - $2,999', 'Poster for Short Film ASAP', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9bba694a-74b8-45b7-a6d6-cb574d8e7edd', 'Shataviah', 'shataviahchapman1998@gmail.com', '(718) 600-5728', 'Brooklyn, NY, 11207', NULL, 'Web Design', 'Less than $500', 'I want a cute fairy themed website more greens and blues more so blues & also I want people to feel welcomed when they are trying to book me using the website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9c2b33bd-93a7-43fa-8250-a33b2fd6c213', 'Jake ', 'djakegrow@gmail.com ', '(424) 285-4892', ' Tampa, FL, 33607', 'Watches', 'Web Design', 'Less than $500\r', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9c9dbfcd-5f06-4c35-8c4c-5975c062c11b', 'Celeste', 'cmdeguzman1@gmail.com ', '2245044480', 'Northbrook, IL, 60062', 'Wedding website', 'Web Development', NULL, ' ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9cbf0933-2cce-4b57-8016-22ac1e4bdba5', 'Mark', 'mark_colton@icloud.com', '(734) 777-8980', 'Dearborn Heights, MI, 48125', NULL, 'Web Design ', NULL, 'custom t shirts and merchandise and resin art', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9d27fe7d-ca99-469a-a9aa-feb2ad53abec', 'Robert', 'robertgoldware@icloud.com', '(609) 224-4326', 'Trenton, New Jersey', 'HVAC', 'Web Design', '$1000-$1999', 'hvac', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9d48bc09-7b28-471c-aa44-eea85be6f36e', 'Sabrina', 'brinasb3@gmail.com', '(806) 874-0217', 'Clarendon, TX, 79226', NULL, 'Mobile Software Development', 'Not sure', 'I\'d like to make a app for truck drivers that kind of replaced dispatch and is similar to door dash but for companies to request load pick ups', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9d7e497c-0add-4a8d-8962-045216024cc3', 'Felicity', 'Hannahhamilton0525@gmail.com', '(607) 437-6072', 'San Antonio, TX, 78252', NULL, 'Web Design ', 'Less than $500', 'Info: Create a new website for my sweet treats business I already have a logo.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9d849db1-827c-47e0-a42f-274ab88c5c8a', 'Catherine', '', '', 'Keller, TX, 76244', '', 'Web Design', '', '', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', '', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9dea8497-2daf-4443-96b0-be63a2cb964d', 'Mumtaaz', 'mumi145z@gmail.com', '(317) 772-5738', 'Indianapolis, IN, 46241', NULL, 'Creative industries', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9df33c58-1c48-492e-b1e0-e03e3801e269', 'Andrew', 'ajohnston@spartanburglegal.com', '(864) 431-6875 / 864-591-1093 ', NULL, NULL, 'Web Design ', '$500 - $999', 'Info: Create a new website. I am sole practitioner with many years of legal experience. I want a website that is cool and eye-catching. I want to be number 1 in my areas in SEO.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9e7dfee3-07f0-492b-8762-f5dc49441c56', 'X Hoang', 'xuanh@comcast.net', '(408) 569-9188', 'Oakley, CA, 94561', 'Health and Fitness', 'Web Design', 'Less than $500', 'I operate in Health and Fitness', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9fd71abe-2c5e-4f6a-b04f-b18c8acdded1', 'Zettie', 'zettie_3212@yahoo.com', '(217) 769-9554', 'Urbana, IL, 61801', NULL, 'Logo Design ', NULL, 'I’m trying to start a logo and name for my delivery business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('9ff00314-f3f5-41ea-b72b-7de9d34777bb', 'James', 'jt@jamesrthomas.com', '(512) 698-0309', 'Austin, TX, 78748', 'Counter app', 'Mobile Software Development', 'I\'m not sure', 'I need a scoring app that scored by 5 increments. Score to 100 or 500', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a0065c94-3d3b-442c-93e2-2d192f0d705f', 'Jeannine', '', NULL, 'Shelton, CT, 06484', NULL, 'Graphic design + Web design ', NULL, 'Looking for logo design for a small quilting-related business, [url hidden], with an online presence on social media and blog, with plans for Shopify site to added at a later date.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a081dcd2-1599-4b0d-a3ee-1f6b868fdc07', 'Robert', 'Robert.L.Canfield@Gmail.com', '(619) 325-9106', 'San Diego, CA, 92116 ', 'Mobile App and Website', 'Mobile Software Development ', NULL, ' I am looking for help in building a website and an app (apple and android) that will act as a directory of resources. I can design pages, provide data for teh directory, and do high level design and marketing.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a0febf0c-6781-4444-af1c-629215764a17', 'Darnell', '', NULL, 'Inglewood, CA, 90305', 'Travel, Food and Photography', 'Web Design', 'Less than $500', 'Interested in creating a travel and food site. I also would like to establish a photography site.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a12431fd-41e6-4070-a199-036ae7672cb3', 'Rocky', 'rockcommunications59@gmail.com', '(864) 633-4610', 'Easley, SC, 29640', NULL, 'Logo Design', NULL, 'I have a inspiration of what I want. Please check the attached picture', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a16207ec-5c3b-47b3-92ca-c6bd2079ab3b', 'Kc Home Trailer Co Inc John Rys, Owner Or David Graham', 'KChometrailer@yahoo.com', '(913) 262-8722', 'Kansas City, Kansas', 'Retail/consumer goods', 'Web Design', 'give an estimate', 'We are a small retail store selling RV parts and accessories. Like a hardware store for RV\'s. Currently investigating the comparative costs of using a web designer over a company like BigCommerce', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a21938a0-7196-49c3-8190-7066e33b7592', 'Julian', 'poncejulian11@icloud.com', '(254) 548-5111', ' Hewitt, TX, 76643', 'Logo + Website', 'Logo Design', NULL, 'Web Design', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a21de116-83eb-4e90-87ba-b093586e4460', 'Adriana Avalos Rosas', 'adan.noriega@gmail.com', '(509) 669-0286 ', 'Chelan, WA, 98816', NULL, 'Social Media Marketing', 'Less than $500', 'Social Media Marketing I wanna use Ticktock', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a23a685e-4165-41b1-acbf-0057daef0759', 'Juan', 'kidsartclass@wzupdoe313art.com', '(586) 765-9294', 'Saint Clair Shores, MI, 48080', NULL, 'Web Design', 'Less than $500', 'I am launching at merch store for my art buisness. I have all the images for the merch. And I offer kids art classes and adult classes that comes with commemorative merch and or meal.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a2c1c4f3-5230-4ef8-9cdd-52450f109ca8', 'Sandi', '', NULL, 'Bellingham, WA, 98225 ', 'Author Website', 'Web Design', 'Less than $500', 'I\'m a debut author finishing an author website created in Squarespace and need help finishing it to launch. The 5 pages have already been set up: Home, About the Book, Reviews, Abouth the Author, and Subscribe. I have the graphics and all of the component pieces developed.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a2d2d4b8-987f-4224-981d-634e7f128d24', 'Chris', 'chris@buildingconceptsindy.com', '(317) 670-5237', 'Noblesville, IN, ', 'Home services', 'web design', '$1000 -$2000', 'I have a domain name on godaddy and a website live. I am looking for a brand new site on Wordpress or something that integrates with the CRM called jobber for small businesses in construction', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a2f56f8b-317b-434d-bf1f-962509f2aac7', 'Johnte', 'johnteevans0226@yahoo.com', '(512) 850-3652', 'Georgetown, TX,', 'Construction', 'Web Design', 'Less than $500', 'construction', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a30f189d-3706-46f1-bc31-022bc022177c', 'Tony', '', NULL, 'Traverse City, Michigan (Nationwide)', NULL, 'Web Design', '$3,000 - $4,999', 'I’ve never done an online business, or any business. I signed up for the basic Shopify plan, but quickly realized I needed help. I have a domain name unclebruces-wares-n-such.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a43babcc-7bd3-4367-ac78-7d069e9902c9', 'Saul', 'pekessp@gmail.com', '(832) 573-1281', 'Katy, TX, 77449', NULL, 'Web Design', 'Less than $500', 'I want to let people know everything of what we offer and have access easily to all our products and of course they can place order , confirm product is in stock and of course easy method of payment', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a44dd60f-b960-41ec-a47f-3248389a5df0', 'Ebony ', '', '', 'Coeur D Alene, ID, 83814', '', 'Logo Design ', '', 'I\'m trying to create a logo for my barbershop. I\'ve been trying to do it myself and haven\'t been successful. I have a few ideas but just need someone to help me put something together.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', '', 1000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a46b3281-f102-4509-81ff-919cfece6a74', 'Leah', 'haweyeweds@aol.com', '(808) 646-0632', 'Honolulu, Hawaii', 'Website Revamp', 'Web Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a518350b-3f97-409f-a35c-6ec52ac037eb', 'Levi', 'levi.golla@gmail.com', '(830) 500-0193', 'New Braunfels, TX, 78132', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a6a29dd0-b8b1-4b29-b94d-37ff1d472845', 'Levi', '', '', 'Gretna, NE, 68028', '', 'Web Design ', 'Less than $500', '', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a6a59ad6-0f70-49b4-8834-85f989aff0ad', 'Nathan', 'nate.ebaugh@gmail.com', '(412) 628-7904', 'Pittsburgh, PA', NULL, 'Web Design', 'Less than $500', 'I would need to sit down with somebody and I need some help pulling photos from my cloud storage. I have before and after photos of projects that I want to use to help in building my website for my business. Then I would like to fix my Google profile. I have almost no online presence whatsoever. I realize now that running my business solely on word-of-mouth has been one big mistake that I’ve made so I’m working on trying to correct that but really need some help. Please get back to me asap. I really look forward to hearing from you soon. Thank you, Sincerely, Nathan Ebaugh Owner / Operator , of NDE Contracting LLC', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a6c67a1d-676a-4df7-8e8a-60c0bb536056', 'Lyndi', 'lwallace@childrenshopeffa.org', '(530) 846-4955', 'Gridley, CA', 'NPO', 'Marketing Agencies', '$5,000', 'Brand awareness, Content, Display, Email, Pay-per-click (PPC) e.g. Google ads, Bing, Search engine optimization (SEO), Social Media e.g. Facebook, Twitter', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a73602a1-f699-4ffd-8739-67138158aead', 'Sara Ting', 'sarating@worldunityinc.org', '617-971-0317', 'Jamaica Plain, MA', NULL, 'Animation', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a73aac75-d724-4ab1-aa6a-e96f599cc816', 'Monica', 'unleashed32218@gmail.com', '(904) 591-0833', 'Jacksonville, FL, 32218', 'Dog park', 'Web Design ', '$500 - $999', 'I need a simple website design that would allow my customers to book dog park visits online, and collect payment online', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a773725e-2544-407c-b9bd-30089135784b', 'Walter', 'wtmail@aol.com', '(916) 945-6959', 'Lincoln, CA, 95648', NULL, 'Web Development', NULL, 'First web site for heating and air conditioning contractor ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-05', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a818b6a5-c777-4cd6-930c-26f50a32417b', 'Marvin', 'stem.programmanager@gmail.com', '(818) 205-5313', 'Los Angeles, California', 'Web store architect', 'Web Development', NULL, 'Online store, Social media integration, Tracking & reporting', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a8ce6f11-0b1f-45c5-bc7a-c88d707e6d35', 'Miguel Pargaz', 'miguelpargaz@gmail.com', '(408) 693-6450', 'San Jose, CA, 95116', 'Restaurant/food', 'Web design', '$2,000 - $2,999', 'Web design  I operate in Restaurant/food', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a975ed8a-9104-4259-a37e-a309c47de92e', 'Vicki', 'thebluedesert710@gmail.com', '(270) 792-6832', 'Bowling Green, KY, 42104', '', 'Web Development', '', 'Ecommerce website and I wanna use Shopify , Need assistance setting up an existing Shopify store.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('a9ff34b3-fe56-4b65-96df-538bd17dfa29', 'Dr. Josephine', 'jrbrown800@aol.com', '19198469123', 'Raleigh, NC', NULL, 'Marketing Agencies', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('aa00e91e-69ba-4930-85d6-27e537978cd1', 'Mike', 'dronezdp@outlook.com', '(845) 500-6480', 'Montgomery, NY, 12549', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ab3999d4-07a1-4b9a-9d2a-4c2673f6cf96', 'Julie', 'jaelder9@hotmail.com', '(724) 944-5709', 'Northport, NY, 11768', NULL, 'Web Design', '$2,000 - $2,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('abddc303-1bee-454c-811b-d69d997cc076', 'Cliff', 'cliffaholmes@gmail.com', '(850) 390-6296', 'Gulf Breeze, FL, 32561', NULL, 'Mobile Software Development', '$1,000 - $2,999', 'Electrical company wanting to offer business thru app. Wanting to start a reoccurring monthly fee for a specific service', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ac1fe504-12e9-4370-9389-0a50eba2e794', 'Bri', 'brigirl1313@gmail.com', '(858) 952-4413', 'Nashville, TN, 37204', 'Vintage Resell ', 'Web Design', '$500 - $999', 'this is for a vintage resell websiBte that should feel really funky and textured and echo sustainability', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ac6e3118-e803-4c5c-aca4-d9e0f437e476', 'Tim', '', '(646) 241-7137', 'Long Beach, NY, 11561', 'Entertainment & events', 'Web Design ', 'Less than $500', 'Hoodies and clothes', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ad041d2b-70ee-4145-a0ba-7a791cb7f6e6', 'Israel', 'mtvpainting247@gmail.com', '(678) 663-6395', 'Lawrenceville, GA, 30043', NULL, 'Web Design', 'Less than $500', 'web design, home service, Looking for designer for my remodeling construction company located I. Lawrenceville', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ae52b66d-37d5-4fad-bc5b-f130ce93058c', 'Rick ', 'rickbeldenphotography@gmail.com', '(704) 957-6833  / (704) 999-3266', 'Mooresville, NC, 28117', 'www.rickbeldenphotography.com', 'Web Design', '$500 - $999', 'Create a new website. I own 4 businesses and needs to be able to display all services on top of being able to purchase apparel.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('afb37d71-b7f3-4cd7-9c7f-d1742669e7d1', 'Terina', 'terinapuetz@hotmail.com', '(509) 431-1825', 'Soap Lake, WA, 98851', NULL, 'Web Design', 'Less than $500', 'I do have shopify but only used it for invoicing, cause the shipping is not right on it. I do have items listed on there though.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b0501215-6b6a-4ec2-b4b6-2c17a077d150', 'Savannah', 'cloud9lawnllc@gmail.com', '417-257-4637', 'West Plains, MO, 65775', 'Landscape Company', 'Logo design, Advertising, Social Media Marketing', NULL, 'Logo design, Advertising, Social Media Marketing, We are looking to revamp our mock logo. We have a lawn care company.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b06fd8d6-ad79-474c-93dd-79a298a83654', 'Sheila', 'Wilkersonwashing@gmail.com', '571-202-0211', 'Pittsboro, NC,', NULL, 'Web Design', 'less than $500', 'Offering Soft washing and power washing. Removal of mold mildew/grafetti/rust stains, Roof washing. Wood Rejuvination etc', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown');
INSERT INTO `leads` (`id`, `client_name`, `email_address`, `contact_number`, `city_state`, `business_description`, `services_required`, `budget`, `additional_info`, `user_id`, `created_at`, `updated_at`, `date`, `status`, `source`, `price`, `priority`, `lead_score`, `last_contact`, `next_follow_up`, `converted_at`, `sales_disposition_id`, `agent`) VALUES
('b0923147-4773-4039-94f2-384cd4529619', 'Laetitia', 'laetgd73@gmail.com', '(857) 919-7866', 'Tacoma, WA, 98409', 'psychologist', 'Web Design', '$1,000 - $1,999', 'Looking to create a website for my forensic psychology practice. One site, a few pages, with a button for English and French. Also looking for help with coming up high on searches.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b0c3a284-09a4-4c00-a4ac-8bc79cf72004', 'Selima', 'sshulerjenkins@gmail.com', '267) 296-5580', 'Philadelphia, PA, 19143', '', 'Web Design ', '$2,000 - $2,999', 'Create a new website for Health & fitness. Doula website, merchandise, and reading materials available.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b0f36392-9c41-49b5-a354-9a95d8ee5ae7', 'Alexander', 'obsessivead0425@gmail.com', '(760) 583-6187', ' Cape Girardeau, MO, 63701', 'Automotive Detailing', 'Web Design ', '$500 - $999', 'I have a vehicle to get photos of my work, most of my prices and services are figured out. Need the technical side of things to complete the job. I have a booking page linked with a stripe account already. I can provide that when necessary. The logo has been attached.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b157fd41-14a8-4080-ae28-ca13697762fd', 'Stofee', 'stofeeduncan36@hotmail.com', '(706) 289-7575', 'Columbus, GA, 31909', 'home decor', 'website design', 'Less than $500', 'A home decor website and furniture to maybe kitchen accessories', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b160627c-49df-402a-bf75-c541c1c8e727', 'Alec', 'alec@Whisper-lawn.com', '(315) 313-4431', 'Liverpool, NY, 13088', 'Lawn care service', 'Graphic Design', NULL, 'I\'m looking to design a trailer wrap for my all electric lawn care service', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b1626e96-f111-4b61-b97a-db30b716b879', 'Louis', '', '', 'Palm Springs, CA, 92262', '', 'SEO', '$500 - $999', 'I would like a ranking on google and increase my business.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', '', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b172b47b-f5ed-4af6-8d6e-3bd356005e5a', 'Marie', 'evelinejoseph111@gmail.com', '(845) 879-8917', 'Spring Valley, NY, 10977', 'Jewelry', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b202d496-89ac-46f6-abdd-70c3dd470c81', 'John', 'jrttlc@aol.com', '(817) 401-8284', 'Dallas, TX, 75214', 'book', 'web design', 'less than $1000', 'Need a book cover for a WWII spy drama. This is my fifth book. Birdcage Walk is the story of an untended effort by Allied Intelligence to use an American pilot who had lived in Germany before the war to masquerade as a German spy with the highest of connections within the Third Reich. He was to convey calculated false intelligence as to where and when the D-Day Invasion would take place back to the Reich as a part of the allies Operation Fortitude South deception. This unintended spy would not only deceive Berlin but would convince reliable existing German spies in England to unknowingly pass on to Berlin the false information. Max Becker only had 65 days to achieve the deception before D-Day 6th of June 1944. His success or failure would be measured in American and Allied lives on the beaches of Normandy.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b218ed5a-497d-4adf-bb2f-d34b1677f03d', 'Rebecca', 'rboyko@bridgetohealingtherapy.com', '781-640-2078', 'Burlington, MA, 01803', 'www.bridgetohealingtherapy.com', 'Major changes', '(408) 887-8201', 'Additional details: I hired someone to build my website, and recently I had her add some additional content and pictures. The mobile version is not formatted in a way that looks professional. The margins are way too wide. The pictures are placed a little bit. Oddly, I’ve already paid $900, and I’m not sure how much it would cost for someone to help me reformat, this is WordPress and go daddy. The first ones are my website and then I included the look that seems to be with all the other websites.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b2824445-3d05-46ba-8932-4ed17ca100c4', 'Melody', 'vernandmel@hotmail.com', '(812) 662-4365', 'Osgood, IN, 47037', NULL, 'Web Design', '$1,000 - $1,999', 'Web sight for book, products, and counciling sessions. Must be able to accept digital payments', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b391c5b9-b052-47d7-9cfe-6ed1a6ae0dd7', 'Sabrina', 'sabrinavann915@gmail.com', '(850) 295-9859', 'Florida, New York', NULL, 'Web Design', 'less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b3a45eb2-604e-4160-8ed4-9f800b3217fb', 'Janice', '', NULL, 'Locust Grove, GA', 'Insurance', 'Web Design', 'Less than $500', 'I\'m thinking to create a website to market muscle car projects through pictures of the process. Possibly increasing usage later on', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b44189b1-71e9-4014-98b5-72e6cd733d6a', 'Lori', 'lorifletcher1971@gmail.com', '(734) 449-7132', 'Perry, OH, 44081', NULL, 'Video Editing', NULL, 'Video Editing it\'s a  Home video video it\'s 10 minutes', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b459f1d1-f55b-498b-b224-5260120e8678', 'Dean', 'amvetspost130bg@gmail.com', '(270) 535-5236', 'South Plainfield, NJ, 07080', NULL, 'Web Design', '$500 - $999', 'We want a main page, events page &able to register for events ,members only page, donations page, shopping page,we are a non-profit veterans organization.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b482f65b-84e8-4c55-b1e5-9decd9d96128', 'Antonio Mayfield', '', NULL, ' Baltimore, MD,', 'Pet Care Service ', 'Web Design', NULL, 'dog care service', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b4ce288b-1726-4db6-983e-e68c3790dd00', 'John', 'johnnypetro@hotmail.com', '(412) 897-3169', ' San Diego, CA, 92129', 'Health & fitness\r', 'Web Development', '$500 - $999 ', 'I need a base landing page to advertise my business and the modality options we offer. I can provide similar websites that I would like to have the same feel as. Would also need a page that could host a widget from Mindbody/ Booker for reservations (they have the programming behind that). I would like it be done in a way that I can tweak it moving forward with new info. I already have a website domain name and Wordpress account', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b517a2ca-566d-4e3e-816c-25522d868570', 'Claudel', '', NULL, 'Andover, MA', NULL, 'Web Design', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b56a6d0c-e672-456c-ae1f-68d81f50c961', 'Diesha', 'deisha.williams85@gmail.com', '(702) 426-7354', 'Las Vegas, NV, 89169', 'Online store', 'Web Development', NULL, 'Hi to whom this may concern, I am new to being a retail business owner, I recently opened up a clothing store, but it did not go so well so until I am able to open up a new storefront, I\'d like to get started with selling online merchandise and I\'m seeking a professional because I have no idea how to get this going but I\'m a fast learner once I put my mind to something. I just need a little guidance so thank you so much for your time. Hopefully, I hear back soon. Have a great day.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b5b402a3-6ed0-4305-9114-e35d4035c2d1', 'Robert', 'grantrobert8210@gmail.com', '(804) 201-7600', 'Manassas, VA, 20109', 'Hire a chef app', 'Mobile Software Development', 'No - I need guidance from the pro', 'The app is for people to hire a chef online,for breakfast, lunch or dinner everything will be done in the app, The menu will feature different types of foods people can choose from payments also will be made through the app.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b5cdbb0d-b66f-44ab-b77c-a1e618e661f9', 'Danny ', 'dbenn15088@msn.com', '(410) 831-2582', 'Edgewood, MD, 21040', NULL, 'Mobile Software Development', 'No - I need guidance from the pro', 'Set up a card reader integration through our payment gateway and website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b5e3daf0-b1aa-4ae0-9f30-49533797a20c', 'Jon', 'jonmichalowski@yahoo.com', '(484) 903-7900', 'Easton, PA, 18045', 'sauce business website', 'web design', '$500-$999', 'Looking for a simple but effective pagefor a sauce company. Flash page with a design i have in mind. I have access to graphics and art work. (Might need tweeking for site) looking for a few pages including, about us, gifts and apparel, and sauces', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b6174ba1-ed24-4ba0-bf7d-e6a9b3fb3195', 'Alain', 'alainp2068@gmail.com', '(516) 288-8605', ' Malverne, New York', NULL, 'Mobile Software Development', NULL, 'create an app for our company to give limited access to our client', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b64395a9-351d-4eaf-b4a6-5d97882bf487', 'John', 'savannahbondfs@gmail.com', '(706) 840-6151', 'Los Angeles, CA, 90002', NULL, 'Web Development', '$500 - $999', 'Looking for a personal trainer to help with weight loss and muscle building. Prefer sessions 3 times a week.”', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b6e2412b-df31-40ef-936c-721a4ac0280f', 'Gail', 'thedesignpros@gmail.com', '(561) 719-8013', 'Wellington, FL', 'Creative industries', 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b7f2fd4f-3912-40ae-9491-7ae3f899db59', 'Indira Etwaroo \r', 'ietwaroo@harlemstage.org', '(202) 713-7265', 'New York, NY, 10031', NULL, 'Major changes', '$5,000 or more', 'Info: Major changes to my WordPress website. We are looking to update our website to make it more user friendly, professional and works as well on a PC as a mobile device.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('b84038c0-bbc1-4236-899c-24a00154e05f', 'Eileen', 'sangerartist@optonline.net', NULL, 'Farmingdale, NY, 11735', 'Artist ', 'Web Design', '$500 - $999', 'Need a website for a small local art studio that’s growing.Need to incorporate reservation app too', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-31', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bb46acb8-8150-4f42-9238-48f21a4cabf9', 'Jacob Oresky ', ' joresky@oreskylaw.com  ', '(917) 887-9300 / (718) 993-0136 ', 'Bronx, NY, 10451', NULL, 'Advertising materials, Brochure/flyer, Commercial logo/branding', NULL, 'Info: Advertising materials, Brochure/flyer, Commercial logo/branding, Personal logo/branding, Print (e.g. cards, posters, artwork) for a Personal Injury Law Firm. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bb5749c3-289c-4115-b471-0fe5eb9fde39', 'Kiran Arif', 'KIRII@DECORATINGDEN.COM', '13476975392', 'Cicinnati, OH', 'kiran@kiriidesign.com', 'SMM', '$500 - $999', 'We are an interior design firm. I need help with creating content, and handling social media channels. We want increase our following and engagement. Someone with experience and definitely an out of the box thinker.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bbaea901-5950-4861-a51a-a9b33c0657d2', 'Nicole', 'nt0804884@gmail.com', '(251) 303-9655', 'Mobile, AL, 36605', '', 'Mobile Software Development', '', 'I would like an app to do laundry for people that do not have time to do it themselves', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bc171652-4b6d-42eb-b2f6-77980ba1a080', 'Felicia', 'burdineshomecandtransport@gmail.com', '4633202050', 'Indianapolis, IN, 46226', NULL, 'Web Design', 'Less than $500', 'I would like to promote my business and look for employees', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bc46ed3e-9d5e-4ff8-8175-940e27486442', 'Julia', 'juliaadams67@hotmail.com', '(229) 319-0835', 'Pelham, Georgia', NULL, 'Web Design ', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bc87113a-b5b8-4216-aa73-936a980d1373', 'Brent Rupnarine', 'brupnarine@platinumsdgroup.com', '(516) 770-9878 /  (516) 681-0090  \n', 'Farmingdale, NY, 11735', 'Pool and Landscape Construction.', 'Major changes', 'TBD', 'Major changes to my website. It\'s Pool and Landscape Construction. Our website hasn\'t been updated in years to show work we\'ve completed. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bd5e558d-1bfb-4ce7-b33e-e364ab4e77c8', 'Pierre', 'Pierrerichardpierre435@gmail.com', '(786) 278-5104', 'Mulberry, FL,', NULL, 'Logo Design', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bd6b054f-94f5-42f4-89d1-483b6f84e60b', 'Morganne', 'morgannecomstock33@gmail.com', '(206) 854-0259', 'Maple Valley, WA', 'Clothing', 'Web Design', 'Less than $500', 'Building a clothing YouTube website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('bd87ebb4-934b-4896-8320-ab2b35ea0fc5', 'Grace', 'gracerobin4456@gmail.com', '(843) 861-9252', 'Tabor City, NC, 28463', 'Boutique', 'Web Design', 'Less than $500', 'To sell products/services e.g. e-commerce', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('be763dae-fb2d-4d5d-a4c3-af9943aed44f', 'Naomi', 'Gustavenaomie632@gmail.com', '(718) 502-4355', 'Philadelphia, PA, 19130', 'Logo', 'web design', 'N/A', 'logo and web as well', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c147a7c5-3c14-4882-8cb2-4905aefaa502', 'Patricia', 'robleerick@live.com ', '(520) 403-9779', 'Tucson, AZ, 85719', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c160216b-5818-42fd-84bb-d213a1f51363', 'Kaylee', 'kayleeweirich21@icloud.com', '(813) 815-2137', 'Land O Lakes, FL, 34639', 'Cleaning Business', 'Web Development ', NULL, 'I am wanting to create a business for my bosses business liberty cleaner in land o lakes, Thank You.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c2065b6a-2920-4a44-bb6c-243fac95fa5c', 'Brandon', 'wweprobw2003@gmail.com', '(631) 578-3116', 'Westbury, NY, 11590', 'WWE Rosters (Personal Project) ', 'Web Design ', 'Less than $500', 'TheSmackDownHotel roster pages', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c22d6fb4-e0b4-42a1-bbae-6a3e588331d0', 'Tina', 'info@aispirepro369.com', '(305) 724-4337', 'Dallas, TX, 75219', 'Develop a new app', 'Mobile Software Development', '', 'I have a concept for an incredible mobile app for the self-help Professional/Personal Development industry. I need to develop the app prototype which includes a gamification feature.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c27dc507-18fb-4037-ae90-b3c08294be48', 'Shauna', 'shaunalcrowley@gmail.com', '(774) 414-8167', 'Worcester, MA, 01606', 'Pet', 'Web Design', 'Less than $500', 'Minor changes to my website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c51fb559-df84-473a-9315-49e289020ccb', 'Frantz', 'FANFANC94@GMAIL.COM', '(973) 380-2596', 'Irvington, NJ, 07111', 'Trucking company', 'Web Design ', 'Less than $500', '\n\n[CONVERTED TO CUSTOMER]\nSale Date: 2025-07-18\nService: Web Design\nValue: $1,000', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 1000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c52459f6-8528-444d-aa7c-12906cd4d57a', 'Laeden', 'laeden0776@outlook.com', '(918) 910-0746', 'Beverly Hills, CA', 'E-Commerce', 'Web Design', 'Less than $500', 'I want my website to mimic the msftsrep website. I\'m looking for a simplistic yet artistic and user-friendly website.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c5feed96-c00f-44b3-acc8-b9a08443ea5f', 'Ronita', '', NULL, 'Mount Holly, NC, 28120', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c61ce283-be9d-419a-b482-d0095f7a38a2', 'Rodney', 'dvs_rdny@yahoo.com\r', '9526861298', 'Saint Paul, MN, 55122', 'book animation', 'book animation', 'n/a', 'Digital, Computer animation', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c643d992-805b-4163-9fdb-91d6323392a1', 'Tara', 'tara@maliamarketing.com', '(818) 437-0750', 'Honolulu, HI, 96821', 'Retail/consumer goods', 'Web Design', '$500 - $999', 'We need to optimize our homepage. And also make it more user friendly for our customers.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c88aa9d4-04af-490d-9ab6-86f3c6b08b4b', 'John', 'Johnr@theaquarist.info', '412-436-5144', 'Pittsburgh, PA', NULL, 'Mobile Software Development', NULL, 'I own The Aquarist, an aquarium maintenance company and looking to develop an app for current and future clients.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c8f3a09f-cdd8-4b61-80c9-f794bbd25d26', 'Wendy', 'kafor44@aol.com', '(708) 710-1264', 'La Grange, IL, 60525', NULL, 'Web Design ', '$1,000 - $2,999', 'Wanna create an app I already have everything designed and set up. Just need to know how to move forward.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c91182d4-5341-4e46-9822-3e1a3241f79a', 'Patricia', '', NULL, 'Goshen, NY, 10924', 'Restaurant/food', 'Web Design', '$1,000 - $1,999', 'I have a website. Tje creador doesn’t let me have control of it. The website is not friendly. I am loosing money. My clients do not know what’s my address and how to find my menu.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c91ec126-f683-4d36-bbdc-6f800aa1b239', 'Miguel', '', '(206) 724-9921', 'Auburn, WA', NULL, 'Marketing Agencies', '500-999', 'i need leads for construction ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('c93125b5-49aa-485f-9255-c7c6158b0680', 'Jeremiah', 'jeremiahdavidrealtor@gmail.com', '(956) 435-5836', 'Alamo, TX, 78516', NULL, 'Web Design', 'Less than $500', 'Create a new website.  I’m gonna need one for yet it might be for a a real estat, produce, or clothing brand.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ca1b76a1-9486-4385-9ccc-edbc0ef48abe', 'Relena', 'relenaperdue@yahoo.com', '(484) 466-3946', 'Glenolden, PA', NULL, 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cb6cfc82-db25-4064-9d5f-61f6ff5e787c', 'Jennifer', 'ajlyka18@gmail.com', '(973) 641-8985', 'Port Charlotte, FL, 33954', 'Health and fitness', 'Web Design', 'Less than $500', 'Primary Care Provider IV hydration and weight loss program', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cc1f0c27-ac00-4a3e-91fe-d5ed1bdd211d', 'Melanie', 'lucylou.mt@gmail.com', '(504) 688-1476', 'Gretna, LA, 70053', NULL, 'Web Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cc6a9699-e79a-40d3-aa6b-fe7cd1068e9e', 'Client 1', 'client1@example.com', '+1123123123', NULL, 'Lambert and Bradford Inc', NULL, NULL, '\n\n[ASSIGNED TO Iftikhar]\n\n[ASSIGNED TO Adam Zain Nasir]', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-07-17 15:06:47', '2025-08-18 14:57:50', '2025-07-18', 'new', 'website', 0.00, 'medium', 50, NULL, NULL, NULL, NULL, 'Ali Admin'),
('cc6acad9-80fd-4239-8e92-e261c4467c87', 'Bowen', '26bleighton@mtbluersd.org\r', '(207) 491-7892', ' Anson, ME, 04911', 'Creative industries', 'Web Design ', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cc70b0e6-6750-427e-b785-219b787f8fca', 'Nakia', '', '', 'Kannapolis, NC, 28081', '', 'Web Design', 'Less than $500', '', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 500.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cd1ce9dc-cd62-46f6-9979-e4fd4a1aa883', 'Phil', '', '', 'Battle Creek, MI, 49015', '', 'Web Design', '$1,000 - $1,999', 'I am looking for a website to promote my part time business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-05', 'new', '', 1000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cdcbb6ee-449d-4c67-8c8b-30e6cf2b870d', 'Brenda', 'Bpallets15@gmail.com', '(512) 584-6460', 'Elgin, TX, 78621', 'Business services', 'Web Design ', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cdd3edd5-bdc4-443d-97a3-7fc6d0f8a463', 'Olivia', 'ocassalone@gmail.com', '(786) 405-6744', 'Miami, FL, 33129', 'Online store', 'Web Development', '', ' I am creating a meal kit business targeted towards younger people, the name is olives and i want the website to be clean fun the colors i would like to use are for sure lilac and a light green with whatever accents work best with that also i want the website to be easy to use and to the poin', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ce2cb16d-1eb5-4a95-b43c-f8b306cee8ff', 'Ron', 'ronharrower14@gmail.com', '5187442637', 'Ballston Spa, NY, 12020', 'Photography', 'Web Design', '$1,000 - $1,999', 'I have a website. This stale, so want to spruce it up. I also want to connect to Etsy where more art stuff is sold. I am a photographer', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ce328907-cc2d-4d7e-8f81-da4a910ba9b7', 'Patti', 'pgaut2012@gmail.com', '(860) 208-3824', 'Brasher Falls, NY, 13613', NULL, 'Web Design', 'Less than $500', 'Website for e-commerce sales', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ce4f146b-3c0e-4178-bb75-cb53d4443e21', 'Shannon', 'slpshannon2004@gmail.com', '(614) 702-8454', 'Circleville, OH, 43113', NULL, 'Web Design', 'Less than $500', 'I am looking for someone to be able to maintain the website for less than $600/year, and to be able to make a few edits to the website from time to time.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cea9d705-6b9d-42d2-8e8a-785490bce54f', 'Damon', 'tymezonin@gmail.com', '(312) 320-4984', 'Kankakee, IL, 60901', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ced6714e-55a3-4f14-b8cc-6289f3f28df5', 'Karen', 'hudkaren@aol.com', '(314) 616-0852', 'Colorado Springs, CO, 80906', '', 'Web Design ', '$500 - $999 ', 'Do you have any additional details?  Author site; book covers, phot, bio', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('cf1c5110-fcb6-4408-87ab-eea4d8632856', 'Jeffrey', 'jeff@newsfromtheotherside.com', '513-940-0044', 'Cincinnati, OH, 45249', 'newsfromtheotherside.com', 'Minor changes', 'Less than $500', 'I\'m looking for a designer who understands my vision and can help the current design have a polished edge. https://newsfromtheotherside.com/', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d052685d-da76-4d1f-83c7-7a666bf955f1', 'Max', 'maksimrobert@outlook.com', '(934) 386-0090', 'Wading River, NY, 11792', 'Shopify ', 'Web Design', '$500 - $999', 'I would like to make a website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d0e1b918-28bc-44fa-8e8b-f998b71f8cc6', 'Charisma', '', '(239) 258-0152', 'Fort Myers, FL, 33912', 'EHR for Medical Records', 'Mobile Software Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d0eb7741-6a44-4e6e-bf16-f3b3fe1c5aef', 'Briona', 'brionacockrell3@gmail.com', '(513) 656-9736', 'Cincinnati, OH, 45248', 'Live streaing app', 'Mobile Software Development', NULL, 'I would like to creat an online live-streaming app where everybody around the world can live stream freely & also get paid on the app', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d21630d5-6d05-43a6-b84c-52ae6c8e0bf7', 'Dale', 'deashley@comcast.net', '(215) 356-2718', 'Asheville, NC, 28803', 'Health & fitness', 'Web Design', '$500 - $999', 'Massage Therapy, custom massage products, signature pain relief balms and creams', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d2484bcc-8b67-4f9d-9855-c1b660bcc557', 'Malia Vincent-Finney', 'mmalia726@gmail.com / mvfinney8@gmail.com', '(951) 660-8717 / (951) 235-3586', 'Moreno Valley, CA, 92557', NULL, 'Mobile Software Development', NULL, 'I want to develop a personalized culinary app to help people eat healthy while learning how to make the best food choices for their lifestyle, health needs, nutrition and budget.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d30ca09a-cadb-4d7c-9e1c-67fd257f05f8', 'Troy ', 'perkinst004@gmail.com ', '(715) 829-2444 ', 'Cadott, WI, 54727', NULL, 'Web Design', ' $500 - $999 ', 'I need a e-commerce store built for my WordPress website, using Woo ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d3fa8b45-cb32-4ee7-83e2-5064cc47a331', 'Maurice ', 'Moeasy57@gmail.com', '(929) 220-6399', 'Ozone Park, NY, 11416  ', 'Website for Tumblers', 'Web Design', '$500 - $999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d439382d-6d68-4cba-9bc5-1cad37bd21c9', 'Stormy', 'mpt00346@icloud.com', '(279) 257-6753', 'Denver, CO, 80218', 'Web Design', 'Web Design', 'More than $5000', 'Please contact me so we can talk more better about the project.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d457e02a-e2d4-495d-b059-c21f8a0c4d4f', 'Gerard', 'francesca@francescarecords.com', '781-894-7984', 'Waltham, MA', 'Music', 'Web Design', ' I have no idea I need prices', 'I have a Bandzoogle website. I need pages created one time , the ability to sell items and take payment through PayPal. Any updates I want to be able to do like my monthly professional schedule after the designer is finished.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d4d3c537-1d0c-489e-9b4d-7a65847e062b', 'Theodore', 'schdytab@gmail.com', '(518) 496-8116', 'Dallas, TX, 75236', NULL, 'Web Design ', 'Less than $500', 'Create a new website for Spiritual Inspiration', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d4ef904a-a89f-4838-a3ed-38e710952547', 'Oquendo', 'blacksheep573@icloud.com', '(573) 219-1549', 'Columbia, MO, 65203', NULL, 'Mobile Software Development ', 'Less than $1,000', 'I need a app for my trash valet business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d543a814-570c-41e9-a41f-caaa424b2c0f', 'Darlene', 'darlene0824@me.com', '(919) 612-1922', 'Creedmoor, NC, 27522', 'Hair dresser', 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d5ff8b65-028e-4247-aecc-97fe2fc95355', 'Jonathan', '', NULL, 'Austin, TX, 78744', NULL, 'Web Design', ' $500 - $999', 'Create a new website to build a pair of single page landing pages for two separate but interconnected aspects of my business. I want to use Cardd.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d664e70b-30cc-47ca-af4c-a07d24a1f8ed', 'Robert', 'robertbprindle@icloud.com', '(614) 738-1726', 'Columbus, OH, 43202', NULL, 'Web Development', NULL, 'Parallax, glossy black, iPhone element somewhere. Unique.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d8a3ae4e-52d8-43b4-bf0e-f36eea15448a', 'Angicel', 'angicelr2020@icloud.com', '(347) 671-9777', 'Rahway, NJ, 07065', NULL, 'Web Design ', '$500 - $999', 'From my business to be successful, I am starting a eyelash business Also known as cosmetology I want my business to uplift woman, and I want them to know that they can look beautiful with or without them empowering them by my business is showing that you can be a strong woman, no matter what', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d8fe0802-aa6d-4745-9ce7-b44af6132d2e', 'Russ', '302russ@gmail.com', '(770) 294-9645', 'Locust Grove, GA', NULL, 'Web Design', 'Less than $500', 'I\'m thinking to create a website to market muscle car projects through pictures of the process. Possibly increasing usage later on', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('d97c4aeb-5f77-4914-af2f-13c58da50233', 'Keith Bebonis', 'Keith@bebon.com', '(847) 778-1672 / (312) 922-0566', 'Chicago, IL, 60604', 'office equipment repair', 'Major changes & PPC', '$2,000 - $2,999', 'I have a generic website that I need to revamp. I want to add some product but manly services we provide, Major changes to my website  built on Goduddy and I operate in office equipment repair', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('dacbbb4f-ff51-4def-8fd0-4dca324c5ef3', 'Casie', 'wellscasie1991@gmail.com', '(513) 616-3850', 'Lebanon, OH, 45036', 'cups and hoodies', 'web design', 'less than $500', 'I sell cups and wraps and hoodies shirts and sweatshirts and bags', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('db32253f-6406-4755-b65b-1a89ef7eaef8', 'Julie', 'J.karnes5459@gmail.com', '(952) 688-2185', 'Waconia, MN, 55387', NULL, 'Web Design', 'Less than $500', 'I am starting a Professional Organizing business. I will need a website designed. I have a logo drafted. I would also like my website to have links to items that people can shop. I would also like to know if someone is able to assist with my social media handles AND making sure everything is linked together properly. I hope this all makes sense. Thank you!', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('db4576d2-6fb9-4452-ae7f-32a2b3944e3c', 'Griffin ', 'Griffinsaccavino7@gmail.com', '(772) 631-4302', 'Port Saint Lucie, FL, 34984', NULL, 'Web Development', NULL, NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('dc0cc568-4b1a-4d70-9710-2f50fae51206', 'Angie', '', NULL, 'Cornelius, OR', NULL, 'SEO', NULL, 'I have my residential painting website Stylish Paining LLC and wanting it to come up when people search for paining jobs so looking to optimize it.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('dc3f6e28-f7dc-4d95-8199-3f42f82d0529', 'Maximillian', 'maximilliandesravines@gmail.com', '(305) 519-7883', 'Hollywood, FL', NULL, 'Web Design', '$2,000 - $2,999', 'I need a functional traffic driving website in hopes to generate more traffic for my concrete business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('dd204870-140d-4095-be8f-dd27ad613022', 'Lauren', 'lauren_brown8@yahoo.com', '(805) 813-4816', 'Haleiwa, HI, 96712', NULL, 'Graphic Design', NULL, 'Just creating a menu', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('dd5044dd-4b92-4356-9377-f00f3386b64c', 'Genny', 'gennyliu22@gmail.com', ' (520) 534-6161', 'Mesa, AZ, 85210 ', 'Swidish and Pressure Message Therapy', 'Web Design ', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('dd9a6858-0788-4821-baff-9753ba54ed9f', 'Brandon', 'pisciottab0723@gmail.com', '562 552 7495', 'Long Beach, CA', NULL, 'Marketing Agencies', '1000-2499', 'I am a broker over at Long Beach Real Estate. We are looking to expand our media/marketing strategy to build inbound leads. We do not have a massive budget but we do understand that we need to improve what we currently have going on.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('de27c70f-214f-4f3a-9c82-36a57d43b0c3', 'Brian', 'twistedcampers@gmail.com', '(223) 289-0835', 'Elizabethtown, PA, 17022', 'Retail/consumer goods', 'Web Design', 'Less than $500', 'Name of business is Twisted Camping Crew. Want to sell merch, do a blog. The website and merch will be for people in the camping and even world. I already have a logo', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-13', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('de4f4b7d-d930-4929-bc8b-6c435fadaacb', 'Joseph', 'joeab0412@gmail.com', '(724) 556-0608', ' New Castle, PA, 16101', 'Health & fitness', 'Create a new website', 'Less than $500', 'I have a non-profit organization, that I would like to start to promote with a nice website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-22', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('de537ac0-230e-49d5-aa7e-85969cd554fb', 'Norma', 'norma08gonzalez@yahoo.com', '(201) 508-7562', 'Jersey City, NJ, 07307', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('df253206-d9af-4d1a-ba46-7bdcfb60934c', 'Charles', '', NULL, 'Bradenton, FL, 34207', 'Creative industries', 'web design', '$5,000 or more', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('df4242c8-4842-4368-8629-3c4ce14a439b', 'Erik', 'sandovale604@icloud.com', '(209) 638-3064', 'San Jose, CA, 95122', NULL, 'Brand Design', NULL, 'I\'ve been working on a brand concept but need help puing it together i need a professional opinion and help making a logo and website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('df469342-4f05-4923-9c59-9f2e1e46a7f3', 'Savannah', 'savannahcaedence2@gmail.com', '(864) 275-6942', 'Web Design', 'Nail Spa', 'Web Design', NULL, 'Nail Spa', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-18', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e1b269b5-6571-4bbf-819d-6075a16d9126', 'Mcmahon', 'Carlo1941mac@gmail.com', '(254) 252-2859', 'Woodway, TX, 76712', NULL, 'Web Design', NULL, 'McMahon Rottweilers Kennels', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e1b71931-fcb6-4d06-aaa3-abfc294ffc02', 'Kaylee', 'Kfoster1516@gmail.com', '3194619426', 'Marengo, IA, 52301', NULL, 'Web Design', NULL, 'We are a powerwashing company , that also does outdoor work. Lawn mowing and cleaning decks, finces, and driveways, and cars .', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e38705d1-a35b-4743-b4b8-1ff865fc2e86', 'Ellen', 'ellenmirth7@gmail.com', '(508) 237-1791', 'Orleans, MA, ', 'Web Design ', 'Web Design ', '$1,000 - $1,999', 'Current site is very primitive.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-14', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e3967aa6-c8ce-4b5a-b768-30ed8f7efd96', 'Ines Izower', 'lizower@gmail.com', '(201) 519-9374', 'Westwood, NJ, 07675', 'Creative industries', 'Web Design', '$5,000 or more', 'Create a new website for Creative industries', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e407cfad-23cf-4b67-9308-9e35f6089300', 'Tia', 'tia@bliih.com', '18183311811', 'Philadelphia, PA, 19130', NULL, 'Web Design', '$2,000 - $2,999', 'Create a new website for Biotech Education & Workforce. Need a brochure website to highlight organization operations, sale merchandise online and raise funds for programming.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-02', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e4c61154-598d-4fdf-9431-2daaa6e7be97', 'Denise', 'chariotbride@gmail.com', '(248) 618-8868', 'Clarkston, MI, 48348', 'Retail / Consumer goods', 'Web Design ', '$500 - $999', 'I need a gallery page added I need a page removed', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e52f9d7b-1157-4290-b05f-54032e3fb76f', 'Miguel ', ' persafloor@gmail.com', '(714) 797-6083', 'Riverside, CA, 92503', 'Flooring Website', 'Web Design', '$500 - $999', 'Look in my website, PERSA FLOOR COVERING, SPANISH would be nice. www.persafloorinstallservices.com', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e564faa7-6579-4bc8-a41d-33ecb762503a', 'Cynthia', 'hereisoverthetop@gmail.com', '(206) 697-1872', 'Bainbridge Island, WA, 98110', NULL, 'Web Design', '$500 - $999', 'I\'m at the beginning phase of gathering thoughts, ideas, etc. -just hunting around to see what\'s involved, needed, copy, etc.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-24', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e5dce040-eaf5-4ce4-a7f2-d0acc3abcb48', 'Ursula', 'ursula@dtailspetservice.com', '(410) 300-0801', 'Elkridge, MD, 21075', 'Pet Service', 'Web Design', '$500 - $999', 'Right now. I\'m looking for someone to make content changes to my website. Also, at the moment my email on my website is not working. If you could trouble shoot too. I would also like SEO help.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e5f1db4c-c184-44ba-abf9-d24d394ad218', 'Trey', 'stockman.trey@gmail.com', '(615) 920-6831', 'Apopka, FL, 32703', 'Health & fitness', 'Web Design', '$1,000 - $1,999', 'Health and fitness page. Selling programming and subscriptions', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e6a55705-b330-4ad3-aeb6-e6e2630975d9', 'L Lourenco', 'Cemeterycenterfolds@yahoo.com', '(760) 684-5000', 'Phelan, CA, 92371', NULL, 'Web Design', 'Less than $500', 'Having problem finding matches though your business', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e6ac5098-116f-45a1-8b83-c950b068a22e', 'Azure', 'caelin.c@yahoo.com', '(704) 957-7277', 'Charlotte, NC, 28216', 'sell my paintings books', 'Web Design', 'Less than $500', 'This is to sell my paintings books and show case short film', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e710036f-88da-4c40-8cc5-66364c8f3307', 'Alexandra', '', NULL, 'Chicago, IL, 60660', NULL, 'Web Design', '$2,000 - $2,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e77cdc3b-f892-4a1a-8ab2-1801bba0d054', 'Warren', 'wrodkin@gmail.com', '(843) 298-1243', 'Hilton Head Island, SC, 29926', '', 'Web Design', '', 'I am sincerely interested', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e81e38a9-dc57-471d-9fc6-cf362f1d9f55', 'David', 'RealtorsGiftHub@gmail.com', '(727) 418-7026', 'Saint Petersburg, FL, 33715', 'RealtorsGiftHub.com', 'Web Design ', '$1,000 - $1,999', 'Upgrade site.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e85dcf4e-3036-44b1-bf20-c5f13aba1d7a', 'James', 'jsellers2021@yahoo.com', '(214) 735-7503', 'Dallas, TX, 75227', NULL, 'Logo Design ', NULL, 'Marketing/PR agencies, Social Media Marketing, Software & app development, Web Design', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e92cc5c5-cd3b-4e8e-9092-b31d4b4f098f', 'James', 'jamesacockrell@gbusjj.com', '(469) 307-3677', NULL, NULL, 'Web design', 'Less than $500', 'We are a startup, but have clients and want to make a simple, but professional website, using GoDaddy that represents what we do.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('e94a57e6-470c-4883-8d8e-0839dbed3b44', 'Bob', 'khetiabharat@msn.com', '(732) 447-4641', 'North Brunswick, NJ, 08902', 'Liquor store', 'Web Design ', 'Less than $500', 'I have domain and hosting by GoDaddy, I would like to have quotes for building an e commerce website for a liquor store', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ea572337-1fc6-41bb-aea8-121bac510233', 'Rita', 'rjsj76@gmail.com ', '(256) 206-5256', 'Athens, AL, 35614', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ea8dc599-0961-4e32-a6ea-2220a7a98abc', 'Robert', 'emeri0912@icloud.com\r', '8134950611', 'Wesley Chapel, FL,', 'Retail/consumer goods\r', 'Retail/consumer goods', 'less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-12', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('eb1e1a79-550d-40e9-96c9-89df35013965', 'Keisha', 'keishan0818@gmail.com', '(706) 691-4828', 'Woodruff, SC, 29388', NULL, 'Web Design', 'Less than $500', 'I will be selling skincare and self care products. Also will eventually branch into robes, pajamas etc. I want this website to really speak to individuals to take care of themselves.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('eb589b24-58af-480c-872a-534648bae298', 'Keith', 'kkauten8@gmail.com', '(319) 939-3791', 'North Liberty, IA, 52317', NULL, 'Web Design', NULL, 'I want something quote as soon as possible', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ed450164-4ded-4fc0-8db7-03ed412684ed', 'Richie', 'richie@freedomathleticsnc.com', '828-818-0099', 'Blowing Rock, NC, 28605', NULL, 'Major changes', 'Less than $500', 'Major changes to my Shopify website.  I have been working on my website myself, learning from different people on YouTube. However, I\'m not being many views and the conversation rate is terrible.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ed45c9f0-3acf-46cc-a838-d5628c053e57', 'Christin', 'innorexmusicpublish@mail.com', '470-209-5105', 'Scottsdale, AZ, 85255', NULL, 'Web Design', NULL, 'Consideration give me a call this Saturday when I’m off work before noon if I don’t answer leave a voicemail I return your call', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-10', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ed73ac6d-6990-4a76-9452-72825bd3b14b', 'Nathan', 'nate.peterson@gmail.com', '(605) 553-3971', 'Sioux Falls, SD, 57110', NULL, 'Web Design ', ' $500 - $999', 'Create a new website To advertise my business/services', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('eda9350a-aa35-48b0-825e-a1efabb9b6ab', 'Antony', 'antonylivingston@hotmail.com', '(561) 578-0202', 'Jupiter, FL, 33469', '', 'Web Design ', ' $2,000 - $2,999', 'Create a new website to build a betting help site with weekly subscriptions. This is based on AI, analytics and a probability program that we use. It will be informative and require mass emails each week with short videos of the proposed picks', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ee3d0cde-ed0b-4f17-83c9-95e537b141a8', 'Andrew', 'abello.pinnacle@gmail.com', '(254) 349-2579', 'Waco, TX, 76708', 'https://www.facebook.com/Pinnacleheatandac', 'Web Design ', 'Less than $500', 'Our business is a licensed heating and cooling service and installation company. We have 30 plus years experience and a trademark logo. We service all brands.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-20', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown');
INSERT INTO `leads` (`id`, `client_name`, `email_address`, `contact_number`, `city_state`, `business_description`, `services_required`, `budget`, `additional_info`, `user_id`, `created_at`, `updated_at`, `date`, `status`, `source`, `price`, `priority`, `lead_score`, `last_contact`, `next_follow_up`, `converted_at`, `sales_disposition_id`, `agent`) VALUES
('eea334ae-c37d-49e9-9a7e-8e7ca4152cdd', 'Jason', 'jason.libertytools@gmail.com', '(615) 308-9299', 'Hendersonville, TN, 37075', NULL, 'Web Design', 'Less than $500', 'I’m a new start up business and I sell industry supply items. I have over 12 vendors that I sell through my business. I would like to a Business Website that showcases my business and capabilities and do a ON LINE E COM Store.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f01d43d7-d68f-4ee3-911e-367d81785a98', 'Michelle James', 'mjames5432@gmail.com', '(410) 905-2670', 'Washington, DC, 20018', 'Health & fitness', 'Major changes', ': $2,000 - $2,999', 'Major changes to my Wix website. It\'s for Health & fitness', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f0f8e74b-f1a7-4731-994b-11b429351b4c', 'Frank', 'abaym31@yahoo.com', '786-586-3868', 'Jacksonville, NC, 28546', '', 'Graphic Design', '', 'i am looking to make membership cards. The color scheme being black and red. The businesses name is Miami Guns abbreviation is MG. The card will be horizontal and a place for signature is on the back, as well i will be doing different tiers of membership so card design gets better based on tier. demographic is people who like to guns. I want to have a barcode on the back of card. I’ve attached my business cards for reference.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f1012b17-a705-4dbe-b514-cc190afdaace', 'AJ', '', NULL, 'Denver CO', 'retail/consumer goods', 'Web Design', '$500 - $999', 'Change my website to look more appealing\r', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f10efb85-c388-4a9c-b187-ad0e19b9a0d3', 'Andy', 'ajt55372@gmail.com', '(612) 306-7876', 'Prior Lake, MN, 55372', NULL, 'Web Design', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-25', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f137ec65-b2d1-4cdf-9316-5a123f55aa84', 'Pam', 'marybellesantiqueandgifts@gmail.com', '(901) 268-3476', 'Florence, AL, 35634', NULL, 'Web Design', '$500 - $999', 'I need some webpage help', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-26', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f280fa42-c589-4c2f-b5d9-9fa8146ad445', 'Henry', 'Henry.Cheng@Carlilerealty.com', '(415) 500-5805', 'Rancho Cordova, CA,', 'Financial Services', 'Web Design ', 'Less than $500', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f28a173a-c2e6-48bd-8bd3-ed425ae31e15', 'Otto', 'omarracello@gmail.com', '(516) 702-1937', 'Saint Augustine, FL, 32095', NULL, 'Web Design ', 'Less than $500', 'Create a new website for advertising black car service rides for airports and other events. Would like it liked with a bank account and new phone number and able to take credit card payments also.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f2cbba76-fbf5-4018-a7e1-551847a3e04c', 'Jhonta', 'milestay888@icloud.com', '(864) 566-0638', 'Greenville, SC, 29611 ', NULL, 'Web Development', NULL, 'Sell clothing', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-05', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f329975d-bd82-4fec-bb3c-828fd54c4ed9', 'Julie', 'Julie.k.duguay@gmail.com', '(408) 887-8201', 'Leander, TX, 78641', NULL, 'Major changes', 'Less than $500', 'Major changes to my Beef website', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-11', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f3477769-0c33-4429-ad50-fbc9a97180e0', 'George', 'georger1825@gmail.com\r', '(309) 299-8987', ' Alexis, IL, ', 'ecommerce', 'web design', 'Less than $500', 'To sell products/services e.g. e-commerce\r', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-23', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f3e05d55-21c9-4fc8-b194-41642a209104', 'Deborah', 'deborahreynolds14@gmail.com', '(407) 595-4172', 'Orlando, FL, 32819', 'Notary', 'Web Design', 'Less than $500', 'Notary Service', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-15', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f4571acd-ece2-407a-833d-adba0cb94a9c', 'David', 'DAVIDMERLEEATON@GMAIL.COM', '(407) 227-5932', 'Winter Park, FL, 32792', NULL, 'Web Design', '$500 - $999', 'Please do not call me. Please introduce yourself by email. A simple website offering one product for sale.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-10', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f53328ae-72aa-46ac-a9bc-b45b4adda856', 'Caitlin ', 'caitlinrichardson998@gmail.com', '(405) 403-8965', 'Oklahoma City, OK, 73159', 'Selling', 'Web Design', '$1,000 - $1,999', NULL, NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-17', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f679e2c6-5d4d-443b-923e-96bdee645f65', 'Breon', 'breontv2@gmail.com', '(470) 453-8984', 'Mcdonough, GA, 30253', NULL, 'Web Design', 'Less than $500', 'That’s all I want and I will like grow with my own crew and be my own fashion seter', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-08', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f6d84a4b-bcd9-4dd0-9dd2-9d468c2c86a9', 'Quortnee', '', '14049858441', 'Atlanta, Georgia', 'Body Fitness', 'Mobile Software Development', ' 3000-5000', 'I’m an owner of a fitness boutique style gym, geared towards personal training. I want to expand my community of training through the app. Offering pre-recorded workouts, community interactions etc…', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-16', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f707222e-db2f-4f33-8ef9-a03428e459cf', 'C Brad Moncrief', ' brad@sterlingsu.com ', '(601) 937-1767', 'Madison, MS, 39110', 'Financial services', 'Minor changes', '$2,000 - $2,999', 'Looking to upgrade square space website my front end and back end to the same look and feel', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f811bcfd-c9e6-45fb-848c-99f1c7c13fc0', 'Noel', 'lamarrdelmore@gmail.com', '(973) 214-6464', 'South Plainfield, NJ', '', 'Web Design', '$500 - $999', 'Create a new website for Go High Level for speaking engagements, coaching and selling products.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('f9134ebd-84a4-4355-b7ce-38d170625c0d', 'Elizabeth', 'hoosierblastmasters@yahoo.com ', ' 812-240-8850', 'Riley, IN, 47871', 'Mobile sandblasting https://www.hoosierblastmasters.com', 'Minor changes', 'Less than $500 ', 'Minor changes to my Wix website. My Mobile sandblasting website is created, I just need copyright, ADA compliance, privacy policy, and security updates added. Everything to make it legal. ', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', '', 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('fb02cbb4-78a0-46cb-ad83-bf6b3b5f62ca', 'Jeannene Bryan', 'jdevinephotography@gmail.com', '813-404-3420', 'Valrico, FL, 33594', NULL, 'Web Design', 'Less than $500', 'Create a new website and Need a professional website I need to introduce myself.I need a gallery, appreciation page', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('fcafedfc-dcb0-4c6b-b429-c1319fea2ece', 'Carrie', 'carriebayton@yahoo.com', '(913) 217-8197', 'Belton, MO, 64012', NULL, 'Web Design', 'Less than $500', 'Create a new website for my business services', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-04', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('fce8adb1-60bc-487e-a096-3b1163216802', 'Rae Rodriguez', 'rachelrn0225@yahoo.com', '(973) 962-0431 / (973) 666-1144', 'Wayne, NJ, 07470', NULL, 'SEO', '$5,000 or more', 'SEO, Generate content, Improve Google/Bing ranking, Improve my site structure, Promote my website, Rank for specific keywords, Technical SEO, Website audit', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-03', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('fe34a273-6bc0-4b88-b54c-9778b96ab306', 'Shirin Salehi', 'shirinsalehi@yahoo.com', '(703) 489-5427', 'Oakton, VA, 22124', NULL, 'Mobile Software Development', '$20,000 or more', 'Info: Develop a new app, this project is for Application - social media.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-09', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('feb74701-b382-4ae8-8add-b44d8b619a07', 'Jason', '', NULL, 'Belle Chasse, LA, 70037', NULL, 'Web Design', 'Less than $500', 'Make a website I can hook through an e-commerce dropshipping store for custom clothes and apparel through printful', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-06', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('fef37936-ef53-4622-a335-ac03d92f9910', 'Isaac', 'vanhoose30@icloud.com', '(937) 846-6514 ', 'New Carlisle, OH, 45344', NULL, 'Web Design ', 'Less than $500', 'I’m wanting a starter website for my future lawn care service where I will be mowing, weed eating, edging, and blowing yards', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-04-19', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('ff30f8a8-62d4-4cb8-85a2-7e22dd687ce1', 'Zoey', 'zoey.seeley@icloud.com', '(830) 357-6128', 'Bulverde, Texas', 'Creative industries', 'Web Design ', 'Less than $500', 'Colors are hot pink bright teal and white Confetti slime is the company name', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-29', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown'),
('fff3340b-66c0-456e-bcc4-f65532f992e2', 'Kelly', 'kellykatedesign@gmail.com', '(630) 699-7898', 'Wheaton, IL, 60189', NULL, 'Web Design', '$500 - $999', 'I created a Shopify account but want to add some features that I don’t know how to do.', NULL, '2025-08-27 23:38:03', '2025-08-18 14:57:50', '2025-03-21', 'new', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Unknown');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` text DEFAULT NULL,
  `sender_id` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `message_type` text DEFAULT NULL,
  `parent_message_id` text DEFAULT NULL,
  `reply_to_message_id` text DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT NULL,
  `edited_at` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `deleted_at` text DEFAULT NULL,
  `deleted_by` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `message_type`, `parent_message_id`, `reply_to_message_id`, `is_edited`, `edited_at`, `is_deleted`, `deleted_at`, `deleted_by`, `created_at`, `updated_at`) VALUES
('01d1446b-af81-4398-afe7-2815211d8153', '5aa9da4a-4499-4be7-90eb-063229f4db0b', '8c9c203b-28ca-4af0-a381-0f809e791155', 'hi', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, '2025-08-06T00:53:34.667209+00:00', '2025-08-06T00:53:34.667209+00:00'),
('10f19557-f2f7-42b0-a5bd-097ceef01955', '5aa9da4a-4499-4be7-90eb-063229f4db0b', '78294d98-4280-40c1-bb6d-b85b7203b370', 'hi', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, '2025-08-06T00:53:20.873141+00:00', '2025-08-06T00:53:20.873141+00:00'),
('2c77ee45-76e7-4b50-8220-35bb12829a77', '8c6e25fb-a92e-4850-92b6-bb9cbc8d7d62', 'ad828522-a32f-4512-9e17-bc5d65bee506', 'hi', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, '2025-08-11T19:46:07.304859+00:00', '2025-08-11T19:46:07.304859+00:00'),
('678ec085-1f56-4dc9-b341-8544c6f2f6d4', '8c6e25fb-a92e-4850-92b6-bb9cbc8d7d62', 'ad828522-a32f-4512-9e17-bc5d65bee506', 'hi', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, '2025-08-26T18:53:36.684788+00:00', '2025-08-26T18:53:36.684788+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_mentions`
--

CREATE TABLE `message_mentions` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `mentioned_user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_reactions`
--

CREATE TABLE `message_reactions` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `emoji` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_search`
--

CREATE TABLE `message_search` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `content_tsv` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_threads`
--

CREATE TABLE `message_threads` (
  `id` varchar(36) NOT NULL,
  `parent_message_id` varchar(36) DEFAULT NULL,
  `thread_name` varchar(255) DEFAULT NULL,
  `participant_count` int(11) DEFAULT 0,
  `reply_count` int(11) DEFAULT 0,
  `last_reply_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `display_name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `display_name`, `description`, `created_at`) VALUES
('1', 'dashboard', 'Dashboard', 'Main dashboard access', '2025-07-25T22:15:35.961208'),
('10', 'messages', 'Messages', 'Message system', '2025-07-25T22:15:35.961208'),
('11', 'automation', 'Marketing Automation', 'Marketing automation', '2025-07-25T22:15:35.961208'),
('12', 'calendar', 'Calendar', 'Calendar management', '2025-07-25T22:15:35.961208'),
('13', 'documents', 'Documents', 'Document management', '2025-07-25T22:15:35.961208'),
('14', 'employees', 'Employees', 'Employee management', '2025-07-25T22:15:35.961208'),
('15', 'user_management', 'User Management', 'User account management', '2025-07-25T22:15:35.961208'),
('16', 'settings', 'Settings', 'System settings', '2025-07-25T22:15:35.961208'),
('17', 'front_sales_management', 'Front Sales Management', 'Front sales management', '2025-07-25T22:15:35.961208'),
('18', 'my_dashboard', 'My Dashboard', 'Personal dashboard', '2025-07-25T22:15:35.961208'),
('2', 'leads', 'Leads', 'Lead management', '2025-07-25T22:15:35.961208'),
('3', 'customers', 'Customers', 'Customer management', '2025-07-25T22:15:35.961208'),
('5', 'upsell', 'Upsell', 'Upsell management', '2025-07-25T22:15:35.961208'),
('55', 'role_management', 'Role Management', 'Manage user roles and permissions', '2025-07-28T23:25:41.37035'),
('56', 'hr', 'HR', 'Human Resources Management', '2025-07-29T15:59:33.906308'),
('57', 'management', 'Management', 'Management Dashboard and Tools', '2025-07-29T15:59:34.936802'),
('58', 'marketing', 'Marketing', 'Marketing Department Tools', '2025-07-29T15:59:35.907617'),
('59', 'development', 'Development', 'Development Department Tools', '2025-07-29T15:59:36.839188'),
('6', 'projects', 'Projects', 'Project management', '2025-07-25T22:15:35.961208'),
('60', 'production', 'Production', 'Production Department Tools', '2025-07-29T15:59:37.287899'),
('61', 'upseller', 'Upseller', 'Upseller Department Tools', '2025-07-29T15:59:38.933914'),
('62', 'other', 'Other', 'Other Department Tools', '2025-07-29T15:59:39.866504'),
('63', 'all_projects', 'All Projects', 'View All Projects', '2025-07-29T15:59:40.903765'),
('64', 'my_projects', 'My Projects', 'View My Assigned Projects', '2025-07-29T15:59:41.874166'),
('65', 'project_assignment', 'Project Assignment', 'Assign Projects to Team Members', '2025-07-29T15:59:42.31964'),
('66', 'project_detail', 'Project Detail', 'Detailed Project Information', '2025-07-29T15:59:43.256729'),
('67', 'recurring_service_detail', 'Recurring Service Detail', 'Detailed Recurring Service Information', '2025-07-29T15:59:44.208664'),
('68', 'customer_profile', 'Customer Profile', 'Customer Profile Management', '2025-07-29T15:59:44.666408'),
('69', 'better_ask_saul', 'Better Ask Saul', 'AI Assistant Tool', '2025-07-29T15:59:45.104168'),
('7', 'kanban', 'Kanban', 'Kanban board', '2025-07-25T22:15:35.961208'),
('70', 'marketing_automation', 'Marketing Automation', 'Marketing Automation Tools', '2025-07-29T15:59:45.542597'),
('71', 'sales_form', 'Sales Form', 'Enhanced Sales Form for creating sales dispositions', '2025-07-29T16:18:45.776967'),
('72', 'front_sales', 'Front sales', 'Front sales Department', '2025-07-29T16:32:03.135082'),
('75', 'upseller_management', 'Upseller Management', 'Upseller team and target management', '2025-08-11T20:41:15.547271'),
('8', 'payments', 'Payments', 'Payment management', '2025-07-25T22:15:35.961208'),
('9', 'recurring_services', 'Recurring Services', 'Recurring services management', '2025-07-25T22:15:35.961208');

-- --------------------------------------------------------

--
-- Table structure for table `payment_plans`
--

CREATE TABLE `payment_plans` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `type` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `frequency` text DEFAULT NULL,
  `total_installments` int(11) DEFAULT NULL,
  `installment_amount` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `next_payment_date` text DEFAULT NULL,
  `start_date` text DEFAULT NULL,
  `end_date` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_plans`
--

INSERT INTO `payment_plans` (`id`, `name`, `type`, `description`, `is_active`, `created_at`, `frequency`, `total_installments`, `installment_amount`, `amount`, `next_payment_date`, `start_date`, `end_date`) VALUES
('08f923b7-4c8a-4e63-974d-913a63f788fe', 'Custom Installments', 'custom_tenor', 'Custom payment schedule with multiple installments', 0, '2025-08-22T22:37:25.796799+00:00', 'monthly', 1, 0, 0, '2025-09-25', '2025-08-25', '2026-08-25'),
('1855e9f2-0086-43d1-836f-346153a59018', 'One Time Payment', 'one_time', 'Single payment for project completion', 0, '2025-08-22T22:37:25.796799+00:00', 'monthly', 1, 0, 0, '2025-09-25', '2025-08-25', '2026-08-25'),
('42751fa3-af68-4087-984a-177014b8e817', 'Quarterly Recurring', 'recurring', 'Quarterly recurring payments for ongoing services', 0, '2025-08-22T22:37:25.796799+00:00', 'monthly', 1, 0, 0, '2025-09-25', '2025-08-25', '2026-08-25'),
('58c2458a-29df-4b27-a590-d33ac51b2908', 'Testing - recurring Payment Plan', 'recurring', 'Payment plan for Testing upsell services', 1, NULL, 'yearly', 1, NULL, 1000, '2026-09-01', NULL, NULL),
('b71839a8-7f04-4f32-85b5-cb4eb5bdaf71', 'Jack - recurring Payment Plan', 'recurring', 'Payment plan for Jack upsell services', 0, '2025-08-25T22:19:21.082276+00:00', 'yearly', 1, NULL, 3000, '2026-08-25', NULL, NULL),
('c2393cd3-72c8-4386-a03d-823aa0b529bc', 'Monthly Recurring', 'recurring', 'Monthly recurring payments for ongoing services', 0, '2025-08-22T22:37:25.796799+00:00', 'monthly', 1, 0, 0, '2025-09-25', '2025-08-25', '2026-08-25'),
('f4e36250-56fb-4865-b98f-880e04e6a059', 'Yearly Recurring', 'recurring', 'Yearly recurring payments for ongoing services', 0, '2025-08-22T22:37:25.796799+00:00', 'monthly', 1, 0, 0, '2025-09-25', '2025-08-25', '2026-08-25');

-- --------------------------------------------------------

--
-- Table structure for table `payment_sources`
--

CREATE TABLE `payment_sources` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `type` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_sources`
--

INSERT INTO `payment_sources` (`id`, `name`, `type`, `is_active`, `created_at`, `updated_at`) VALUES
('1379f646-d1ba-46bb-9ab4-c7160b306e08', 'ZELLE AZ SKYLINE', 'zelle', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('4d4e594e-c454-478d-9b85-ad8c736759b6', 'Authorize.net ADA', 'authorize_net', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('6ac3ea13-1309-48ea-a8fb-7b49ff15ffb7', 'WIRE Transfer', 'wire', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('6bbf54ce-f7b9-4da1-8d08-bf1caaadd33f', 'SWIPE SIMPLE ADA', 'swipe_simple', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('8459d7c2-f352-47df-8da6-1a92b2236c13', 'ZELLE AZ TECH', 'zelle', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('9c5b38d1-c40f-41b9-b118-666ba2255dd7', 'ZELLE ADA', 'zelle', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('a9c52ab4-6d97-4fa3-acc4-f6b2809d771c', 'PAY BRIGHT AZ TECH', 'pay_bright', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('c49b622f-8f6d-452b-8f3a-230df5412721', 'SQUARE SKYLINE', 'square', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('e625d532-fe56-4e16-a0ec-16171404ba28', 'PayPal OSCS', 'paypal', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('eeab91df-e6c1-4163-9582-aa013e34ebb6', 'Authorize.net OSCS', 'authorize_net', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00'),
('fdabe796-f97b-41f3-bd95-960f95f51fc6', 'CASH APP ADA', 'cash_app', 0, '2025-08-22T22:37:25.796799+00:00', '2025-08-22T22:37:25.796799+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `payment_source_id` varchar(36) DEFAULT NULL,
  `transaction_type` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `attributes` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `resource`, `action`, `description`, `attributes`, `created_at`) VALUES
('0738f540-989d-47fc-9955-3d024d33c922', 'leads', 'read', 'View leads', '{}', '2025-08-28 12:43:02'),
('07872042-25b1-4623-bc5f-4d184a1a8d8c', 'employees', 'read', 'View employee information', '{}', '2025-08-28 12:43:02'),
('07eb3555-ed2d-44ac-a321-b5f55e8db7bd', 'leads', 'create', 'Create new leads', '{}', '2025-08-28 12:43:02'),
('095c2529-dfcd-438e-957d-8f63a55819e2', 'customers', 'create', 'Create customer records', '{}', '2025-08-28 12:43:02'),
('1900801a-4d1e-4502-81b1-2875ef000693', 'customers', 'delete', 'Delete customer records', '{}', '2025-08-28 12:43:02'),
('3bee17f0-7ef3-4ee4-8de4-3ec97217b646', 'reports', 'view', 'View reports', '{}', '2025-08-28 12:43:02'),
('43969bfe-e428-45f4-8c78-4be5ca2e473d', 'projects', 'create', 'Create projects', '{}', '2025-08-28 12:43:02'),
('4d84e509-8748-4cff-a505-5fd3db9fff76', 'employees', 'update', 'Edit employee information', '{}', '2025-08-28 12:43:02'),
('51277fad-3b0e-47e0-9f98-3b44991dbe8d', 'customers', 'read', 'View customer information', '{}', '2025-08-28 12:43:02'),
('525118f7-07c0-4696-a8eb-a787f5c9a650', 'users', 'manage', 'Manage user accounts', '{}', '2025-08-28 12:43:02'),
('564b873c-04af-4206-aaec-5e9546b35121', 'employees', 'create', 'Create employee records', '{}', '2025-08-28 12:43:02'),
('5dcae717-6718-429a-8563-0dac389030d8', 'leads', 'delete', 'Delete leads', '{}', '2025-08-28 12:43:02'),
('7de3db4e-913c-45fa-9578-b137134dc327', 'leads', 'update', 'Edit leads', '{}', '2025-08-28 12:43:02'),
('840f26f3-41a1-422f-b3d3-ed59a1dd09c1', 'projects', 'update', 'Edit projects', '{}', '2025-08-28 12:43:02'),
('97896696-b6d6-45f7-ae88-4892314d0438', 'roles', 'manage', 'Manage roles and permissions', '{}', '2025-08-28 12:43:02'),
('a21fc4eb-70a5-4845-9a22-abcd30fe8841', 'customers', 'update', 'Edit customer information', '{}', '2025-08-28 12:43:02'),
('a4e0311d-3d5a-48b2-b2c9-949f770ba08c', '*', '*', 'All permissions on all resources', '{}', '2025-08-28 12:43:02'),
('b7221e19-bfc0-4379-bee3-ae9008efdd00', 'projects', 'read', 'View projects', '{}', '2025-08-28 12:43:02'),
('c9c2d32a-cdc4-4b90-883b-6bebc65a9337', 'employees', 'delete', 'Delete employee records', '{}', '2025-08-28 12:43:02'),
('d4d18745-acc6-427f-a8a8-698fe5e4e52c', 'audit', 'view', 'View audit logs', '{}', '2025-08-28 12:43:02'),
('fd6c8192-1e1b-4fc9-81ea-875d55df8688', 'projects', 'delete', 'Delete projects', '{}', '2025-08-28 12:43:02'),
('fe156e4d-c807-45ba-ac35-e5d616bf838c', 'dashboard', 'view', 'Access dashboard', '{}', '2025-08-28 12:43:02');

-- --------------------------------------------------------

--
-- Table structure for table `permission_audit_log`
--

CREATE TABLE `permission_audit_log` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `permission_granted` tinyint(1) NOT NULL,
  `context` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pinned_messages`
--

CREATE TABLE `pinned_messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `pinned_by` varchar(36) DEFAULT NULL,
  `pinned_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `client` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `due_date` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `progress` int(11) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lead_id` varchar(36) DEFAULT NULL,
  `sales_disposition_id` varchar(36) DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `services` text DEFAULT NULL,
  `project_manager` text DEFAULT NULL,
  `assigned_pm_id` varchar(36) DEFAULT NULL,
  `assignment_date` text DEFAULT NULL,
  `project_type` text DEFAULT NULL,
  `is_upsell` tinyint(1) DEFAULT 0,
  `parent_project_id` text DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `amount_paid` decimal(15,2) DEFAULT NULL,
  `payment_plan_id` text DEFAULT NULL,
  `payment_source_id` text DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` text DEFAULT NULL,
  `next_payment_date` text DEFAULT NULL,
  `total_installments` int(11) DEFAULT NULL,
  `current_installment` int(11) DEFAULT NULL,
  `installment_frequency` text DEFAULT NULL,
  `installment_amount` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `client`, `description`, `due_date`, `status`, `progress`, `user_id`, `created_at`, `updated_at`, `lead_id`, `sales_disposition_id`, `budget`, `services`, `project_manager`, `assigned_pm_id`, `assignment_date`, `project_type`, `is_upsell`, `parent_project_id`, `total_amount`, `amount_paid`, `payment_plan_id`, `payment_source_id`, `is_recurring`, `recurring_frequency`, `next_payment_date`, `total_installments`, `current_installment`, `installment_frequency`, `installment_amount`) VALUES
('183863b8-f0be-4c54-bcd2-09ce571e2ea9', 'Jack - Web Design', 'Jack', 'Fresh website', '2025-09-24', 'assigned', 0, '78294d98-4280-40c1-bb6d-b85b7203b370', '2025-08-25 15:29:16', '2025-08-25 17:01:14', '6a8baab9-4f17-470e-9c07-ac8aada2dd88', '05a82562-c573-422d-8a65-72ffe86d8a9d', 0.00, '[\"Web Design\"]', NULL, '4c74f743-fa52-470d-ba55-8343f2099041', '2025-08-25T21:50:22.006+00:00', 'one-time', 0, NULL, 1500.00, 500.00, NULL, NULL, 0, NULL, '2025-09-25', 3, 1, 'monthly', 0.00),
('40195351-5734-4f76-b362-4bb347f202e3', 'Justin - Web Development', 'Justin', 'Fresh Website', NULL, 'unassigned', NULL, NULL, '2025-09-05 14:25:07', '2025-09-05 14:25:07', '00083c33-212b-4233-9251-f09e6704fcba', '47d1e708-cdc5-4e96-a5af-293b6083aefc', 1000.00, '[\"Web Development\"]', NULL, NULL, NULL, 'one-time', 0, NULL, 1000.00, 0.00, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
('4baa8904-9803-4b3f-953d-382a7830eff1', '2D Animation - Testing (Upsell)', 'Testing', 'Upsell project: 2D Animation - Test upsell service details - should only create sales disposition', NULL, 'pending', NULL, NULL, '2025-09-01 13:51:08', '2025-09-01 13:51:08', NULL, '7d9f3c54-b3d0-4184-bf0a-7fd8f69932bc', 1500.00, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1500.00, 0.00, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
('8249f78f-83cf-4b25-995d-04a6519d9022', 'Kendra Quashie - Web Design', 'Kendra Quashie', 'Complete web design with development', '2025-09-17', 'assigned', 0, '78294d98-4280-40c1-bb6d-b85b7203b370', '2025-08-18 15:07:12', '2025-08-25 17:01:14', '52f9aadb-0460-4a8e-9a7f-e07b451d8f41', 'd676ab4f-eed3-4820-b5cb-86239c86daf0', 0.00, '[\"Web Design\"]', NULL, 'c68193f0-bb0e-47d3-bdd7-a717acd775f6', '2025-08-25T21:50:26.797+00:00', 'one-time', 0, NULL, 6000.00, 3000.00, NULL, NULL, 0, NULL, NULL, 1, 1, NULL, 0.00),
('90ec9330-fb7c-4fb5-ad8b-a547192cb6f3', 'Testing - Web Design', 'Testing', 'Fresh Website', NULL, 'review', NULL, NULL, '2025-08-29 12:19:02', '2025-09-01 17:02:48', '104ed258-b9a6-4c7e-8de0-14352b95b51e', 'f1990c74-34aa-42d2-8457-1762be29747c', 2000.00, '[\"Web Design\"]', NULL, '4c74f743-fa52-470d-ba55-8343f2099041', '2025-09-01 21:35:04', 'one-time', 0, NULL, 2000.00, 0.00, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
('94a9be99-58c0-4211-9192-2744361362da', '2D Animation - Testing (Upsell)', 'Testing', 'Upsell project: 2D Animation - Test upsell service details', NULL, 'pending', NULL, NULL, '2025-09-01 13:38:33', '2025-09-01 13:38:33', NULL, '7b1f9cb8-a619-45be-8eac-244762cf6b5a', 2000.00, NULL, NULL, NULL, NULL, NULL, 1, NULL, 2000.00, 0.00, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
('aba50555-ad87-4af0-af47-76c38f1098fc', '2D Animation - Testing (Upsell)', 'Testing', 'Upsell project: 2D Animation - Test upsell service details - should only create sales disposition', NULL, 'pending', NULL, NULL, '2025-09-01 13:50:39', '2025-09-01 13:50:39', NULL, 'b12a736e-d24f-47ba-a12a-0beace075735', 1500.00, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1500.00, 0.00, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL),
('b80623c2-5dce-4ada-9d67-ab48a0b1489d', 'Web Design - Jack (Upsell)', 'Jack', 'Upsell project: Web Design - Custom Website', '2025-09-24', 'assigned', 0, 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:21:34', '2025-09-01 16:37:21', NULL, 'd9d186db-87ce-4f49-8d64-76895398ff91', 5000.00, '[\"Web Design\"]', NULL, '4c74f743-fa52-470d-ba55-8343f2099041', '2025-09-01 21:37:21', 'one-time', 0, NULL, 5000.00, 3000.00, NULL, NULL, 0, NULL, NULL, 1, 1, NULL, 0.00),
('be6a46aa-5595-45ee-b4fd-c698fcf07e93', 'Maintenance - Jack (Upsell)', 'Jack', 'Upsell project: Maintenance - 1 year maintenance', '2025-09-24', 'unassigned', 0, 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:19:21', '2025-08-25 17:19:21', NULL, '63cca759-3de1-4ad8-a16b-1a59aa789b20', 3000.00, '[\"Maintenance\"]', NULL, NULL, NULL, 'one-time', 0, NULL, 3000.00, 3000.00, 'b71839a8-7f04-4f32-85b5-cb4eb5bdaf71', NULL, 0, 'yearly', '2026-08-25', 1, 1, NULL, 0.00),
('c314d9f5-46e4-45ba-909b-2570e10c892c', 'VPS Hosting - Pro - Testing (Upsell)', 'Testing', 'Upsell project: VPS Hosting - Pro - 1 year hosting', NULL, 'pending', NULL, NULL, '2025-09-01 13:40:09', '2025-09-01 13:40:09', NULL, 'c1123082-e91c-4169-b470-8dd995313805', 1000.00, NULL, NULL, NULL, NULL, NULL, 1, NULL, 1000.00, 0.00, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_tasks`
--

CREATE TABLE `project_tasks` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `task_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_upsells`
--

CREATE TABLE `project_upsells` (
  `id` varchar(36) NOT NULL,
  `original_project_id` varchar(36) DEFAULT NULL,
  `upsell_type` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `additional_amount` decimal(15,2) DEFAULT NULL,
  `payment_source_id` varchar(36) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recurring_payment_schedule`
--

CREATE TABLE `recurring_payment_schedule` (
  `id` varchar(36) NOT NULL,
  `project_id` text DEFAULT NULL,
  `frequency` text DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `next_payment_date` text DEFAULT NULL,
  `total_payments` int(11) DEFAULT NULL,
  `payments_completed` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `recurring_payment_schedule`
--

INSERT INTO `recurring_payment_schedule` (`id`, `project_id`, `frequency`, `amount`, `next_payment_date`, `total_payments`, `payments_completed`, `is_active`, `created_at`) VALUES
('4fca6bb8-7cc6-4bdf-93c9-f0a17b7f6636', 'c314d9f5-46e4-45ba-909b-2570e10c892c', 'yearly', 1000, '2026-09-01', 12, 0, 1, NULL),
('542cc0cf-7f19-4169-985c-579f0240a07e', 'be6a46aa-5595-45ee-b4fd-c698fcf07e93', 'yearly', 3000, '2026-08-25', 12, 0, 0, '2025-08-25T22:19:22.109003+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `display_name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `hierarchy_level` int(11) DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT 0,
  `permissions` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `hierarchy_level`, `is_system_role`, `permissions`, `created_at`, `updated_at`) VALUES
('26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'upseller', 'Upseller', 'Make an upsell on on-board accounts and manage their projects.', 50, 0, '[{\"module_name\":\"hr\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"project_assignment\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"kanban\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"upsell\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"employees\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"messages\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"dashboard\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"automation\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"my_dashboard\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"customers\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"sales_form\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"other\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"development\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"leads\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"better_ask_saul\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"project_detail\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"upseller_management\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"user_management\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"calendar\",\"can_create\":true,\"can_read\":true,\"can_update\":true,\"can_delete\":true,\"screen_visible\":true},{\"module_name\":\"customer_profile\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"management\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"role_management\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"payments\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"upseller\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"all_projects\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"front_sales_management\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"recurring_service_detail\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"production\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"recurring_services\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"front_sales\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"documents\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"marketing\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"settings\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"projects\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"my_projects\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"marketing_automation\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0}]', '2025-08-11 14:43:10', '2025-08-28 18:09:48'),
('ae936867-cbed-466c-bdef-778f05da133d', 'front_sales', 'Front Seller', 'Front Seller Dashboard', 50, 0, '[{\"module_name\":\"messages\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"leads\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":0,\"screen_visible\":1},{\"module_name\":\"calendar\",\"can_create\":true,\"can_read\":true,\"can_update\":true,\"can_delete\":true,\"screen_visible\":true},{\"module_name\":\"better_ask_saul\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"settings\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"sales_form\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"front_sales_management\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0},{\"module_name\":\"customers\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"my_dashboard\",\"can_create\":1,\"can_read\":1,\"can_update\":1,\"can_delete\":1,\"screen_visible\":1},{\"module_name\":\"front_sales\",\"can_create\":0,\"can_read\":0,\"can_update\":0,\"can_delete\":0,\"screen_visible\":0}]', '2025-07-28 16:12:07', '2025-09-05 18:27:19'),
('e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'admin', 'Administrator', 'Full system access with all permissions', 100, 1, '[{\"action\":\"*\",\"resource\":\"*\"},{\"action\":\"manage\",\"resource\":\"users\"},{\"action\":\"manage\",\"resource\":\"roles\"},{\"action\":\"view\",\"resource\":\"audit\"}]', '2025-07-28 16:07:29', '2025-08-28 17:49:47');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` text DEFAULT NULL,
  `module_name` text DEFAULT NULL,
  `can_create` tinyint(1) DEFAULT NULL,
  `can_read` tinyint(1) DEFAULT NULL,
  `can_update` tinyint(1) DEFAULT NULL,
  `can_delete` tinyint(1) DEFAULT NULL,
  `screen_visible` tinyint(1) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `module_name`, `can_create`, `can_read`, `can_update`, `can_delete`, `screen_visible`, `created_at`, `updated_at`) VALUES
('01a4c053-5d29-43a5-9f8d-88b5e9f41dca', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'hr', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('06073249-ce2f-4de6-bb29-69758b637a9f', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'project_assignment', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('0acb3a60-8d13-404a-aae8-5a554d875b63', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'kanban', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('0bc8ce1d-9937-4ae1-ba84-936b582513b4', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'user_management', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('0c4ac4eb-b28a-4802-9946-e77e25985b64', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'upsell', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('0fc2327f-2752-4b18-bb53-b0bd88ed695b', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'employees', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('14908308-64d8-40a0-af3c-6725b9cb5f24', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'messages', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('14e65887-a68a-4d53-b245-48cdcb4413e5', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'hr', 1, 1, 1, 1, 1, '2025-07-29T16:54:11.847048', NULL),
('171e3849-f0e4-4451-a388-e3fdf5914adb', 'ae936867-cbed-466c-bdef-778f05da133d', 'messages', 1, 1, 1, 1, 1, '2025-08-18T19:52:53.634049', NULL),
('1a0e2730-1ed5-4b09-aed6-e532f38ff901', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'dashboard', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('1bee0a7a-3f88-4539-85e6-d62748c940f7', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'marketing', 1, 1, 1, 1, 1, '2025-07-29T16:54:12.75911', NULL),
('20d67ad4-f135-4f4b-ac77-90269c5c54ae', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'automation', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('223814fc-0317-4568-ba7c-d41be3fc96d4', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'recurring_services', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('24f2f703-bc74-406f-a662-01d277038fec', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'upseller_management', 1, 1, 1, 1, 1, '2025-08-11T20:41:22.377247', NULL),
('250cbb9f-11cf-4abb-bf05-a01226c3a644', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'calendar', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('2c07f752-f075-4366-96c3-a27d172db870', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'my_dashboard', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('3673fb87-dda4-4c7d-8094-79989ca0d887', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'kanban', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('37095c6b-4762-460c-a179-7e833700ed86', 'ae936867-cbed-466c-bdef-778f05da133d', 'leads', 1, 1, 1, 0, 1, '2025-08-18T19:52:53.634049', NULL),
('3a29cc78-92c9-4105-9486-05ea1384c9fe', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'front_sales', 1, 1, 1, 1, 1, '2025-07-29T16:54:10.901626', NULL),
('3be7a54f-55c3-4031-ad63-03ff13d1228b', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'sales_form', 1, 1, 1, 1, 1, '2025-07-29T16:41:48.052453', NULL),
('3c68f1a6-c46f-48db-8f74-da58255df6ba', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'customers', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('428f3084-c07f-41c2-90ca-a59a03fee3cb', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'customers', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('49432ce6-583e-4799-8ef1-e166cbb64fa2', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'sales_form', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('4a1914f2-895b-4fb5-8543-ebd9ae86f425', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'role_management', 1, 1, 1, 1, 1, '2025-07-29T16:50:55.201785', NULL),
('4c7685cc-ced7-4998-ae59-edd32e8787b3', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'other', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('549e2697-c695-484e-be32-b61c008c2f8f', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'other', 1, 1, 1, 1, 1, '2025-07-29T16:54:14.167726', NULL),
('55b7df79-ec54-4c5a-bd0d-e6630e53a163', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'development', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('5ab58fc8-3828-4824-8636-ff2361d41fa4', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'projects', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('682cbcf7-9685-4f90-9fe3-8dd2a2254189', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'leads', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('6c5fb82f-14cd-4462-a33b-b3085ef52334', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'project_assignment', 1, 1, 1, 1, 1, '2025-08-13T23:02:53.88904', NULL),
('70d51009-9297-4187-814b-34212b7e31ba', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'documents', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('74af1f08-7de6-4e4d-b42d-4bb67c70802f', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'better_ask_saul', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('7ba41415-8535-4ff7-b16a-2add656a1917', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'settings', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('7cf979a8-76b7-4e57-bca2-deed5ddbbf29', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'all_projects', 1, 1, 1, 1, 1, '2025-08-13T23:02:53.88904', NULL),
('7d5eedd5-5c4f-4a56-935e-eba3b74eac38', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'project_detail', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('887df8dc-ce92-4071-a891-a1bdb9ef164c', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'upseller_management', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('8ae98aed-a663-430e-a598-702b666eb901', 'ae936867-cbed-466c-bdef-778f05da133d', 'calendar', 1, 1, 1, 1, 1, '2025-08-18T19:52:53.634049', NULL),
('8f6e6ee7-3567-4750-b368-cfa4a0898c65', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'user_management', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('95698f9c-32e9-4658-86a1-117daa456f13', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'calendar', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('973308d0-b232-4baf-afb6-6a1b9650e2d6', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'customer_profile', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('97b0d093-1f2b-4b5f-afed-94131cb36f65', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'automation', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('99c1ed4c-ef1d-4822-98ea-72f7bf2de3cd', 'ae936867-cbed-466c-bdef-778f05da133d', 'better_ask_saul', 1, 1, 1, 1, 1, '2025-08-18T19:52:53.634049', NULL),
('a1405f64-e0b4-4bf6-ad4d-079d2bc84044', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'better_ask_saul', 1, 1, 1, 1, 1, '2025-07-29T16:41:49.838094', NULL),
('a1c21c7a-6fbf-4c29-bc2a-0703611d75b7', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'management', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('a2c9a30a-4f54-47af-b554-e702fe7e3281', 'ae936867-cbed-466c-bdef-778f05da133d', 'settings', 0, 0, 0, 0, 0, '2025-08-18T19:52:53.634049', NULL),
('a533e901-7d28-4f49-a47d-8b0a774b90dc', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'my_projects', 1, 1, 1, 1, 1, '2025-08-13T23:02:53.88904', NULL),
('a871a27d-0d9f-458e-8f2f-81c93b24f92f', 'ae936867-cbed-466c-bdef-778f05da133d', 'sales_form', 1, 1, 1, 1, 1, '2025-08-18T19:52:53.634049', NULL),
('aaf5f57a-5c5b-4275-8ba2-501a3b00eb6d', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'messages', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('abc7bb97-8563-4334-924a-c83cfa417340', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'upsell', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('ace67d41-54d8-4444-9791-075249536277', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'production', 1, 1, 1, 1, 1, '2025-07-29T16:54:15.097035', NULL),
('b01a89a4-5d48-4c82-8ea2-0ef84cf12442', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'role_management', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('b0aa5987-8dc3-4bab-90d3-b33e4f666da8', 'ae936867-cbed-466c-bdef-778f05da133d', 'front_sales_management', 0, 0, 0, 0, 0, '2025-08-18T19:52:53.634049', NULL),
('b276806d-ad88-49eb-8ec5-892b9264d546', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'payments', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('b8867515-b5a0-40f7-9980-761f51431f94', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'upseller', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('bce9a971-3134-4dbe-bd00-df4724376f78', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'all_projects', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('bee855d7-edd0-47b0-9b0b-ce2d0e7320e8', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'front_sales_management', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('bf3b3112-0e2a-44d7-b030-773cecf00eae', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'recurring_service_detail', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('c0f6e2c6-f0b7-4666-b64d-8a21ecab69a7', 'ae936867-cbed-466c-bdef-778f05da133d', 'customers', 1, 1, 1, 1, 1, '2025-08-18T19:52:53.634049', NULL),
('c1813bb7-7d14-48c4-b55c-e2ae23375a12', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'production', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('c5ca182f-af35-427d-94a1-e5ad22461f65', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'recurring_services', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('cdad4371-0a19-4e1f-87ff-409df75de885', 'ae936867-cbed-466c-bdef-778f05da133d', 'my_dashboard', 1, 1, 1, 1, 1, '2025-08-18T19:52:53.634049', NULL),
('cf4106ab-db69-4203-b92c-276e6b4ade6b', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'my_dashboard', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('d9087e3f-3ca2-4244-bb9b-acb65ba60ca7', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'upseller', 1, 1, 1, 1, 1, '2025-07-29T16:54:16.517712', NULL),
('da9be241-0593-4f08-a13c-3db2a29c5913', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'employees', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('dcb33dd9-1c22-477d-9a2d-1a3a6d132d86', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'dashboard', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('ded264fc-c2f3-4d71-8712-b2e3c9451570', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'front_sales', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('e2ab0a1f-6c8a-495e-81cc-9eae6004be15', 'ae936867-cbed-466c-bdef-778f05da133d', 'front_sales', 0, 0, 0, 0, 0, '2025-08-18T19:52:53.634049', NULL),
('e8deaf68-ca9b-41be-a48f-98f9786fa732', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'front_sales_management', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('ec8f71bc-81bf-4858-8f21-ae0e37f06b46', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'development', 1, 1, 1, 1, 1, '2025-07-29T16:54:09.983671', NULL),
('ed337f41-8511-466b-a987-7fc0a452b50b', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'documents', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('f0e23ba3-d6d4-4e2d-8ab1-ebc13fefe56a', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'marketing', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('f52b0b90-f6ec-49bf-9bea-1ac5b1eff7ce', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'settings', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('f6d0d0ff-a156-45f5-81f4-d78833a8044b', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'projects', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL),
('f7526fb9-a56a-4930-9d21-0c93d3cfa230', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'my_projects', 1, 1, 1, 1, 1, '2025-08-25T21:52:36.278429', NULL),
('f7b11b15-53f2-42ce-a015-47922a392b33', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'payments', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('f9cf741a-484c-4b9d-bcfe-1d689e384f69', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', 'leads', 1, 1, 1, 1, 1, '2025-07-28T21:07:29.159817', NULL),
('fc349c44-eb0d-4780-bbcd-3a7e6671c59c', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', 'marketing_automation', 0, 0, 0, 0, 0, '2025-08-25T21:52:36.278429', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sales_dispositions`
--

CREATE TABLE `sales_dispositions` (
  `id` varchar(36) NOT NULL,
  `sale_date` text DEFAULT NULL,
  `customer_name` text DEFAULT NULL,
  `phone_number` text DEFAULT NULL,
  `email` text DEFAULT NULL,
  `front_brand` text DEFAULT NULL,
  `business_name` text DEFAULT NULL,
  `service_sold` text DEFAULT NULL,
  `services_included` text DEFAULT NULL,
  `turnaround_time` text DEFAULT NULL,
  `service_tenure` text DEFAULT NULL,
  `service_details` text DEFAULT NULL,
  `agreement_url` text DEFAULT NULL,
  `payment_mode` text DEFAULT NULL,
  `company` text DEFAULT NULL,
  `sales_source` text DEFAULT NULL,
  `lead_source` text DEFAULT NULL,
  `sale_type` text DEFAULT NULL,
  `gross_value` decimal(15,2) DEFAULT NULL,
  `cash_in` decimal(15,2) DEFAULT NULL,
  `remaining` decimal(15,2) DEFAULT NULL,
  `tax_deduction` decimal(15,2) DEFAULT NULL,
  `seller` text DEFAULT NULL,
  `account_manager` text DEFAULT NULL,
  `project_manager` text DEFAULT NULL,
  `assigned_to` text DEFAULT NULL,
  `assigned_by` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` varchar(36) DEFAULT NULL,
  `lead_id` text DEFAULT NULL,
  `is_upsell` tinyint(1) DEFAULT 0,
  `original_sales_disposition_id` text DEFAULT NULL,
  `service_types` text DEFAULT NULL,
  `payment_source` text DEFAULT NULL,
  `payment_company` text DEFAULT NULL,
  `brand` text DEFAULT NULL,
  `agreement_signed` tinyint(1) DEFAULT 0,
  `agreement_sent` tinyint(1) DEFAULT 0,
  `payment_plan_id` text DEFAULT NULL,
  `payment_source_id` text DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` text DEFAULT NULL,
  `total_installments` int(11) DEFAULT NULL,
  `current_installment` int(11) DEFAULT NULL,
  `next_payment_date` text DEFAULT NULL,
  `upsell_amount` decimal(15,2) DEFAULT NULL,
  `original_sale_id` text DEFAULT NULL,
  `installment_frequency` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_dispositions`
--

INSERT INTO `sales_dispositions` (`id`, `sale_date`, `customer_name`, `phone_number`, `email`, `front_brand`, `business_name`, `service_sold`, `services_included`, `turnaround_time`, `service_tenure`, `service_details`, `agreement_url`, `payment_mode`, `company`, `sales_source`, `lead_source`, `sale_type`, `gross_value`, `cash_in`, `remaining`, `tax_deduction`, `seller`, `account_manager`, `project_manager`, `assigned_to`, `assigned_by`, `created_at`, `updated_at`, `user_id`, `lead_id`, `is_upsell`, `original_sales_disposition_id`, `service_types`, `payment_source`, `payment_company`, `brand`, `agreement_signed`, `agreement_sent`, `payment_plan_id`, `payment_source_id`, `is_recurring`, `recurring_frequency`, `total_installments`, `current_installment`, `next_payment_date`, `upsell_amount`, `original_sale_id`, `installment_frequency`) VALUES
('05a82562-c573-422d-8a65-72ffe86d8a9d', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'Web Design', '[\"Web Design\"]', '', '', 'Web Design: Fresh website', '', 'WIRE', 'American Digital Agency', 'BARK', 'PAID_MARKETING', 'FRONT', 1500.00, 500.00, 1000.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', '78294d98-4280-40c1-bb6d-b85b7203b370', '2025-08-25 15:29:13', '2025-08-28 21:05:23', '78294d98-4280-40c1-bb6d-b85b7203b370', NULL, 0, NULL, NULL, 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 3, 1, '2025-09-25', 0.00, NULL, 'monthly'),
('2cf8060f-bde6-4dae-90a5-98046c698927', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'VPS Hosting - Basic', '[\"VPS Hosting - Basic\"]', '', '', 'VPS Hosting - Basic: Dedicated server for one year', '', 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 5000.00, 5000.00, 0.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:11:00', '2025-08-28 21:05:23', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', NULL, 0, '05a82562-c573-422d-8a65-72ffe86d8a9d', '[\"VPS Hosting - Basic\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, 'yearly', 1, 1, '2026-08-25', 0.00, NULL, NULL),
('43aa290b-ffc0-40bf-90eb-02f358584760', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'SEO', '[\"SEO\"]', '', '', 'SEO: Complete seo', '', 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 500.00, 500.00, 0.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:15:30', '2025-08-28 21:05:23', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', NULL, 0, '05a82562-c573-422d-8a65-72ffe86d8a9d', '[\"SEO\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, 'monthly', 1, 1, '2025-09-25', 0.00, NULL, NULL),
('47d1e708-cdc5-4e96-a5af-293b6083aefc', '2025-09-05', 'Justin', '(561) 6033752', 'cmo.nootropiq@gmail.com', NULL, 'nootropiq', 'Web Development', '[\"Web Development\"]', NULL, NULL, 'Web Development: Fresh Website', NULL, 'WIRE', 'American Digital Agency', 'BARK', 'PAID_MARKETING', 'FRONT', 1000.00, 500.00, 500.00, 0.00, '', '', '', '', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', '2025-09-05 14:25:07', '2025-09-05 14:25:07', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', '00083c33-212b-4233-9251-f09e6704fcba', 0, NULL, '[\"Web Development\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('63cca759-3de1-4ad8-a16b-1a59aa789b20', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'Maintenance', '[\"Maintenance\"]', '', '', 'Maintenance: 1 year maintenance', '', 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 3000.00, 3000.00, 0.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:19:21', '2025-08-28 21:05:23', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', NULL, 0, '05a82562-c573-422d-8a65-72ffe86d8a9d', '[\"Maintenance\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, 'b71839a8-7f04-4f32-85b5-cb4eb5bdaf71', NULL, 0, 'yearly', 1, 1, '2026-08-25', 0.00, NULL, NULL),
('7b1f9cb8-a619-45be-8eac-244762cf6b5a', '2025-09-01', 'Testing', '1234567890', 'test@test.com', NULL, 'testing', '2D Animation', '[\"2D Animation\"]', '2 weeks', '1 month', '2D Animation: Test upsell service details', NULL, 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 2000.00, 1000.00, 1000.00, 0.00, '', '', '', '', '722d6008-7cec-43d3-8648-926a14f765c9', '2025-09-01 13:38:33', '2025-09-01 13:38:33', '722d6008-7cec-43d3-8648-926a14f765c9', NULL, 1, 'f1990c74-34aa-42d2-8457-1762be29747c', '[\"2D Animation\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('7d9f3c54-b3d0-4184-bf0a-7fd8f69932bc', '2025-09-01', 'Testing', '1234567890', 'test@test.com', NULL, 'testing', '2D Animation', '[\"2D Animation\"]', '2 weeks', '1 month', '2D Animation: Test upsell service details - should only create sales disposition', NULL, 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 1500.00, 750.00, 750.00, 0.00, '', '', '', '', '722d6008-7cec-43d3-8648-926a14f765c9', '2025-09-01 13:51:08', '2025-09-01 13:51:08', '722d6008-7cec-43d3-8648-926a14f765c9', NULL, 1, 'b12a736e-d24f-47ba-a12a-0beace075735', '[\"2D Animation\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('85d172cf-b54f-415b-addc-9067bd8ecae5', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'VPS Hosting - Basic', '[\"VPS Hosting - Basic\"]', '', '', 'VPS Hosting - Basic: Dedicated server for one year', '', 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 5000.00, 5000.00, 0.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:07:51', '2025-08-28 21:05:23', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', NULL, 0, '05a82562-c573-422d-8a65-72ffe86d8a9d', '[\"VPS Hosting - Basic\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, 'yearly', 1, 1, '2026-08-25', 0.00, NULL, NULL),
('8a75310d-4064-4abc-a298-0d8cb752c73c', '2025-09-01', 'Testing', '1234567890', 'test@test.com', NULL, 'testing', '2D Animation', '[\"2D Animation\"]', '2 weeks', '1 month', '2D Animation: Test upsell service details - should only create sales disposition', NULL, 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 1500.00, 750.00, 750.00, 0.00, '', '', '', '', '722d6008-7cec-43d3-8648-926a14f765c9', '2025-09-01 13:51:28', '2025-09-01 13:51:28', '722d6008-7cec-43d3-8648-926a14f765c9', NULL, 1, '7d9f3c54-b3d0-4184-bf0a-7fd8f69932bc', '[\"2D Animation\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('b12a736e-d24f-47ba-a12a-0beace075735', '2025-09-01', 'Testing', '1234567890', 'test@test.com', NULL, 'testing', '2D Animation', '[\"2D Animation\"]', '2 weeks', '1 month', '2D Animation: Test upsell service details - should only create sales disposition', NULL, 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 1500.00, 750.00, 750.00, 0.00, '', '', '', '', '722d6008-7cec-43d3-8648-926a14f765c9', '2025-09-01 13:50:39', '2025-09-01 13:50:39', '722d6008-7cec-43d3-8648-926a14f765c9', NULL, 1, 'c1123082-e91c-4169-b470-8dd995313805', '[\"2D Animation\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('c1123082-e91c-4169-b470-8dd995313805', '2025-09-01', 'Testing', '1234567890', 'test@test.com', NULL, 'testing', 'VPS Hosting - Pro', '[\"VPS Hosting - Pro\"]', NULL, NULL, 'VPS Hosting - Pro: 1 year hosting', NULL, 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 1000.00, 1000.00, 0.00, 0.00, '', '', '', '', 'a1791be0-b633-41bf-adce-fe1a1390b640', '2025-09-01 13:40:09', '2025-09-01 13:40:09', 'a1791be0-b633-41bf-adce-fe1a1390b640', NULL, 1, 'f1990c74-34aa-42d2-8457-1762be29747c', '[\"VPS Hosting - Pro\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, '0', NULL, 1, 'yearly', 1, 1, '2026-09-01', 0.00, NULL, NULL),
('d676ab4f-eed3-4820-b5cb-86239c86daf0', '2025-08-18', 'Kendra Quashie', '9176673777', 'kendra.quashie@yahoo.com', '', 'Kendra', 'Web Design', '[\"Web Design\"]', '', '', 'Web Design: Complete web design with development', '', 'WIRE', 'American Digital Agency', 'BARK', 'PAID_MARKETING', 'FRONT', 6000.00, 3000.00, 3000.00, 0.00, '', '', '', 'aliz799@icloud.com', '78294d98-4280-40c1-bb6d-b85b7203b370', '2025-08-18 15:07:12', '2025-08-28 21:05:23', '78294d98-4280-40c1-bb6d-b85b7203b370', NULL, 0, NULL, NULL, 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('d8af5353-c0a4-4713-9b79-42a08f3919e3', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'VPS Hosting - Basic', '[\"VPS Hosting - Basic\"]', '', '', 'VPS Hosting - Basic: Dedicated server for one year', '', 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 5000.00, 5000.00, 0.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:13:32', '2025-08-28 21:05:23', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', NULL, 0, '05a82562-c573-422d-8a65-72ffe86d8a9d', '[\"VPS Hosting - Basic\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, 'yearly', 1, 1, '2026-08-25', 0.00, NULL, NULL),
('d9d186db-87ce-4f49-8d64-76895398ff91', '2025-08-25', 'Jack', '(916) 705-1136', 'demo@example.com', '', 'Swidish and Pressure Message Therapy', 'Web Design', '[\"Web Design\"]', '', '', 'Web Design: Custom Website', '', 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 5000.00, 3000.00, 2000.00, 0.00, '', '', '', 'aghawasirf1@gmail.com', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '2025-08-25 17:21:34', '2025-08-28 21:05:23', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', NULL, 0, '05a82562-c573-422d-8a65-72ffe86d8a9d', '[\"Web Design\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('f1990c74-34aa-42d2-8457-1762be29747c', '2025-08-29', 'Testing', '1234567890', 'test@test.com', NULL, 'testing', 'Web Design', '[\"Web Design\"]', NULL, NULL, 'Web Design: Fresh Website', NULL, 'WIRE', 'American Digital Agency', 'BARK', 'PAID_MARKETING', 'FRONT', 2000.00, 1000.00, 1000.00, 0.00, '', '', '', '', '722d6008-7cec-43d3-8648-926a14f765c9', '2025-08-29 12:19:02', '2025-08-29 12:19:02', '722d6008-7cec-43d3-8648-926a14f765c9', '104ed258-b9a6-4c7e-8de0-14352b95b51e', 0, NULL, '[\"Web Design\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 1, 1, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('fbf25fb6-af28-4b4d-b555-59ea5fa11825', '2025-09-01', 'Kendra Quashie', '9176673777', 'kendra.quashie@yahoo.com', NULL, 'Kendra', 'Domain Registration', '[\"Domain Registration\"]', NULL, NULL, 'Domain Registration: 500', NULL, 'WIRE', 'American Digital Agency', 'REFFERAL', 'ORGANIC', 'UPSELL', 500.00, 500.00, 0.00, 0.00, '', '', '', '', '307b981c-46bb-4c23-8eca-aa5a065a7fca', '2025-09-01 17:07:56', '2025-09-01 17:07:56', '307b981c-46bb-4c23-8eca-aa5a065a7fca', NULL, 1, 'd676ab4f-eed3-4820-b5cb-86239c86daf0', '[\"Domain Registration\"]', 'Wire', 'American Digital Agency', 'Liberty Web Studio', 0, 0, NULL, NULL, 0, NULL, 1, 1, NULL, 0.00, NULL, NULL),
('test-id-123', '2025-01-15', 'Test Customer', '123-456-7890', 'test@example.com', 'Test Brand', 'Test Business', 'Web Design', '[\"Web Design\"]', '2 weeks', '1 year', 'Web Design: Test service', 'https://example.com', 'WIRE', 'Test Company', 'BARK', 'ORGANIC', 'FRONT', 1000.00, 500.00, 500.00, 0.00, '', '', '', '', 'user-123', '2025-08-29 12:01:37', '2025-08-29 12:01:37', 'user-123', 'lead-123', 0, NULL, '[\"Web Design\"]', 'Wire', 'Test Company', 'Test Brand', 1, 1, 'plan-123', NULL, 1, 'monthly', 12, 1, '2025-02-15', 0.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `service_type` text DEFAULT NULL,
  `billing_frequency` text DEFAULT NULL,
  `category` text DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` text DEFAULT NULL,
  `setup_fee` decimal(15,2) DEFAULT NULL,
  `recurring_price` text DEFAULT NULL,
  `min_contract_months` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `created_at`, `service_type`, `billing_frequency`, `category`, `price`, `description`, `is_recurring`, `recurring_frequency`, `setup_fee`, `recurring_price`, `min_contract_months`) VALUES
('0d313c2f-54b4-4c22-b354-15198682a396', 'Email Hosting', '2025-07-22 17:21:14', 'recurring', 'monthly', 'email', 9.99, 'Professional email hosting with 10GB storage', 0, 'monthly', 0.00, NULL, 1),
('176e4089-1d87-4f51-a50b-b07fa57a1711', 'SMM (Management)', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('17a45ec4-35a1-4131-b578-108b700974d1', 'AI Web Development', '2025-04-17 12:39:12', 'project', NULL, 'development', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('28b63a66-5680-4344-a0f5-75d52f00ca24', 'AI Development', '2025-04-17 12:39:12', 'project', NULL, 'development', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('2b309905-9130-46ca-af3d-48b48c178814', 'PPC Management', '2025-04-17 12:17:39', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('2c32a98e-df4b-4887-8a2e-52de6d81b6be', 'Book Publishing', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('2d9a10c2-85e6-48c2-9290-e70810a02151', 'Web Portal', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('3435187d-f19c-498a-a532-cf8f788b26c0', 'SEO Services', '2025-04-17 12:17:39', 'project', NULL, 'marketing', 0.00, NULL, 0, 'monthly', 0.00, NULL, 1),
('346a9836-4349-434a-8b92-7f222d476ca4', 'Domain Registration', '2025-07-22 17:21:14', 'recurring', 'yearly', 'domain', 12.99, 'Annual domain registration and management', 0, 'yearly', 0.00, NULL, 1),
('37dc3993-cc96-4b8d-badc-2b407a84312e', 'Domain Transfer', '2025-07-22 17:21:14', 'one-time', 'one-time', 'domain', 25.00, 'Transfer domain from another registrar', 0, 'yearly', 0.00, NULL, 1),
('38036b37-d51d-4f72-b307-0af5d60e6126', 'SEO Audit', '2025-07-22 17:21:14', 'one-time', 'one-time', 'marketing', 200.00, 'Comprehensive SEO audit and recommendations', 0, 'monthly', 0.00, NULL, 1),
('40df2a61-f0d0-45e3-8032-b1d71481681b', 'ORM', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('41e8e898-7008-46c5-bdff-55b6b19cc30a', 'Plugin Integration', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('45ad7183-fac3-4fd0-b205-883894cf48ff', 'Content Writing', '2025-04-17 12:17:39', 'project', NULL, 'marketing', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('4a3ca51a-53d9-44cd-a5c7-61261c010960', 'PPC', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('4b405d2f-e02e-4618-a619-4c7aa2290859', 'Data Migration', '2025-07-22 17:21:14', 'one-time', 'one-time', 'consultation', 150.00, 'Migrate data from old hosting to new server', 0, NULL, 0.00, NULL, 1),
('4f38cf16-56a5-47d7-9151-1888fb04251c', 'SMM (Marketing)', '2025-04-17 12:39:12', 'project', NULL, 'marketing', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('54ff2dc6-afa6-48ff-aeea-14657fe5393c', 'Mobile App', '2025-04-17 12:39:12', 'project', NULL, 'development', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('5b1ecd68-a599-4b63-bff1-ee381b8418a6', 'SSL Certificate', '2025-07-22 17:21:14', 'recurring', 'yearly', 'ssl', 89.99, 'Annual SSL certificate for website security', 0, NULL, 0.00, NULL, 1),
('638d4bc4-070e-4e40-93c3-b22e07aa1ebc', '3D Animation', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('6cbcb493-4002-43c1-9413-089d7dfd2839', 'Graphic Design', '2025-04-17 12:17:39', 'project', NULL, 'design', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('6d2310ac-e9a9-48d2-8f17-406577bbbd84', 'AI Agent', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('73be6159-0d1d-4319-aff1-25a4fd75a50d', 'SEO', '2025-04-17 12:39:12', 'project', NULL, 'marketing', 0.00, NULL, 0, 'monthly', 0.00, NULL, 1),
('955d7f2a-d63d-46d5-ba42-70b41d6a8c8f', 'Email Marketing', '2025-04-17 12:17:39', 'project', NULL, 'marketing', 0.00, NULL, 0, 'monthly', 0.00, NULL, 1),
('97772438-8c67-4fbe-a9d7-835e06b55ba1', 'Logo', '2025-04-17 12:39:12', 'project', NULL, 'design', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('986ddcb8-89bd-4602-a769-583ae049db4f', 'WebApp', '2025-04-17 12:39:12', 'project', NULL, 'development', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('9b444052-5dd7-468b-896f-34c4f15a9bfe', 'Website Consultation', '2025-07-22 17:21:14', 'one-time', 'one-time', 'consultation', 100.00, 'One-hour website optimization consultation', 0, NULL, 0.00, NULL, 1),
('ab4b6576-7783-4abf-91ea-f65c26c8f56e', 'Hosting', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, 'monthly', 0.00, NULL, 1),
('b7e8ee32-a4f0-4468-8837-53695ad82d82', 'Social Media Management', '2025-04-17 12:17:39', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('c6113eca-5c1f-43ff-9ebd-6a05d290ac8b', 'Maintenance', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, 'monthly', 0.00, NULL, 1),
('c707fd78-db8e-4c17-ab84-c9dbe6a0a6c5', 'Digital Marketing', '2025-04-17 12:17:39', 'project', NULL, 'marketing', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('cf67eda0-aa9d-4400-9a78-9743bb1f27c6', 'VPS Hosting - Basic', '2025-07-22 17:21:14', 'recurring', 'monthly', 'hosting', 29.99, 'Basic VPS hosting with 2GB RAM, 20GB SSD', 0, 'monthly', 0.00, NULL, 1),
('d1af4679-591d-4f96-877c-335bed9b9764', 'SSL Installation', '2025-07-22 17:21:14', 'one-time', 'one-time', 'ssl', 50.00, 'Install and configure SSL certificate', 0, NULL, 0.00, NULL, 1),
('d51c5cc2-7185-47d3-89f3-0eeea286a22f', 'Content Writing', '2025-04-17 12:39:12', 'project', NULL, 'marketing', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('de587e6c-30c0-4593-b1c5-f01583f6480f', 'AI Integration', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('dfd2638a-7e6b-400c-bc34-8f5f4103ad25', 'Web Development', '2025-04-17 12:17:39', 'project', NULL, 'development', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('e475c481-70b6-4da4-9d07-301599d187d3', 'Website Revamp', '2025-04-17 12:39:12', 'project', NULL, 'development', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('e481c676-5522-4e3d-b779-8d30ab27dd75', 'Web Design', '2025-04-17 12:39:12', 'project', NULL, 'design', 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('e5f9e599-4d0e-40ec-8288-a0e4b8b426aa', 'Other', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('ed383153-578a-4d62-839e-6ce8a73423a0', 'Book Writing', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('effc38ee-6bed-47dc-92f1-ec9cc59d753a', '2D Animation', '2025-04-17 12:39:12', 'project', NULL, NULL, 0.00, NULL, 0, NULL, 0.00, NULL, 1),
('f69b8de4-7499-489d-802f-c6fe17f30c86', 'VPS Hosting - Pro', '2025-07-22 17:21:14', 'recurring', 'monthly', 'hosting', 59.99, 'Professional VPS hosting with 4GB RAM, 50GB SSD', 0, 'monthly', 0.00, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `task_activities`
--

CREATE TABLE `task_activities` (
  `id` varchar(36) NOT NULL,
  `board_id` varchar(36) DEFAULT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_attachments`
--

CREATE TABLE `task_attachments` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `file_name` text DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` text DEFAULT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_boards`
--

CREATE TABLE `task_boards` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `board_type` text DEFAULT NULL,
  `created_by` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL,
  `is_template` tinyint(1) DEFAULT NULL,
  `template_name` text DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_boards`
--

INSERT INTO `task_boards` (`id`, `name`, `description`, `board_type`, `created_by`, `created_at`, `updated_at`, `is_template`, `template_name`, `is_archived`) VALUES
('05a545dd-327b-4dae-96ce-956b76b85d8c', 'Dwsign', 'A new kanban board', 'project', 'ad828522-a32f-4512-9e17-bc5d65bee506', '2025-08-26T18:51:57.673476+00:00', '2025-08-26T18:52:09.624+00:00', 0, NULL, 0),
('094a2533-070f-40f0-bb70-a6c60009487a', 'New Board', 'A new kanban board', 'project', '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9', '2025-08-06T01:01:27.048567+00:00', '2025-08-06T01:01:27.048567+00:00', 0, NULL, 0),
('92a2f7c0-9c6a-4598-bf51-a17c17d3a2af', 'New Board', 'A new kanban board', 'project', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-07-23T22:48:01.426438+00:00', '2025-07-23T22:48:01.426438+00:00', 0, NULL, 0),
('a2317ca4-d8a4-43c6-a3de-2620de205fc2', 'New Board', 'A new kanban board', 'project', 'de514a73-4782-439e-b2ea-3f49fe568e24', '2025-07-23T17:46:53.73564+00:00', '2025-07-23T17:46:53.73564+00:00', 0, NULL, 0),
('a5273b77-f2eb-4a7d-9e97-ac211f9ddcab', 'New Board', 'A new kanban board', 'project', 'ad828522-a32f-4512-9e17-bc5d65bee506', '2025-08-26T18:51:36.045008+00:00', '2025-08-26T18:51:36.045008+00:00', 0, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `task_cards`
--

CREATE TABLE `task_cards` (
  `id` varchar(36) NOT NULL,
  `list_id` varchar(36) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `due_date` timestamp NULL DEFAULT NULL,
  `priority` text DEFAULT NULL,
  `status` text DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_card_labels`
--

CREATE TABLE `task_card_labels` (
  `card_id` varchar(36) NOT NULL,
  `label_id` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_checklists`
--

CREATE TABLE `task_checklists` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_checklist_items`
--

CREATE TABLE `task_checklist_items` (
  `id` varchar(36) NOT NULL,
  `checklist_id` varchar(36) DEFAULT NULL,
  `text` text DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `position` int(11) DEFAULT NULL,
  `completed_by` varchar(36) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `author_id` varchar(36) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_labels`
--

CREATE TABLE `task_labels` (
  `id` varchar(36) NOT NULL,
  `board_id` varchar(36) DEFAULT NULL,
  `name` text DEFAULT NULL,
  `color` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_lists`
--

CREATE TABLE `task_lists` (
  `id` varchar(36) NOT NULL,
  `board_id` text DEFAULT NULL,
  `name` text DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `color` text DEFAULT NULL,
  `wip_limit` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_lists`
--

INSERT INTO `task_lists` (`id`, `board_id`, `name`, `position`, `color`, `wip_limit`, `created_at`, `updated_at`) VALUES
('1874044c-2e94-4761-aa4a-cf52a612f9eb', '92a2f7c0-9c6a-4598-bf51-a17c17d3a2af', 'Review', 3, '#8b5cf6', NULL, '2025-07-23T22:48:01.696579+00:00', '2025-07-23T22:48:01.696579+00:00'),
('1d3316f3-ac99-4d0a-a0f0-a731605485d1', 'a2317ca4-d8a4-43c6-a3de-2620de205fc2', 'Done', 4, '#10b981', NULL, '2025-07-23T17:46:54.169676+00:00', '2025-07-23T17:46:54.169676+00:00'),
('2d2ecb6a-b0b4-4c4e-9f1e-ee7d055ae2f5', 'a5273b77-f2eb-4a7d-9e97-ac211f9ddcab', 'In Progress', 2, '#fbbf24', NULL, '2025-08-26T18:51:36.389087+00:00', '2025-08-26T18:51:36.389087+00:00'),
('2ef32a0b-88fb-4d4e-ac23-1e5088fbbc4e', '094a2533-070f-40f0-bb70-a6c60009487a', 'To Do', 1, '#e2e8f0', NULL, '2025-08-06T01:01:27.31335+00:00', '2025-08-06T01:01:27.31335+00:00'),
('480857f5-e545-4297-af44-e74dd0a7ffd7', 'a5273b77-f2eb-4a7d-9e97-ac211f9ddcab', 'Done', 4, '#10b981', NULL, '2025-08-26T18:51:36.389087+00:00', '2025-08-26T18:51:36.389087+00:00'),
('4c373b29-28f2-4bba-948a-205189a8c94c', 'a2317ca4-d8a4-43c6-a3de-2620de205fc2', 'Review', 1, '#8b5cf6', NULL, '2025-07-23T17:46:54.169676+00:00', '2025-07-23T17:46:54.169676+00:00'),
('550f0c74-f15c-4551-8386-5b1de770ec76', 'a2317ca4-d8a4-43c6-a3de-2620de205fc2', 'In Progress', 2, '#fbbf24', NULL, '2025-07-23T17:46:54.169676+00:00', '2025-07-23T17:46:54.169676+00:00'),
('55d92e85-e5d7-4a2b-a979-bf673d371167', '92a2f7c0-9c6a-4598-bf51-a17c17d3a2af', 'Done', 4, '#10b981', NULL, '2025-07-23T22:48:01.696579+00:00', '2025-07-23T22:48:01.696579+00:00'),
('5a4dcf61-a7e7-493a-bb0c-ef6cd8f6a865', '05a545dd-327b-4dae-96ce-956b76b85d8c', 'To Do', 1, '#e2e8f0', NULL, '2025-08-26T18:51:57.953872+00:00', '2025-08-26T18:51:57.953872+00:00'),
('6d41a04a-5a3a-46e1-9d42-ecef6f2b49c1', '094a2533-070f-40f0-bb70-a6c60009487a', 'Review', 3, '#8b5cf6', NULL, '2025-08-06T01:01:27.31335+00:00', '2025-08-06T01:01:27.31335+00:00'),
('6f4cfb83-7e33-43e7-b39c-64324adb131d', '92a2f7c0-9c6a-4598-bf51-a17c17d3a2af', 'To Do', 1, '#e2e8f0', NULL, '2025-07-23T22:48:01.696579+00:00', '2025-07-23T22:48:01.696579+00:00'),
('8ba8c82d-dca9-4539-91db-89bd892e32ce', 'a5273b77-f2eb-4a7d-9e97-ac211f9ddcab', 'To Do', 1, '#e2e8f0', NULL, '2025-08-26T18:51:36.389087+00:00', '2025-08-26T18:51:36.389087+00:00'),
('8c394751-ac00-4902-b229-3dcbaadd4fb5', '094a2533-070f-40f0-bb70-a6c60009487a', 'In Progress', 2, '#fbbf24', NULL, '2025-08-06T01:01:27.31335+00:00', '2025-08-06T01:01:27.31335+00:00'),
('9d74e112-182a-4178-a17b-b1347fd6ea44', 'a2317ca4-d8a4-43c6-a3de-2620de205fc2', 'To Do', 1, '#e2e8f0', NULL, '2025-07-23T17:46:54.169676+00:00', '2025-07-23T17:46:54.169676+00:00'),
('a013ca40-4d78-458c-a042-e9cfda245cf3', '05a545dd-327b-4dae-96ce-956b76b85d8c', 'Done', 4, '#10b981', NULL, '2025-08-26T18:51:57.953872+00:00', '2025-08-26T18:51:57.953872+00:00'),
('a1d4d949-c8ab-48c7-8e92-9d7ef0b01c86', '094a2533-070f-40f0-bb70-a6c60009487a', 'New List', 5, '#e2e8f0', NULL, '2025-08-06T01:01:41.726148+00:00', '2025-08-06T01:01:41.726148+00:00'),
('a3f35a2b-f001-4c36-9f02-7464b3247cb9', '05a545dd-327b-4dae-96ce-956b76b85d8c', 'In Progress', 2, '#fbbf24', NULL, '2025-08-26T18:51:57.953872+00:00', '2025-08-26T18:51:57.953872+00:00'),
('bb9c2c9f-6d52-45e9-8e81-de6eb550673b', 'a2317ca4-d8a4-43c6-a3de-2620de205fc2', 'New List', 0, '#e2e8f0', NULL, '2025-07-23T19:11:15.788869+00:00', '2025-07-23T19:11:15.788869+00:00'),
('bdc66f6d-c50b-4a7c-bbbd-b0903a46d9cb', '92a2f7c0-9c6a-4598-bf51-a17c17d3a2af', 'In Progress', 2, '#fbbf24', NULL, '2025-07-23T22:48:01.696579+00:00', '2025-07-23T22:48:01.696579+00:00'),
('e0e7b2e5-aaff-4d69-bc85-8585f0accf99', '05a545dd-327b-4dae-96ce-956b76b85d8c', 'Review', 3, '#8b5cf6', NULL, '2025-08-26T18:51:57.953872+00:00', '2025-08-26T18:51:57.953872+00:00'),
('fa7adc7b-2cc8-4d9e-928a-83a997a891e2', '094a2533-070f-40f0-bb70-a6c60009487a', 'Done', 4, '#10b981', NULL, '2025-08-06T01:01:27.31335+00:00', '2025-08-06T01:01:27.31335+00:00'),
('fa944402-b09b-4691-a817-22483dc956ab', 'a5273b77-f2eb-4a7d-9e97-ac211f9ddcab', 'Review', 3, '#8b5cf6', NULL, '2025-08-26T18:51:36.389087+00:00', '2025-08-26T18:51:36.389087+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `task_time_entries`
--

CREATE TABLE `task_time_entries` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `department` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL,
  `team_leader_id` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `description`, `department`, `is_active`, `created_at`, `updated_at`, `team_leader_id`) VALUES
('090a7ee8-abb4-4297-b0fe-d2455a4ac322', 'Alpha', '', 'Front Sales', 1, '2025-09-05 23:54:02', '2025-09-05 23:54:02', NULL),
('20f1cfe8-0789-4606-bc6a-c0d3faa52320', 'Team Alpha', 'High-performing sales team focused on enterprise clients', 'Front Sales', 0, '2025-07-24T16:29:22.590623+00:00', '2025-09-05 23:53:56', '14d4edad-a775-4708-99a5-ce3241faef66'),
('7ad5ff31-df5a-4cf7-8e39-091c5bd84469', 'Team Beta', 'Dynamic team specializing in SMB and startup clients', 'Front Sales', 0, '2025-07-24T16:29:22.590623+00:00', '2025-09-05 23:47:19', 'e3f783a9-b3ce-46b0-805b-5845584e447b'),
('8c06164a-85cb-4663-9cae-b342d9f4037b', 'Debug Test Team', 'Testing team creation', 'Front Sales', 0, '2025-09-05 23:44:13', '2025-09-05 23:47:19', NULL),
('a3b9ca65-662f-43d4-806f-4edf880561d9', 'Beta', '', 'Front Sales', 1, '2025-09-05 23:54:06', '2025-09-05 23:54:06', NULL),
('c1a327da-90f6-4f75-a2f2-bff859426c4b', 'Test Team UUID', 'Testing UUID generation for team creation', 'Front Sales', 0, '2025-09-05 23:44:29', '2025-09-05 23:47:23', NULL),
('e13299b0-255e-400d-962d-9269796fe540', 'Beta', '', 'Front Sales', 0, '2025-09-05 23:49:46', '2025-09-05 23:50:00', NULL),
('e3cd633f-faad-48aa-8565-de8664257e05', 'Beta', '', 'Front Sales', 0, '2025-09-05 23:53:38', '2025-09-05 23:53:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` varchar(36) NOT NULL,
  `team_id` text DEFAULT NULL,
  `member_id` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `joined_at` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `team_id`, `member_id`, `role`, `joined_at`, `is_active`) VALUES
('6177efba-2608-4e09-90b5-5398217c22a8', '20f1cfe8-0789-4606-bc6a-c0d3faa52320', '14d4edad-a775-4708-99a5-ce3241faef66', 'leader', '2025-07-31T17:30:32.02812+00:00', 0),
('991fb111-11db-44aa-8d9b-333c9d82d97e', 'e3cd633f-faad-48aa-8565-de8664257e05', '14d4edad-a775-4708-99a5-ce3241faef66', 'member', '2025-09-05 23:53:44', 1),
('a68e1b6a-93d9-446b-8682-7c2cd9d4ee0d', 'a3b9ca65-662f-43d4-806f-4edf880561d9', '14d4edad-a775-4708-99a5-ce3241faef66', 'member', '2025-09-05 23:54:14', 1),
('a8df7758-fa4a-4338-a77b-0fbfe644daa8', '20f1cfe8-0789-4606-bc6a-c0d3faa52320', '2ec09323-d324-4bd6-aed5-4ea67af38924', 'member', '2025-07-31T17:24:35.013579+00:00', 0),
('ef25a2df-bc24-498f-afbe-6bc7665e2eb5', '20f1cfe8-0789-4606-bc6a-c0d3faa52320', '2ec09323-d324-4bd6-aed5-4ea67af38924', 'member', '2025-09-05 23:51:35', 0),
('f2c84aa8-513f-4bdc-8241-21256776dfc3', '090a7ee8-abb4-4297-b0fe-d2455a4ac322', '2ec09323-d324-4bd6-aed5-4ea67af38924', 'member', '2025-09-05 23:54:10', 1),
('f43a603b-c328-4592-89dc-518546a2f303', '20f1cfe8-0789-4606-bc6a-c0d3faa52320', '2ec09323-d324-4bd6-aed5-4ea67af38924', 'member', '2025-09-05 23:52:58', 1);

-- --------------------------------------------------------

--
-- Table structure for table `team_performance`
--

CREATE TABLE `team_performance` (
  `id` varchar(36) NOT NULL,
  `team_id` varchar(36) DEFAULT NULL,
  `month` date DEFAULT NULL,
  `total_accounts_achieved` int(11) DEFAULT 0,
  `total_gross` decimal(15,2) DEFAULT 0.00,
  `total_cash_in` decimal(15,2) DEFAULT 0.00,
  `total_remaining` decimal(15,2) DEFAULT 0.00,
  `target_accounts` int(11) DEFAULT 0,
  `target_gross` decimal(15,2) DEFAULT 0.00,
  `target_cash_in` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `typing_indicators`
--

CREATE TABLE `typing_indicators` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `is_typing` tinyint(1) DEFAULT 0,
  `started_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `upseller_performance`
--

CREATE TABLE `upseller_performance` (
  `id` varchar(36) NOT NULL,
  `seller_id` text DEFAULT NULL,
  `month` text DEFAULT NULL,
  `accounts_achieved` int(11) DEFAULT NULL,
  `total_gross` int(11) DEFAULT NULL,
  `total_cash_in` int(11) DEFAULT NULL,
  `total_remaining` int(11) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `upseller_performance`
--

INSERT INTO `upseller_performance` (`id`, `seller_id`, `month`, `accounts_achieved`, `total_gross`, `total_cash_in`, `total_remaining`, `created_at`, `updated_at`) VALUES
('f5aaae12-0c80-409e-8a13-5af7a32e61d2', '4c74f743-fa52-470d-ba55-8343f2099041', '2025-08-01', 6, 23500, 21500, 2000, '2025-08-25T22:07:51.265941+00:00', '2025-08-25T22:21:34.742992+00:00');

-- --------------------------------------------------------

--
-- Table structure for table `upseller_targets`
--

CREATE TABLE `upseller_targets` (
  `id` varchar(36) NOT NULL,
  `seller_id` text DEFAULT NULL,
  `month` text DEFAULT NULL,
  `target_accounts` int(11) DEFAULT NULL,
  `target_gross` int(11) DEFAULT NULL,
  `target_cash_in` int(11) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `upseller_targets`
--

INSERT INTO `upseller_targets` (`id`, `seller_id`, `month`, `target_accounts`, `target_gross`, `target_cash_in`, `created_at`, `updated_at`) VALUES
('', NULL, '2025-09-01', 0, 0, 15000, '2025-09-02 03:16:54', '2025-09-02 03:52:06'),
('2142e4a9-b8c0-44aa-b6f7-570e1dd787ab', 'c68193f0-bb0e-47d3-bdd7-a717acd775f6', '2025-09-01', 0, 0, 5000, '2025-09-04 03:49:57', '2025-09-04 03:49:57'),
('46b905ee-c33f-40cf-ba93-7ba8d76187b3', 'c68193f0-bb0e-47d3-bdd7-a717acd775f6', '2025-09-01', 0, 0, 15000, '2025-09-02 04:04:18', '2025-09-02 04:04:18'),
('9e1cb023-3699-40f0-9143-20ecbd6998eb', '4c74f743-fa52-470d-ba55-8343f2099041', '2025-09-01', 0, 0, 15000, '2025-09-06 00:05:20', '2025-09-06 00:05:20');

-- --------------------------------------------------------

--
-- Table structure for table `upseller_targets_management`
--

CREATE TABLE `upseller_targets_management` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `month` date DEFAULT NULL,
  `target_accounts` int(11) DEFAULT 0,
  `target_gross` decimal(15,2) DEFAULT 0.00,
  `target_cash_in` decimal(15,2) DEFAULT 0.00,
  `set_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `upseller_teams`
--

CREATE TABLE `upseller_teams` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `team_lead_id` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `upseller_teams`
--

INSERT INTO `upseller_teams` (`id`, `name`, `description`, `team_lead_id`, `created_at`, `updated_at`, `is_active`) VALUES
('0bd11de8-24aa-4c1c-b663-a3c774f7a760', 'Alpha', '', NULL, '2025-08-11T22:07:36.331288+00:00', '2025-08-11T22:07:36.331288+00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `upseller_team_members`
--

CREATE TABLE `upseller_team_members` (
  `id` varchar(36) NOT NULL,
  `team_id` text DEFAULT NULL,
  `employee_id` text DEFAULT NULL,
  `role` text DEFAULT NULL,
  `joined_at` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `upseller_team_members`
--

INSERT INTO `upseller_team_members` (`id`, `team_id`, `employee_id`, `role`, `joined_at`, `is_active`) VALUES
('83685f81-e66a-4d24-87ba-a184a85497b3', '0bd11de8-24aa-4c1c-b663-a3c774f7a760', '4c74f743-fa52-470d-ba55-8343f2099041', 'member', '2025-08-15T17:20:54.537056+00:00', 1),
('e34035cc-fb65-4b19-8215-96687134d048', '0bd11de8-24aa-4c1c-b663-a3c774f7a760', 'c68193f0-bb0e-47d3-bdd7-a717acd775f6', 'member', '2025-08-11T22:09:56.919524+00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` varchar(36) NOT NULL,
  `user_id` text DEFAULT NULL,
  `module_id` int(11) DEFAULT NULL,
  `can_create` tinyint(1) DEFAULT NULL,
  `can_read` tinyint(1) DEFAULT NULL,
  `can_update` tinyint(1) DEFAULT NULL,
  `can_delete` tinyint(1) DEFAULT NULL,
  `screen_visible` tinyint(1) DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_permissions`
--

INSERT INTO `user_permissions` (`id`, `user_id`, `module_id`, `can_create`, `can_read`, `can_update`, `can_delete`, `screen_visible`, `created_at`, `updated_at`) VALUES
('03065e66-470b-4939-ab76-bc227177b740', '705ede64-e466-4359-9b7a-e65c2b8debef', 5, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('046031e9-fa90-4723-a5f1-49b540ff0dec', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 3, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('0b38f689-1c8a-4de3-81fe-9e6065526d93', '705ede64-e466-4359-9b7a-e65c2b8debef', 8, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('0bbdbe09-9ac4-4446-a582-9a6ea9f88713', 'ad828522-a32f-4512-9e17-bc5d65bee506', 69, 1, 1, 1, 1, 0, '2025-08-11T19:43:46.930336', NULL),
('0d42f591-26b8-4739-8526-f28637da4a06', 'de514a73-4782-439e-b2ea-3f49fe568e24', 17, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('11ec2b51-3737-42b7-a82b-bc4d147719b0', 'de514a73-4782-439e-b2ea-3f49fe568e24', 55, 1, 1, 1, 1, 1, '2025-07-29T16:50:57.341065', NULL),
('149e3d29-34c9-439f-bbcf-f65949442916', '78294d98-4280-40c1-bb6d-b85b7203b370', 10, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('16b1001a-2031-4adc-ba75-6e7e97dd2402', '78294d98-4280-40c1-bb6d-b85b7203b370', 71, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('1e40e573-9732-49ed-936a-1f0585698069', 'de514a73-4782-439e-b2ea-3f49fe568e24', 6, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('1feb8e7b-f84b-4484-968a-01407c0fc39b', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 55, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('20f49d36-93db-476b-bff9-fef5ab72ce0b', '78294d98-4280-40c1-bb6d-b85b7203b370', 3, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('211af95c-7ec0-4e40-ab88-750d7c307f57', 'de514a73-4782-439e-b2ea-3f49fe568e24', 16, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('21aaf1a7-60cb-46bf-80a9-d0931296ea97', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 71, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('21e9d14a-4b60-451b-8d93-0a6412daf5d1', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 6, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('24b08d4b-0460-4329-9e58-7999dc620892', 'de514a73-4782-439e-b2ea-3f49fe568e24', 5, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('251a72c6-d0a2-4199-a215-281adf79b841', '705ede64-e466-4359-9b7a-e65c2b8debef', 69, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('276ddbd0-fe89-4f9d-9a7c-91433faa740c', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 56, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('29101cdb-d026-4112-a9d7-1dce50e51986', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 75, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('2b7e6a29-2d64-4423-be44-d6d205e7b155', '705ede64-e466-4359-9b7a-e65c2b8debef', 14, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('2b86a609-87ba-4e03-a587-7ad8ab3d71ed', 'de514a73-4782-439e-b2ea-3f49fe568e24', 14, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('2c044c2c-3dae-46f8-a3ab-e64f2ca04b58', 'de514a73-4782-439e-b2ea-3f49fe568e24', 72, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('2de9b492-34af-4396-b51d-835fa58410eb', 'de514a73-4782-439e-b2ea-3f49fe568e24', 18, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('31422020-1f99-44e2-abbd-0e083de1bad1', 'de514a73-4782-439e-b2ea-3f49fe568e24', 12, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('32900762-bef5-477d-a591-26fb6de8d1b5', '78294d98-4280-40c1-bb6d-b85b7203b370', 16, 0, 0, 0, 0, 0, '2025-07-31T17:11:39.144116', NULL),
('340a7066-e3fe-4fab-826a-5396a7f33e4b', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 10, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('35df3c3d-ae2f-43ca-b849-d43c9538c285', 'de514a73-4782-439e-b2ea-3f49fe568e24', 3, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('37fea993-0955-49dc-ae5e-5c35edd4687e', '8c9c203b-28ca-4af0-a381-0f809e791155', 10, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('39756339-8b66-42a2-b4d1-8ac0e348ab41', 'de514a73-4782-439e-b2ea-3f49fe568e24', 60, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('3a872f18-72bb-401e-946f-fa979eb278f5', '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9', 75, 1, 1, 1, 1, 1, '2025-08-11T20:42:12.862608', NULL),
('3bc7771c-9e73-486f-bfea-5c46d3867d5f', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 2, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('3c2e544a-3115-4cc9-8277-7ab00e37c6fc', 'de514a73-4782-439e-b2ea-3f49fe568e24', 7, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('40693b49-53f9-434f-a5e2-516db0a07bb5', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 64, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('427c66ae-3326-4a76-b6e5-5e46fbdb2c48', 'de514a73-4782-439e-b2ea-3f49fe568e24', 15, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('4584ff52-e6fc-4cfe-996a-fb4d1df8fe06', '705ede64-e466-4359-9b7a-e65c2b8debef', 60, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('4614cd97-4d7c-45d7-a6c0-7846cd3f1d10', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 9, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('461a165c-aee2-4c16-b224-312ab8a56f98', '705ede64-e466-4359-9b7a-e65c2b8debef', 56, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('469c6b1e-2b9c-4e1b-b8f6-94f5a59cd36e', '705ede64-e466-4359-9b7a-e65c2b8debef', 7, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('47162319-5bc4-4c73-8f93-a578d8f309d3', '78294d98-4280-40c1-bb6d-b85b7203b370', 12, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('49e14baa-cc2d-4547-aec6-4b697aa9667f', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 15, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('49e8b302-2196-4aab-8ece-5287791415d6', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 68, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('4b16dc1c-efd5-4abc-91c6-76971f28d870', 'ad828522-a32f-4512-9e17-bc5d65bee506', 3, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('4fc62585-c5a4-4f7f-81c6-c0e432e23b46', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 69, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('5213a37d-23a6-48eb-b6ff-ad8dcce4bba5', '8c9c203b-28ca-4af0-a381-0f809e791155', 71, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('569fea22-aac4-4480-9adf-51b810cf6ec6', 'ad828522-a32f-4512-9e17-bc5d65bee506', 10, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('57bd9b8d-394b-4840-ac6e-d0af2539b11b', 'de514a73-4782-439e-b2ea-3f49fe568e24', 8, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('5b7a6cfb-30e2-4d44-a15e-acaaa4f6b091', '705ede64-e466-4359-9b7a-e65c2b8debef', 58, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('5ba99265-e7bf-4f0f-8ee1-dd8ee6580def', 'de514a73-4782-439e-b2ea-3f49fe568e24', 11, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('5dfcb151-ae45-4dbf-a88a-1a9b3cb053fb', '705ede64-e466-4359-9b7a-e65c2b8debef', 6, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('5f7b656b-0134-4527-988b-2b052e004201', 'ad828522-a32f-4512-9e17-bc5d65bee506', 6, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('606652de-cdfe-4c43-8891-2334ba4d1f9c', '78294d98-4280-40c1-bb6d-b85b7203b370', 17, 0, 0, 0, 0, 0, '2025-07-31T17:11:39.144116', NULL),
('60a66caf-5aa8-4c32-8338-cf73803e3de0', 'de514a73-4782-439e-b2ea-3f49fe568e24', 1, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('632014cc-40d5-4b66-8da7-2351d3e74932', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 14, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('696545b0-525c-4787-b753-48f4854690bd', '705ede64-e466-4359-9b7a-e65c2b8debef', 61, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('6d1b5b8a-67a3-424a-bcaa-e2762bcabc70', 'de514a73-4782-439e-b2ea-3f49fe568e24', 10, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('6d8ea9c4-c06b-4a15-8ea8-6790098909e0', 'de514a73-4782-439e-b2ea-3f49fe568e24', 62, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('6e090fd5-0fb0-486f-95ff-e9066b14ba93', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 59, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('708c7f80-8ca6-4637-b59d-8ddd256e7f77', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 62, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('725c38d5-32f9-4141-8a5c-6aee9f5aec60', 'ad828522-a32f-4512-9e17-bc5d65bee506', 18, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('7344c0b9-9dbe-42b6-9e58-e497ee73929d', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 66, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('750b93e8-dad7-4d88-847a-911fe1b35665', '705ede64-e466-4359-9b7a-e65c2b8debef', 13, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('7a678a90-a1d8-4c37-a3c3-f16e48bf1298', '705ede64-e466-4359-9b7a-e65c2b8debef', 71, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('7be97a9a-1f0e-46f7-9f8f-e1c8068e0b57', 'de514a73-4782-439e-b2ea-3f49fe568e24', 59, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('82275ac9-c4e7-4bbe-ad42-b2fa4a0c52a3', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 65, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('839969f0-58f9-45ac-92a6-680adbaf3e0b', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 11, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('85a86cd3-e06d-4e62-a483-379cb5a1564f', '705ede64-e466-4359-9b7a-e65c2b8debef', 17, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('88a55335-4f0c-41d5-80e5-eddd76170cbe', '705ede64-e466-4359-9b7a-e65c2b8debef', 62, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('890c2079-6293-4c7c-9028-ed7967cbd44d', 'ad828522-a32f-4512-9e17-bc5d65bee506', 7, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('8a2cc70c-6e66-4d6e-a927-b49463479fa4', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 61, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('8f5ca02f-2654-4dbc-b28b-d75c693ee610', '8c9c203b-28ca-4af0-a381-0f809e791155', 69, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('8fa6f6c6-386e-49a3-9959-24ce10a9d642', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 5, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('90d5752e-4486-4b73-995d-9e818481cb61', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 63, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('96d69417-7f30-4671-aab3-28f2069cd247', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 67, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('9b0556b3-3470-4b26-94a9-8c52bc5674f9', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 13, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('9b3cfc55-eeed-4f50-8bb8-1970adad5d52', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 1, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('9b5dc8ac-82af-4bb9-87ad-149e6320b1e7', 'de514a73-4782-439e-b2ea-3f49fe568e24', 58, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('9b77b9d3-1a3e-4161-88fb-ee01c4664d46', '8c9c203b-28ca-4af0-a381-0f809e791155', 3, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('9d00f02b-5f84-4176-91cc-ca9011d2dcd0', 'de514a73-4782-439e-b2ea-3f49fe568e24', 9, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('9f13f004-0f88-4cbc-894c-6443a0a12279', 'de514a73-4782-439e-b2ea-3f49fe568e24', 69, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('a169f5f7-aa05-4d12-8538-c0342b28b52e', '705ede64-e466-4359-9b7a-e65c2b8debef', 55, 1, 1, 1, 1, 1, '2025-07-29T16:50:57.341065', NULL),
('a840fa5e-6f5c-4fce-9e2b-db2ac7403460', '705ede64-e466-4359-9b7a-e65c2b8debef', 59, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('ac419f50-f434-4ae5-9516-250d6f08078f', 'ad828522-a32f-4512-9e17-bc5d65bee506', 61, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('ad34ccd4-cfd1-4282-9bbb-12d8b5318da9', 'de514a73-4782-439e-b2ea-3f49fe568e24', 2, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('af986475-a55c-4f55-98bf-b5a4c376da5d', '8c9c203b-28ca-4af0-a381-0f809e791155', 12, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('b15b1479-523c-43dc-9ff0-abcc38fad0ad', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 12, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('b37ee47b-f1d1-45c1-a756-d61b93d74868', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 60, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('b5551a5c-5a53-41b4-93c0-90c2dbd96de4', '8c9c203b-28ca-4af0-a381-0f809e791155', 17, 0, 0, 0, 0, 0, '2025-07-31T16:41:13.028052', NULL),
('b61adf05-0be6-48b5-aa16-7ecc3e717ae9', '8c9c203b-28ca-4af0-a381-0f809e791155', 18, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('b6ee9e29-28cc-48c5-9437-382421901569', 'ad828522-a32f-4512-9e17-bc5d65bee506', 5, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('b9214080-5ea2-4a58-9c7c-fa3d63c73d44', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 58, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('bcdb9b9c-59a6-43c3-897d-f1225315a736', 'de514a73-4782-439e-b2ea-3f49fe568e24', 56, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('c012fc2b-5ff0-4a4f-ac9e-b7384092d8fc', 'ad828522-a32f-4512-9e17-bc5d65bee506', 66, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('c0b1cb43-398e-497e-99ee-2f750e6fe9a8', '705ede64-e466-4359-9b7a-e65c2b8debef', 1, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('c3a66c57-7605-4e59-9b76-52e240371c4b', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 72, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('c64a1c4b-dc4b-416d-a885-c5a042849be6', '705ede64-e466-4359-9b7a-e65c2b8debef', 18, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('c6ee4542-9254-4362-a1ca-9fdaa9df8084', '705ede64-e466-4359-9b7a-e65c2b8debef', 3, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('c7b1b219-197d-49d0-89cb-f6d39f8f31b5', '8c9c203b-28ca-4af0-a381-0f809e791155', 2, 1, 1, 1, 1, 1, '2025-07-31T16:41:13.028052', NULL),
('cbb9cd21-d4d8-4719-8632-cb568f1b0726', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 7, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('cd020a3a-0689-42d5-812a-29f1473fd8c0', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 70, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('cd74cd3c-f761-4075-81ff-678c985e093e', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 16, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('ceeb4fdb-4a8e-4459-8c6a-3845d1544d59', '705ede64-e466-4359-9b7a-e65c2b8debef', 72, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('d027d1e1-325e-4696-9405-f63dc3d524fc', 'de514a73-4782-439e-b2ea-3f49fe568e24', 13, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('d5d78371-4c49-4ee3-9753-5a8bb82d5172', '8c9c203b-28ca-4af0-a381-0f809e791155', 16, 0, 0, 0, 0, 0, '2025-07-31T16:41:13.028052', NULL),
('d6873d2e-c34b-4166-95b0-0ae2a2850e0e', '78294d98-4280-40c1-bb6d-b85b7203b370', 2, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('d6887112-128f-4fff-889d-1f0ef8c39617', '705ede64-e466-4359-9b7a-e65c2b8debef', 2, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('d6a3605a-c120-4613-8a94-ef334cb9ed94', '705ede64-e466-4359-9b7a-e65c2b8debef', 15, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('d769daf0-c117-46ca-b5ea-01bdde035191', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 18, 1, 1, 1, 1, 1, '2025-08-15T17:19:06.014693', NULL),
('d7e9ae98-2e96-4e69-bcdc-8c2d1d440691', '78294d98-4280-40c1-bb6d-b85b7203b370', 69, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('d90fa5ba-84d6-4c47-81e7-e2b15593098c', '78294d98-4280-40c1-bb6d-b85b7203b370', 18, 1, 1, 1, 1, 1, '2025-07-31T17:11:39.144116', NULL),
('d96550c0-acca-4b07-aa94-67606052e254', 'de514a73-4782-439e-b2ea-3f49fe568e24', 75, 1, 1, 1, 1, 1, '2025-08-11T20:42:12.862608', NULL),
('da95a80b-4bb2-461a-a893-4976bae40a34', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 17, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('dee3f88d-0e23-42b9-bfea-8ca96a8b8bb6', '705ede64-e466-4359-9b7a-e65c2b8debef', 10, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('df1279ab-963a-4130-b2b8-a62a341c0782', 'ad828522-a32f-4512-9e17-bc5d65bee506', 16, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('e08869ed-e022-4996-8fff-21c14501ca95', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 57, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('e791d449-7522-4df9-971c-430003c33f30', 'ad828522-a32f-4512-9e17-bc5d65bee506', 1, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('eec35f09-0c53-43c7-a2e0-c4937740ec12', '705ede64-e466-4359-9b7a-e65c2b8debef', 75, 1, 1, 1, 1, 1, '2025-08-11T20:42:12.862608', NULL),
('ef440ca5-6772-4bf0-b4be-2fa501fc2cb4', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', 8, 0, 0, 0, 0, 0, '2025-08-15T17:19:06.014693', NULL),
('f47d83dd-a1b3-48a4-be15-15ae5befd4fa', '705ede64-e466-4359-9b7a-e65c2b8debef', 12, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('f5eaeed7-326d-467e-aaed-45b2cbef3fb9', 'de514a73-4782-439e-b2ea-3f49fe568e24', 61, 1, 1, 1, 1, 1, '2025-07-29T16:54:23.346638', NULL),
('f9544e15-ad38-45b1-8916-a064fbc8d028', '705ede64-e466-4359-9b7a-e65c2b8debef', 11, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('f9a1a737-868f-4f71-aa98-7a8f94cf3899', '705ede64-e466-4359-9b7a-e65c2b8debef', 9, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('faa9fba2-e9e1-40cd-b46d-c65f886ebdf6', 'ad828522-a32f-4512-9e17-bc5d65bee506', 64, 1, 1, 1, 1, 1, '2025-08-11T19:43:46.930336', NULL),
('fab93b6a-be72-40e5-a4fb-268de0d77045', 'de514a73-4782-439e-b2ea-3f49fe568e24', 71, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL),
('fb98cd01-372c-426b-849d-f6d9a9711a97', '705ede64-e466-4359-9b7a-e65c2b8debef', 16, 1, 1, 1, 1, 1, '2025-07-29T16:42:23.574644', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_presence`
--

CREATE TABLE `user_presence` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `last_seen` timestamp NULL DEFAULT NULL,
  `custom_status` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

CREATE TABLE `user_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `email` text DEFAULT NULL,
  `display_name` text DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `employee_id` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `attributes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `email`, `display_name`, `is_admin`, `created_at`, `updated_at`, `employee_id`, `is_active`, `attributes`) VALUES
('47fc8b65-e5e1-40ce-8c6f-199e4b3e544e', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'adamzainnasir.fro@logicworks.com', 'Adam Zain Nasir', 0, '2025-07-31 12:11:38', '2025-08-28 16:23:22', '2ec09323-d324-4bd6-aed5-4ea67af38924', 0, '{\"phone\":\"03330217780\",\"position\":\"Assistant Vice President\",\"department\":\"Front Sales\",\"permissions\":{\"leads\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"calendar\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"messages\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"settings\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"customers\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"sales_form\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"my_dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"better_ask_saul\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"front_sales_management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false}},\"personal_email\":\"xaineexo@gmail.com\",\"user_management_email\":\"adamzainnasir.fro@logicworks.com\"}'),
('587752a7-a82d-4e7c-80ec-53d9e4e48b2a', '722d6008-7cec-43d3-8648-926a14f765c9', 'admin@logicworks.com', 'CRM Admin', 0, '2025-07-30 17:21:07', '2025-08-28 16:23:20', NULL, 0, '{\"role\":\"super_admin\",\"is_admin\":true,\"department\":\"Administration\",\"permissions\":{\"hr\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"api\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"admin\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"audit\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"leads\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"other\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"sales\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"backup\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"kanban\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"system\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"upsell\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"billing\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"reports\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"support\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"calendar\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"messages\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"payments\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"projects\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"settings\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"upseller\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"analytics\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"customers\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"documents\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"employees\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"marketing\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"automation\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"production\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"sales_form\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"development\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"front_sales\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"integrations\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"my_dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"notifications\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"better_ask_saul\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"role_management\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"user_management\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"recurring_services\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"front_sales_management\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true}},\"access_level\":\"full\",\"can_access_api\":true,\"is_super_admin\":true,\"can_import_data\":true,\"can_manage_leads\":true,\"can_manage_roles\":true,\"can_manage_sales\":true,\"can_manage_users\":true,\"can_manage_kanban\":true,\"can_manage_system\":true,\"can_manage_backups\":true,\"can_manage_billing\":true,\"can_manage_reports\":true,\"can_manage_support\":true,\"can_delete_any_data\":true,\"can_export_all_data\":true,\"can_manage_calendar\":true,\"can_manage_messages\":true,\"can_manage_projects\":true,\"can_manage_settings\":true,\"can_manage_analytics\":true,\"can_manage_customers\":true,\"can_manage_dashboard\":true,\"can_manage_documents\":true,\"can_manage_employees\":true,\"can_manage_marketing\":true,\"can_manage_workflows\":true,\"can_access_audit_logs\":true,\"can_manage_automation\":true,\"can_manage_permissions\":true,\"can_manage_integrations\":true,\"can_manage_notifications\":true,\"can_override_permissions\":true}'),
('969800bf-d01e-4d3f-80d2-c72b061b3abc', 'c056b5e5-874a-4f0c-a3ed-9d4565728451', 'adam@americandigitalagency.us', 'adam@americandigitalagency.us', 0, '2025-07-30 17:51:22', '2025-08-28 16:23:21', NULL, 0, '{\"role\":\"user\",\"is_admin\":false,\"department\":\"General\",\"created_via\":\"manual_fix\",\"permissions\":{},\"access_level\":\"basic\",\"is_super_admin\":false}'),
('ccddc582-e3ae-4055-821c-c612e9a41b63', 'a1791be0-b633-41bf-adce-fe1a1390b640', 'aghawasif.ups@logicworks.com', 'Agha Wasif ', 0, '2025-08-15 12:19:05', '2025-08-28 16:23:23', '4c74f743-fa52-470d-ba55-8343f2099041', 0, '{\"phone\":\"03323578995\",\"position\":\"Up Seller \",\"department\":\"Upseller\",\"permissions\":{\"hr\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"leads\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"other\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"kanban\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"upsell\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"calendar\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"messages\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"payments\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"projects\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"settings\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"upseller\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"customers\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"documents\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"employees\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"marketing\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"automation\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"production\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"sales_form\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"development\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"front_sales\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"my_projects\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"all_projects\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"my_dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"project_detail\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"better_ask_saul\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"role_management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"user_management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"customer_profile\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"project_assignment\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"recurring_services\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"upseller_management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"marketing_automation\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"front_sales_management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"recurring_service_detail\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false}},\"personal_email\":\"aghawasirf1@gmail.com\",\"user_management_email\":\"aghawasif.ups@logicworks.com\"}'),
('d45b3f63-9319-45b2-b8de-6bac2f0a8555', '767f0551-06aa-40b1-9113-b710250165c1', 'ali@logicworks.ai', 'ali@logicworks.ai', 0, '2025-07-30 17:51:22', '2025-08-28 16:23:21', NULL, 0, '{\"role\":\"user\",\"is_admin\":false,\"department\":\"General\",\"created_via\":\"manual_fix\",\"permissions\":{},\"access_level\":\"basic\",\"is_super_admin\":false}'),
('ec5491aa-c891-4f32-b2a3-529ebfa702da', '307b981c-46bb-4c23-8eca-aa5a065a7fca', 'muhammadalisheikh.ups@logicworks.com', 'Muhammad Ali Sheikh', 0, '2025-08-11 14:43:46', '2025-08-28 16:23:22', 'c68193f0-bb0e-47d3-bdd7-a717acd775f6', 0, '{\"phone\":\"0333-2431633\",\"position\":\"Account Manager\",\"department\":\"Upseller\",\"permissions\":{\"kanban\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"upsell\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"messages\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"projects\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"settings\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"upseller\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"customers\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"my_projects\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"my_dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"project_detail\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"better_ask_saul\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":false}},\"personal_email\":\"aliz799@icloud.com\",\"user_management_email\":\"muhammadalisheikh.ups@logicworks.com\"}'),
('ed987e4c-6615-4b0e-9854-9b459fdc1b54', '32ecaf78-c507-4140-bb07-a0cf57f6c813', 'adnanshafaqat.fro@logicworks.com', 'Adnan Shafaqat', 0, '2025-07-31 11:41:12', '2025-08-28 16:23:22', '14d4edad-a775-4708-99a5-ce3241faef66', 0, '{\"phone\":\"03120074615\",\"position\":\"Sr. Sales Executive \",\"department\":\"Front Sales\",\"permissions\":{\"leads\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"calendar\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"messages\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"settings\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false},\"customers\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"sales_form\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"my_dashboard\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"better_ask_saul\":{\"can_read\":true,\"can_create\":true,\"can_delete\":true,\"can_update\":true,\"screen_visible\":true},\"front_sales_management\":{\"can_read\":false,\"can_create\":false,\"can_delete\":false,\"can_update\":false,\"screen_visible\":false}},\"personal_email\":\"adnanshafaqat9@gmail.com\",\"user_management_email\":\"adnanshafaqat.fro@logicworks.com\"}');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `role_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `created_at`, `updated_at`) VALUES
('22d3ff00-aa36-4dfc-9bd7-059323151e77', '8c9c203b-28ca-4af0-a381-0f809e791155', 'ae936867-cbed-466c-bdef-778f05da133d', '2025-07-31 11:41:13', '2025-08-28 17:50:59'),
('47c43a91-d852-4f59-a7ff-dfd6de562e33', '307b981c-46bb-4c23-8eca-aa5a065a7fca', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', '2025-08-28 19:11:11', '2025-08-28 19:11:11'),
('5192d862-d9c7-41a4-a948-f161aa6edaac', '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', '2025-07-31 17:23:08', '2025-08-28 17:50:59'),
('676d336b-7f17-40d1-a20e-463876db04ea', 'de514a73-4782-439e-b2ea-3f49fe568e24', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', '2025-07-29 11:27:09', '2025-08-28 17:50:59'),
('69752817-cc69-44dc-a2f3-c44ca5ab249f', 'f3efd012-5e4b-4ea4-917a-a9deb3a272a9', 'ae936867-cbed-466c-bdef-778f05da133d', '2025-08-28 19:11:11', '2025-08-28 19:11:11'),
('786b9819-3084-4f34-8a58-26b7b1f1f034', '722d6008-7cec-43d3-8648-926a14f765c9', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', '2025-08-28 19:11:11', '2025-08-28 19:11:11'),
('98c902ef-9f90-4ae3-a6ef-92b4138da426', 'ad828522-a32f-4512-9e17-bc5d65bee506', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', '2025-08-11 14:43:47', '2025-08-28 17:50:59'),
('cff546ab-6e24-4bd0-adf1-ed08156a78fb', 'b7a4394a-acb2-48cf-91d9-d3f082ed2db0', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', '2025-08-15 12:19:06', '2025-08-28 17:50:59'),
('d2be082d-a440-4c90-9c2e-1f7848709d72', '705ede64-e466-4359-9b7a-e65c2b8debef', 'e2dbe44a-491f-4dd6-a1f6-d542c8d041d9', '2025-07-29 11:27:09', '2025-08-28 17:50:59'),
('da4bd68b-c296-4722-88e5-fbbea8629063', '78294d98-4280-40c1-bb6d-b85b7203b370', 'ae936867-cbed-466c-bdef-778f05da133d', '2025-07-31 12:11:39', '2025-08-28 17:50:59'),
('dfe2005c-6157-49ca-9596-470c65dea122', 'a1791be0-b633-41bf-adce-fe1a1390b640', '26dc37fe-bd9a-4e1d-a3d0-7466404e614f', '2025-08-28 19:11:11', '2025-08-28 19:11:11'),
('e783c5ff-9fae-46d1-9892-fc942a61e5c5', '32ecaf78-c507-4140-bb07-a0cf57f6c813', 'ae936867-cbed-466c-bdef-778f05da133d', '2025-08-28 19:11:11', '2025-08-28 19:11:11');

-- --------------------------------------------------------

--
-- Table structure for table `workspaces`
--

CREATE TABLE `workspaces` (
  `id` varchar(36) NOT NULL,
  `name` text DEFAULT NULL,
  `slug` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` text DEFAULT NULL,
  `updated_at` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `workspaces`
--

INSERT INTO `workspaces` (`id`, `name`, `slug`, `description`, `created_at`, `updated_at`) VALUES
('00000000-0000-0000-0000-000000000000', 'LogicWorks CRM', 'logicworks', 'Main workspace for LogicWorks CRM team', '2025-07-31T19:29:23.442768+00:00', '2025-07-31T19:29:23.442768+00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_chat_conversations`
--
ALTER TABLE `ai_chat_conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_chat_messages`
--
ALTER TABLE `ai_chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `auth_audit_log`
--
ALTER TABLE `auth_audit_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `auth_password_reset_tokens`
--
ALTER TABLE `auth_password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `auth_users`
--
ALTER TABLE `auth_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `auth_user_sessions`
--
ALTER TABLE `auth_user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_is_revoked` (`is_revoked`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_files`
--
ALTER TABLE `customer_files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_notes`
--
ALTER TABLE `customer_notes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_tags`
--
ALTER TABLE `customer_tags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_tasks`
--
ALTER TABLE `customer_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_dependents`
--
ALTER TABLE `employee_dependents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_emergency_contacts`
--
ALTER TABLE `employee_emergency_contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee_performance_history`
--
ALTER TABLE `employee_performance_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `error_logs`
--
ALTER TABLE `error_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `front_seller_performance`
--
ALTER TABLE `front_seller_performance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `front_seller_targets`
--
ALTER TABLE `front_seller_targets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message_mentions`
--
ALTER TABLE `message_mentions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message_search`
--
ALTER TABLE `message_search`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message_threads`
--
ALTER TABLE `message_threads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_sources`
--
ALTER TABLE `payment_sources`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_resource_action` (`resource`,`action`),
  ADD KEY `idx_permissions_resource` (`resource`),
  ADD KEY `idx_permissions_action` (`action`);

--
-- Indexes for table `permission_audit_log`
--
ALTER TABLE `permission_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_log_user_id` (`user_id`),
  ADD KEY `idx_audit_log_created_at` (`created_at`);

--
-- Indexes for table `pinned_messages`
--
ALTER TABLE `pinned_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_projects_due_date` (`due_date`(768)),
  ADD KEY `idx_projects_status` (`status`(768));

--
-- Indexes for table `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_upsells`
--
ALTER TABLE `project_upsells`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `recurring_payment_schedule`
--
ALTER TABLE `recurring_payment_schedule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_roles_name` (`name`(768)),
  ADD KEY `idx_roles_hierarchy` (`hierarchy_level`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_role_permissions_role_id` (`role_id`(768)),
  ADD KEY `idx_role_permissions_module` (`module_name`(768));

--
-- Indexes for table `sales_dispositions`
--
ALTER TABLE `sales_dispositions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_activities`
--
ALTER TABLE `task_activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_attachments`
--
ALTER TABLE `task_attachments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_boards`
--
ALTER TABLE `task_boards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_cards`
--
ALTER TABLE `task_cards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_card_labels`
--
ALTER TABLE `task_card_labels`
  ADD PRIMARY KEY (`card_id`,`label_id`);

--
-- Indexes for table `task_checklists`
--
ALTER TABLE `task_checklists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_checklist_items`
--
ALTER TABLE `task_checklist_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_labels`
--
ALTER TABLE `task_labels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_lists`
--
ALTER TABLE `task_lists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `task_time_entries`
--
ALTER TABLE `task_time_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `team_performance`
--
ALTER TABLE `team_performance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `typing_indicators`
--
ALTER TABLE `typing_indicators`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `upseller_performance`
--
ALTER TABLE `upseller_performance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `upseller_targets`
--
ALTER TABLE `upseller_targets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `upseller_targets_management`
--
ALTER TABLE `upseller_targets_management`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `upseller_teams`
--
ALTER TABLE `upseller_teams`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `upseller_team_members`
--
ALTER TABLE `upseller_team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_permissions_user_id` (`user_id`(768)),
  ADD KEY `idx_user_permissions_module_id` (`module_id`);

--
-- Indexes for table `user_presence`
--
ALTER TABLE `user_presence`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_roles_user_id` (`user_id`),
  ADD KEY `idx_user_roles_role_id` (`role_id`);

--
-- Indexes for table `workspaces`
--
ALTER TABLE `workspaces`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_audit_log`
--
ALTER TABLE `auth_audit_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=194;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_password_reset_tokens`
--
ALTER TABLE `auth_password_reset_tokens`
  ADD CONSTRAINT `auth_password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auth_user_sessions`
--
ALTER TABLE `auth_user_sessions`
  ADD CONSTRAINT `auth_user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permission_audit_log`
--
ALTER TABLE `permission_audit_log`
  ADD CONSTRAINT `permission_audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
