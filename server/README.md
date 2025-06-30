# Inventory Management System - Backend API

A comprehensive Express.js backend API for the Mini Inventory Management System with MongoDB integration.

## Features

- **Complete CRUD Operations** for Products, Suppliers, and Transactions
- **Advanced Reporting** with aggregation pipelines
- **Input Validation** using express-validator
- **Security Middleware** with helmet, CORS, and rate limiting
- **Error Handling** with custom error middleware
- **Database Relationships** with Mongoose population
- **Pagination and Filtering** for all endpoints
- **Stock Management** with automatic quantity updates

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/inventory_management
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/reports/low-stock` - Get low stock products
- `GET /api/products/reports/inventory-value` - Get inventory value report
- `GET /api/products/reports/by-supplier` - Get products grouped by supplier

### Suppliers
- `GET /api/suppliers` - Get all suppliers with filtering and pagination
- `GET /api/suppliers/:id` - Get single supplier with products
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `GET /api/suppliers/reports/performance` - Get supplier performance report

### Transactions
- `GET /api/transactions` - Get all transactions with filtering and pagination
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create new transaction (auto-updates stock)
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction (reverses stock changes)
- `GET /api/transactions/reports/summary` - Get transaction summary report

### System
- `GET /health` - Health check endpoint
- `GET /` - API information and available endpoints

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - Sort direction: 'asc' or 'desc' (default: 'desc')

### Filtering
- `search` - Text search across relevant fields
- `category` - Filter by product category
- `supplierId` - Filter by supplier ID
- `stockStatus` - Filter by stock status: 'LOW_STOCK', 'OUT_OF_STOCK', 'IN_STOCK'
- `type` - Filter transactions by type: 'PURCHASE', 'SALE', 'ADJUSTMENT'
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)

## Data Models

### Product Schema
```javascript
{
  name: String (required, max: 100)
  sku: String (required, unique, uppercase, max: 50)
  quantity: Number (required, min: 0)
  price: Number (required, min: 0)
  supplierId: ObjectId (required, ref: 'Supplier')
  minimumStock: Number (required, min: 0, default: 10)
  category: String (max: 50)
  description: String (max: 500)
  isActive: Boolean (default: true)
  timestamps: true
}
```

### Supplier Schema
```javascript
{
  name: String (required, max: 100)
  email: String (required, unique, email format)
  phone: String (required, phone format)
  address: {
    street: String (required)
    city: String (required)
    state: String
    zipCode: String
    country: String (required, default: 'USA')
  }
  contactPerson: String (max: 100)
  activeStatus: Boolean (default: true)
  paymentTerms: Enum ['NET_30', 'NET_60', 'NET_90', 'COD', 'PREPAID']
  rating: Number (min: 1, max: 5, default: 3)
  timestamps: true
}
```

### Transaction Schema
```javascript
{
  productId: ObjectId (required, ref: 'Product')
  type: Enum ['PURCHASE', 'SALE', 'ADJUSTMENT'] (required)
  quantity: Number (required, min: 1)
  unitPrice: Number (required, min: 0)
  total: Number (required, auto-calculated)
  reference: String (max: 100)
  notes: String (max: 500)
  supplierId: ObjectId (ref: 'Supplier', auto-populated)
  status: Enum ['PENDING', 'COMPLETED', 'CANCELLED'] (default: 'COMPLETED')
  timestamps: true
}
```

## Validation Rules

### Input Validation
- All required fields are validated
- String length limits enforced
- Email and phone format validation
- SKU format validation (uppercase alphanumeric with hyphens/underscores)
- Numeric range validation
- MongoDB ObjectId validation

### Business Logic Validation
- SKU uniqueness across products
- Email uniqueness across suppliers
- Sufficient stock validation for sales
- Supplier existence validation for products
- Transaction history preservation (soft delete for products with transactions)

## Error Handling

The API uses consistent error response format:

```javascript
{
  success: false,
  message: "Error description",
  errors: [...] // Validation errors array (if applicable)
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Sanitization** - XSS protection
- **Validation** - Comprehensive input validation
- **Error Handling** - Secure error responses

## Performance Optimizations

- **Database Indexing** - Optimized queries
- **Pagination** - Efficient data loading
- **Compression** - Response compression
- **Connection Pooling** - MongoDB connection optimization
- **Aggregation Pipelines** - Efficient reporting queries

## Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (when implemented)
```

### Environment Variables
```env
PORT=5000                                    # Server port
NODE_ENV=development                         # Environment mode
MONGODB_URI=mongodb://localhost:27017/inventory_management
MONGODB_TEST_URI=mongodb://localhost:27017/inventory_management_test
JWT_SECRET=your_super_secret_jwt_key_here   # For future auth implementation
JWT_EXPIRES_IN=7d                           # Token expiration
FRONTEND_URL=http://localhost:3000          # CORS origin
RATE_LIMIT_WINDOW_MS=900000                 # Rate limit window (15 min)
RATE_LIMIT_MAX_REQUESTS=100                 # Max requests per window
```

## Database Setup

The application will automatically connect to MongoDB and create the necessary collections. No manual database setup is required.

### Sample Data
The API doesn't include sample data seeding. Use the frontend application or API endpoints to create initial data.

## Monitoring and Logging

- **Morgan** - HTTP request logging
- **Console Logging** - Database connection status
- **Error Logging** - Comprehensive error tracking
- **Health Check** - `/health` endpoint for monitoring

## Future Enhancements

- JWT Authentication and Authorization
- Role-based Access Control
- File Upload for Product Images
- Email Notifications for Low Stock
- Advanced Analytics and Reporting
- API Documentation with Swagger
- Unit and Integration Tests
- Docker Containerization
- CI/CD Pipeline Setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when test suite is available)
5. Submit a pull request

## License

This project is licensed under the MIT License.