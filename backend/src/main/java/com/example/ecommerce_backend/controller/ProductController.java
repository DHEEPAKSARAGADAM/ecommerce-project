package com.example.ecommerce_backend.controller;

import com.example.ecommerce_backend.entity.Product;
import com.example.ecommerce_backend.service.ProductService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger =
            LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAllProducts() {

        logger.info("GET /api/products");

        return productService.getAllProducts();
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
          return productService.searchProducts(name);
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {

        logger.info("GET /api/products/{}", id);

        return productService.getProductById(id);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {

        logger.info("POST /api/products");

        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

        return "Product deleted successfully";
    }
}