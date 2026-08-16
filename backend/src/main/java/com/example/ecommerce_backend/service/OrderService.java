package com.example.ecommerce_backend.service;

import com.example.ecommerce_backend.dto.OrderItemRequest;
import com.example.ecommerce_backend.dto.OrderRequest;
import com.example.ecommerce_backend.dto.OrderResponse;
import com.example.ecommerce_backend.entity.Order;
import com.example.ecommerce_backend.entity.OrderItem;
import com.example.ecommerce_backend.entity.Product;
import com.example.ecommerce_backend.repository.OrderRepository;
import com.example.ecommerce_backend.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        if (request.getCustomerName() == null ||
                request.getCustomerName().isBlank()) {

            throw new RuntimeException("Customer name is required");
        }

        if (request.getPhone() == null ||
                request.getPhone().isBlank()) {

            throw new RuntimeException("Phone is required");
        }

        if (request.getAddress() == null ||
                request.getAddress().isBlank()) {

            throw new RuntimeException("Address is required");
        }

        Order order = new Order();

        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("CONFIRMED");
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + itemRequest.getProductId()
                            )
                    );

            int quantity = itemRequest.getQuantity();

            if (quantity <= 0) {
                throw new RuntimeException("Invalid quantity");
            }

            if (product.getStock() < quantity) {

                throw new RuntimeException(
                        "Not enough stock for " + product.getName()
                );
            }

            BigDecimal itemTotal =
                    product.getPrice()
                            .multiply(BigDecimal.valueOf(quantity));

            total = total.add(itemTotal);

            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);

            // Store the price at the time of purchase.
            orderItem.setPrice(product.getPrice());

            order.addItem(orderItem);

            product.setStock(product.getStock() - quantity);

            productRepository.save(product);
        }

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        return new OrderResponse(
                savedOrder.getId(),
                savedOrder.getCustomerName(),
                savedOrder.getPaymentMethod(),
                savedOrder.getTotalAmount(),
                savedOrder.getStatus(),
                savedOrder.getCreatedAt()
        );
    }
}