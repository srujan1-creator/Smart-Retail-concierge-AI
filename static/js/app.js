// AURA CONCIERGE APPLICATION STATE
const state = {
    user: {
        name: "Alex Sterling",
        email: "alex.sterling@design.co",
        address: "72 Greene Street, Apt 4B, Soho, New York, NY 10012",
        phone: "+1 (555) 019-2837",
        card_last4: "4242",
        calendar_event: "Meeting in Soho at 2:00 PM today"
    },
    cart: [
        {
            product_id: 1,
            name: "Essential Wool Blazer",
            price: 495.00,
            image_url: "/static/images/products/wool_blazer.png",
            color: "Navy",
            size: "42L",
            quantity: 1
        },
        {
            product_id: 2,
            name: "Luxury Poplin Shirt",
            price: 145.00,
            image_url: "/static/images/products/poplin_shirt.png",
            color: "White",
            size: "M",
            quantity: 1
        }
    ],
    fittingRoom: [
        {
            product_id: 5,
            name: "Premium Merino Polo",
            price: 125.00,
            image_url: "/static/images/products/merino_polo.png",
            color: "Midnight Blue",
            size: "L"
        },
        {
            product_id: 6,
            name: "Tech-Stretch Chinos",
            price: 145.00,
            image_url: "/static/images/products/tech_chinos.png",
            color: "Desert Sand",
            size: "34"
        }
    ],
    products: [], // Loaded from API
    currentScreen: "bag",
    promoCode: "",
    promoDiscount: 0, // fraction (0.20 for 20% off)
    deliveryMethod: "home", // home or pickup
    deliverySpeed: "standard", // standard or express
    paymentMethod: "visa", // visa or apple
    reservation: {
        store: "Soho Flagship",
        date: "Oct 24",
        time: "12:30 PM",
        addedPocketSquare: false
    },
    orderReceipt: null,
    arStream: null,
    arActiveProduct: 1, // Default Essential Wool Blazer
    arScale: 1.05,
    arCameraMode: "user",
    arMode: "webcam", // webcam or ai_tryon
    arSelectedModel: "m", // s, m, l, xl
    loggedIn: true
};

// DOM ELEMENTS
const DOM = {
    chatMessages: document.getElementById("chat-messages"),
    chatForm: document.getElementById("chat-form"),
    chatInput: document.getElementById("chat-input"),
    cartItemsList: document.getElementById("cart-items"),
    subtotal: document.getElementById("summary-subtotal"),
    shipping: document.getElementById("summary-shipping"),
    tax: document.getElementById("summary-tax"),
    total: document.getElementById("summary-total"),
    bagCountBadges: document.querySelectorAll(".bag-count"),
    promoInput: document.getElementById("promo-input"),
    promoApplyBtn: document.getElementById("promo-apply-btn"),
    btnProceedCheckout: document.getElementById("btn-proceed-checkout"),
    
    // Shipping screen
    btnDeliveryContinue: document.getElementById("btn-delivery-continue"),
    deliveryHome: document.getElementById("delivery-home"),
    deliveryPickup: document.getElementById("delivery-pickup"),
    speedStandard: document.getElementById("speed-standard"),
    speedExpress: document.getElementById("speed-express"),
    deliveryInsightCard: document.getElementById("delivery-insight-card"),
    selectPickupInsight: document.getElementById("select-pickup-insight"),
    
    // Payment screen
    btnPaymentContinue: document.getElementById("btn-payment-continue"),
    paymentVisa: document.getElementById("payment-visa"),
    paymentApple: document.getElementById("payment-apple"),
    paymentTotalValue: document.getElementById("payment-total-value"),
    
    // Review screen
    btnPlaceOrder: document.getElementById("btn-place-order"),
    reviewItemsContainer: document.getElementById("review-items-container"),
    reviewSubtotal: document.getElementById("review-subtotal"),
    reviewShipping: document.getElementById("review-shipping"),
    reviewTax: document.getElementById("review-tax"),
    reviewTotal: document.getElementById("review-total"),
    reviewShippingTitle: document.getElementById("review-shipping-title"),
    reviewShippingAddress: document.getElementById("review-shipping-address"),
    reviewPaymentTitle: document.getElementById("review-payment-title"),
    reviewItemsCount: document.getElementById("review-items-count"),
    
    // Fitting room screen
    fittingItemsContainer: document.getElementById("fitting-items-container"),
    fittingItemsHeader: document.getElementById("fitting-items-count-header"),
    btnConfirmReservation: document.getElementById("btn-confirm-reservation"),
    dateToday: document.getElementById("date-today"),
    dateTomorrow: document.getElementById("date-tomorrow"),
    timeSlots: document.querySelectorAll(".slot-btn"),
    btnApplyRec: document.getElementById("btn-add-rec"),
    stylistCard: document.getElementById("stylist-card"),
    
    // Map screen
    checkingItemImg: document.getElementById("checking-item-img"),
    checkingItemName: document.getElementById("checking-item-name"),
    mapStoreTitle: document.getElementById("map-store-title"),
    mapStoreDistance: document.getElementById("map-store-distance"),
    mapStoreStock: document.getElementById("map-store-stock"),
    mapStoreBadge: document.getElementById("map-store-badge"),
    mapBtnDirections: document.getElementById("map-btn-directions"),
    mapBtnReserve: document.getElementById("map-btn-reserve"),
    pinSoho: document.getElementById("pin-soho"),
    pinChelsea: document.getElementById("pin-chelsea"),
    pinBrooklyn: document.getElementById("pin-brooklyn"),
    
    // Receipt screen
    receiptItemsContainer: document.getElementById("receipt-items-container"),
    receiptSubtotal: document.getElementById("receipt-subtotal"),
    receiptTax: document.getElementById("receipt-tax"),
    receiptTotal: document.getElementById("receipt-total"),
    receiptPickupStore: document.getElementById("receipt-pickup-store"),
    receiptStoreBold: document.getElementById("receipt-store-bold"),
    receiptPmVal: document.getElementById("receipt-pm-val"),
    receiptAuthCode: document.getElementById("receipt-auth-code"),
    btnAddWallet: document.getElementById("btn-add-wallet"),
    walletOverlay: document.getElementById("wallet-pass-card"),
    closeWalletBtn: document.getElementById("close-wallet"),
    walletCodeVal: document.getElementById("wallet-code-val"),
    
    // Global resets / chips
    resetSession: document.getElementById("reset-session"),
    navItems: document.querySelectorAll(".phone-bottom-nav .nav-item"),
    suggestionChips: document.querySelectorAll(".suggestion-chip"),
    
    // Drawer elements
    drawerOverlay: document.getElementById("phone-drawer-overlay"),
    drawer: document.getElementById("phone-drawer"),
    btnCloseDrawer: document.getElementById("btn-close-drawer"),
    drawerItems: document.querySelectorAll(".drawer-item"),
    menuBtns: document.querySelectorAll(".menu-btn"),
    
    // AR Fitting room elements
    webcamFeed: document.getElementById("webcam-feed"),
    webcamFallback: document.getElementById("webcam-fallback"),
    arOverlayWrapper: document.getElementById("ar-overlay-wrapper"),
    arOverlayImg: document.getElementById("ar-clothing-overlay-img"),
    arProductSelector: document.getElementById("ar-product-selector"),
    btnCameraShutter: document.getElementById("btn-camera-shutter"),
    btnCameraToggle: document.getElementById("btn-camera-toggle"),
    cameraFlash: document.getElementById("camera-flash"),
    snapshotToast: document.getElementById("snapshot-toast"),
    snapThumbImg: document.getElementById("snap-thumb-img"),
    btnArScaleUp: document.getElementById("btn-ar-scale-up"),
    btnArScaleDown: document.getElementById("btn-ar-scale-down"),
    btnArReset: document.getElementById("btn-ar-reset"),
    btnCloseAr: document.getElementById("btn-close-ar"),
    arFitScore: document.getElementById("ar-fit-score"),
    meterShoulders: document.getElementById("meter-shoulders"),
    meterLength: document.getElementById("meter-length"),
    arFitVerdict: document.getElementById("ar-fit-verdict"),
    btnArAiReview: document.getElementById("btn-ar-ai-review"),
    
    // AI tryon DOM selectors
    tabArWebcam: document.getElementById("tab-ar-webcam"),
    tabArGoogle: document.getElementById("tab-ar-google"),
    aiTryonViewport: document.getElementById("ai-tryon-viewport"),
    aiTryonModelImg: document.getElementById("ai-tryon-model-img"),
    aiTryonLoader: document.getElementById("ai-tryon-loader"),
    aiDrapeProgress: document.getElementById("ai-drape-progress"),
    aiDrapePct: document.getElementById("ai-drape-pct"),
    aiLoaderStatus: document.getElementById("ai-loader-status"),
    aiModelSelectorBlock: document.getElementById("ai-model-selector-block"),
    aiModelList: document.getElementById("ai-model-list"),
    btnCheckoutHelp: document.getElementById("btn-checkout-help")
};

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    fetchProfile();
    setupEventListeners();
    updateCartUI();
});

