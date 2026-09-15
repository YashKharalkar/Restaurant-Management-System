import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('grand_table_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('grand_table_cart', JSON.stringify(cartItems));
    } catch {
      // ignore storage error
    }
  }, [cartItems]);

  const addToCart = (item, specialInstructions = '') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        return prev.map((i, index) =>
          index === existingIndex
            ? {
                ...i,
                qty: i.qty + 1,
                special_instructions: specialInstructions || i.special_instructions || '',
              }
            : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          qty: 1,
          special_instructions: specialInstructions || '',
        },
      ];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const updateInstructions = (id, instructions) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, special_instructions: instructions } : i))
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('grand_table_cart');
  };

  // For Reorder action: replaces or merges items
  const populateCart = (newItems) => {
    const formatted = newItems.map((item) => ({
      id: item.menu_item_id || item.id,
      name: item.item_name || item.name,
      price: Number(item.item_price || item.price),
      qty: item.quantity || item.qty || 1,
      special_instructions: item.special_instructions || '',
      category: item.category || 'Special',
      image_url: item.image_url || null,
    }));
    setCartItems(formatted);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        updateInstructions,
        clearCart,
        populateCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

