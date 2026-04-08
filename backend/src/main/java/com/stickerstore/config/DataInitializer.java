package com.stickerstore.config;

import com.stickerstore.model.Cart;
import com.stickerstore.model.Product;
import com.stickerstore.model.Role;
import com.stickerstore.model.User;
import com.stickerstore.repository.CartRepository;
import com.stickerstore.repository.ProductRepository;
import com.stickerstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
        log.info("Database seeded successfully!");
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        User admin = User.builder()
                .username("admin")
                .email("admin@stickerstore.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .build();
        admin = userRepository.save(admin);
        cartRepository.save(Cart.builder().user(admin).build());

        User user = User.builder()
                .username("user")
                .email("user@stickerstore.com")
                .password(passwordEncoder.encode("user123"))
                .role(Role.ROLE_USER)
                .build();
        user = userRepository.save(user);
        cartRepository.save(Cart.builder().user(user).build());

        log.info("Seeded 2 users: admin, user");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        List<Product> products = List.of(
                Product.builder()
                        .name("Happy Cat Sticker")
                        .description("An adorable smiling cat sticker perfect for laptops and water bottles. Made with premium vinyl.")
                        .price(new BigDecimal("3.99"))
                        .imageUrl("https://picsum.photos/seed/cat1/400/400")
                        .category("Animals")
                        .stockQuantity(100)
                        .build(),
                Product.builder()
                        .name("Cool Dog Sticker")
                        .description("A cool dog wearing sunglasses. Waterproof and UV resistant.")
                        .price(new BigDecimal("4.49"))
                        .imageUrl("https://picsum.photos/seed/dog1/400/400")
                        .category("Animals")
                        .stockQuantity(80)
                        .build(),
                Product.builder()
                        .name("Doge Meme Sticker")
                        .description("The classic Doge meme in sticker form. Such wow, very stick.")
                        .price(new BigDecimal("2.99"))
                        .imageUrl("https://picsum.photos/seed/doge/400/400")
                        .category("Memes")
                        .stockQuantity(150)
                        .build(),
                Product.builder()
                        .name("This Is Fine Sticker")
                        .description("The iconic 'This Is Fine' meme dog in a fire. Perfect for your laptop.")
                        .price(new BigDecimal("3.49"))
                        .imageUrl("https://picsum.photos/seed/fine/400/400")
                        .category("Memes")
                        .stockQuantity(120)
                        .build(),
                Product.builder()
                        .name("Mountain Sunset Sticker")
                        .description("Beautiful mountain sunset landscape sticker. High-quality matte finish.")
                        .price(new BigDecimal("5.99"))
                        .imageUrl("https://picsum.photos/seed/mountain/400/400")
                        .category("Nature")
                        .stockQuantity(60)
                        .build(),
                Product.builder()
                        .name("Ocean Wave Sticker")
                        .description("A stunning ocean wave sticker with vibrant blues and whites.")
                        .price(new BigDecimal("4.99"))
                        .imageUrl("https://picsum.photos/seed/ocean/400/400")
                        .category("Nature")
                        .stockQuantity(75)
                        .build(),
                Product.builder()
                        .name("Sakura Bloom Sticker")
                        .description("Delicate cherry blossom sticker inspired by Japanese art. Premium holographic finish.")
                        .price(new BigDecimal("6.99"))
                        .imageUrl("https://picsum.photos/seed/sakura/400/400")
                        .category("Anime")
                        .stockQuantity(50)
                        .build(),
                Product.builder()
                        .name("Kawaii Ramen Sticker")
                        .description("Cute kawaii-style ramen bowl with a happy face. Die-cut vinyl.")
                        .price(new BigDecimal("3.99"))
                        .imageUrl("https://picsum.photos/seed/ramen/400/400")
                        .category("Anime")
                        .stockQuantity(90)
                        .build(),
                Product.builder()
                        .name("Pixel Heart Sticker")
                        .description("Retro pixel art heart sticker. Great for gamers and retro enthusiasts.")
                        .price(new BigDecimal("1.99"))
                        .imageUrl("https://picsum.photos/seed/pixel/400/400")
                        .category("Custom")
                        .stockQuantity(200)
                        .build(),
                Product.builder()
                        .name("Cosmic Galaxy Sticker")
                        .description("A mesmerizing galaxy sticker with stars and nebulae. Holographic effect.")
                        .price(new BigDecimal("7.99"))
                        .imageUrl("https://picsum.photos/seed/galaxy/400/400")
                        .category("Nature")
                        .stockQuantity(40)
                        .build(),
                Product.builder()
                        .name("Cactus Friends Sticker Pack")
                        .description("A set of three adorable cactus stickers with different expressions.")
                        .price(new BigDecimal("8.99"))
                        .imageUrl("https://picsum.photos/seed/cactus/400/400")
                        .category("Custom")
                        .stockQuantity(65)
                        .build(),
                Product.builder()
                        .name("Ninja Cat Sticker")
                        .description("A stealthy ninja cat sticker. Premium matte vinyl with die-cut edges.")
                        .price(new BigDecimal("4.99"))
                        .imageUrl("https://picsum.photos/seed/ninja/400/400")
                        .category("Animals")
                        .stockQuantity(85)
                        .build(),
                Product.builder()
                        .name("Stonks Meme Sticker")
                        .description("The classic Stonks meme man. Show everyone your portfolio is doing great.")
                        .price(new BigDecimal("2.49"))
                        .imageUrl("https://picsum.photos/seed/stonks/400/400")
                        .category("Memes")
                        .stockQuantity(110)
                        .build(),
                Product.builder()
                        .name("Dragon Spirit Sticker")
                        .description("Majestic dragon spirit sticker with flowing energy trails. Large 4-inch size.")
                        .price(new BigDecimal("9.99"))
                        .imageUrl("https://picsum.photos/seed/dragon/400/400")
                        .category("Anime")
                        .stockQuantity(35)
                        .build(),
                Product.builder()
                        .name("Retro Sunset Sticker")
                        .description("80s-style retro sunset with palm trees and neon colors. Synthwave vibes.")
                        .price(new BigDecimal("5.49"))
                        .imageUrl("https://picsum.photos/seed/retro/400/400")
                        .category("Custom")
                        .stockQuantity(70)
                        .build()
        );

        productRepository.saveAll(products);
        log.info("Seeded {} products", products.size());
    }
}