// GET CATALOG PRODUCTS
async function fetchProducts() {
    try {
        const res = await fetch("/api/products");
        state.products = await res.json();
        preProcessTransparentImages();
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

// GET USER PROFILE
async function fetchProfile() {
    if (!state.loggedIn) return;
    try {
        const url = state.user && state.user.id ? `/api/profile?user_id=${state.user.id}` : "/api/profile";
        const res = await fetch(url);
        const profileData = await res.json();
        state.user = profileData;
        
        // Update static layout bindings
        const uProfileName = document.getElementById("user-profile-name");
        if (uProfileName && profileData && profileData.name) {
            uProfileName.innerText = profileData.name;
        }
        const uProfileAddress = document.getElementById("user-profile-address");
        if (uProfileAddress && profileData && profileData.address) {
            uProfileAddress.innerHTML = profileData.address.replace(/, /g, "<br>");
        }
        
        // Update drawer profile details dynamically
        const drawerName = document.querySelector(".drawer-profile-name");
        if (drawerName && profileData && profileData.name) {
            drawerName.innerText = profileData.name;
        }
        const drawerEmail = document.querySelector(".drawer-profile-email");
        if (drawerEmail && profileData && profileData.email) {
            drawerEmail.innerText = profileData.email;
        }
        const drawerAvatar = document.querySelector(".drawer-avatar");
        if (drawerAvatar && profileData && profileData.name) {
            const initials = profileData.name.split(" ").map(n => n[0]).join("");
            drawerAvatar.innerText = initials;
            drawerAvatar.style.background = "var(--color-primary-light)";
            drawerAvatar.style.color = "var(--color-primary)";
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
    }
}

// SCREEN ROUTING
function showScreen(screenId) {
    const screens = document.querySelectorAll(".app-screen");
    screens.forEach(s => s.classList.remove("active-screen"));
    
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add("active-screen");
        state.currentScreen = screenId;
    }
    
    // Sync navigation bar highlight
    DOM.navItems.forEach(nav => {
        nav.classList.remove("active-nav");
        if (nav.dataset.screen === screenId) {
            nav.classList.add("active-nav");
        }
    });

    // Sync drawer active item
    if (DOM.drawerItems) {
        DOM.drawerItems.forEach(item => {
            item.classList.remove("active");
            if (item.dataset.target === screenId) {
                item.classList.add("active");
            }
        });
    }

    // Stop camera if leaving virtual-fit screen
    if (state.currentScreen === "virtual-fit" && screenId !== "virtual-fit") {
        stopARCamera();
    }

    // Run custom screen triggers
    if (screenId === "delivery") {
        updateDeliveryInsights();
    } else if (screenId === "review") {
        renderReviewOrder();
    } else if (screenId === "fitting-room") {
        renderFittingRoom();
    } else if (screenId === "receipt") {
        renderDigitalReceipt();
    } else if (screenId === "virtual-fit") {
        if (state.arMode === "ai_tryon") {
            stopARCamera();
            runAIDrapeSimulation();
        } else {
            startARCamera();
        }
    }
}

// UPDATE CART CALCULATIONS
function updateCartUI() {
    if (DOM.cartItemsList) {
        DOM.cartItemsList.innerHTML = "";
    }
    
    let subtotal = 0;
    let totalQty = 0;
    
    state.cart.forEach(item => {
        subtotal += item.price * item.quantity;
        totalQty += item.quantity;
        
        const card = document.createElement("div");
        card.className = "cart-item";
        card.innerHTML = `
            <div class="cart-item-img-container">
                <img src="${item.image_url}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div>
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-meta">
                        <span class="meta-pill">${item.color}</span>
                        <span class="meta-pill">Size ${item.size}</span>
                        <button class="ar-tryon-btn-cart" data-id="${item.product_id}" style="background:transparent;border:none;color:var(--color-primary);font-weight:700;cursor:pointer;text-decoration:underline;padding:0;font-size:10.5px;margin-left:6px;">📷 AR fit</button>
                    </p>
                </div>
                <div class="cart-item-bottom">
                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <div class="qty-control">
                        <button class="qty-btn minus" data-id="${item.product_id}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.product_id}">+</button>
                    </div>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.product_id}">×</button>
        `;
        
        DOM.cartItemsList.appendChild(card);
    });
    
    // Quantities badges
    DOM.bagCountBadges.forEach(b => b.innerText = totalQty);
    
    // Totals calculations
    const finalSub = subtotal * (1 - state.promoDiscount);
    let shippingVal = 0;
    if (state.deliveryMethod === "home" && state.deliverySpeed === "express") {
        shippingVal = 15.00;
    }
    const taxVal = finalSub * 0.08;
    const finalTotal = finalSub + shippingVal + taxVal;
    
    DOM.subtotal.innerText = `$${subtotal.toFixed(2)}`;
    if (state.promoDiscount > 0) {
        DOM.subtotal.innerHTML = `<span style="text-decoration:line-through; color:#8A98A8; font-size:12px; margin-right:6px">$${subtotal.toFixed(2)}</span> $${finalSub.toFixed(2)}`;
    }
    
    DOM.shipping.innerText = shippingVal === 0 ? "Free" : `$${shippingVal.toFixed(2)}`;
    DOM.shipping.className = shippingVal === 0 ? "free-badge" : "";
    DOM.tax.innerText = `$${taxVal.toFixed(2)}`;
    DOM.total.innerText = `$${finalTotal.toFixed(2)}`;
    
    DOM.paymentTotalValue.innerText = `$${finalTotal.toFixed(2)}`;
}

// SETUP LISTENERS
function setupEventListeners() {
    // Global back button navigation mapping
    document.querySelectorAll(".back-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const currentScreen = state.currentScreen;
            if (currentScreen === "delivery") {
                showScreen("bag");
            } else if (currentScreen === "payment") {
                showScreen("delivery");
            } else if (currentScreen === "review") {
                showScreen("payment");
            } else if (currentScreen === "map") {
                showScreen("bag");
            } else if (currentScreen === "fitting-room") {
                showScreen("bag");
            } else if (currentScreen === "receipt") {
                showScreen("bag");
            } else if (currentScreen === "virtual-fit") {
                showScreen("bag");
            } else {
                showScreen("bag");
            }
        });
    });

    // Reset assistant & session
    DOM.resetSession.addEventListener("click", () => {
        state.cart = [
            {
                product_id: 1,
                name: "Essential Wool Blazer",
                price: 495.00,
                image_url: "/static/images/products/wool_blazer.png",
                color: "Navy",
                size: "42L",
                quantity: 1
            },
            {
                product_id: 2,
                name: "Luxury Poplin Shirt",
                price: 145.00,
                image_url: "/static/images/products/poplin_shirt.png",
                color: "White",
                size: "M",
                quantity: 1
            }
        ];
        state.promoCode = "";
        state.promoDiscount = 0;
        state.deliveryMethod = "home";
        state.deliverySpeed = "standard";
        state.paymentMethod = "visa";
        state.orderReceipt = null;
        DOM.promoInput.value = "";
        
        DOM.chatMessages.innerHTML = `
            <div class="message assistant-message">
                <div class="message-content">
                    Profile resets complete. I've reloaded your bag. How can I help you styling today?
                </div>
                <span class="message-time">Just now</span>
            </div>
        `;
        
        // reset tabs toggles
        DOM.deliveryHome.classList.add("active");
        DOM.deliveryPickup.classList.remove("active");
        DOM.deliveryHome.querySelector(".delivery-radio-btn").classList.add("checked");
        DOM.deliveryPickup.querySelector(".delivery-radio-btn").classList.remove("checked");
        
        DOM.paymentVisa.classList.add("active");
        DOM.paymentApple.classList.remove("active");
        DOM.paymentVisa.querySelector(".payment-radio").classList.add("checked");
        DOM.paymentApple.querySelector(".payment-radio").classList.remove("checked");
        
        updateCartUI();
        showScreen("bag");
    });

    // Chat submit
    DOM.chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        sendMessage();
    });

    // Sug chips
    DOM.suggestionChips.forEach(chip => {
        chip.addEventListener("click", () => {
            DOM.chatInput.value = chip.dataset.query;
            sendMessage();
        });
    });

    // Phone navigation menu buttons
    DOM.navItems.forEach(nav => {
        nav.addEventListener("click", () => {
            showScreen(nav.dataset.screen);
        });
    });

    // Bag icon click to navigate to bag screen
    document.querySelectorAll(".bag-icon-wrapper").forEach(wrapper => {
        wrapper.addEventListener("click", () => {
            showScreen("bag");
        });
    });

    // Cart Interactions (quantity / remove)
    DOM.cartItemsList.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        if (isNaN(id)) return;
        
        const item = state.cart.find(c => c.product_id === id);
        if (e.target.classList.contains("plus")) {
            item.quantity++;
            updateCartUI();
        } else if (e.target.classList.contains("minus")) {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                state.cart = state.cart.filter(c => c.product_id !== id);
            }
            updateCartUI();
        } else if (e.target.classList.contains("cart-item-remove")) {
            state.cart = state.cart.filter(c => c.product_id !== id);
            updateCartUI();
        } else if (e.target.classList.contains("ar-tryon-btn-cart")) {
            state.arActiveProduct = id;
            showScreen("virtual-fit");
        }
    });

    // Tip link / upsell add
    document.getElementById("add-tip-item").addEventListener("click", () => {
        addItemToCart(7); // Pocket Square
    });

    // Promo Apply
    DOM.promoApplyBtn.addEventListener("click", () => {
        const val = DOM.promoInput.value.trim().toUpperCase();
        if (val === "AURA20") {
            state.promoDiscount = 0.20;
            state.promoCode = "AURA20";
            addAssistantMessage("Applied **AURA20**! You just saved 20% off your wardrobe catalog selection.");
            updateCartUI();
        } else {
            addAssistantMessage("Hmm, that promo code doesn't look valid. Try typing **AURA20** for a concierge discount.");
        }
    });

    // Shopping bag Proceed
    DOM.btnProceedCheckout.addEventListener("click", () => {
        if (!state.loggedIn) {
            showScreen("receipt");
            addAssistantMessage("Please **Sign In** to your Aura profile to proceed with checkout.");
            return;
        }
        showScreen("delivery");
    });

    // Delivery settings toggles
    DOM.deliveryHome.addEventListener("click", () => {
        state.deliveryMethod = "home";
        DOM.deliveryHome.classList.add("active");
        DOM.deliveryPickup.classList.remove("active");
        DOM.deliveryHome.querySelector(".delivery-radio-btn").classList.add("checked");
        DOM.deliveryPickup.querySelector(".delivery-radio-btn").classList.remove("checked");
        updateCartUI();
    });

    DOM.deliveryPickup.addEventListener("click", () => {
        state.deliveryMethod = "pickup";
        DOM.deliveryPickup.classList.add("active");
        DOM.deliveryHome.classList.remove("active");
        DOM.deliveryPickup.querySelector(".delivery-radio-btn").classList.add("checked");
        DOM.deliveryHome.querySelector(".delivery-radio-btn").classList.remove("checked");
        updateCartUI();
    });

    DOM.selectPickupInsight.addEventListener("click", () => {
        state.deliveryMethod = "pickup";
        DOM.deliveryPickup.classList.add("active");
        DOM.deliveryHome.classList.remove("active");
        DOM.deliveryPickup.querySelector(".delivery-radio-btn").classList.add("checked");
        DOM.deliveryHome.querySelector(".delivery-radio-btn").classList.remove("checked");
        updateCartUI();
        addAssistantMessage("Switched you to **In-Store Pickup** at the Soho Flagship store.");
    });

    DOM.speedStandard.addEventListener("click", () => {
        state.deliverySpeed = "standard";
        DOM.speedStandard.classList.add("active");
        DOM.speedExpress.classList.remove("active");
        updateCartUI();
    });

    DOM.speedExpress.addEventListener("click", () => {
        state.deliverySpeed = "express";
        DOM.speedExpress.classList.add("active");
        DOM.speedStandard.classList.remove("active");
        updateCartUI();
    });

    DOM.btnDeliveryContinue.addEventListener("click", () => {
        showScreen("payment");
    });

    // Address Edit Interactions
    const btnEditAddress = document.getElementById("btn-edit-shipping-address");
    const addressDisplayBox = document.getElementById("address-display-box");
    const addressEditBox = document.getElementById("address-edit-box");
    const inputEditAddress = document.getElementById("input-edit-address");
    const btnCancelAddressEdit = document.getElementById("btn-cancel-address-edit");
    const btnSaveAddressEdit = document.getElementById("btn-save-address-edit");

    if (btnEditAddress && addressDisplayBox && addressEditBox && inputEditAddress) {
        btnEditAddress.addEventListener("click", () => {
            inputEditAddress.value = state.user ? (state.user.address || "") : "";
            addressDisplayBox.style.display = "none";
            addressEditBox.style.display = "block";
        });
    }

    if (btnCancelAddressEdit && addressDisplayBox && addressEditBox) {
        btnCancelAddressEdit.addEventListener("click", () => {
            addressEditBox.style.display = "none";
            addressDisplayBox.style.display = "block";
        });
    }

    if (btnSaveAddressEdit && addressDisplayBox && addressEditBox && inputEditAddress) {
        btnSaveAddressEdit.addEventListener("click", async () => {
            const newAddress = inputEditAddress.value.trim();
            if (!newAddress) return;
            
            if (state.user) {
                state.user.address = newAddress;
            }
            
            // Update display UI on Shipping screen
            const displayEl = document.getElementById("user-profile-address");
            if (displayEl) {
                displayEl.innerHTML = newAddress.replace(/, /g, "<br>");
            }
            
            // Hide edit box, show display
            addressEditBox.style.display = "none";
            addressDisplayBox.style.display = "block";
            
            // Update db via POST
            try {
                await fetch("/api/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ address: newAddress })
                });
            } catch (err) {
                console.error("Error saving address:", err);
            }
            
            // Re-render receipt / profile screens to reflect the change
            renderDigitalReceipt();
        });
    }

    // Profile Login / Logout event listeners
    const btnLogout = document.getElementById("btn-profile-logout");
    const btnLogin = document.getElementById("btn-profile-login");
    
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            state.loggedIn = false;
            renderDigitalReceipt();
            addAssistantMessage("You have been signed out. Please **Sign In** to your Aura profile to sync your wardrobe concierge details.");
        });
    }
    
    if (btnLogin) {
        btnLogin.addEventListener("click", async () => {
            const emailInput = document.getElementById("login-email");
            const passwordInput = document.getElementById("login-password");
            const emailVal = emailInput ? emailInput.value.trim() : "";
            const passwordVal = passwordInput ? passwordInput.value : "";
            
            if (!emailVal || !passwordVal) {
                addAssistantMessage("Please enter both your email address and password to sign in.");
                return;
            }
            
            try {
                const res = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailVal, password: passwordVal })
                });
                
                const data = await res.json();
                if (data.success) {
                    state.loggedIn = true;
                    state.user = data.user;
                    
                    // Force refresh profile visual bindings
                    await fetchProfile(); 
                    renderDigitalReceipt();
                    
                    addAssistantMessage(`Welcome back, **${data.user.name}**! I've loaded your profile details, synced your database records, and loaded your past order history.`);
                } else {
                    addAssistantMessage(`Login failed: **${data.message || "Invalid credentials."}**`);
                }
            } catch (err) {
                console.error("Error logging in:", err);
                addAssistantMessage("An error occurred during authentication. Please check your credentials and try again.");
            }
        });
    }

    // Auth Tab switching (Sign In / Sign Up)
    const tabAuthLogin = document.getElementById("tab-auth-login");
    const tabAuthRegister = document.getElementById("tab-auth-register");
    const authLoginForm = document.getElementById("auth-login-form-container");
    const authRegisterForm = document.getElementById("auth-register-form-container");
    const linkGoRegister = document.getElementById("link-go-register");
    const linkGoLogin = document.getElementById("link-go-login");

    function showLoginTab() {
        if (tabAuthLogin) {
            tabAuthLogin.style.background = "white";
            tabAuthLogin.style.color = "var(--color-text-dark)";
            tabAuthLogin.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
            tabAuthLogin.style.fontWeight = "700";
        }
        if (tabAuthRegister) {
            tabAuthRegister.style.background = "transparent";
            tabAuthRegister.style.color = "var(--color-text-muted)";
            tabAuthRegister.style.boxShadow = "none";
            tabAuthRegister.style.fontWeight = "600";
        }
        if (authLoginForm) authLoginForm.style.display = "block";
        if (authRegisterForm) authRegisterForm.style.display = "none";
    }

    function showRegisterTab() {
        if (tabAuthRegister) {
            tabAuthRegister.style.background = "white";
            tabAuthRegister.style.color = "var(--color-text-dark)";
            tabAuthRegister.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
            tabAuthRegister.style.fontWeight = "700";
        }
        if (tabAuthLogin) {
            tabAuthLogin.style.background = "transparent";
            tabAuthLogin.style.color = "var(--color-text-muted)";
            tabAuthLogin.style.boxShadow = "none";
            tabAuthLogin.style.fontWeight = "600";
        }
        if (authLoginForm) authLoginForm.style.display = "none";
        if (authRegisterForm) authRegisterForm.style.display = "block";
    }

    if (tabAuthLogin) tabAuthLogin.addEventListener("click", showLoginTab);
    if (tabAuthRegister) tabAuthRegister.addEventListener("click", showRegisterTab);
    if (linkGoRegister) linkGoRegister.addEventListener("click", showRegisterTab);
    if (linkGoLogin) linkGoLogin.addEventListener("click", showLoginTab);

    // Register button handler
    const btnRegister = document.getElementById("btn-profile-register");
    if (btnRegister) {
        btnRegister.addEventListener("click", async () => {
            const nameInput = document.getElementById("register-name");
            const emailInput = document.getElementById("register-email");
            const passwordInput = document.getElementById("register-password");
            const confirmInput = document.getElementById("register-confirm-password");

            const nameVal = nameInput ? nameInput.value.trim() : "";
            const emailVal = emailInput ? emailInput.value.trim() : "";
            const passwordVal = passwordInput ? passwordInput.value : "";
            const confirmVal = confirmInput ? confirmInput.value : "";

            if (!nameVal || !emailVal || !passwordVal) {
                addAssistantMessage("Please fill in all required fields: **Name**, **Email**, and **Password**.");
                return;
            }
            if (passwordVal !== confirmVal) {
                addAssistantMessage("Passwords do not match. Please re-enter your confirmation password.");
                return;
            }
            if (passwordVal.length < 6) {
                addAssistantMessage("Password must be at least **6 characters** long.");
                return;
            }

            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nameVal, email: emailVal, password: passwordVal })
                });

                const data = await res.json();
                if (data.success) {
                    state.loggedIn = true;
                    state.user = data.user;

                    // Update avatar initials from the new user's name
                    const initials = nameVal.split(" ").map(n => n[0]).join("").toUpperCase();
                    const avatarEl = document.getElementById("profile-avatar-clickable");
                    if (avatarEl) {
                        avatarEl.innerHTML = `<span id="profile-avatar-txt">${initials}</span><div style="position: absolute; bottom: 0; right: 0; background: var(--color-primary); color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; border: 1.5px solid white;">✏️</div>`;
                    }

                    await fetchProfile();
                    renderDigitalReceipt();

                    // Clear registration fields
                    if (nameInput) nameInput.value = "";
                    if (emailInput) emailInput.value = "";
                    if (passwordInput) passwordInput.value = "";
                    if (confirmInput) confirmInput.value = "";

                    addAssistantMessage(`Welcome aboard, **${nameVal}**! 🎉 Your Phoenix account has been created and you're now signed in. I've initialized your smart concierge profile.`);
                } else {
                    addAssistantMessage(`Registration failed: **${data.message || "An error occurred."}**`);
                }
            } catch (err) {
                console.error("Error registering:", err);
                addAssistantMessage("An error occurred during registration. Please try again.");
            }
        });
    }

    // Payment method toggles
    DOM.paymentVisa.addEventListener("click", () => {
        state.paymentMethod = "visa";
        DOM.paymentVisa.classList.add("active");
        DOM.paymentApple.classList.remove("active");
        DOM.paymentVisa.querySelector(".payment-radio").classList.add("checked");
        DOM.paymentApple.querySelector(".payment-radio").classList.remove("checked");
    });

    DOM.paymentApple.addEventListener("click", () => {
        state.paymentMethod = "apple";
        DOM.paymentApple.classList.add("active");
        DOM.paymentVisa.classList.remove("active");
        DOM.paymentApple.querySelector(".payment-radio").classList.add("checked");
        DOM.paymentVisa.querySelector(".payment-radio").classList.remove("checked");
    });

    DOM.btnPaymentContinue.addEventListener("click", () => {
        showScreen("review");
    });

    // Checkout Order Placement
    DOM.btnPlaceOrder.addEventListener("click", () => {
        placeOrder();
    });

    // Smart Fitting Room interactions
    DOM.dateToday.addEventListener("click", () => {
        DOM.dateToday.classList.add("active");
        DOM.dateTomorrow.classList.remove("active");
        state.reservation.date = "Oct 24";
    });

    DOM.dateTomorrow.addEventListener("click", () => {
        DOM.dateTomorrow.classList.add("active");
        DOM.dateToday.classList.remove("active");
        state.reservation.date = "Oct 25";
    });

    DOM.timeSlots.forEach(slot => {
        slot.addEventListener("click", () => {
            DOM.timeSlots.forEach(s => s.classList.remove("active"));
            slot.classList.add("active");
            state.reservation.time = slot.innerText;
        });
    });

    DOM.btnApplyRec.addEventListener("click", () => {
        if (!state.reservation.addedPocketSquare) {
            state.reservation.addedPocketSquare = true;
            // Add Pocket Square item to fitting room
            state.fittingRoom.push({
                product_id: 7,
                name: "Silk Pocket Square",
                price: 45.00,
                image_url: "/static/images/products/pocket_square.png",
                color: "Grey",
                size: "One Size"
            });
            DOM.btnApplyRec.innerText = "Added to Reservation ✓";
            DOM.btnApplyRec.style.color = "#c99b53";
            renderFittingRoom();
            addAssistantMessage("Great choice! I have added the **Silk Pocket Square** to your fitting room reservation list.");
        }
    });

    DOM.btnConfirmReservation.addEventListener("click", async () => {
        try {
            const res = await fetch("/api/reserve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    store: state.reservation.store,
                    date: state.reservation.date,
                    time: state.reservation.time,
                    items: state.fittingRoom
                })
            });
            const data = await res.json();
            if (data.success) {
                addAssistantMessage(`Perfect, Alex! I've reserved try-on room at **${state.reservation.store || "Soho Flagship"}** on **${state.reservation.date}** at **${state.reservation.time}** for your selections. The stylist room has been prepped.`);
                // Switch back to bag or map
                showScreen("bag");
            }
        } catch (err) {
            console.error("Error booking reservation:", err);
        }
    });

    // Change store navigation mapping
    const changeStoreBtn = document.querySelector(".change-store-btn");
    if (changeStoreBtn) {
        changeStoreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showScreen("map");
        });
    }

    if (DOM.btnCheckoutHelp) {
        DOM.btnCheckoutHelp.addEventListener("click", (e) => {
            e.preventDefault();
            const totalText = document.getElementById("review-total") ? document.getElementById("review-total").innerText : "";
            const cardLast4 = state.user ? state.user.card_last4 : "4242";
            const helpMsg = `Hello Alex! I see you are reviewing your order parameters: \n\n` +
                `- **Delivery Selection**: ${state.deliveryMethod === "pickup" ? "In-Store Pickup (" + (state.reservation.store || "Soho Flagship") + ")" : "Home Delivery"}\n` +
                `- **Payment Method**: ${state.paymentMethod === "apple" ? "Apple Pay" : "Visa ending in " + cardLast4}\n` +
                `- **Order Total**: ${totalText}\n\n` +
                `If all details look correct, click the **Place Order** button below to complete your checkout reservation!`;
            addAssistantMessage(helpMsg);
        });
    }

    // Map Interactivity
    DOM.pinSoho.addEventListener("click", () => {
        updateMapCard("Soho Flagship", "0.8 miles away", "MAIN HUB", "In Stock — 3 left", 5);
        highlightMapPin("soho");
    });
    DOM.pinChelsea.addEventListener("click", () => {
        updateMapCard("Chelsea Store", "1.2 miles away", "BOUTIQUE", "In Stock — 4 left", 5);
        highlightMapPin("chelsea");
    });
    DOM.pinBrooklyn.addEventListener("click", () => {
        updateMapCard("Brooklyn Hub", "2.4 miles away", "DISTRIBUTION HUB", "In Stock — 8 left", 5);
        highlightMapPin("brooklyn");
    });

    DOM.mapBtnReserve.addEventListener("click", () => {
        // Go to fitting room reserving
        showScreen("fitting-room");
    });

    // Apple Wallet slide pass integration
    DOM.btnAddWallet.addEventListener("click", () => {
        DOM.walletOverlay.classList.add("active");
    });
    DOM.closeWalletBtn.addEventListener("click", () => {
        DOM.walletOverlay.classList.remove("active");
    });

    // Review edits navigation mapping
    document.querySelectorAll(".edit-link-btn[data-go-screen]").forEach(btn => {
        btn.addEventListener("click", () => {
            showScreen(btn.dataset.goScreen);
        });
    });

    // Drawer opening/closing event listeners
    if (DOM.menuBtns) {
        DOM.menuBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                DOM.drawer.classList.add("open");
                DOM.drawerOverlay.classList.add("active");
            });
        });
    }

    if (DOM.btnCloseDrawer) {
        DOM.btnCloseDrawer.addEventListener("click", () => {
            DOM.drawer.classList.remove("open");
            DOM.drawerOverlay.classList.remove("active");
        });
    }

    if (DOM.drawerOverlay) {
        DOM.drawerOverlay.addEventListener("click", () => {
            DOM.drawer.classList.remove("open");
            DOM.drawerOverlay.classList.remove("active");
        });
    }

    if (DOM.drawerItems) {
        DOM.drawerItems.forEach(item => {
            item.addEventListener("click", () => {
                const targetScreen = item.dataset.target;
                showScreen(targetScreen);
                DOM.drawer.classList.remove("open");
                DOM.drawerOverlay.classList.remove("active");
            });
        });
    }

    // AR Calibration button listeners
    if (DOM.btnArScaleUp) {
        DOM.btnArScaleUp.addEventListener("click", () => {
            state.arScale = Math.min(2.5, state.arScale + 0.05);
            updateAROverlayTransform();
            updateARFitEstimator();
        });
    }

    if (DOM.btnArScaleDown) {
        DOM.btnArScaleDown.addEventListener("click", () => {
            state.arScale = Math.max(0.4, state.arScale - 0.05);
            updateAROverlayTransform();
            updateARFitEstimator();
        });
    }

    if (DOM.btnArReset) {
        DOM.btnArReset.addEventListener("click", () => {
            overlayX = 0;
            overlayY = 20;
            state.arScale = 1.05;
            updateAROverlayTransform();
            updateARFitEstimator();
        });
    }

    if (DOM.btnCloseAr) {
        DOM.btnCloseAr.addEventListener("click", () => {
            showScreen("bag");
        });
    }

    if (DOM.btnCameraShutter) {
        DOM.btnCameraShutter.addEventListener("click", () => {
            captureARSnapshot();
        });
    }

    if (DOM.btnCameraToggle) {
        DOM.btnCameraToggle.addEventListener("click", () => {
            state.arCameraMode = (state.arCameraMode === "user") ? "environment" : "user";
            startARCamera();
            addAssistantMessage(`Switched camera source mode to **${state.arCameraMode === "user" ? "Front (User)" : "Rear (Environment)"}**.`);
        });
    }

    if (DOM.btnArAiReview) {
        DOM.btnArAiReview.addEventListener("click", () => {
            requestAIFitReview();
        });
    }

    if (DOM.tabArWebcam) {
        DOM.tabArWebcam.addEventListener("click", () => {
            DOM.tabArWebcam.classList.add("active");
            DOM.tabArGoogle.classList.remove("active");
            state.arMode = "webcam";
            DOM.aiTryonViewport.style.display = "none";
            DOM.aiModelSelectorBlock.style.display = "none";
            DOM.arOverlayWrapper.style.display = "block";
            startARCamera();
        });
    }

    if (DOM.tabArGoogle) {
        DOM.tabArGoogle.addEventListener("click", () => {
            DOM.tabArGoogle.classList.add("active");
            DOM.tabArWebcam.classList.remove("active");
            state.arMode = "ai_tryon";
            stopARCamera();
            DOM.arOverlayWrapper.style.display = "none";
            DOM.aiTryonViewport.style.display = "flex";
            DOM.aiModelSelectorBlock.style.display = "block";
            runAIDrapeSimulation();
        });
    }

    if (DOM.aiModelList) {
        DOM.aiModelList.querySelectorAll(".model-card").forEach(card => {
            card.addEventListener("click", () => {
                DOM.aiModelList.querySelectorAll(".model-card").forEach(c => c.classList.remove("active"));
                card.classList.add("active");
                state.arSelectedModel = card.dataset.model;
                runAIDrapeSimulation();
            });
        });
    }

    // Delegation for fitting room try-on AR triggers
    if (DOM.fittingItemsContainer) {
        DOM.fittingItemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("ar-tryon-btn-fitting")) {
                const id = parseInt(e.target.dataset.id);
                state.arActiveProduct = id;
                showScreen("virtual-fit");
            }
        });
    }

    // Photo Editor: apply adjustments/presets helper
    function applyEditorFilters() {
        const preview = document.getElementById("editor-image-preview");
        if (!preview) return;
        
        const brightness = document.getElementById("slider-brightness").value;
        const contrast = document.getElementById("slider-contrast").value;
        const saturation = document.getElementById("slider-saturation").value;
        
        document.getElementById("brightness-val").innerText = brightness + "%";
        document.getElementById("contrast-val").innerText = contrast + "%";
        document.getElementById("saturation-val").innerText = saturation + "%";
        
        // Active filter preset styling
        let filterPreset = "";
        const activeFilterBtn = document.querySelector(".filter-chip.active-filter");
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : "none";
        
        if (activeFilter === "noir") {
            filterPreset = "grayscale(100%) ";
        } else if (activeFilter === "warm") {
            filterPreset = "sepia(50%) hue-rotate(-10deg) ";
        } else if (activeFilter === "glow") {
            filterPreset = "contrast(130%) saturate(120%) ";
        } else if (activeFilter === "ambient") {
            filterPreset = "hue-rotate(180deg) saturate(110%) ";
        }
        
        preview.style.filter = `${filterPreset}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    }

    // Photo Editor: slider listeners
    ["slider-brightness", "slider-contrast", "slider-saturation"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", applyEditorFilters);
        }
    });

    // Photo Editor: Filter chip preset selector
    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach(c => {
                c.classList.remove("active-filter");
                c.style.background = "rgba(255,255,255,0.08)";
                c.style.borderColor = "rgba(255,255,255,0.1)";
            });
            chip.classList.add("active-filter");
            chip.style.background = "var(--color-primary)";
            chip.style.borderColor = "var(--color-primary)";
            
            applyEditorFilters();
        });
    });

    // Photo Editor: Watermark checkbox toggle
    const chkWatermark = document.getElementById("chk-editor-watermark");
    const watermarkOverlay = document.getElementById("editor-watermark-overlay");
    if (chkWatermark && watermarkOverlay) {
        chkWatermark.addEventListener("change", () => {
            watermarkOverlay.style.display = chkWatermark.checked ? "block" : "none";
        });
    }

    // Photo Editor: Open Pic Editor
    const btnOpenPicEditor = document.getElementById("btn-open-pic-editor");
    const picEditorOverlay = document.getElementById("pic-editor-overlay");
    if (btnOpenPicEditor && picEditorOverlay) {
        btnOpenPicEditor.addEventListener("click", () => {
            const thumbImg = document.getElementById("snap-thumb-img");
            const preview = document.getElementById("editor-image-preview");
            if (thumbImg && preview) {
                preview.src = thumbImg.src;
                state.editingPicSource = thumbImg.src; // store original
                
                // Show Editor Overlay
                picEditorOverlay.style.display = "flex";
                
                // Reset to defaults
                document.getElementById("btn-editor-reset").click();
            }
        });
    }

    // Photo Editor: Close Pic Editor
    const btnClosePicEditor = document.getElementById("close-pic-editor");
    if (btnClosePicEditor && picEditorOverlay) {
        btnClosePicEditor.addEventListener("click", () => {
            picEditorOverlay.style.display = "none";
        });
    }

    // Photo Editor: Reset values
    const btnEditorReset = document.getElementById("btn-editor-reset");
    if (btnEditorReset) {
        btnEditorReset.addEventListener("click", () => {
            const preview = document.getElementById("editor-image-preview");
            if (preview && state.editingPicSource) {
                preview.src = state.editingPicSource;
            }
            
            document.getElementById("slider-brightness").value = 100;
            document.getElementById("slider-contrast").value = 100;
            document.getElementById("slider-saturation").value = 100;
            
            if (chkWatermark) chkWatermark.checked = false;
            if (watermarkOverlay) watermarkOverlay.style.display = "none";
            
            // Reset filter chips
            document.querySelectorAll(".filter-chip").forEach(c => {
                c.classList.remove("active-filter");
                c.style.background = "rgba(255,255,255,0.08)";
                c.style.borderColor = "rgba(255,255,255,0.1)";
            });
            const origChip = document.querySelector('.filter-chip[data-filter="none"]');
            if (origChip) {
                origChip.classList.add("active-filter");
                origChip.style.background = "var(--color-primary)";
                origChip.style.borderColor = "var(--color-primary)";
            }
            
            applyEditorFilters();
        });
    }

    // Photo Editor: Save changes (Draw to canvas and generate new dataURL)
    const btnEditorSave = document.getElementById("btn-editor-save");
    if (btnEditorSave) {
        btnEditorSave.addEventListener("click", () => {
            const img = document.getElementById("editor-image-preview");
            if (!img || !img.src) return;
            
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            const tempImg = new Image();
            tempImg.onload = function() {
                canvas.width = tempImg.naturalWidth || 320;
                canvas.height = tempImg.naturalHeight || 420;
                
                // Apply filter effects
                ctx.filter = img.style.filter;
                ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
                
                // Draw watermark if checked
                if (chkWatermark && chkWatermark.checked) {
                    ctx.filter = "none"; // Reset filter for watermark
                    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                    ctx.font = "bold " + Math.round(canvas.width * 0.038) + "px Outfit";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "bottom";
                    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 1.5;
                    ctx.shadowOffsetY = 1.5;
                    ctx.fillText("CURATED BY AURA", canvas.width - 12, canvas.height - 12);
                }
                
                const editedDataUrl = canvas.toDataURL("image/png");
                document.getElementById("snap-thumb-img").src = editedDataUrl;
                
                // Hide editor
                if (picEditorOverlay) picEditorOverlay.style.display = "none";
                addAssistantMessage("Fit Snapshot updated successfully! 🎨 Changes have been merged into your saved try-on photo.");
            };
            tempImg.src = img.src;
        });
    }

    // Profile Pic modal listeners
    const avatarClickable = document.getElementById("profile-avatar-clickable");
    const profilePicModal = document.getElementById("profile-pic-modal");
    const btnCancelProfilePic = document.getElementById("btn-cancel-profile-pic");
    const btnSaveProfilePic = document.getElementById("btn-save-profile-pic");
    const profilePicUrlInput = document.getElementById("profile-pic-url-input");
    let selectedAvatarPreset = { type: "initials", value: "AS" };

    if (avatarClickable && profilePicModal) {
        avatarClickable.addEventListener("click", () => {
            profilePicModal.style.display = "flex";
        });
    }

    if (btnCancelProfilePic && profilePicModal) {
        btnCancelProfilePic.addEventListener("click", () => {
            profilePicModal.style.display = "none";
        });
    }

    // Preset chips click binding
    document.querySelectorAll(".avatar-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".avatar-preset-btn").forEach(b => {
                b.style.borderColor = "transparent";
                b.classList.remove("active-preset");
            });
            btn.style.borderColor = "var(--color-primary)";
            btn.classList.add("active-preset");
            
            selectedAvatarPreset.type = btn.dataset.type;
            if (btn.dataset.type === "initials") {
                selectedAvatarPreset.value = btn.innerText;
                if (profilePicUrlInput) profilePicUrlInput.value = "";
            } else {
                selectedAvatarPreset.value = btn.dataset.url;
                if (profilePicUrlInput) profilePicUrlInput.value = btn.dataset.url;
            }
        });
    });

    if (btnSaveProfilePic && profilePicModal) {
        btnSaveProfilePic.addEventListener("click", () => {
            let avatarHtml = "AS";
            const urlVal = profilePicUrlInput ? profilePicUrlInput.value.trim() : "";
            
            if (urlVal) {
                avatarHtml = `<img src="${urlVal}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else if (selectedAvatarPreset.type === "img") {
                avatarHtml = `<img src="${selectedAvatarPreset.value}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
                avatarHtml = `<span id="profile-avatar-txt">${selectedAvatarPreset.value}</span>`;
            }
            
            // Update the profile avatar
            const avatarWrap = document.getElementById("profile-avatar-clickable");
            if (avatarWrap) {
                avatarWrap.innerHTML = `${avatarHtml}<div style="position: absolute; bottom: 0; right: 0; background: var(--color-primary); color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; border: 1.5px solid white;">✏️</div>`;
            }
            
            // Also update the drawer avatar
            const drawerAvatar = document.querySelector(".drawer-avatar");
            if (drawerAvatar) {
                if (urlVal || selectedAvatarPreset.type === "img") {
                    const src = urlVal || selectedAvatarPreset.value;
                    drawerAvatar.innerHTML = `<img src="${src}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    drawerAvatar.style.background = "none";
                } else {
                    drawerAvatar.innerHTML = selectedAvatarPreset.value;
                    drawerAvatar.style.background = "var(--color-primary-light)";
                    drawerAvatar.style.color = "var(--color-primary)";
                }
            }
            
            // Close modal
            profilePicModal.style.display = "none";
            addAssistantMessage("Your profile avatar has been updated! 👤 Synced settings across your smart concierge profile.");
        });
    }
}

