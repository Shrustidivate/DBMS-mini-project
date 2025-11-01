import { Link } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ShopHub</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/cart">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                </Button>
              </Link>
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </Button>
              </Link>
              <Link to="/chatbot">
  <Button variant="ghost" size="sm">
    <MessageSquare className="mr-2 h-4 w-4" />
    Chatbot
  </Button>
</Link>

              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              
            </>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
