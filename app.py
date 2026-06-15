from flask import Flask, request, jsonify, render_template
import sqlite3
import json
import os
from datetime import datetime
from vector_search import ProductVectorSearch
from google import genai
from google.genai import types

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'aura_concierge.db')

# Auto-initialize SQLite database on import if it doesn't exist yet
if not os.path.exists(DB_PATH):
    print("[Database] Initializing database for the first time...")
    from database import init_db
    init_db()

# Instantiate searcher
searcher = ProductVectorSearch()

# -------------------------------------------------------------------
# Gemini AI Configuration
# -------------------------------------------------------------------
# Load API key: try .env file first, then environment variable
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
if os.path.exists(_env_path):
    with open(_env_path) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                os.environ.setdefault(_k.strip(), _v.strip())

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Create Gemini client (will be None if no key is set)
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"[Gemini] Failed to create client: {e}")

# In-memory conversation history per session (keyed by a simple counter for demo)
conversation_history = []

# System prompt that gives Gemini full context about the store
CONCIERGE_SYSTEM_PROMPT = """You are **Phoenix**, an elite AI retail concierge for **Aura** — a luxury premium fashion retailer. You are embedded inside the Aura mobile app, helping customers find perfect outfits, check inventory, style recommendations, reserve fitting rooms, and manage their shopping experience.

## Your Personality
- Warm, confident, and fashion-savvy
- You speak with the authority of a personal stylist at a premium boutique
- Use markdown formatting (bold, lists, emojis) to make replies visually rich
- Keep responses concise (2-4 short paragraphs max) — this is a mobile chat
- Be proactive: suggest next steps, offer to add items to bag, recommend pairings

## Store Product Catalog
Here is the current Aura catalog you can reference:

1. **Essential Wool Blazer** — $495.00 — Italian-woven, half-canvassed construction. Colors: Charcoal, Navy. Sizes: 38R-44R.
2. **Luxury Poplin Shirt** — $145.00 — Egyptian cotton, mother-of-pearl buttons. Colors: White, Sky Blue. Sizes: S-XL.
3. **Tech-Stretch Chinos** — $195.00 — 4-way stretch, nano-stain-resistant. Colors: Stone, Navy. Sizes: 30-36.
4. **Artisan Leather Chelsea Boots** — $385.00 — Italian calfskin, Goodyear welt. Colors: Cognac, Black. Sizes: 8-12.
5. **Premium Merino Polo** — $125.00 — Extra-fine 15.5μ merino, athletic fit. Colors: Forest Green, Burgundy, Slate. Sizes: S-XL.
6. **Silk Pocket Square** — $65.00 — Hand-rolled Italian silk. Colors: Burgundy, Navy, Champagne.
7. **Tailored Blazer** — $545.00 — Full-canvas construction, Bemberg lining. Colors: Navy, Dark Grey. Sizes: 38R-44R.
8. **Contemporary Cut-Out Dress** — $295.00 — Sculptural neckline, pencil skirt silhouette. Colors: Black, Ivory. Sizes: XS-L.
9. **Aura Silk Wrap Dress** — $345.00 — Charmeuse silk, side-tie waist. Colors: Emerald, Midnight. Sizes: XS-L.

## Store Locations & Inventory
- **Soho Flagship** — 0.8 miles away — full stock on most items
- **Upper East Side** — 2.3 miles — limited stock
- **Brooklyn Heights** — 3.1 miles — full stock

## Capabilities You Can Help With
- Product recommendations and outfit styling
- Checking live stock/inventory at nearby stores
- Smart fitting room reservations at Soho Flagship
- Checkout and delivery guidance
- Calendar-smart delivery recommendations
- AI virtual try-on guidance
- General fashion and styling advice

## Important Rules
- If asked something completely unrelated to fashion/shopping, politely redirect
- Always be helpful — if you don't know a product, suggest the closest match
- When recommending products, mention prices and key features
- For outfit combinations, explain WHY items pair well together
- You can answer general fashion questions (fabrics, care, styling tips)
"""

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/profile', methods=['GET', 'POST'])
def profile():
    conn = get_db_connection()
    user_id = request.args.get('user_id') or (request.get_json(silent=True) or {}).get('user_id')
    
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        address = data.get('address')
        phone = data.get('phone')
        name = data.get('name')
        email = data.get('email')
        
        if user_id:
            conn.execute('''
                UPDATE user_profile 
                SET address = COALESCE(?, address),
                    phone = COALESCE(?, phone),
                    name = COALESCE(?, name),
                    email = COALESCE(?, email)
                WHERE id = ?
            ''', (address, phone, name, email, user_id))
        else:
            conn.execute('''
                UPDATE user_profile 
                SET address = COALESCE(?, address),
                    phone = COALESCE(?, phone),
                    name = COALESCE(?, name),
                    email = COALESCE(?, email)
            ''', (address, phone, name, email))
        conn.commit()
        
    if user_id:
        user = conn.execute('SELECT * FROM user_profile WHERE id = ?', (user_id,)).fetchone()
    else:
        user = conn.execute('SELECT * FROM user_profile LIMIT 1').fetchone()
        
    if not user:
        conn.close()
        return jsonify({"error": "User not found"}), 404
        
    # Fetch orders
    user_dict = dict(user)
    orders_rows = conn.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC', (user_dict['id'],)).fetchall()
    orders = []
    for order in orders_rows:
        o = dict(order)
        o['items'] = json.loads(o['items'])
        orders.append(o)
        
    user_dict['orders'] = orders
    conn.close()
    return jsonify(user_dict)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM user_profile WHERE email = ? AND password = ?', (email, password)).fetchone()
    
    if not user:
        conn.close()
        return jsonify({"success": False, "message": "Invalid email or password."}), 401
        
    user_dict = dict(user)
    
    # Fetch orders
    orders_rows = conn.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC', (user_dict['id'],)).fetchall()
    orders = []
    for order in orders_rows:
        o = dict(order)
        o['items'] = json.loads(o['items'])
        orders.append(o)
        
    user_dict['orders'] = orders
    conn.close()
    
    return jsonify({
        "success": True,
        "user": user_dict
    })

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    
    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400
        
    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM user_profile WHERE email = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"success": False, "message": "Email is already registered."}), 400
        
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO user_profile (name, email, address, phone, card_last4, calendar_event, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        name,
        email,
        "",
        "",
        "9999",
        "No meetings scheduled today",
        password
    ))
    conn.commit()
    user_id = cursor.lastrowid
    
    # Retrieve newly created user
    user = conn.execute('SELECT * FROM user_profile WHERE id = ?', (user_id,)).fetchone()
    user_dict = dict(user)
    user_dict['orders'] = []
    conn.close()
    
    return jsonify({
        "success": True,
        "user": user_dict
    })