// UPDATE MAP DATA
function updateMapCard(name, dist, badge, stock, prodId) {
    DOM.mapStoreTitle.innerText = name;
    DOM.mapStoreDistance.innerText = dist;
    DOM.mapStoreBadge.innerText = badge;
    DOM.mapStoreStock.innerText = stock;
    state.reservation.store = name; // sync active store
}

function highlightMapPin(pinId) {
    const pins = document.querySelectorAll(".map-pin");
    pins.forEach(p => p.classList.remove("active-pin"));
    
    const target = document.getElementById(`pin-${pinId}`);
    if (target) {
        target.classList.add("active-pin");
        
        // append pulse ring to active
        const ring = target.querySelector(".pulse-ring");
        if (!ring) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", "0");
            circle.setAttribute("cy", "0");
            circle.setAttribute("r", "14");
            circle.setAttribute("fill", "#ff6b35");
            circle.setAttribute("opacity", "0.2");
            circle.setAttribute("class", "pulse-ring");
            target.prepend(circle);
        }
    }
}

// SHIPPING DETAILS RE-CALC ON CHANGE
function updateDeliveryInsights() {
    if (state.deliveryMethod === "pickup") {
        DOM.deliveryInsightCard.style.display = "none";
        DOM.addressSectionBlock = "none";
        DOM.speedSectionBlock = "none";
    } else {
        DOM.deliveryInsightCard.style.display = "flex";
    }
}

