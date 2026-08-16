package com.example.ecommerce_backend.service;

import com.example.ecommerce_backend.entity.Product;
import com.example.ecommerce_backend.repository.ProductRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private static final Logger logger =
            LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {

        logger.info("Fetching all products");

        List<Product> products = productRepository.findAll();

        logger.info("Fetched {} products", products.size());

        return products;
    }

    public List<Product> searchProducts(String name) {
       return productRepository.findByNameContainingIgnoreCase(name);
    }

    public Product createProduct(Product product) {

        logger.info("Creating product: {}", product.getName());

        Product savedProduct = productRepository.save(product);

        logger.info("Product created with id: {}", savedProduct.getId());

        return savedProduct;
    }

    public Product getProductById(Long id) {

        logger.info("Fetching product id: {}", id);

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found with id: " + id)
                );
    }

    public Product updateProduct(Long id, Product updatedProduct) {

        Product existing = getProductById(id);

        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStock(updatedProduct.getStock());
        existing.setImageUrl(updatedProduct.getImageUrl());

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {

        Product product = getProductById(id);

        productRepository.delete(product);

        logger.info("Deleted product id: {}", id);
    }
}