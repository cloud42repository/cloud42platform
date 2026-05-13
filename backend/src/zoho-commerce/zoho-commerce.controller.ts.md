# zoho-commerce.controller.ts

NestJS REST controller that exposes Zoho Commerce API endpoints for managing products, categories, customers, orders, and OAuth lifecycle. It delegates all operations to `ZohoCommerceService`.

## Key Exports

- **ZohoCommerceController** — Controller class mapped to the `zoho-commerce` route prefix, providing full CRUD for products and orders, read operations for customers, and OAuth management.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `ZohoCommerceService` — Service layer handling Zoho Commerce API operations

## How It Works

The controller defines RESTful handlers for products (list, get, create, update, delete), categories (list, get, create, delete), customers (list, get), orders (list, get, create, update status, cancel), and OAuth (authorize URL, exchange code, revoke). Each handler passes request data to the service and returns the result directly.
