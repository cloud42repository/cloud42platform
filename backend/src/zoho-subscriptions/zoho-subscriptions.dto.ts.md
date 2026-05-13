# zoho-subscriptions.dto.ts

TypeScript type definitions and interfaces for Zoho Subscriptions API entities including plans, addons, coupons, customers, and subscriptions.

## Key Exports

- **BillingInterval** — Union type for billing frequencies (monthly, yearly, weekly, etc.)
- **SubsPlan** — Interface for subscription plans with pricing and trial info
- **CreatePlanDTO / UpdatePlanDTO** — DTOs for plan creation and update
- **SubsAddon** — Interface for recurring or one-time addons with price brackets
- **DiscountType / DurationType** — Union types for coupon configuration
- **SubsCoupon** — Interface for discount coupons with redemption tracking
- **SubsCustomer** — Interface for customers with billing/shipping addresses
- **CreateSubsCustomerDTO / UpdateSubsCustomerDTO** — DTOs for customer management
- **SubscriptionStatus** — Union type covering all subscription lifecycle states
- **Subscription** — Interface for subscriptions linking customers to plans with addons
- **CreateSubscriptionDTO / UpdateSubscriptionDTO** — DTOs for subscription management
- **SubsListParams** — Extended list parameters with status and search filters

## Dependencies

- `ZohoAddress` from `../shared/shared.dto` — Shared address type
- `ZohoListParams` from `../shared/shared.dto` — Base pagination parameters

## How It Works

Provides complete type coverage for the Zoho Subscriptions API data model. Types are used across the controller, service, and client layers to enforce correct payloads for billing operations including plan management, customer lifecycle, and subscription state transitions.