@app.route('/api/products')
def products():
    conn = get_db_connection()
    products_rows = conn.execute('SELECT * FROM products').fetchall()
    products_list = []
    for row in products_rows:
        p = dict(row)
        p['colors'] = json.loads(p['colors'])
        p['sizes'] = json.loads(p['sizes'])
        products_list.append(p)
    conn.close()
    return jsonify(products_list)

@app.route('/api/inventory/<int:product_id>')
def inventory(product_id):
    conn = get_db_connection()
    inv_rows = conn.execute('''
        SELECT store_name, quantity, distance_miles 
        FROM inventory 
        WHERE product_id = ?
    ''', (product_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in inv_rows])

@app.route('/api/chat', methods=['POST'])
def chat():
    global conversation_history
    data = request.json or {}
    message = data.get('message', '').strip()
    session_cart = data.get('cart', [])
    current_screen = data.get('screen', 'bag')
    
    if not message:
        return jsonify({"message": "I'm sorry, did you want to ask me something?", "action": "none"})
    
    msg_lower = message.lower()
    
    # ---- STRUCTURED INTENTS (kept for navigation actions) ----
    
    # Fit Analysis (internal command from try-on system)
    if msg_lower.startswith("analyze fit:"):
        if "model:" in msg_lower:
            try:
                parts = message.split("|")
                prod_name = parts[0].split(":")[1].strip()
                model_name = parts[1].split(":")[1].strip()
                score = int(parts[2].split(":")[1].strip())
                shoulders = int(parts[3].split(":")[1].strip())
                length = int(parts[4].split(":")[1].strip())
            except Exception as e:
                prod_name = "Selected Item"
                model_name = "Jordan (M)"
                score = 80
                shoulders = 80
                length = 80

            if score > 90:
                analysis = (
                    f"### 📏 Google AI Try-On Review: **{prod_name}** on **{model_name}**\n\n"
                    f"**Fit Diagnostic:** `{score}% Match` (Optimal Fit)\n\n"
                    f"**Analysis details:**\n"
                    f"- **Shoulder Drape:** `{shoulders}% Fit` (Sits flush on the clavicle bones)\n"
                    f"- **Hem Length:** `{length}% Fit` (Proper drape proportion relative to height)\n\n"
                    f"**Tailoring verdict:** Flawless! The garment naturally wraps the chest panel with zero fabric pulling. "
                    f"The sleeve cuffs terminate precisely at the wrist break. **This size is highly recommended.**"
                )
            else:
                recs = []
                if "taylor" in model_name.lower():
                    recs.append(
                        f"The garment is **oversized** for Taylor's slim proportions. "
                        f"The shoulders droop by 1.8 inches and sleeves ride past the knuckles.\n"
                        f"**Tailoring recommendation:** Recommend sizing down to a **Size 38R** (or Size XS) for a tailored modern fit."
                    )
                elif "jordan" in model_name.lower():
                    recs.append(
                        f"The garment is **slightly loose** on Jordan's regular proportions. "
                        f"Ideal for relaxed, casual layering, but lacks structured waist lines.\n"
                        f"**Tailoring recommendation:** Select a **Size 40R** for a crisp, professional drape."
                    )
                elif "morgan" in model_name.lower():
                    recs.append(
                        f"Fabric tension detected! The fabric is experiencing pulling under Morgan's athletic armpits.\n"
                        f"**Tailoring recommendation:** Recommend sizing up to a larger size to ease fabric strain."
                    )
                else: # Alex
                    recs.append(
                        f"The chest and back lines are experiencing significant fabric strain. "
                        f"The seam contours do not drape naturally over the silhouette.\n"
                        f"**Tailoring recommendation:** Size up to a **Size 44R** or **46L** (or Size XXL) to ensure comfort and ease of movement."
                    )
                
                recs_md = "\n".join([f"- {r}" for r in recs])
                analysis = (
                    f"### 📏 Google AI Try-On Review: **{prod_name}** on **{model_name}**\n\n"
                    f"**Fit Diagnostic:** `{score}% Match` (Tailoring Required)\n\n"
                    f"**Analysis details:**\n"
                    f"- **Shoulder Alignment:** `{shoulders}% Fit`\n"
                    f"- **Hem Length:** `{length}% Fit`\n\n"
                    f"**Generative Fabric Simulation Insights:**\n"
                    f"{recs_md}\n\n"
                    f"Please try switching to another model body type or sizing option to find your optimal silhouette drape!"
                )
            
            return jsonify({
                "message": analysis,
                "action": "none",
                "screen": current_screen,
                "products": [],
                "inventory": []
            })
            
        try:
            parts = message.split("|")
            prod_name = parts[0].split(":")[1].strip()
            score = int(parts[1].split(":")[1].strip())
            shoulders = int(parts[2].split(":")[1].strip())
            length = int(parts[3].split(":")[1].strip())
            scale = float(parts[4].split(":")[1].strip())
            target_scale = float(parts[5].split(":")[1].strip())
            offset_x = int(parts[6].split(":")[1].strip())
            offset_y = int(parts[7].split(":")[1].strip())
            target_y = int(parts[8].split(":")[1].strip())
        except Exception as e:
            prod_name = "Selected Item"
            score = 80
            shoulders = 80
            length = 80
            scale = 1.0
            target_scale = 1.05
            offset_x = 0
            offset_y = 0
            target_y = 20

        if score > 90:
            analysis = (
                f"### 📏 Aura Fit Review: **{prod_name}**\n\n"
                f"**Overall Fit Rating:** `{score}% Match` (Optimal Fit)\n\n"
                f"**Analysis Details:**\n"
                f"- **Shoulder Alignment:** `{shoulders}% Fit` (Aligned with your silhouette)\n"
                f"- **Garment Length:** `{length}% Fit` (Proper drape and proportion)\n\n"
                f"**Verdict:** The current scale ({scale:.2f}x) and positioning are excellent. "
                f"The shoulders sit flush and the sleeves align at the wrist. "
                f"**No size alterations or calibration adjustment needed.** This size is ready to order!"
            )
        else:
            recs = []
            scale_diff = scale - target_scale
            if scale_diff > 0.1:
                recs.append(
                    f"The garment appears **oversized** (scale `{scale:.2f}x` exceeds the model benchmark `{target_scale}x`). "
                    f"This causes shoulder droop and excess fabric bunching.\n"
                    f"**Tailoring tip:** Size down (e.g. try a Size 38R instead of 40R, or S instead of M)."
                )
            elif scale_diff < -0.1:
                recs.append(
                    f"The garment appears **undersized** (scale `{scale:.2f}x` is below the model benchmark `{target_scale}x`). "
                    f"This will cause tight shoulders and sleeves riding up.\n"
                    f"**Tailoring tip:** Size up (e.g. try a Size 42L instead of 40R, or L instead of M)."
                )
            else:
                recs.append(
                    f"The garment scale (`{scale:.2f}x`) is within the recommended threshold, but placement coordinates need adjustments."
                )

            x_diff = abs(offset_x)
            y_diff = abs(offset_y - target_y)
            
            if x_diff > 15:
                recs.append(
                    f"The overlay is shifted horizontally by `{offset_x}px` off-center. "
                    f"Please center the garment overlay on your torso for an accurate fit assessment."
                )
            if y_diff > 25:
                recs.append(
                    f"The overlay vertical alignment is off by `{offset_y - target_y}px`. "
                    f"Align the collar flush with the base of your neck."
                )

            recs_md = "\n".join([f"- {r}" for r in recs])
            analysis = (
                f"### 📏 Aura Fit Review: **{prod_name}**\n\n"
                f"**Overall Fit Rating:** `{score}% Match` (Needs Adjustments)\n\n"
                f"**Analysis Details:**\n"
                f"- **Shoulder Alignment:** `{shoulders}% Fit`\n"
                f"- **Garment Length:** `{length}% Fit`\n\n"
                f"**Tailoring Insights & Corrections:**\n"
                f"{recs_md}\n\n"
                f"Please adjust the drag position or use the **[ + ]** / **[ - ]** controls to scale the item to your silhouette, then re-submit for review."
            )

        return jsonify({
            "message": analysis,
            "action": "none",
            "screen": current_screen,
            "products": [],
            "inventory": []
        })
    
    # ---- DETECT NAVIGATION INTENTS (for UI actions) ----
    response = {
        "message": "",
        "action": "none",
        "screen": current_screen,
        "products": [],
        "inventory": []
    }

    # Stock / Inventory Check Intent
    stock_keywords = ["stock", "inventory", "available", "have", "polo", "nearby", "store", "size", "merino", "chinos", "boots"]
    is_stock_intent = any(kw in msg_lower for kw in stock_keywords) and ("stock" in msg_lower or "avail" in msg_lower or "where" in msg_lower or "near" in msg_lower)

    # Fitting Room try-on Intent
    fitting_keywords = ["fitting", "room", "reserve", "book", "try", "slot", "fitting room", "appointment"]
    is_fitting_intent = any(kw in msg_lower for kw in fitting_keywords)

    # Checkout Intent
    checkout_keywords = ["checkout", "check out", "pay", "order", "buy", "purchase", "shipping"]
    is_checkout_intent = any(kw in msg_lower for kw in checkout_keywords) and not is_fitting_intent

    conn = get_db_connection()
    
    # Set action flags for navigation
    if is_stock_intent:
        prod_results = searcher.search(message, limit=1)
        if prod_results and prod_results[0][1] > 0.1:
            product = prod_results[0][0]
        else:
            product = dict(conn.execute('SELECT * FROM products WHERE id = 5').fetchone())
            
        product_id = product['id']
        inv_data = conn.execute('''
            SELECT store_name, quantity, distance_miles 
            FROM inventory 
            WHERE product_id = ?
        ''', (product_id,)).fetchall()
        
        inv_list = [dict(r) for r in inv_data]
        response["action"] = "show_stock"
        response["screen"] = "map"
        response["products"] = [product_id]
        response["inventory"] = inv_list
    elif is_fitting_intent:
        response["action"] = "navigate_fitting_room"
        response["screen"] = "fitting_room"
        response["products"] = [5, 6]
    elif is_checkout_intent:
        response["action"] = "navigate_checkout"
        response["screen"] = "delivery"

    # ---- GEMINI AI RESPONSE ----
    # Build context about what products match the query
    search_results = searcher.search(message, limit=3)
    matching_products = [prod for prod, score in search_results if score > 0.05]
    
    product_context = ""
    if matching_products:
        product_context = "\n\n[SYSTEM: The following products matched the user's query via semantic search. Reference them naturally in your response:]\n"
        for p in matching_products:
            product_context += f"- {p['name']} (${p['price']:.2f}) — {p['description']}\n"
        response["products"] = [p['id'] for p in matching_products]
        if not is_stock_intent and not is_fitting_intent and not is_checkout_intent:
            response["action"] = "recommend_products"

    # Add cart context
    cart_context = ""
    if session_cart:
        cart_context = f"\n\n[SYSTEM: The user currently has {len(session_cart)} item(s) in their shopping bag.]"

    # Calendar context
    user = conn.execute('SELECT calendar_event FROM user_profile LIMIT 1').fetchone()
    calendar_context = ""
    if user and user['calendar_event']:
        calendar_context = f"\n\n[SYSTEM: The user has an upcoming event: {user['calendar_event']}. Use this to personalize recommendations if relevant.]"

    conn.close()

    # Build the full user message with context
    enriched_message = message + product_context + cart_context + calendar_context

    # Add to conversation history
    conversation_history.append({"role": "user", "content": enriched_message})
    
    # Keep history manageable (last 20 messages)
    if len(conversation_history) > 20:
        conversation_history = conversation_history[-20:]

    # Call Gemini API
    if gemini_client:
        try:
            # Build contents for Gemini
            contents = []
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "model"
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                ))

            models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            gemini_response = None
            last_error = None
            
            for m_name in models_to_try:
                try:
                    gemini_response = gemini_client.models.generate_content(
                        model=m_name,
                        contents=contents,
                        config=types.GenerateContentConfig(
                            system_instruction=CONCIERGE_SYSTEM_PROMPT,
                            temperature=0.8,
                            max_output_tokens=500,
                        )
                    )
                    break
                except Exception as ex:
                    last_error = ex
                    print(f"[Gemini] Failed with {m_name}: {ex}")
                    continue
            
            if gemini_response is None:
                raise last_error

            
            ai_text = gemini_response.text.strip()
            
            # Add assistant response to history
            conversation_history.append({"role": "assistant", "content": ai_text})
            
            response["message"] = ai_text
        except Exception as e:
            error_str = str(e)
            print(f"[Gemini] API call error: {error_str}")
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                response["message"] = "🔥 Phoenix is momentarily cooling down (rate limit reached). Please wait a few seconds and try again — I'll be right back! ⏳"
            else:
                response["message"] = "I'm experiencing a brief connection issue. Let me try again — could you repeat your question? 🔄"
    else:
        # Fallback when no API key is configured
        response["message"] = ("⚠️ **Gemini AI is not configured yet.** Please add your API key to the `.env` file:\n\n"
                              "`GEMINI_API_KEY=your_key_here`\n\n"
                              "Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)")

    return jsonify(response)

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json or {}
    items = data.get('items', [])
    total = data.get('total', 0.0)
    shipping_address = data.get('shipping_address', '72 Greene Street, Apt 4B, Soho, New York, NY 10012')
    payment_method = data.get('payment_method', 'Apple Pay')
    delivery_speed = data.get('delivery_speed', 'In-Store Pickup')
    
    # Generate random auth/pickup code
    import random
    pickup_code = f"QR_{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    user_id = data.get('user_id')
    
    # Decrement inventory if pickup/order is placed
    for item in items:
        prod_id = item.get('product_id')
        qty = item.get('quantity', 1)
        store = "Soho Flagship" if "Pickup" in delivery_speed else None
        
        if store:
            cursor.execute('''
                UPDATE inventory 
                SET quantity = MAX(0, quantity - ?) 
                WHERE product_id = ? AND store_name = ?
            ''', (qty, prod_id, store))
        else:
            # Decrement generic stock
            cursor.execute('''
                UPDATE products 
                SET stock_level = MAX(0, stock_level - ?) 
                WHERE id = ?
            ''', (qty, prod_id))
            
    # Save order
    order_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        INSERT INTO orders (user_id, date, total, status, items, shipping_address, payment_method, pickup_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        order_date,
        total,
        "Ready for Pickup" if "Pickup" in delivery_speed else "Processing",
        json.dumps(items),
        shipping_address,
        payment_method,
        pickup_code
    ))
    
    conn.commit()
    conn.close()
    
    # Reload searcher in case stock limits changed tags or something (though searcher uses static details)
    searcher.load_products()
    
    return jsonify({
        "success": True,
        "order_id": cursor.lastrowid,
        "pickup_code": pickup_code,
        "date": order_date
    })

@app.route('/api/reserve', methods=['POST'])
def reserve():
    data = request.json or {}
    store = data.get('store', 'Soho Flagship')
    date = data.get('date', '')
    time = data.get('time', '')
    items = data.get('items', [])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reservations (store_name, reservation_date, reservation_time, items)
        VALUES (?, ?, ?, ?)
    ''', (
        store,
        date,
        time,
        json.dumps(items)
    ))
    conn.commit()
    conn.close()
    
    return jsonify({
        "success": True,
        "reservation_id": cursor.lastrowid
    })

if __name__ == '__main__':
    # Initialize DB first
    from database import init_db
    init_db()
    
    app.run(debug=True, port=5000)