// ADD PRODUCTS HELPER
function addItemToCart(prodId) {
    const prod = state.products.find(p => p.id === prodId);
    if (!prod) return;
    
    const inCart = state.cart.find(c => c.product_id === prodId);
    if (inCart) {
        inCart.quantity++;
    } else {
        state.cart.push({
            product_id: prod.id,
            name: prod.name,
            price: prod.price,
            image_url: prod.image_url,
            color: prod.colors[0],
            size: prod.sizes[0],
            quantity: 1
        });
    }
    updateCartUI();
    addAssistantMessage(`I've added the **${prod.name}** ($${prod.price.toFixed(2)}) to your Shopping Bag.`);
}

// CHAT MESSAGE HELPERS
function addAssistantMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "message assistant-message";
    
    // Parse simplified markdown (bold, links, em)
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
    bubble.innerHTML = `
        <div class="message-content">${formatted}</div>
        <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    `;
    
    DOM.chatMessages.appendChild(bubble);
    scrollToBottom();
}

function addUserMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "message user-message";
    bubble.innerHTML = `
        <div class="message-content">${text}</div>
        <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    `;
    DOM.chatMessages.appendChild(bubble);
    scrollToBottom();
}

function scrollToBottom() {
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

// SEND CHAT MESSAGE TO BACKEND
async function sendMessage() {
    const text = DOM.chatInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    DOM.chatInput.value = "";
    
    // Show Typing indicator
    const loader = document.createElement("div");
    loader.className = "message assistant-message typing-loader";
    loader.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    DOM.chatMessages.appendChild(loader);
    scrollToBottom();
    
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                cart: state.cart,
                screen: state.currentScreen
            })
        });
        const data = await res.json();
        
        // Remove loader
        const l = DOM.chatMessages.querySelector(".typing-loader");
        if (l) l.remove();
        
        addAssistantMessage(data.message);
        
        // Execute grounded simulator sync actions
        if (data.action !== "none") {
            handleConciergeSync(data);
        }
    } catch (err) {
        console.error("Error communicating with chat API:", err);
        const l = DOM.chatMessages.querySelector(".typing-loader");
        if (l) l.remove();
        addAssistantMessage("I encountered an issue connecting to my grounding service. Let me refresh and try again.");
    }
}

