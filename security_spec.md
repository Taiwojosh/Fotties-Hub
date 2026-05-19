# Security Specification for Fotties Hub

## Data Invariants
- A User profile can only be created by the authenticated owner of the UID.
- Products can only be written (create, update, delete) by an administrator.
- Orders can be created by any user (authenticated or guest), but:
    - If a `userId` is provided, it must match the authenticated user's UID.
    - Status can only be 'pending' on creation.
    - Only administrators can update the order status.
    - Users can only read their own orders.
    - Anonymous or Guest orders are readable only if the client knows the specific order ID (get only, no list for all orders).

## The "Dirty Dozen" Payloads

1. **Identity Theft (User Profile)**: Attempt to create a user profile with a UID that doesn't match the authenticated user's UID.
2. **Unauthorized Product Write**: Attempt to create a product as a non-admin user.
3. **Price Manipulation**: Attempt to update a product price as a regular user.
4. **Order Status Hijack**: Attempt to create an order with status 'delivered' (skipping 'pending').
5. **Order Spoofing**: Attempt to create an order with a `userId` that belongs to another user.
6. **Order PEEPING**: Attempt to list all orders as a non-admin user.
7. **Order Status Update**: Attempt to update an order status as a regular user (should be admin only).
8. **Immutable Order Date**: Attempt to update the `date` of an existing order.
9. **Shadow Field Injection**: Attempt to create a product with an extra `isFeatured: true` field not in the schema.
10. **Resource Poisoning (ID)**: Attempt to create a product with a 1KB long string as an ID.
11. **PII Exposure**: Attempt to read another user's PII (address, phone) from the `orders` collection.
12. **Recursive Cost Attack**: Attempt to query `orders` with a list operation that doesn't have a `userId` filter.

## Test Runner (Logic)
The `firestore.rules` will be tested against these invariants.
