import unittest
import json
import os
import sqlite3
from app import app
from database import DB_PATH, init_db

class AuraConciergeTestCase(unittest.TestCase):
    def setUp(self):
        # Enforce clean database init
        init_db()
        self.app = app.test_client()
        self.app.testing = True

    def test_profile_api(self):
        response = self.app.get('/api/profile')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['name'], 'Alex Sterling')
        self.assertEqual(data['card_last4'], '4242')
        self.assertIn('orders', data)
        self.assertTrue(len(data['orders']) > 0)

        # Test POST profile update
        update_payload = {
            "address": "123 Broadway, New York, NY 10003",
            "phone": "+1 (555) 999-9999"
        }
        res_post = self.app.post('/api/profile', 
                                 data=json.dumps(update_payload),
                                 content_type='application/json')
        self.assertEqual(res_post.status_code, 200)
        post_data = json.loads(res_post.data)
        self.assertEqual(post_data['address'], '123 Broadway, New York, NY 10003')
        self.assertEqual(post_data['phone'], '+1 (555) 999-9999')

    def test_products_api(self):
        response = self.app.get('/api/products')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(len(data) >= 7)
        first_product = data[0]
        self.assertIn('name', first_product)
        self.assertIn('colors', first_product)
        self.assertIn('sizes', first_product)
        self.assertIsInstance(first_product['colors'], list)

    def test_inventory_api(self):
        # Product 5 is Premium Merino Polo
        response = self.app.get('/api/inventory/5')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(len(data) > 0)
        soho_store = next((s for s in data if s['store_name'] == 'Soho Flagship'), None)
        self.assertIsNotNone(soho_store)
        self.assertEqual(soho_store['quantity'], 3)
        self.assertEqual(soho_store['distance_miles'], 0.8)

    def test_chat_semantic_search(self):
        payload = {
            "message": "something casual but formal enough for a tech networking mixer",
            "cart": [],
            "screen": "bag"
        }
        response = self.app.post('/api/chat', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)
        self.assertEqual(data['action'], 'recommend_products')
        self.assertTrue(len(data['products']) > 0)

    def test_chat_stock_check(self):
        payload = {
            "message": "Is the Premium Merino Polo in stock nearby?",
            "cart": [],
            "screen": "bag"
        }
        response = self.app.post('/api/chat', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['action'], 'show_stock')
        self.assertEqual(data['screen'], 'map')
        self.assertIn('inventory', data)
        self.assertEqual(data['products'], [5])

    def test_chat_fitting_room(self):
        payload = {
            "message": "reserve a Soho fitting room to try them on",
            "cart": [],
            "screen": "bag"
        }
        response = self.app.post('/api/chat', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['action'], 'navigate_fitting_room')
        self.assertEqual(data['screen'], 'fitting_room')
        self.assertIn('products', data)

    def test_checkout_and_reservation(self):
        # Test reserving a try on slot
        reserve_payload = {
            "store": "Soho Flagship",
            "date": "Oct 24",
            "time": "12:30 PM",
            "items": [{"product_id": 5, "name": "Premium Merino Polo", "price": 125.00}]
        }
        res = self.app.post('/api/reserve', 
                            data=json.dumps(reserve_payload),
                            content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(json.loads(res.data)['success'])

        # Test placing an order
        order_payload = {
            "items": [
                {
                    "product_id": 1,
                    "name": "Essential Wool Blazer",
                    "price": 495.00,
                    "quantity": 1,
                    "color": "Navy",
                    "size": "42L"
                }
            ],
            "total": 534.60,
            "shipping_address": "72 Greene Street, Apt 4B, Soho, New York, NY 10012",
            "payment_method": "Apple Pay",
            "delivery_speed": "In-Store Pickup"
        }
        res_order = self.app.post('/api/checkout', 
                                  data=json.dumps(order_payload),
                                  content_type='application/json')
        self.assertEqual(res_order.status_code, 200)
        order_data = json.loads(res_order.data)
        self.assertTrue(order_data['success'])
        self.assertTrue(order_data['pickup_code'].startswith('QR_'))

    def test_chat_fit_check(self):
        # Test fit check with low score (needs adjustments)
        payload = {
            "message": "Analyze fit: Essential Wool Blazer | Score: 75 | Shoulders: 72 | Length: 78 | Scale: 1.25 | TargetScale: 1.05 | OffsetX: 25 | OffsetY: 45 | TargetY: 20",
            "cart": [],
            "screen": "virtual-fit"
        }
        response = self.app.post('/api/chat', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)
        self.assertIn('Aura Fit Review', data['message'])
        self.assertIn('oversized', data['message'])
        self.assertIn('shifted horizontally', data['message'])

        # Test fit check with high score (optimal fit)
        payload_fit = {
            "message": "Analyze fit: Essential Wool Blazer | Score: 95 | Shoulders: 96 | Length: 94 | Scale: 1.05 | TargetScale: 1.05 | OffsetX: 0 | OffsetY: 20 | TargetY: 20",
            "cart": [],
            "screen": "virtual-fit"
        }
        response_fit = self.app.post('/api/chat', 
                                     data=json.dumps(payload_fit),
                                     content_type='application/json')
        self.assertEqual(response_fit.status_code, 200)
        data_fit = json.loads(response_fit.data)
        self.assertIn('message', data_fit)
        self.assertIn('Optimal Fit', data_fit['message'])

    def test_chat_model_fit_check(self):
        # Test model-based fit check for Taylor (S) with low score
        payload = {
            "message": "Analyze fit: Essential Wool Blazer | Model: Taylor (S) | Score: 57 | Shoulders: 55 | Length: 60",
            "cart": [],
            "screen": "virtual-fit"
        }
        response = self.app.post('/api/chat', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)
        self.assertIn('Google AI Try-On Review', data['message'])
        self.assertIn('Taylor (S)', data['message'])
        self.assertIn('oversized', data['message'])
        self.assertIn('Size 38R', data['message'])

        # Test model-based fit check for Jordan (M) with high score
        payload_fit = {
            "message": "Analyze fit: Essential Wool Blazer | Model: Jordan (M) | Score: 95 | Shoulders: 96 | Length: 94",
            "cart": [],
            "screen": "virtual-fit"
        }
        response_fit = self.app.post('/api/chat', 
                                     data=json.dumps(payload_fit),
                                     content_type='application/json')
        self.assertEqual(response_fit.status_code, 200)
        data_fit = json.loads(response_fit.data)
        self.assertIn('message', data_fit)
        self.assertIn('Optimal Fit', data_fit['message'])
        self.assertIn('Jordan (M)', data_fit['message'])


if __name__ == '__main__':
    unittest.main()
