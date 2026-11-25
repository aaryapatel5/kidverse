package com.kidverse;

import com.kidverse.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KidverseApplication {

    public static void main(String[] args) {
        DotenvLoader.load();
        SpringApplication.run(KidverseApplication.class, args);
    }
}