// CONCIERGE SYNC AGENT CONTROLLER
function handleConciergeSync(data) {
    console.log("Sync action executing:", data.action, data);
    
    if (data.screen) {
        showScreen(data.screen);
    }
    
    switch (data.action) {
        case "recommend_products":
            if (data.products && data.products.length > 0) {
                // Automatically switch screen to bag
                showScreen("bag");
                
                const recSection = document.getElementById("cart-recommendations-section");
                const recContainer = document.getElementById("cart-recommendations-container");
                if (recSection && recContainer) {
                    recContainer.innerHTML = "";
                    let hasRecs = false;
                    
                    data.products.forEach(prodId => {
                        // Check if item is already in cart
                        const inCart = state.cart.find(c => c.product_id === prodId);
                        if (inCart) return; // Skip if already in cart
                        
                        // Find product in state.products
                        const prod = state.products.find(p => p.id === prodId);
                        if (!prod) return;
                        
                        hasRecs = true;
                        
                        // Create card element
                        const card = document.createElement("div");
                        card.className = "cart-item";
                        card.style.border = "1px solid var(--color-primary-light)"; // green-ish premium accent border
                        card.innerHTML = `
                            <div class="cart-item-img-container">
                                <img src="${prod.image_url}" alt="${prod.name}">
                            </div>
                            <div class="cart-item-details">
                                <div>
                                    <h4 class="cart-item-name">${prod.name}</h4>
                                    <p class="cart-item-meta" style="margin-top: 4px;">
                                        <span class="meta-pill">${prod.colors[0]}</span>
                                        <span class="meta-pill">Size ${prod.sizes[0]}</span>
                                    </p>
                                </div>
                                <div class="cart-item-bottom" style="margin-top: 6px;">
                                    <span class="cart-item-price">$${prod.price.toFixed(2)}</span>
                                    <button class="tip-action-btn add-rec-btn" data-id="${prod.id}" style="margin-top: 0; font-weight: 700; color: var(--color-primary); padding: 4px 10px; border: 1px solid var(--color-primary); border-radius: 6px; background: var(--color-primary-light); cursor: pointer;">+ ADD</button>
                                </div>
                            </div>
                        `;
                        
                        // Bind add button click
                        const addBtn = card.querySelector(".add-rec-btn");
                        addBtn.addEventListener("click", () => {
                            addItemToCart(prod.id);
                            card.remove();
                            // Hide container if empty
                            if (recContainer.children.length === 0) {
                                recSection.style.display = "none";
                            }
                        });
                        
                        recContainer.appendChild(card);
                    });
                    
                    if (hasRecs) {
                        recSection.style.display = "block";
                        // Scroll down to the recommendations banner
                        setTimeout(() => {
                            recSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }, 100);
                    } else {
                        recSection.style.display = "none";
                    }
                }
            }
            break;
            
        case "show_stock":
            if (data.products && data.products.length > 0) {
                const prodId = data.products[0];
                const prod = state.products.find(p => p.id === prodId) || state.inventoryCheckingProduct;
                
                // Update checking banner
                DOM.checkingItemImg.src = prod.image_url;
                DOM.checkingItemName.innerText = prod.name;
                
                // Default pin Soho Active
                highlightMapPin("soho");
                if (data.inventory && data.inventory.length > 0) {
                    const soho = data.inventory.find(i => i.store_name.includes("Soho"));
                    if (soho) {
                        updateMapCard("Soho Flagship", `${soho.distance_miles} miles away`, "MAIN HUB", `In Stock — ${soho.quantity} left`, prodId);
                    }
                }
            }
            break;
            
        case "navigate_fitting_room":
            // Prep items try-on
            break;
            
        case "highlight_pickup":
            // Highlight insight and switch deliver toggles
            state.deliveryMethod = "pickup";
            DOM.deliveryPickup.click();
            break;
            
        case "navigate_checkout":
            break;
    }
}

// RENDER REVIEW ORDER
function renderReviewOrder() {
    DOM.reviewItemsContainer.innerHTML = "";
    
    // Title mapping
    if (state.deliveryMethod === "pickup") {
        DOM.reviewShippingTitle.innerText = "In-Store Pickup";
        const currentStore = state.reservation.store || "Soho Flagship";
        let storeAddress = "452 Broadway, New York, NY 10013";
        if (currentStore === "Chelsea Store") {
            storeAddress = "122 Tenth Avenue, New York, NY 10011";
        } else if (currentStore === "Brooklyn Hub") {
            storeAddress = "210 Joralemon Street, Brooklyn, NY 11201";
        }
        DOM.reviewShippingAddress.innerText = `${currentStore} (Ready in 2 hours)\n${storeAddress}`;
    } else {
        DOM.reviewShippingTitle.innerText = `Home Delivery (${state.deliverySpeed === "express" ? "Express" : "Standard"})`;
        const userName = state.user ? state.user.name : "Alex Sterling";
        const userAddr = state.user ? state.user.address : "72 Greene Street, Apt 4B, Soho, New York, NY 10012";
        DOM.reviewShippingAddress.innerText = `${userName}, ${userAddr}`;
    }
    
    const cardLast4 = state.user ? state.user.card_last4 : "4242";
    DOM.reviewPaymentTitle.innerText = state.paymentMethod === "apple" ? "Apple Pay" : `Visa ending in ${cardLast4}`;
    
    let subtotal = 0;
    state.cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const row = document.createElement("div");
        row.className = "review-item-row";
        row.innerHTML = `
            <div class="review-item-img">
                <img src="${item.image_url}" alt="${item.name}">
            </div>
            <div class="review-item-info">
                <h4 class="review-item-name">${item.name}</h4>
                <p class="review-item-meta">${item.color} • Size ${item.size} • Qty ${item.quantity}</p>
            </div>
            <span class="review-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        DOM.reviewItemsContainer.appendChild(row);
    });
    
    DOM.reviewItemsCount.innerText = `ORDER ITEMS (${state.cart.length})`;
    
    // Calculate final totals
    const finalSub = subtotal * (1 - state.promoDiscount);
    let shippingVal = 0;
    if (state.deliveryMethod === "home" && state.deliverySpeed === "express") {
        shippingVal = 15.00;
    }
    const taxVal = finalSub * 0.08;
    const finalTotal = finalSub + shippingVal + taxVal;
    
    DOM.reviewSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    if (state.promoDiscount > 0) {
        DOM.reviewSubtotal.innerHTML = `<span style="text-decoration:line-through; color:#8A98A8; font-size:11px; margin-right:6px">$${subtotal.toFixed(2)}</span> $${finalSub.toFixed(2)}`;
    }
    
    DOM.reviewShipping.innerText = shippingVal === 0 ? "Free" : `$${shippingVal.toFixed(2)}`;
    DOM.reviewShipping.className = shippingVal === 0 ? "free-badge" : "";
    DOM.reviewTax.innerText = `$${taxVal.toFixed(2)}`;
    DOM.reviewTotal.innerText = `$${finalTotal.toFixed(2)}`;
}

// RENDER FITTING ROOM TRY-ON
function renderFittingRoom() {
    DOM.fittingItemsContainer.innerHTML = "";
    DOM.fittingItemsHeader.innerHTML = `Items for Try-on <span class="item-count-badge">${state.fittingRoom.length} ITEMS</span>`;
    
    // Update store details dynamically
    const storeNameEl = document.getElementById("fitting-store-name");
    const storeAddrEl = document.getElementById("fitting-store-address");
    if (storeNameEl && storeAddrEl) {
        storeNameEl.innerText = state.reservation.store;
        if (state.reservation.store === "Chelsea Store") {
            storeAddrEl.innerText = "122 Tenth Avenue, New York, NY 10011";
        } else if (state.reservation.store === "Brooklyn Hub") {
            storeAddrEl.innerText = "210 Joralemon Street, Brooklyn, NY 11201";
        } else {
            storeAddrEl.innerText = "452 Broadway, New York, NY 10013"; // Soho Flagship default
        }
    }
    
    state.fittingRoom.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "fitting-item-card";
        card.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}">
            <div class="fitting-item-details">
                <h4 class="fitting-item-name">${item.name}</h4>
                <p class="fitting-item-meta">
                    ${item.color} • Size ${item.size}
                    <button class="ar-tryon-btn-fitting" data-id="${item.product_id}" style="background:transparent;border:none;color:var(--color-primary);font-weight:700;cursor:pointer;text-decoration:underline;padding:0;font-size:10.5px;margin-left:6px;">📷 AR fit</button>
                </p>
                <p class="fitting-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <button class="fitting-item-remove" data-index="${index}">×</button>
        `;
        DOM.fittingItemsContainer.appendChild(card);
    });
    
    // fitting remove bindings
    DOM.fittingItemsContainer.querySelectorAll(".fitting-item-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(btn.dataset.index);
            state.fittingRoom.splice(idx, 1);
            renderFittingRoom();
        });
    });

    if (state.reservation.addedPocketSquare) {
        DOM.stylistCard.style.display = "none";
    } else {
        DOM.stylistCard.style.display = "block";
    }
}

