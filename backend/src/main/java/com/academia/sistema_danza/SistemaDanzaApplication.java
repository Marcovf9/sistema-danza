package com.academia.sistema_danza;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SistemaDanzaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaDanzaApplication.class, args);
	}

}
