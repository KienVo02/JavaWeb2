package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.CustomerRequest;
import com.example.kienweb2.entity.Customer;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.CustomerRepository;
import com.example.kienweb2.service.CustomerService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findNotDeletedOrderByCreatedAtDesc("DELETED");
    }

    @Override
    public Customer getCustomerById(Long id) {
        return findCustomer(id);
    }

    @Override
    @Transactional
    public Customer createCustomer(CustomerRequest request) {
        if (!hasText(request.fullName())) {
            throw new BadRequestException("Ten khach hang khong duoc de trong.");
        }

        Customer customer = new Customer();
        applyData(customer, request);
        return customerRepository.save(customer);
    }

    @Override
    @Transactional
    public Customer updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        applyData(customer, request);
        return customerRepository.save(customer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = findCustomer(id);
        customer.setStatus("DELETED");
        customerRepository.save(customer);
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay khach hang id: " + id));
    }

    private void applyData(Customer customer, CustomerRequest request) {
        if (hasText(request.fullName())) {
            customer.setFullName(request.fullName().trim());
        }
        if (request.email() != null) {
            customer.setEmail(trimToNull(request.email()));
        }
        if (request.phone() != null) {
            customer.setPhone(trimToNull(request.phone()));
        }
        if (request.address() != null) {
            customer.setAddress(trimToNull(request.address()));
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }
}
