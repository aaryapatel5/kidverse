-- ==========================================================
-- KidVerse Database Initialization Script
-- Database Name: college_project
-- Target Engine: MySQL / MariaDB (via XAMPP)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `college_project` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `college_project`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(150),
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL, -- 'PARENT' or 'CHILD'
    `parent_id` BIGINT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_parent` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table (Learning Kits)
CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `age` VARCHAR(50) NOT NULL,
    `age_group` VARCHAR(20) NOT NULL, -- '3-5', '6-8', '9+'
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `video_url` VARCHAR(500) NOT NULL,
    `is_budget` BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `discount_pct` INT NOT NULL DEFAULT 0,
    `discount_amount` DOUBLE NOT NULL DEFAULT 0,
    `shipping` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL,
    `free_gift` VARCHAR(255) NULL,
    `status` VARCHAR(50) DEFAULT 'CONFIRMED',
    `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `price` DOUBLE NOT NULL,
    CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Child Progress Table
CREATE TABLE IF NOT EXISTS `child_progress` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `child_id` BIGINT NOT NULL UNIQUE,
    `stars` INT NOT NULL DEFAULT 0,
    `last_game` VARCHAR(100) NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_progress_child` FOREIGN KEY (`child_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data: Learning Kits (Initial 15 Products from Figma Website)
INSERT INTO `products` (`id`, `title`, `age`, `age_group`, `description`, `price`, `color`, `image_url`, `video_url`, `is_budget`) VALUES
(1, 'Creative Arts Kit', 'Ages 3-5', '3-5', 'Explore colors, shapes, and textures through painting, drawing, and crafting activities.', 2499, 'bg-[#ff8fa3]', 'https://images.unsplash.com/photo-1685477111354-7ffb7c7d396f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/yAiAJ85fPVE', FALSE),
(10, 'Alphabet Flash Cards', 'Ages 3-5', '3-5', 'Fun illustrated flash cards to learn letters, numbers, and shapes. Perfect starter kit.', 499, 'bg-[#ffd166]', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/yAiAJ85fPVE', TRUE),
(11, 'Sticker Activity Book', 'Ages 3-5', '3-5', 'Colorful activity book with 500+ stickers, mazes, and dot-to-dot fun for tiny hands.', 699, 'bg-[#ff8fa3]', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/yAiAJ85fPVE', TRUE),
(2, 'Science Explorer Kit', 'Ages 6-8', '6-8', 'Discover the wonders of science with fun experiments and hands-on exploration.', 2999, 'bg-[#8b7bd8]', 'https://images.unsplash.com/photo-1758685734470-a75109299497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/a_TSR_v07m0', FALSE),
(4, 'Reading & Writing Kit', 'Ages 5-7', '6-8', 'Build literacy skills through storytelling, creative writing, and reading activities.', 1999, 'bg-[#ffd166]', 'https://images.unsplash.com/photo-1762475833699-53a01f26565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/gH5qvD0g9wQ', FALSE),
(5, 'Music & Rhythm Kit', 'Ages 4-8', '6-8', 'Introduce your child to music with instruments, rhythm games, and creative sound activities.', 3299, 'bg-[#ff8fa3]', 'https://images.unsplash.com/photo-1761243839303-618ae0906300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/H-9_dZSxq8k', FALSE),
(6, 'Nature Discovery Kit', 'Ages 5-9', '6-8', 'Explore the natural world with outdoor activities, plant growing, and nature observation.', 2699, 'bg-[#52C41A]', 'https://images.unsplash.com/photo-1758307042875-cc40b192260d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/WXY5yRQr4Ug', FALSE),
(12, 'Story Dice Set', 'Ages 6-8', '6-8', 'Roll the dice and spin exciting stories! Boosts imagination, language, and creative thinking.', 599, 'bg-[#8b7bd8]', 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/gH5qvD0g9wQ', TRUE),
(13, 'Mini Science Cards', 'Ages 6-8', '6-8', '30 illustrated home-experiment cards — no lab needed, just curiosity!', 799, 'bg-[#6ec4db]', 'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/a_TSR_v07m0', TRUE),
(3, 'Math Adventure Kit', 'Ages 7-10', '9+', 'Make math exciting with games, puzzles, and real-world problem-solving challenges.', 2799, 'bg-[#6ec4db]', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/50qf99eUCUU', FALSE),
(7, 'Building & Construction Kit', 'Ages 4-8', '9+', 'Build creativity and spatial skills with blocks, construction tools, and building challenges.', 2899, 'bg-[#ffd166]', 'https://images.unsplash.com/photo-1772920909185-05b854e3858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/4kxbT3c52hg', FALSE),
(8, 'Coding & Robotics Kit', 'Ages 8-12', '9+', 'Learn programming basics and robotics through interactive projects and coding challenges.', 3999, 'bg-[#8b7bd8]', 'https://images.unsplash.com/photo-1568585262983-9b54814595a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/Fkd9TWUtFm0', FALSE),
(9, 'Sports & Fitness Kit', 'Ages 5-10', '9+', 'Stay active with fun sports equipment, exercises, and fitness games for kids.', 2599, 'bg-[#52C41A]', 'https://images.unsplash.com/photo-1771924492117-06ba6ce2f408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/dhCM0C6GnrY', FALSE),
(14, 'Brain Teaser Pack', 'Ages 9+', '9+', 'Challenging puzzles, riddles, and logic games that sharpen young minds and critical thinking.', 899, 'bg-[#52C41A]', 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/50qf99eUCUU', TRUE),
(15, 'Math Workbook Kit', 'Ages 9+', '9+', 'Comprehensive math practice with fun worksheets, games, and a mini calculator included.', 799, 'bg-[#6ec4db]', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 'https://www.youtube.com/embed/50qf99eUCUU', TRUE)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
