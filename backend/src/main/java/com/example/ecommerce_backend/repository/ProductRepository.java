package com.example.ecommerce_backend.repository;

import com.example.ecommerce_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProductRepository extends JpaRepository<Product, Long> {
     List<Product> findByNameContainingIgnoreCase(String name);
}
