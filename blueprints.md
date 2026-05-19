# Blueprint: Dupsy Confectioneries Website

## Site Structure (Single HTML with internal sections)
- Homepage
- Menu (with category filter buttons)
- Cart (cart items + checkout form)
- About
- Contact

## Page Elements

### Header
- Logo (logo.png)
- Navigation: Home, Menu, Cart, About, Contact
- Cart icon with item count badge

### Homepage
- Hero: background gradient (butter to gold), slogan, "View Menu" button
- Featured products grid (4 items)
- Why Choose Us: Quality • Freshness • Satisfaction

### Menu Page
- Category filter buttons (Cakes, Pastries, Snacks, Nigerian, Continental, Desserts, Surprises)
- Product grid: image, name, description, price, "Add to Cart"

### Cart Page
- Cart items table with quantity controls and remove button
- Subtotal and total
- Checkout form: Full Name, Phone, Address, Special Instructions
- "Place Order" button – triggers WhatsApp

### About Us
- Brand story, values, commitment to freshness
- Optional: small gallery of products/events

### Contact
- Phone, email, contact form (optional)
- Floating WhatsApp button (visible on all pages)

## WhatsApp Message Format
New Order from Dupsy Confectioneries
Name: [customer name]
Phone: [phone]
Address: [address]
Instructions: [notes]

Order Items:

[product] x[quantity] = ₦[subtotal]

Total: ₦[grand total]

## Example Product Data Structure
const products = [
  { id:1, category:"Cakes", name:"Red Velvet Cake", description:"Moist with cream cheese frosting", price:15000, image:"https://images.unsplash.com/photo-1586788224331-947f68671cf1" },
  { id:2, category:"Pastries", name:"Spring Rolls", description:"Crispy vegetable rolls", price:3000, image:"..." },
  // ... include at least 8 products covering all categories
];

## Color Scheme
Butter (#FAF3E0): backgrounds, cards

Brown (#8B4513): text, buttons

Gold (#FFD700): borders, hover states, accents

Black (#000000): headings, footer background


## Responsive Breakpoints
Mobile: ≤640px (stack everything)

Tablet: 641–1024px (2‑3 columns)

Desktop: ≥1025px (4 columns)

## Testing Checklist
Cart updates correctly

Cart persists after page refresh

WhatsApp message opens with correct order data

Category filters work

All pages are accessible via navigation





