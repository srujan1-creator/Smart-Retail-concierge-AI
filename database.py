import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'aura_concierge.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop existing tables to ensure clean schema rebuild
    cursor.execute('DROP TABLE IF EXISTS inventory')
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('DROP TABLE IF EXISTS user_profile')
    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('DROP TABLE IF EXISTS reservations')
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            category TEXT,
            colors TEXT, -- JSON array of strings
            sizes TEXT,  -- JSON array of strings
            tags TEXT,   -- Space-separated search tags
            stock_level INTEGER DEFAULT 0
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            store_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            distance_miles REAL NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            address TEXT,
            phone TEXT,
            card_last4 TEXT,
            calendar_event TEXT,
            password TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            items TEXT NOT NULL, -- JSON array of items (product_id, name, price, qty, color, size)
            shipping_address TEXT,
            payment_method TEXT,
            pickup_code TEXT,
            FOREIGN KEY (user_id) REFERENCES user_profile (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            store_name TEXT NOT NULL,
            reservation_date TEXT NOT NULL,
            reservation_time TEXT NOT NULL,
            items TEXT NOT NULL, -- JSON array of items
            status TEXT DEFAULT 'Confirmed',
            FOREIGN KEY (user_id) REFERENCES user_profile (id)
        )
    ''')
    
    # Seed Data
    cursor.execute('SELECT COUNT(*) FROM products')
    if cursor.fetchone()[0] == 0:
        # Seed Products
        products = [
            (
                "Essential Wool Blazer",
                "Meticulously crafted from premium Italian virgin wool, this unstructured blazer combines sartorial elegance with everyday versatility. Features soft shoulders, notch lapels, and a patch pocket design.",
                495.00,
                "/static/images/products/wool_blazer.png",
                "Outerwear",
                json.dumps(["Navy", "Charcoal"]),
                json.dumps(["38R", "40R", "42L"]),
                "blazer jacket outerwear formal smart casual wool premium premium wool navy charcoal tailoring mixer business meeting interview professional luxury",
                12
            ),
            (
                "Luxury Poplin Shirt",
                "Crafted from fine double-ply Egyptian cotton poplin, this shirt offers a crisp feel and natural sheen. Perfect for layering under tailoring or wearing casually.",
                145.00,
                "/static/images/products/poplin_shirt.png",
                "Shirts",
                json.dumps(["White", "Blue"]),
                json.dumps(["S", "M", "L", "XL"]),
                "shirt top dress shirt white poplin cotton linen smart casual formal business classic layering linen premium office",
                25
            ),
            (
                "Tailored Wool Blazer",
                "A sharp, tailored fit blazer in refined wool blend. Modern silhouette with structured shoulders, making it a classic choice for the office or networking events.",
                450.00,
                "/static/images/products/tailored_blazer.png",
                "Outerwear",
                json.dumps(["Charcoal"]),
                json.dumps(["40R"]),
                "blazer jacket formal business wool charcoal luxury tailoring suit smart casual",
                5
            ),
            (
                "Nappa Leather Boots",
                "Hand-finished in soft Italian nappa leather, these chelsea boots offer a sleek silhouette and exceptional comfort with a durable rubber-injected leather sole.",
                285.00,
                "/static/images/products/leather_boots.png",
                "Shoes",
                json.dumps(["Black"]),
                json.dumps(["9", "10", "11"]),
                "boots shoes footwear leather black chelsea formal premium luxury casual smart dress boots",
                8
            ),
            (
                "Premium Merino Polo",
                "Knit from extra-fine Australian merino wool, this knit polo offers supreme softness and thermal comfort. A refined alternative to a standard collar shirt.",
                125.00,
                "/static/images/products/merino_polo.png",
                "Shirts",
                json.dumps(["Midnight Blue", "Charcoal"]),
                json.dumps(["S", "M", "L", "XL"]),
                "polo shirt knitwear merino wool blue charcoal casual smart casual knit luxury collared",
                15
            ),
            (
                "Tech-Stretch Chinos",
                "Engineered from a high-performance cotton blend with 4-way stretch, these chinos repel water and resist creases while maintaining a classic tailored silhouette.",
                145.00,
                "/static/images/products/tech_chinos.png",
                "Pants",
                json.dumps(["Desert Sand", "Navy"]),
                json.dumps(["30", "32", "34", "36"]),
                "chinos pants trousers stretch tech casual smart casual desert sand beige navy outdoor performance comfort",
                18
            ),
            (
                "Silk Pocket Square",
                "An exquisite silk pocket square featuring a classic geometric motif, hand-rolled edges, and rich luster to complete any formal look.",
                45.00,
                "/static/images/products/pocket_square.png",
                "Accessories",
                json.dumps(["Grey", "Gold"]),
                json.dumps(["One Size"]),
                "pocket square accessory silk grey gold pocket square tie formal styling decoration luxury pattern suit styling",
                30
            ),
            (
                "Aura Silk Wrap Dress",
                "An exquisite wrap dress crafted from heavyweight sandwashed mulberry silk. Features a flattering V-neckline, self-tie waist, and a fluid, sweeping silhouette that drapes elegantly.",
                345.00,
                "/static/images/products/wrap_dress.png",
                "Dresses",
                json.dumps(["Emerald Green", "Ruby Red"]),
                json.dumps(["XS", "S", "M", "L", "XL"]),
                "dress silk wrap dress female women stylish formal wedding guest luxury sweep emerald green ruby red elegant drape contemporary fashion",
                15
            ),
            (
                "Contemporary Cut-Out Dress",
                "A highly fashionable and modern midi dress featuring a sleek contemporary asymmetrical cut-out silhouette. Minimalist design crafted in premium crepe fabric, perfect for modern styling.",
                295.00,
                "/static/images/products/modern_dress.png",
                "Dresses",
                json.dumps(["Charcoal", "Black"]),
                json.dumps(["XS", "S", "M", "L"]),
                "dress modern cut-out asymmetrical midi dress female women stylish contemporary fashion designer chic charcoal black",
                12
            )
        ]
        
        cursor.executemany('''
            INSERT INTO products (name, description, price, image_url, category, colors, sizes, tags, stock_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', products)
        
        # Seed Inventory
        # We need specific stocks for Premium Merino Polo at different stores
        # Product ID 5 is Premium Merino Polo
        # Product ID 6 is Tech-Stretch Chinos
        # Product ID 1 is Essential Wool Blazer
        # Product ID 2 is Luxury Poplin Shirt
        inventory = [
            # Merino Polo
            (5, "Soho Flagship", 3, 0.8),
            (5, "Brooklyn Hub", 8, 2.4),
            (5, "Chelsea Store", 4, 1.2),
            # Tech-Stretch Chinos
            (6, "Soho Flagship", 5, 0.8),
            (6, "Brooklyn Hub", 10, 2.4),
            (6, "Chelsea Store", 2, 1.2),
            # Essential Wool Blazer
            (1, "Soho Flagship", 2, 0.8),
            (1, "Brooklyn Hub", 4, 2.4),
            # Luxury Poplin Shirt
            (2, "Soho Flagship", 6, 0.8),
            (2, "Brooklyn Hub", 12, 2.4),
            # Nappa Leather Boots
            (4, "Soho Flagship", 1, 0.8),
            (4, "Brooklyn Hub", 3, 2.4),
            # Aura Silk Wrap Dress
            (8, "Soho Flagship", 8, 0.8),
            (8, "Brooklyn Hub", 7, 2.4),
            # Contemporary Cut-Out Dress
            (9, "Soho Flagship", 5, 0.8),
            (9, "Brooklyn Hub", 7, 2.4)
        ]
        
        cursor.executemany('''
            INSERT INTO inventory (product_id, store_name, quantity, distance_miles)
            VALUES (?, ?, ?, ?)
        ''', inventory)
        
        # Seed User Profiles
        cursor.execute('''
            INSERT INTO user_profile (name, email, address, phone, card_last4, calendar_event, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            "Alex Sterling",
            "alex.sterling@design.co",
            "72 Greene Street, Apt 4B, Soho, New York, NY 10012",
            "+1 (555) 019-2837",
            "4242",
            "Meeting in Soho at 2:00 PM today",
            "password123"
        ))
        
        cursor.execute('''
            INSERT INTO user_profile (name, email, address, phone, card_last4, calendar_event, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            "Taylor Swift",
            "taylor.swift@music.com",
            "150 Franklin Street, Penthouse, Tribeca, New York, NY 10013",
            "+1 (555) 089-7389",
            "8888",
            "Rehearsal at Madison Square Garden at 6:00 PM today",
            "password456"
        ))
        
        # Seed initial order history
        initial_order_items = [
            {
                "product_id": 3,
                "name": "Tailored Wool Blazer",
                "price": 450.00,
                "quantity": 1,
                "color": "Charcoal",
                "size": "40R"
            },
            {
                "product_id": 4,
                "name": "Nappa Leather Boots",
                "price": 285.00,
                "quantity": 1,
                "color": "Black",
                "size": "10"
            }
        ]
        cursor.execute('''
            INSERT INTO orders (user_id, date, total, status, items, shipping_address, payment_method, pickup_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            1, # user_id = Alex
            "2026-06-05 14:30:00",
            797.48, # total after tax/shipping
            "Delivered",
            json.dumps(initial_order_items),
            "1248 Oakwood Avenue, Suite 402, San Francisco, CA 94107",
            "Visa ending in 4242",
            "QR_9XJ22B"
        ))
        
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()
