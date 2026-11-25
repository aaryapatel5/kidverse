package com.kidverse.config;

import com.kidverse.entity.ChildProgress;
import com.kidverse.entity.Product;
import com.kidverse.entity.User;
import com.kidverse.repository.ChildProgressRepository;
import com.kidverse.repository.ProductRepository;
import com.kidverse.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChildProgressRepository childProgressRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public DataInitializer(ProductRepository productRepository,
                           UserRepository userRepository,
                           ChildProgressRepository childProgressRepository,
                           PasswordEncoder passwordEncoder,
                           Environment environment) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.childProgressRepository = childProgressRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        initProducts();

        // Seed demo accounts only in development profile; NEVER create default accounts in production
        boolean isProduction = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
        if (!isProduction) {
            initDefaultUsers();
        }
    }

    private void initProducts() {
        if (productRepository.count() == 0) {
            List<Product> defaultProducts = List.of(
                // Ages 3-5
                new Product(1L, "Creative Arts Kit", "Ages 3-5", "3-5",
                    "Explore colors, shapes, and textures through painting, drawing, and crafting activities.",
                    2499.0, "bg-[#ff8fa3]",
                    "https://images.unsplash.com/photo-1685477111354-7ffb7c7d396f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/yAiAJ85fPVE", false),
                new Product(10L, "Alphabet Flash Cards", "Ages 3-5", "3-5",
                    "Fun illustrated flash cards to learn letters, numbers, and shapes. Perfect starter kit.",
                    499.0, "bg-[#ffd166]",
                    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/yAiAJ85fPVE", true),
                new Product(11L, "Sticker Activity Book", "Ages 3-5", "3-5",
                    "Colorful activity book with 500+ stickers, mazes, and dot-to-dot fun for tiny hands.",
                    699.0, "bg-[#ff8fa3]",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/yAiAJ85fPVE", true),

                // Ages 6-8
                new Product(2L, "Science Explorer Kit", "Ages 6-8", "6-8",
                    "Discover the wonders of science with fun experiments and hands-on exploration.",
                    2999.0, "bg-[#8b7bd8]",
                    "https://images.unsplash.com/photo-1758685734470-a75109299497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/a_TSR_v07m0", false),
                new Product(4L, "Reading & Writing Kit", "Ages 5-7", "6-8",
                    "Build literacy skills through storytelling, creative writing, and reading activities.",
                    1999.0, "bg-[#ffd166]",
                    "https://images.unsplash.com/photo-1762475833699-53a01f26565a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/gH5qvD0g9wQ", false),
                new Product(5L, "Music & Rhythm Kit", "Ages 4-8", "6-8",
                    "Introduce your child to music with instruments, rhythm games, and creative sound activities.",
                    3299.0, "bg-[#ff8fa3]",
                    "https://images.unsplash.com/photo-1761243839303-618ae0906300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/H-9_dZSxq8k", false),
                new Product(6L, "Nature Discovery Kit", "Ages 5-9", "6-8",
                    "Explore the natural world with outdoor activities, plant growing, and nature observation.",
                    2699.0, "bg-[#52C41A]",
                    "https://images.unsplash.com/photo-1758307042875-cc40b192260d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/WXY5yRQr4Ug", false),
                new Product(12L, "Story Dice Set", "Ages 6-8", "6-8",
                    "Roll the dice and spin exciting stories! Boosts imagination, language, and creative thinking.",
                    599.0, "bg-[#8b7bd8]",
                    "https://images.unsplash.com/photo-1611996575749-79a3a250f948?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/gH5qvD0g9wQ", true),
                new Product(13L, "Mini Science Cards", "Ages 6-8", "6-8",
                    "30 illustrated home-experiment cards — no lab needed, just curiosity!",
                    799.0, "bg-[#6ec4db]",
                    "https://images.unsplash.com/photo-1628348070889-cb656235b4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/a_TSR_v07m0", true),

                // Ages 9+
                new Product(3L, "Math Adventure Kit", "Ages 7-10", "9+",
                    "Make math exciting with games, puzzles, and real-world problem-solving challenges.",
                    2799.0, "bg-[#6ec4db]",
                    "https://images.unsplash.com/photo-1509228468518-180dd4864904?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/50qf99eUCUU", false),
                new Product(7L, "Building & Construction Kit", "Ages 4-8", "9+",
                    "Build creativity and spatial skills with blocks, construction tools, and building challenges.",
                    2899.0, "bg-[#ffd166]",
                    "https://images.unsplash.com/photo-1772920909185-05b854e3858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/4kxbT3c52hg", false),
                new Product(8L, "Coding & Robotics Kit", "Ages 8-12", "9+",
                    "Learn programming basics and robotics through interactive projects and coding challenges.",
                    3999.0, "bg-[#8b7bd8]",
                    "https://images.unsplash.com/photo-1568585262983-9b54814595a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/Fkd9TWUtFm0", false),
                new Product(9L, "Sports & Fitness Kit", "Ages 5-10", "9+",
                    "Stay active with fun sports equipment, exercises, and fitness games for kids.",
                    2599.0, "bg-[#52C41A]",
                    "https://images.unsplash.com/photo-1771924492117-06ba6ce2f408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/dhCM0C6GnrY", false),
                new Product(14L, "Brain Teaser Pack", "Ages 9+", "9+",
                    "Challenging puzzles, riddles, and logic games that sharpen young minds and critical thinking.",
                    899.0, "bg-[#52C41A]",
                    "https://images.unsplash.com/photo-1606167668584-78701c57f13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/50qf99eUCUU", true),
                new Product(15L, "Math Workbook Kit", "Ages 9+", "9+",
                    "Comprehensive math practice with fun worksheets, games, and a mini calculator included.",
                    799.0, "bg-[#6ec4db]",
                    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
                    "https://www.youtube.com/embed/50qf99eUCUU", true)
            );
            productRepository.saveAll(defaultProducts);
        }
    }

    private void initDefaultUsers() {
        if (!userRepository.existsByUsername("parent@kidverse.com")) {
            User parent = new User("parent@kidverse.com", "parent@kidverse.com",
                    passwordEncoder.encode("password123"), "PARENT");
            userRepository.save(parent);
        }

        if (!userRepository.existsByUsername("Leo")) {
            User child = new User("Leo", null,
                    passwordEncoder.encode("kid123"), "CHILD");
            userRepository.save(child);

            if (childProgressRepository.findByChildUsername("Leo").isEmpty()) {
                childProgressRepository.save(new ChildProgress(child, 12, "alphabet"));
            }
        }
    }
}
