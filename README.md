# Serve Sync 🧑‍🍳

This is a web application designed to streamline restaurant operations by organizing the workflow between waiters, chefs, and administrators.

## Features

- **Authentication System**
  - User registration and login functionality
  - Admin users can assign roles to registered users

- **User Roles**
  - **Admin**
    - Full access to all tabs: Tables, Menu, and Orders
    - Can assign roles and manage all data
  - **Waiter**
    - Access to: Tables and Menu
    - Can add and delete tables
    - Can take guest orders and send them to the kitchen
    - Can edit orders until the chef starts working on them
    - Can add, delete, edit Menu Items
  - **Chef**
    - Access to: Orders and Menu
    - Can update the order status when preparation starts and when food is ready
    - Can add, delete, edit Menu Items

## Workflow

1. **Table Management**
   - Admins and waiters can create and delete tables.

2. **Order Placement**
   - The waiter selects a table and clicks the **Order** button.
   - A list of menu items (from the database) is displayed.
   - Menu items can be added, edited, or removed by users with the appropriate role.
   - Once the order is created, it's sent to the kitchen.

3. **Order Lifecycle**
   - The **Chef** sees the incoming orders and presses a button to mark an order as "In Progress."
   - While the order is in progress, the **Waiter** can no longer edit it.
   - Once the food is ready, the **Chef** marks the order as **Ready to Serve**.
   - The **Waiter** then sees that the order is ready and delivers it to the guests.
   - After delivery, the **Waiter** clicks **Order Finished**, and the order is deleted from the system.

## Possible Improvements

- Add support for guests to make additional orders.
- Support for managing multiple restaurants (a `restaurants` table exists in the database but currently, only one is used).
- Add notifications or real-time updates to improve communication between staff.

## Technologies Used

- Backend: .NET & EF Core
- Frontend: React
- Database: PostgreSQL 
- Authentication: JWT

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/strelec00/serve-sync
