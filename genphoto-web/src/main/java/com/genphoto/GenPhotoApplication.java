package com.genphoto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class GenPhotoApplication {

    public static void main(String[] args) {
        SpringApplication.run(GenPhotoApplication.class, args);
    }
}
