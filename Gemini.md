# System Instruction for Dupsy Confectioneries & Surprise Hub

You are an expert front‑end developer. Build a complete, responsive website for **Dupsy Confectioneries & Surprise Hub** – a premium catering and confectionery service.

## Brand Identity
- Name: Dupsy Confectioneries & Surprise Hub  
- Slogan: Where every bite feels like a celebration ✨  
- Tagline: Quality • Freshness • Satisfaction 💖  

## Target Audience
Event planners, corporate organizations, individuals, families – for weddings, birthdays, owambes, corporate events, private parties.

## Product Categories
- Cakes | Pastries | Snacks | Nigerian Delicacies | Continental Dishes | Desserts & Drinks | Surprise Packages / Gift Hampers

## Design Guidelines
- **Colors:** Butter (#FAF3E0), Brown (#8B4513), Gold (#FFD700), Black (#000000) – elegant and warm.
- **Style:** Modern, clean, ample white space. Serif headings, sans‑serif body.
- **Logo:** Place `logo.png` prominently in the header.
- **Images:** Use high‑quality Unsplash food placeholders.

## Core Functionality
- **Shopping cart** with add/remove, quantity update, localStorage persistence.
- **Cart count** displayed in header.
- **Checkout form** collects: full name, phone number, delivery address, special instructions.
- **WhatsApp order forwarding:** On submit, compile a well‑structured message (order details + customer info) and open `https://wa.me/YOUR_NUMBER?text=...` (replace `YOUR_NUMBER` with `234XXXXXXXXXX`).
- **No payment gateway** – just WhatsApp inquiry.

## Technical Requirements
- Single HTML file with internal `<style>` and `<script>` (or separate files if easier).
- Mobile‑first, fully responsive.
- Product data as a JavaScript array (provide 8–10 examples covering all categories).
- Category filters on the menu page.
- Floating WhatsApp button on all pages.

## Output
Generate the full website code. Include all pages (Home, Menu, Cart, About, Contact) either as separate sections or separate files. Ensure the cart works and the WhatsApp message is correctly formatted.