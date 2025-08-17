# Frontend API Integration Guide

Your Next.js frontend is now fully connected to your MongoDB backend! Here's how to use it:

## 🚀 Quick Start

### 1. **API Service Layer** (`src/utils/api.js`)
All your API calls are centralized in this file:

```javascript
import { authAPI, productAPI, userAPI, cartAPI } from '@/utils/api';

// Authentication
const result = await authAPI.login({ email, password });
const user = await authAPI.register({ name, email, password, role });

// Products
const products = await productAPI.getAllProducts();
const product = await productAPI.getProduct(id);

// User operations
const profile = await userAPI.getProfile();
const favorites = await userAPI.getFavorites();

// Cart operations
const cart = await cartAPI.getCart();
await cartAPI.addToCart(productId, quantity);
```

### 2. **Custom Hooks** (`src/hooks/useApi.js`)
Pre-built hooks for common operations:

```javascript
import { useProducts, useCart, useFavorites } from '@/hooks/useApi';

function MyComponent() {
  const { products, loading, error, fetchProducts } = useProducts();
  const { cart, addToCart, removeFromCart } = useCart();
  
  useEffect(() => {
    fetchProducts(); // Automatically fetches products
  }, [fetchProducts]);
  
  // Your component logic here
}
```

### 3. **Authentication Context** (`src/contexts/AuthContext.js`)
Manage user state across your app:

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isAdmin, isVendor } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {isAdmin() && <AdminPanel />}
      {isVendor() && <VendorDashboard />}
    </div>
  );
}
```

## 🔐 Authentication Flow

### Login
```javascript
import { authAPI } from '@/utils/api';

const handleLogin = async (credentials) => {
  try {
    const result = await authAPI.login(credentials);
    if (result.token) {
      // User is automatically logged in
      // Token is stored in localStorage
      // Redirect or update UI
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Registration
```javascript
const handleRegister = async (userData) => {
  try {
    const result = await authAPI.register(userData);
    if (result.token) {
      // User is automatically logged in
    } else if (result.message) {
      // Vendor needs admin approval
      alert(result.message);
    }
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

## 🛍️ Product Management

### Fetch Products
```javascript
import { useProducts } from '@/hooks/useApi';

function ProductsPage() {
  const { products, loading, error, fetchProducts } = useProducts();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### Search Products
```javascript
const { searchProducts } = useProducts();

const handleSearch = async (query) => {
  if (query.trim()) {
    await searchProducts(query);
  } else {
    fetchProducts(); // Reset to all products
  }
};
```

### Create Product (Vendors)
```javascript
import { productAPI } from '@/utils/api';

const handleCreateProduct = async (productData) => {
  try {
    // First upload image
    const uploadResult = await productAPI.uploadImage(imageFile);
    
    // Then create product
    const product = await productAPI.createProduct({
      ...productData,
      image_url: uploadResult.url,
      original_url: uploadResult.url
    });
    
    // Refresh products list
    fetchProducts();
  } catch (error) {
    console.error('Failed to create product:', error);
  }
};
```

## 🛒 Shopping Cart

### Cart Operations
```javascript
import { useCart } from '@/hooks/useApi';

function CartPage() {
  const { cart, loading, addToCart, removeFromCart, clearCart } = useCart();
  
  useEffect(() => {
    fetchCart(); // Load cart on mount
  }, []);
  
  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };
  
  const handleRemoveFromCart = async (productId) => {
    await removeFromCart(productId);
  };
  
  return (
    <div>
      {cart.map(item => (
        <CartItem 
          key={item._id} 
          item={item}
          onRemove={() => handleRemoveFromCart(item.product_id)}
        />
      ))}
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}
```

## ❤️ Favorites System

### Manage Favorites
```javascript
import { useFavorites } from '@/hooks/useApi';

function FavoritesPage() {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  const handleToggleFavorite = async (productId, productData) => {
    const isFavorited = favorites.some(fav => fav.image_id === productId);
    
    if (isFavorited) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId, productData);
    }
  };
}
```

## 👑 Admin Functions

### Admin Operations
```javascript
import { adminAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

function AdminDashboard() {
  const { isAdmin } = useAuth();
  
  if (!isAdmin()) {
    return <AccessDenied />;
  }
  
  const handleApproveVendor = async (vendorId) => {
    await adminAPI.approveVendor(vendorId);
    // Refresh vendors list
  };
  
  const handleBlockUser = async (userId) => {
    await adminAPI.blockUser(userId);
    // Refresh users list
  };
  
  return (
    <div>
      <VendorManagement />
      <UserManagement />
      <ProductManagement />
    </div>
  );
}
```

## 🎯 Best Practices

### 1. **Error Handling**
Always wrap API calls in try-catch:

```javascript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  // Handle error
  console.error('API call failed:', error.message);
  // Show user-friendly error message
}
```

### 2. **Loading States**
Use the loading states from hooks:

```javascript
const { loading, error, data } = useApi();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <YourComponent data={data} />;
```

### 3. **Authentication Checks**
Always check authentication before making protected API calls:

```javascript
const { isAuthenticated, user } = useAuth();

if (!isAuthenticated) {
  return <LoginPrompt />;
}

// Now safe to make authenticated API calls
```

### 4. **Role-Based Access**
Use role checks for different features:

```javascript
const { isAdmin, isVendor, isUser } = useAuth();

return (
  <div>
    {isAdmin() && <AdminPanel />}
    {isVendor() && <VendorDashboard />}
    {isUser() && <UserDashboard />}
  </div>
);
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in your client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/
```

### API Base URL
The API service automatically uses:
- **Development**: `http://localhost:5001/`
- **Production**: Set via `NEXT_PUBLIC_API_URL` environment variable

## 🚀 Ready to Use!

Your frontend is now fully connected to your MongoDB backend with:
- ✅ **Complete API service layer**
- ✅ **Authentication management**
- ✅ **Custom hooks for common operations**
- ✅ **Error handling and loading states**
- ✅ **Role-based access control**
- ✅ **Shopping cart functionality**
- ✅ **Favorites system**
- ✅ **Product management**
- ✅ **Admin functions**

Start building your UI components using these APIs! 🎉