// PLACE ORDER API CALL
async function placeOrder() {
    let subtotal = 0;
    state.cart.forEach(item => subtotal += item.price * item.quantity);
    const finalSub = subtotal * (1 - state.promoDiscount);
    let shippingVal = 0;
    if (state.deliveryMethod === "home" && state.deliverySpeed === "express") {
        shippingVal = 15.00;
    }
    const taxVal = finalSub * 0.08;
    const finalTotal = finalSub + shippingVal + taxVal;
    
    try {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: state.user ? state.user.id : null,
                items: state.cart,
                total: finalTotal,
                shipping_address: state.deliveryMethod === "pickup" ? (state.reservation.store || "Soho Flagship") + " store" : (state.user ? state.user.address : "72 Greene Street, Apt 4B, Soho, New York, NY 10012"),
                payment_method: state.paymentMethod === "apple" ? "Apple Pay" : `Visa ending in ${state.user ? state.user.card_last4 : "4242"}`,
                delivery_speed: state.deliveryMethod === "pickup" ? "In-Store Pickup" : `${state.deliverySpeed} Delivery`
            })
        });
        const data = await res.json();
        if (data.success) {
            state.orderReceipt = {
                order_id: data.order_id,
                pickup_code: data.pickup_code,
                date: data.date,
                items: [...state.cart],
                subtotal: subtotal,
                tax: taxVal,
                total: finalTotal,
                payment_method: state.paymentMethod === "apple" ? "Apple Pay" : `Visa ending in ${state.user ? state.user.card_last4 : "4242"}`
            };
            
            // clear cart state
            state.cart = [];
            updateCartUI();
            
            // Render receipt screen and navigate
            renderDigitalReceipt();
            showScreen("receipt");
            
            if (state.deliveryMethod === "pickup") {
                const pickupStoreName = state.reservation.store || "Soho Flagship";
                addAssistantMessage(`Fantastic, Alex! Your order has been placed. Order ID is **#${data.order_id}**. I've generated your **Digital Pickup Pass** inside your profile. Since you're picking it up, show the pass barcode at the **${pickupStoreName}** desk.`);
            } else {
                const speedText = state.deliverySpeed === "express" ? "Express" : "Standard";
                const userAddress = (state.user && state.user.address) ? state.user.address : "72 Greene Street, Apt 4B, Soho, New York, NY 10012";
                addAssistantMessage(`Fantastic, Alex! Your order has been placed. Order ID is **#${data.order_id}**. I've generated your **Digital Delivery Pass** inside your profile. Since you chose Home Delivery, we will ship it to your address: **${userAddress}** via **${speedText} Shipping**.`);
            }
        }
    } catch (err) {
        console.error("Error placing order:", err);
    }
}

