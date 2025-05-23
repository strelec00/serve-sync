# Serve Sync 🧑‍🍳

Serve Sync is a web application designed to streamline restaurant operations by organizing the workflow between **waiters**, **chefs**, and **administrators**.


## Features

- **Authentication System**
  - User registration and login
  - Admin can assign roles to registered users
  - Newly registered users have `Role = null` until an Admin assigns one

- **User Roles**
  - **Admin**
    - Full access: Tables, Menu, Orders, Users
    - Assign roles, manage all data
  - **Waiter**
    - Access: Tables, Menu
    - Add/delete tables and menu items
    - Take guest orders and send to kitchen
    - Edit orders *until* chef starts preparing them
  - **Chef**
    - Access: Orders, Menu
    - Update order status (In Progress / Ready)
    - Manage menu items


## Workflow

### 1. Table Management
Admins and waiters can create and delete tables.

### 2. Order Placement
- Waiter selects a table → clicks **Order**
- Menu items are loaded from DB
- Waiter adds items to the order
- Order is sent to kitchen

### 3. Order Lifecycle
- Chef marks order as **In Progress**
- Waiter can no longer edit the order
- Chef marks order as **Ready**
- Waiter sees it's ready → delivers food
- After delivery → Waiter clicks **Order Finished** → order is removed



## Technologies

- **Backend:** .NET 8 & Entity Framework Core
- **Frontend:** React
- **Database:** PostgreSQL
- **Auth:** JWT Tokens



## Requirements

- [.NET 8 SDK or later](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- PostgreSQL Server



## Setup Instructions

### 1. Clone the repository
    ```
    git clone https://github.com/strelec00/serve-sync
    cd serve-sync

### Backend Setup
2. Navigate to backend
      ```
      cd backend/
3. Configure DB Connection
   In appsetting.json, replace your_username and your_password with valid SQL Server credentials. Set Port if needed.
      ```
    {
    "ConnectionStrings": {
    "DefaultConnection":"Host=localhost;Port=$5432;Database=ServeSync;Username=your_username;Password=your_password"
      }
    }
4. Install Entity Framework Tools (If not already installed)
      ```
    dotnet tool install --global dotnet-ef

5. Apply Migrations and Seed the Database
      ```
    dotnet ef database update
      
6. Run the Backend
   Backend should run on Port: 5123
      ```
    dotnet run

### Frontend Setup
7. Navigate to Frontend
      ```
    cd ../frontend
8. Install Dependencies
      ```
    npm install

9. Run the Frontend
      ```
    npm run dev

## Default Login Credentials
| Role   | Username   | Password   |
|--------|------------|------------|
| Admin  | adminuser  | adminpass  |
| Chef   | chefuser   | chefpass   |
| Waiter | waiteruser | waiterpass |
| Waiter | jan        | strelec    |

