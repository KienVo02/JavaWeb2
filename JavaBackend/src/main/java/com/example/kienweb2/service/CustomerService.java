package com.example.kienweb2.service;

import com.example.kienweb2.dto.CustomerRequest;
import com.example.kienweb2.entity.Customer;
import java.util.List;

public interface CustomerService {

    List<Customer> getAllCustomers();

    Customer getCustomerById(Long id);

    Customer createCustomer(CustomerRequest request);

    Customer updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);
}