// RENDER DIGITAL RECEIPT & PROFILE SCREEN
function renderDigitalReceipt() {
    try {
        const loginSection = document.getElementById("profile-login-section");
        const infoSection = document.getElementById("profile-info-section");
        const historySection = document.getElementById("order-history-section");
        const activeOrderBlock = document.getElementById("active-order-block");
        
        // Update drawer profile details dynamically
        const drawerName = document.querySelector(".drawer-profile-name");
        const drawerEmail = document.querySelector(".drawer-profile-email");
        const drawerAvatar = document.querySelector(".drawer-avatar");
        
        if (!state.loggedIn) {
            if (drawerName) drawerName.innerText = "Guest User";
            if (drawerEmail) drawerEmail.innerText = "Sign in to sync account";
            if (drawerAvatar) {
                drawerAvatar.innerText = "👤";
                drawerAvatar.style.background = "rgba(255, 255, 255, 0.05)";
                drawerAvatar.style.color = "#8A98A8";
            }
            const uProfileName = document.getElementById("user-profile-name");
            if (uProfileName) uProfileName.innerText = "Guest User";
            const uProfileAddress = document.getElementById("user-profile-address");
            if (uProfileAddress) uProfileAddress.innerText = "Please log in to load shipping details.";
            
            if (loginSection) loginSection.style.display = "block";
            if (infoSection) infoSection.style.display = "none";
            if (historySection) historySection.style.display = "none";
            if (activeOrderBlock) activeOrderBlock.style.display = "none";
            return;
        } else {
            if (state.user) {
                if (drawerName) drawerName.innerText = state.user.name || "Alex Sterling";
                if (drawerEmail) drawerEmail.innerText = state.user.email || "alex.sterling@design.co";
                if (drawerAvatar) {
                    const profileAvatar = document.getElementById("profile-avatar-clickable");
                    const profileImg = profileAvatar ? profileAvatar.querySelector("img") : null;
                    if (profileImg) {
                        drawerAvatar.innerHTML = `<img src="${profileImg.src}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                        drawerAvatar.style.background = "none";
                    } else {
                        const initials = (state.user.name || "Alex Sterling").split(" ").map(n => n[0]).join("");
                        drawerAvatar.innerText = initials;
                        drawerAvatar.style.background = "var(--color-primary-light)";
                        drawerAvatar.style.color = "var(--color-primary)";
                    }
                }
            }
            if (loginSection) loginSection.style.display = "none";
            if (infoSection) infoSection.style.display = "block";
            if (historySection) historySection.style.display = "block";
        }

        const o = state.orderReceipt;
        
        // Toggle active order pass visibility
        if (activeOrderBlock) {
            if (o) {
                activeOrderBlock.style.display = "block";
                
                // Populate active order details
                if (DOM.receiptItemsContainer) {
                    DOM.receiptItemsContainer.innerHTML = "";
                    if (Array.isArray(o.items)) {
                        o.items.forEach(item => {
                            const row = document.createElement("div");
                            row.className = "receipt-item-row";
                            row.innerHTML = `
                                <img src="${item.image_url}" alt="${item.name}">
                                <div class="receipt-item-info">
                                    <h4 class="receipt-item-name">${item.name}</h4>
                                    <p class="receipt-item-meta">Size: ${item.size} • Color: ${item.color}</p>
                                </div>
                                <span class="receipt-item-price">$${item.price.toFixed(2)}</span>
                            `;
                            DOM.receiptItemsContainer.appendChild(row);
                        });
                    }
                }
                
                if (DOM.receiptSubtotal) DOM.receiptSubtotal.innerText = `$${(o.subtotal || 0).toFixed(2)}`;
                if (DOM.receiptTax) DOM.receiptTax.innerText = `$${(o.tax || 0).toFixed(2)}`;
                if (DOM.receiptTotal) DOM.receiptTotal.innerText = `$${(o.total || 0).toFixed(2)}`;
                if (DOM.walletCodeVal) DOM.walletCodeVal.innerText = o.pickup_code || "";
                if (DOM.receiptAuthCode && o.pickup_code) DOM.receiptAuthCode.innerText = o.pickup_code.split("_")[1] || "";
                if (DOM.receiptPmVal) DOM.receiptPmVal.innerText = o.payment_method || "";
                
                const passLabel = document.getElementById("receipt-pass-label");
                const passDesc = document.getElementById("receipt-pass-desc");
                const deliveryTitle = document.getElementById("receipt-location-title");
                const deliveryAddress = document.getElementById("receipt-location-address");
                const directionsLink = document.getElementById("receipt-directions-link");
                const confSubtitle = document.getElementById("receipt-conf-subtitle");
                const walletLabel2 = document.getElementById("wallet-pass-label-2");
                const walletVal2 = document.getElementById("wallet-pass-val-2");

                const currentStore = state.reservation.store || "Soho Flagship";
                let storeAddress = "452 Broadway, New York, NY 10013";
                if (currentStore === "Chelsea Store") {
                    storeAddress = "122 Tenth Avenue, New York, NY 10011";
                } else if (currentStore === "Brooklyn Hub") {
                    storeAddress = "210 Joralemon Street, Brooklyn, NY 11201";
                }

                if (state.deliveryMethod === "pickup") {
                    if (passLabel) passLabel.innerText = "PICKUP PASS";
                    if (passDesc) {
                        passDesc.innerHTML = `Show this code at the <strong id="receipt-store-bold">${currentStore}</strong> pickup counter`;
                    }
                    if (confSubtitle) {
                        confSubtitle.innerText = "Your personal concierge has secured your items. They are ready for pickup.";
                    }
                    if (deliveryTitle) {
                        deliveryTitle.innerText = "📍 PICKUP LOCATION";
                    }
                    if (DOM.receiptPickupStore) {
                        DOM.receiptPickupStore.innerText = currentStore;
                    }
                    if (deliveryAddress) {
                        deliveryAddress.innerText = storeAddress;
                    }
                    if (directionsLink) {
                        directionsLink.style.display = "inline-block";
                    }
                    if (walletLabel2) {
                        walletLabel2.innerText = "PICKUP LOCATION";
                    }
                    if (walletVal2) {
                        walletVal2.innerText = currentStore;
                    }
                } else {
                    // Home delivery!
                    if (passLabel) passLabel.innerText = "DELIVERY PASS";
                    if (passDesc) {
                        const speedText = state.deliverySpeed === "express" ? "Express" : "Standard";
                        const userAddress = (state.user && state.user.address) ? state.user.address : "72 Greene Street, Apt 4B, Soho, New York, NY 10012";
                        passDesc.innerText = `This code confirms your shipment via ${speedText} Shipping to ${userAddress}`;
                    }
                    if (confSubtitle) {
                        confSubtitle.innerText = "Your order has been placed. We're processing your delivery.";
                    }
                    if (deliveryTitle) {
                        deliveryTitle.innerText = "📍 SHIPPING ADDRESS";
                    }
                    if (DOM.receiptPickupStore) {
                        DOM.receiptPickupStore.innerText = "Home Delivery";
                    }
                    if (deliveryAddress) {
                        const speedText = state.deliverySpeed === "express" ? "Express Delivery" : "Standard Shipping";
                        const userAddress = (state.user && state.user.address) ? state.user.address : "72 Greene Street, Apt 4B, Soho, New York, NY 10012";
                        deliveryAddress.innerHTML = `<strong>Address:</strong> ${userAddress}<br><strong>Speed:</strong> ${speedText}`;
                    }
                    if (directionsLink) {
                        directionsLink.style.display = "none";
                    }
                    if (walletLabel2) {
                        walletLabel2.innerText = "DELIVERY SPEED";
                    }
                    if (walletVal2) {
                        walletVal2.innerText = `${state.deliverySpeed === "express" ? "Express" : "Standard"} Delivery`;
                    }
                }
            } else {
                activeOrderBlock.style.display = "none";
            }
        }

        // Populate user profile info
        if (state.user) {
            const uName = document.getElementById("profile-user-name");
            if (uName) uName.innerText = state.user.name || "Alex Sterling";
            
            const uEmail = document.getElementById("profile-user-email");
            if (uEmail) uEmail.innerText = state.user.email || "alex.sterling@design.co";
            
            const uPhone = document.getElementById("profile-user-phone");
            if (uPhone) uPhone.innerText = state.user.phone || "";
            
            const uAddress = document.getElementById("profile-saved-address");
            if (uAddress) {
                uAddress.innerHTML = state.user.address ? state.user.address.replace(/, /g, "<br>") : "72 Greene Street, Apt 4B<br>Soho, New York, NY 10012";
            }
            
            const uCard = document.getElementById("profile-saved-card");
            if (uCard) uCard.innerText = state.user.card_last4 || "4242";
            
            // Render order history list
            const orderHistoryList = document.getElementById("order-history-list");
            if (orderHistoryList) {
                orderHistoryList.innerHTML = "";
                
                const orders = state.user.orders || [];
                if (orders.length === 0) {
                    orderHistoryList.innerHTML = `<p class="card-text" style="color:var(--color-text-muted); text-align:center; padding:10px;">No past orders found.</p>`;
                } else {
                    orders.forEach(order => {
                        const card = document.createElement("div");
                        card.className = "past-order-card";
                        
                        // Format items list text
                        let itemsText = "";
                        if (Array.isArray(order.items)) {
                            itemsText = order.items.map(i => `${i.name} (${i.color}, Size ${i.size})`).join(", ");
                        }
                        
                        const statusClass = (order.status || "").toLowerCase();
                        card.innerHTML = `
                            <div class="past-order-header">
                                <span class="past-order-date">${order.date}</span>
                                <span class="past-order-status ${statusClass}">${order.status}</span>
                            </div>
                            <div class="past-order-items">
                                ${itemsText}
                            </div>
                            <div class="past-order-footer">
                                <span>Payment: ${order.payment_method || "Apple Pay"}</span>
                                <span class="past-order-total">Total: $${(order.total || 0).toFixed(2)}</span>
                            </div>
                        `;
                        orderHistoryList.appendChild(card);
                    });
                }
            }
        }
    } catch (err) {
        console.error("Error rendering Profile / Receipt screen:", err);
    }
}

// ==========================================
// AR VIRTUAL TRY-ON CAMERA MODULE
// ==========================================
const transparentImageCache = {};

function getTransparentImage(imageUrl, callback) {
    if (transparentImageCache[imageUrl]) {
        callback(transparentImageCache[imageUrl]);
        return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        const isWhiteGarment = imageUrl.includes("poplin_shirt");

        if (!isWhiteGarment) {
            // Global chroma-keying for non-white garments:
            // Since the garment is solid colored (navy, black, charcoal, sand) and the background is white,
            // we can safely remove any pixel that is near-white in the entire image.
            // This cleanly removes enclosed white spaces like sleeve gaps.
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                const a = data[i+3];
                if (a > 0 && r > 235 && g > 235 && b > 235) {
                    data[i+3] = 0; // Make transparent
                }
            }
        } else {
            // BFS Flood Fill from corners for white garments:
            // This prevents holes inside the white shirt itself.
            const visited = new Uint8Array(w * h);
            const queue = [];

            function isWhite(x, y) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx+1];
                const b = data[idx+2];
                const a = data[idx+3];
                if (a < 50) return false;
                return r > 240 && g > 240 && b > 240;
            }

            // Boundary pixels initialization
            for (let x = 0; x < w; x++) {
                if (isWhite(x, 0)) {
                    queue.push(x, 0);
                    visited[x] = 1;
                }
                if (isWhite(x, h - 1)) {
                    queue.push(x, h - 1);
                    visited[(h - 1) * w + x] = 1;
                }
            }
            for (let y = 0; y < h; y++) {
                if (isWhite(0, y)) {
                    queue.push(0, y);
                    visited[y * w] = 1;
                }
                if (isWhite(w - 1, y)) {
                    queue.push(w - 1, y);
                    visited[y * w + (w - 1)] = 1;
                }
            }

            let qHead = 0;
            const dx = [1, -1, 0, 0];
            const dy = [0, 0, 1, -1];

            while (qHead < queue.length) {
                const cx = queue[qHead++];
                const cy = queue[qHead++];

                const idx = (cy * w + cx) * 4;
                data[idx+3] = 0;

                for (let i = 0; i < 4; i++) {
                    const nx = cx + dx[i];
                    const ny = cy + dy[i];
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        const nIdx = ny * w + nx;
                        if (!visited[nIdx] && isWhite(nx, ny)) {
                            visited[nIdx] = 1;
                            queue.push(nx, ny);
                        }
                    }
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        transparentImageCache[imageUrl] = dataUrl;
        callback(dataUrl);
    };
    img.onerror = function() {
        callback(imageUrl);
    };
    img.src = imageUrl;
}

function preProcessTransparentImages() {
    if (state.products && state.products.length > 0) {
        state.products.forEach(p => {
            getTransparentImage(p.image_url, () => {
                console.log(`Pre-processed transparent image for: ${p.name}`);
            });
        });
    }
}

let isDragging = false;
let startX = 0, startY = 0;
let overlayX = 0, overlayY = 20; // Default offset relative to center

async function startARCamera() {
    // Stop any existing stream
    stopARCamera();

    // Reset overlay settings
    overlayX = 0;
    overlayY = 20;
    state.arScale = 1.05;
    updateAROverlayTransform();

    try {
        const constraints = {
            video: {
                facingMode: state.arCameraMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        state.arStream = stream;
        DOM.webcamFeed.srcObject = stream;
        DOM.webcamFeed.style.display = "block";
        DOM.webcamFallback.style.display = "none";
        console.log("Webcam feed active.");
    } catch (err) {
        console.warn("Camera access denied or unavailable. Fallback to model avatar.", err);
        DOM.webcamFeed.style.display = "none";
        DOM.webcamFallback.style.display = "flex";
    }

    // Set active try-on overlay image using background-remover
    const activeProd = state.products.find(p => p.id === state.arActiveProduct) || state.products[0];
    if (activeProd) {
        getTransparentImage(activeProd.image_url, (url) => {
            DOM.arOverlayImg.src = url;
        });
    }

    renderARCarousel();
    setupAROverlayDragging();
    updateARFitEstimator();
}

function stopARCamera() {
    if (state.arStream) {
        state.arStream.getTracks().forEach(track => track.stop());
        state.arStream = null;
    }
    DOM.webcamFeed.srcObject = null;
    DOM.webcamFeed.style.display = "none";
    DOM.webcamFallback.style.display = "flex";
    console.log("Webcam stopped.");
}

function updateAROverlayTransform() {
    DOM.arOverlayWrapper.style.transform = `translate3d(${overlayX}px, ${overlayY}px, 0) scale(${state.arScale})`;
}

function setupAROverlayDragging() {
    const wrapper = DOM.arOverlayWrapper;
    
    // Mouse Dragging handlers
    wrapper.onmousedown = function(e) {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - overlayX;
        startY = e.clientY - overlayY;
        document.onmousemove = dragMove;
        document.onmouseup = dragEnd;
    };

    function dragMove(e) {
        if (!isDragging) return;
        overlayX = e.clientX - startX;
        overlayY = e.clientY - startY;
        
        // Boundaries restriction within phone simulator screen viewport
        const maxW = 180;
        const maxH = 200;
        overlayX = Math.max(-maxW, Math.min(maxW, overlayX));
        overlayY = Math.max(-maxH, Math.min(maxH, overlayY));
        
        updateAROverlayTransform();
    }

    // Touch Dragging handlers
    wrapper.ontouchstart = function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - overlayX;
            startY = e.touches[0].clientY - overlayY;
            document.ontouchmove = touchMove;
            document.ontouchend = touchEnd;
        }
    };

    function touchMove(e) {
        if (!isDragging || e.touches.length !== 1) return;
        overlayX = e.touches[0].clientX - startX;
        overlayY = e.touches[0].clientY - startY;
        updateAROverlayTransform();
    }

    function touchEnd() {
        isDragging = false;
        document.ontouchmove = null;
        document.ontouchend = null;
        updateARFitEstimator();
    }

    function dragEnd() {
        isDragging = false;
        document.onmousemove = null;
        document.onmouseup = null;
        updateARFitEstimator();
    }

    // Scroll gesture scaling
    wrapper.onwheel = function(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        state.arScale = Math.max(0.4, Math.min(2.5, state.arScale + delta));
        updateAROverlayTransform();
        updateARFitEstimator();
    };
}

function renderARCarousel() {
    DOM.arProductSelector.innerHTML = "";
    state.products.forEach(p => {
        const item = document.createElement("div");
        item.className = `ar-carousel-item ${p.id === state.arActiveProduct ? "active" : ""}`;
        item.dataset.id = p.id;
        item.innerHTML = `<img src="${p.image_url}" alt="${p.name}">`;
        
        item.addEventListener("click", () => {
            document.querySelectorAll(".ar-carousel-item").forEach(c => c.classList.remove("active"));
            item.classList.add("active");
            state.arActiveProduct = p.id;
            
            if (state.arMode === "ai_tryon") {
                runAIDrapeSimulation();
            } else {
                getTransparentImage(p.image_url, (url) => {
                    DOM.arOverlayImg.src = url;
                });
                
                // Adjust offsets dynamically based on clothes classification
                overlayX = 0;
                if (p.category === "Outerwear" || p.category === "Shirts" || p.category === "Dresses") {
                    overlayY = 20;
                    state.arScale = 1.05;
                } else if (p.category === "Pants") {
                    overlayY = 120;
                    state.arScale = 0.95;
                } else if (p.category === "Shoes") {
                    overlayY = 180;
                    state.arScale = 0.8;
                } else {
                    overlayY = 0;
                    state.arScale = 1.0;
                }
                updateAROverlayTransform();
                updateARFitEstimator();
            }
            
            addAssistantMessage(`Switched AR dressing overlay to the **${p.name}**. Scroll/Pinch to scale, drag to adjust fit!`);
        });
        
        DOM.arProductSelector.appendChild(item);
    });
}

function updateARFitEstimator() {
    const prod = state.products.find(p => p.id === state.arActiveProduct) || state.products[0];
    if (!prod) return;
    
    if (state.arMode === "ai_tryon") {
        // AI Try-on fit score calculations based on the model roster size mismatch
        let shoulderScore = 80;
        let lengthScore = 80;
        let verdict = "";
        
        const m = state.arSelectedModel;
        
        // Taylor (Slim S):
        if (m === "s") {
            if (prod.id === 9) { // Contemporary Cut-Out Dress (XS/S is good)
                shoulderScore = 95;
                lengthScore = 92;
                verdict = `Taylor (S): The Cut-Out Dress fits beautifully. Clean neckline contour and flattering waist wrap.`;
            } else { // Blazers or other items (our seed bag contains Size 42L Wool Blazer)
                shoulderScore = 55;
                lengthScore = 60;
                verdict = `Taylor (S): The Size 42L Wool Blazer is oversized. Sleeve length is 2.5" too long and shoulders droop by 1.8". Recommend Size 38R.`;
            }
        }
        // Jordan (Regular M):
        else if (m === "m") {
            if (prod.id === 9) {
                shoulderScore = 88;
                lengthScore = 85;
                verdict = `Jordan (M): Good drape, though fabric clings slightly at hips. Sizing is modern and fitted.`;
            } else {
                shoulderScore = 85;
                lengthScore = 78;
                verdict = `Jordan (M): Size 42L Blazer fits slightly loose. Ideal for a relaxed drape. Recommend Size 40R for a tailored finish.`;
            }
        }
        // Morgan (Athletic L):
        else if (m === "l") {
            if (prod.id === 9) {
                shoulderScore = 72;
                lengthScore = 75;
                verdict = `Morgan (L): Asymmetrical cut-out has high tension. Recommend sizing up to XL to prevent fabric strain.`;
            } else {
                shoulderScore = 98;
                lengthScore = 94;
                verdict = `Morgan (L): Perfect tailoring match. The structured shoulders sit flush and sleeves break cleanly at the wrist.`;
            }
        }
        // Alex (Plus XL):
        else if (m === "xl") {
            if (prod.id === 9) {
                shoulderScore = 60;
                lengthScore = 62;
                verdict = `Alex (XL): Fabric strain detected at waist. Recommend sizing up to XXL for comfortable wear.`;
            } else {
                shoulderScore = 68;
                lengthScore = 72;
                verdict = `Alex (XL): Size 42L Blazer is tight in chest and armholes. Recommend sizing up to a 44R or 46L.`;
            }
        }
        
        const avgScore = Math.round((shoulderScore + lengthScore) / 2);
        DOM.arFitScore.innerText = `${avgScore}% MATCH`;
        DOM.meterShoulders.style.width = `${shoulderScore}%`;
        DOM.meterLength.style.width = `${lengthScore}%`;
        DOM.meterShoulders.parentElement.nextElementSibling.innerText = `${shoulderScore}%`;
        DOM.meterLength.parentElement.nextElementSibling.innerText = `${lengthScore}%`;
        
        if (avgScore > 90) {
            DOM.arFitScore.style.background = "rgba(0, 230, 118, 0.15)";
            DOM.arFitScore.style.color = "#00E676";
        } else if (avgScore > 80) {
            DOM.arFitScore.style.background = "rgba(255, 213, 79, 0.15)";
            DOM.arFitScore.style.color = "#FFD54F";
        } else {
            DOM.arFitScore.style.background = "rgba(255, 82, 82, 0.15)";
            DOM.arFitScore.style.color = "#FF5252";
        }
        DOM.arFitVerdict.innerText = verdict;
        return;
    }
    
    // Simple alignment/scale comparison score
    let targetScale = 1.05;
    let targetY = 20;
    
    if (prod.category === "Pants") {
        targetScale = 0.95;
        targetY = 120;
    } else if (prod.category === "Shoes") {
        targetScale = 0.8;
        targetY = 180;
    }

    const scaleDiff = Math.abs(state.arScale - targetScale);
    const posXDiff = Math.abs(overlayX);
    const posYDiff = Math.abs(overlayY - targetY);
    
    let shoulderScore = Math.round(98 - (scaleDiff * 35) - (posXDiff * 0.1) - (posYDiff * 0.05));
    let lengthScore = Math.round(95 - (scaleDiff * 25) - (posYDiff * 0.1));
    
    shoulderScore = Math.max(55, Math.min(100, shoulderScore));
    lengthScore = Math.max(50, Math.min(100, lengthScore));
    
    const avgScore = Math.round((shoulderScore + lengthScore) / 2);
    
    DOM.arFitScore.innerText = `${avgScore}% MATCH`;
    DOM.meterShoulders.style.width = `${shoulderScore}%`;
    DOM.meterLength.style.width = `${lengthScore}%`;
    
    DOM.meterShoulders.parentElement.nextElementSibling.innerText = `${shoulderScore}%`;
    DOM.meterLength.parentElement.nextElementSibling.innerText = `${lengthScore}%`;

    let verdict = "";
    if (avgScore > 90) {
        DOM.arFitScore.style.background = "rgba(0, 230, 118, 0.15)";
        DOM.arFitScore.style.color = "#00E676";
        verdict = `Fit Check: Excellent! The shoulders sit perfectly on frame. Sizing recommendation is highly optimal.`;
    } else if (avgScore > 80) {
        DOM.arFitScore.style.background = "rgba(255, 213, 79, 0.15)";
        DOM.arFitScore.style.color = "#FFD54F";
        verdict = `Fit Check: Good. Sizing fits slightly loose. Adjust position or select a different size if needed.`;
    } else {
        DOM.arFitScore.style.background = "rgba(255, 82, 82, 0.15)";
        DOM.arFitScore.style.color = "#FF5252";
        verdict = `Fit Check: Deviation detected. Align dress closer to grid markings to check size details.`;
    }
    DOM.arFitVerdict.innerText = verdict;
}

// Generate shutter audio snap chirp using AudioContext
function playCameraShutterSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Shutter snap sound
        const bufferSize = audioCtx.sampleRate * 0.08;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.06);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Success chirp
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.12);
        oscGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        
        osc.connect(oscGain);
        oscGain.connect(audioCtx.destination);
        
        noise.start();
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
    } catch(e) {
        console.warn("Sound failed to load/play", e);
    }
}

async function captureARSnapshot() {
    DOM.cameraFlash.classList.add("flash-active");
    playCameraShutterSound();
    
    setTimeout(() => {
        DOM.cameraFlash.classList.remove("flash-active");
    }, 350);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = 320;
    canvas.height = 420;
    
    // Draw Video Feed frame or fallback background
    if (state.arStream) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Flip mirror horizontally
        ctx.drawImage(DOM.webcamFeed, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    } else {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#1a232b');
        grad.addColorStop(1, '#080c10');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.font = "60px Inter";
        ctx.textAlign = "center";
        ctx.fillText("👤", canvas.width/2, canvas.height/2);
    }
    
    // Grid alignment overlay watermark
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width/3, 0); ctx.lineTo(canvas.width/3, canvas.height);
    ctx.moveTo(canvas.width*2/3, 0); ctx.lineTo(canvas.width*2/3, canvas.height);
    ctx.moveTo(0, canvas.height/3); ctx.lineTo(canvas.width, canvas.height/3);
    ctx.moveTo(0, canvas.height*2/3); ctx.lineTo(canvas.width, canvas.height*2/3);
    ctx.stroke();

    // Draw active clothing overlay
    const activeProd = state.products.find(p => p.id === state.arActiveProduct) || state.products[0];
    if (activeProd) {
        const img = DOM.arOverlayImg;
        if (img.complete && img.naturalWidth > 0) {
            const centerX = canvas.width / 2 + overlayX;
            const centerY = canvas.height / 2 + overlayY;
            const overlayW = 200 * state.arScale;
            const overlayH = (img.naturalHeight / img.naturalWidth) * overlayW;
            ctx.drawImage(img, centerX - overlayW/2, centerY - overlayH/2, overlayW, overlayH);
        }
    }
    
    // Add watermark text
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "9px Outfit";
    ctx.textAlign = "right";
    ctx.fillText("AURA CONCIERGE AR", canvas.width - 12, canvas.height - 12);
    
    const dataUrl = canvas.toDataURL("image/png");
    
    DOM.snapThumbImg.src = dataUrl;
    DOM.snapshotToast.classList.add("active");
    
    setTimeout(() => {
        DOM.snapshotToast.classList.remove("active");
    }, 3200);
    
    addAssistantMessage(`Saved virtual try-on snapshot for **${activeProd.name}**. Checked alignment at **${DOM.arFitScore.innerText.split(" ")[0]}** fit rating!`);
}

async function requestAIFitReview() {
    const prod = state.products.find(p => p.id === state.arActiveProduct) || state.products[0];
    if (!prod) return;
    
    let messageBody = "";
    let userMsg = `Requesting AI Fit Review for my try-on of the **${prod.name}**.`;
    
    if (state.arMode === "ai_tryon") {
        let shoulderScore = 80;
        let lengthScore = 80;
        const m = state.arSelectedModel;
        
        if (m === "s") {
            if (prod.id === 9) { shoulderScore = 95; lengthScore = 92; }
            else { shoulderScore = 55; lengthScore = 60; }
        } else if (m === "m") {
            if (prod.id === 9) { shoulderScore = 88; lengthScore = 85; }
            else { shoulderScore = 85; lengthScore = 78; }
        } else if (m === "l") {
            if (prod.id === 9) { shoulderScore = 72; lengthScore = 75; }
            else { shoulderScore = 98; lengthScore = 94; }
        } else if (m === "xl") {
            if (prod.id === 9) { shoulderScore = 60; lengthScore = 62; }
            else { shoulderScore = 68; lengthScore = 72; }
        }
        
        const avgScore = Math.round((shoulderScore + lengthScore) / 2);
        const modelNames = { s: "Taylor (S)", m: "Jordan (M)", l: "Morgan (L)", xl: "Alex (XL)" };
        userMsg = `Requesting Google-style AI Fit Review of the **${prod.name}** on model **${modelNames[m]}**.`;
        messageBody = `Analyze fit: ${prod.name} | Model: ${modelNames[m]} | Score: ${avgScore} | Shoulders: ${shoulderScore} | Length: ${lengthScore}`;
    } else {
        // Calculate current fit stats from webcam drag/scale
        let targetScale = 1.05;
        let targetY = 20;
        
        if (prod.category === "Pants") {
            targetScale = 0.95;
            targetY = 120;
        } else if (prod.category === "Shoes") {
            targetScale = 0.8;
            targetY = 180;
        }

        const scaleDiff = Math.abs(state.arScale - targetScale);
        const posXDiff = Math.abs(overlayX);
        const posYDiff = Math.abs(overlayY - targetY);
        
        let shoulderScore = Math.round(98 - (scaleDiff * 35) - (posXDiff * 0.1) - (posYDiff * 0.05));
        let lengthScore = Math.round(95 - (scaleDiff * 25) - (posYDiff * 0.1));
        
        shoulderScore = Math.max(55, Math.min(100, shoulderScore));
        lengthScore = Math.max(50, Math.min(100, lengthScore));
        
        const avgScore = Math.round((shoulderScore + lengthScore) / 2);
        
        messageBody = `Analyze fit: ${prod.name} | Score: ${avgScore} | Shoulders: ${shoulderScore} | Length: ${lengthScore} | Scale: ${state.arScale.toFixed(2)} | TargetScale: ${targetScale} | OffsetX: ${overlayX} | OffsetY: ${overlayY} | TargetY: ${targetY}`;
    }
    
    // Add user message to chat panel
    addUserMessage(userMsg);
    
    // Show typing loader
    const loader = document.createElement("div");
    loader.className = "message assistant-message typing-loader";
    loader.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    DOM.chatMessages.appendChild(loader);
    scrollToBottom();
    
    // Call the chatbot API
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: messageBody,
                cart: state.cart,
                screen: state.currentScreen
            })
        });
        const data = await res.json();
        
        // Remove typing loader
        loader.remove();
        
        if (data.message) {
            addAssistantMessage(data.message);
        }
    } catch(err) {
        console.error("AI Fit Review failed:", err);
        loader.remove();
        addAssistantMessage("I'm sorry, I'm having trouble analyzing the fit right now. Please try again.");
    }
}

function runAIDrapeSimulation() {
    const prod = state.products.find(p => p.id === state.arActiveProduct) || state.products[0];
    if (!prod) return;

    // Show loading overlay
    DOM.aiTryonLoader.style.display = "flex";
    DOM.aiDrapeProgress.style.width = "0%";
    DOM.aiDrapePct.innerText = "0%";
    DOM.aiLoaderStatus.innerText = "Aura Drape Engine initializing model parameters...";

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 12) + 5; // increment by 5% to 17%
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Set correct image source based on product and size model
            const m = state.arSelectedModel;
            let imgSrc = "";
            
            if (prod.id === 9 || prod.name.includes("Cut-Out")) { // Contemporary Cut-Out Dress
                if (m === "s") imgSrc = "/static/images/models/model_s_modern.png";
                else if (m === "m") imgSrc = "/static/images/models/model_m_modern.png";
                else imgSrc = "/static/images/models/model_l_modern.png"; // Fallback for L/XL
            } else if (prod.id === 8 || prod.name.includes("Wrap")) { // Silk Wrap Dress
                imgSrc = "/static/images/models/model_s_dress.png"; // Taylor wearing wrap dress
            } else { // Blazers and other products fallback to wool blazers S/M/L/XL
                if (m === "s") imgSrc = "/static/images/models/model_s_blazer.png";
                else if (m === "m") imgSrc = "/static/images/models/model_m_blazer.png";
                else if (m === "l") imgSrc = "/static/images/models/model_l_blazer.png";
                else imgSrc = "/static/images/models/model_xl_blazer.png";
            }
            
            DOM.aiTryonModelImg.src = imgSrc;
            
            setTimeout(() => {
                DOM.aiTryonLoader.style.display = "none";
                updateARFitEstimator();
            }, 200);
        } else {
            DOM.aiDrapeProgress.style.width = `${progress}%`;
            DOM.aiDrapePct.innerText = `${progress}%`;
            
            if (progress < 30) {
                DOM.aiLoaderStatus.innerText = "Aura Drape Engine initializing model parameters...";
            } else if (progress < 65) {
                DOM.aiLoaderStatus.innerText = "Mapping body silhouette coordinates and fabric draping...";
            } else if (progress < 90) {
                DOM.aiLoaderStatus.innerText = "Synthesizing high-fidelity fabric folds & rendering textures...";
            } else {
                DOM.aiLoaderStatus.innerText = "Applying natural lighting shadows...";
            }
        }
    }, 100);
}
