import json
import uuid
from datetime import datetime
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from unittest.mock import patch
from .models import GroceryItem  # Adjust import based on your app structure


class GroceryItemAPITestCase(APITestCase):
    """Comprehensive test suite for Grocery Items API"""
    
    def setUp(self):
        """Set up test data before each test method"""
        self.client = APIClient()
        self.list_url = reverse('groceryitem-list')  # Adjust URL name based on your URLconf
        
        # Create test items
        self.item1 = GroceryItem.objects.create(
            name="Organic Milk",
            bought=False
        )
        self.item2 = GroceryItem.objects.create(
            name="Whole Wheat Bread",
            bought=True
        )
        self.item3 = GroceryItem.objects.create(
            name="Fresh Apples",
            bought=False
        )
        
        # URLs for detail operations
        self.detail_url_item1 = reverse('groceryitem-detail', kwargs={'pk': self.item1.id})
        self.detail_url_item2 = reverse('groceryitem-detail', kwargs={'pk': self.item2.id})


class TestGetAllItems(GroceryItemAPITestCase):
    """Test GET /items endpoint"""
    
    def test_get_all_items_success(self):
        """Test retrieving all grocery items"""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        
        # Verify response structure
        for item in response.data:
            self.assertIn('id', item)
            self.assertIn('name', item)
            self.assertIn('bought', item)
            self.assertIn('createdAt', item)
            
            # Verify data types
            self.assertIsInstance(item['id'], str)
            self.assertIsInstance(item['name'], str)
            self.assertIsInstance(item['bought'], bool)
            self.assertIsInstance(item['createdAt'], str)
    
    def test_get_items_includes_both_bought_and_active(self):
        """Test that response includes both bought and active items"""
        response = self.client.get(self.list_url)
        
        bought_items = [item for item in response.data if item['bought']]
        active_items = [item for item in response.data if not item['bought']]
        
        self.assertEqual(len(bought_items), 1)
        self.assertEqual(len(active_items), 2)
    
    def test_get_items_returns_valid_uuid_format(self):
        """Test that all item IDs are valid UUIDs"""
        response = self.client.get(self.list_url)
        
        for item in response.data:
            # Should not raise ValueError if valid UUID
            uuid.UUID(item['id'])
    
    def test_get_items_returns_valid_datetime_format(self):
        """Test that createdAt fields are valid ISO datetime strings"""
        response = self.client.get(self.list_url)
        
        for item in response.data:
            # Should not raise ValueError if valid datetime
            datetime.fromisoformat(item['createdAt'].replace('Z', '+00:00'))
    
    def test_get_items_empty_list(self):
        """Test GET request when no items exist"""
        GroceryItem.objects.all().delete()
        
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
    
    def test_get_items_ordering(self):
        """Test that items are returned in consistent order (by creation date)"""
        response = self.client.get(self.list_url)
        
        # Assuming items are ordered by creation date
        created_dates = [item['createdAt'] for item in response.data]
        self.assertEqual(created_dates, sorted(created_dates))


class TestCreateItem(GroceryItemAPITestCase):
    """Test POST /items endpoint"""
    
    def test_create_item_success(self):
        """Test creating a new grocery item"""
        data = {"name": "Greek Yogurt"}
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify response structure
        self.assertIn('id', response.data)
        self.assertIn('name', response.data)
        self.assertIn('bought', response.data)
        self.assertIn('createdAt', response.data)
        
        # Verify response values
        self.assertEqual(response.data['name'], "Greek Yogurt")
        self.assertEqual(response.data['bought'], False)  # Should default to False
        
        # Verify item was created in database
        self.assertTrue(
            GroceryItem.objects.filter(name="Greek Yogurt").exists()
        )
    
    def test_create_item_with_valid_name_boundary_values(self):
        """Test creating items with minimum and maximum valid name lengths"""
        # Test minimum length (1 character)
        data = {"name": "A"}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Test maximum length (100 characters)
        long_name = "A" * 100
        data = {"name": long_name}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_item_invalid_empty_name(self):
        """Test creating item with empty name returns 400"""
        data = {"name": ""}
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_item_invalid_missing_name(self):
        """Test creating item without name field returns 400"""
        data = {}
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_item_invalid_null_name(self):
        """Test creating item with null name returns 400"""
        data = {"name": None}
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_item_invalid_name_too_long(self):
        """Test creating item with name longer than 100 characters returns 400"""
        data = {"name": "A" * 101}
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_item_invalid_name_not_string(self):
        """Test creating item with non-string name returns 400"""
        test_cases = [
            {"name": 123},
            {"name": True},
            {"name": []},
            {"name": {}}
        ]
        
        for data in test_cases:
            with self.subTest(data=data):
                response = self.client.post(self.list_url, data, format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_item_ignores_extra_fields(self):
        """Test that extra fields in request are ignored"""
        data = {
            "name": "Extra Field Test",
            "bought": True,  # Should be ignored
            "id": "custom-id",  # Should be ignored
            "extra_field": "should be ignored"
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['bought'], False)  # Should default to False
        self.assertNotEqual(response.data['id'], "custom-id")  # Should generate new UUID
    
    def test_create_item_content_type_validation(self):
        """Test that proper content-type is required"""
        data = {"name": "Content Type Test"}
        
        # Test with form data (should work)
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Test with JSON (should work)
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class TestUpdateItemStatus(GroceryItemAPITestCase):
    """Test PATCH /items/{id} endpoint"""
    
    def test_update_item_status_to_bought(self):
        """Test updating item status to bought"""
        data = {"bought": True}
        
        response = self.client.patch(self.detail_url_item1, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bought'], True)
        self.assertEqual(response.data['name'], self.item1.name)
        self.assertEqual(response.data['id'], str(self.item1.id))
        
        # Verify in database
        self.item1.refresh_from_db()
        self.assertTrue(self.item1.bought)
    
    def test_update_item_status_to_not_bought(self):
        """Test updating item status to not bought"""
        data = {"bought": False}
        
        response = self.client.patch(self.detail_url_item2, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bought'], False)
        
        # Verify in database
        self.item2.refresh_from_db()
        self.assertFalse(self.item2.bought)
    
    def test_update_item_status_invalid_item_id(self):
        """Test updating non-existent item returns 404"""
        non_existent_id = str(uuid.uuid4())
        url = reverse('groceryitem-detail', kwargs={'pk': non_existent_id})
        data = {"bought": True}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_item_status_invalid_uuid(self):
        """Test updating item with invalid UUID format returns 404"""
        url = '/items/invalid-uuid/'  # Adjust based on your URL pattern
        data = {"bought": True}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST])
    
    def test_update_item_status_missing_bought_field(self):
        """Test updating item without bought field returns 400"""
        data = {}
        
        response = self.client.patch(self.detail_url_item1, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_item_status_invalid_bought_value(self):
        """Test updating item with invalid bought value returns 400"""
        test_cases = [
            {"bought": "true"},  # String instead of boolean
            {"bought": 1},       # Integer instead of boolean
            {"bought": None},    # Null value
            {"bought": "yes"},   # Invalid string
        ]
        
        for data in test_cases:
            with self.subTest(data=data):
                response = self.client.patch(self.detail_url_item1, data, format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_item_status_ignores_other_fields(self):
        """Test that PATCH ignores fields other than bought"""
        original_name = self.item1.name
        data = {
            "bought": True,
            "name": "Should be ignored",
            "id": "should-be-ignored"
        }
        
        response = self.client.patch(self.detail_url_item1, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], original_name)
        self.assertEqual(response.data['id'], str(self.item1.id))
        self.assertEqual(response.data['bought'], True)


class TestDeleteItem(GroceryItemAPITestCase):
    """Test DELETE /items/{id} endpoint"""
    
    def test_delete_item_success(self):
        """Test deleting an existing item"""
        item_id = self.item1.id
        
        response = self.client.delete(self.detail_url_item1)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(response.content, b'')
        
        # Verify item was deleted from database
        self.assertFalse(
            GroceryItem.objects.filter(id=item_id).exists()
        )
    
    def test_delete_item_not_found(self):
        """Test deleting non-existent item returns 404"""
        non_existent_id = str(uuid.uuid4())
        url = reverse('groceryitem-detail', kwargs={'pk': non_existent_id})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_item_invalid_uuid(self):
        """Test deleting item with invalid UUID format"""
        url = '/items/invalid-uuid/'  # Adjust based on your URL pattern
        
        response = self.client.delete(url)
        
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST])
    
    def test_delete_item_twice(self):
        """Test deleting the same item twice returns 404 on second attempt"""
        # First deletion should succeed
        response = self.client.delete(self.detail_url_item1)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Second deletion should return 404
        response = self.client.delete(self.detail_url_item1)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TestAPIErrorHandling(GroceryItemAPITestCase):
    """Test error handling across all endpoints"""
    
    def test_invalid_http_methods(self):
        """Test that invalid HTTP methods return 405"""
        # Test invalid methods on list endpoint
        response = self.client.put(self.list_url, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        # Test invalid methods on detail endpoint
        response = self.client.post(self.detail_url_item1, {})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def test_malformed_json(self):
        """Test that malformed JSON returns 400"""
        malformed_json = '{"name": "test"'  # Missing closing brace
        
        response = self.client.post(
            self.list_url,
            malformed_json,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('your_app.views.GroceryItemViewSet.list')  # Adjust import path
    def test_database_error_handling(self, mock_list):
        """Test that database errors are handled gracefully"""
        mock_list.side_effect = Exception("Database connection error")
        
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


class TestAPIResponseHeaders(GroceryItemAPITestCase):
    """Test API response headers and content types"""
    
    def test_response_content_type(self):
        """Test that responses have correct content-type"""
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/json')
    
    def test_cors_headers(self):
        """Test CORS headers if implemented"""
        response = self.client.get(self.list_url)
        
        # Adjust based on your CORS configuration
        # self.assertIn('Access-Control-Allow-Origin', response)


class TestAPIPagination(GroceryItemAPITestCase):
    """Test pagination if implemented"""
    
    def test_pagination_with_many_items(self):
        """Test pagination when there are many items"""
        # Create many items
        for i in range(50):
            GroceryItem.objects.create(name=f"Test Item {i}")
        
        response = self.client.get(self.list_url)
        
        # Adjust assertions based on your pagination implementation
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Add specific pagination tests based on your setup


class TestAPIAuthentication(GroceryItemAPITestCase):
    """Test authentication if implemented"""
    
    def test_unauthenticated_access(self):
        """Test API access without authentication"""
        # This test depends on whether your API requires authentication
        # Adjust based on your authentication requirements
        
        response = self.client.get(self.list_url)
        
        # If authentication is required:
        # self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # If authentication is not required:
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TestAPIPerformance(GroceryItemAPITestCase):
    """Test API performance aspects"""
    
    def test_response_time_reasonable(self):
        """Test that API responses are reasonably fast"""
        import time
        
        start_time = time.time()
        response = self.client.get(self.list_url)
        end_time = time.time()
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLess(end_time - start_time, 1.0)  # Should respond within 1 second
    
    def test_handles_concurrent_requests(self):
        """Test that API can handle concurrent requests"""
        from concurrent.futures import ThreadPoolExecutor
        
        def make_request():
            return self.client.get(self.list_url)
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [future.result() for future in futures]
        
        for response in responses:
            self.assertEqual(response.status_code, status.HTTP_200_OK)


# Additional utility methods for test setup
class TestDataFactory:
    """Factory for creating test data"""
    
    @staticmethod
    def create_grocery_item(name="Test Item", bought=False):
        """Create a test grocery item"""
        return GroceryItem.objects.create(name=name, bought=bought)
    
    @staticmethod
    def create_multiple_items(count=5, bought_ratio=0.5):
        """Create multiple test items with specified bought ratio"""
        items = []
        for i in range(count):
            bought = i < (count * bought_ratio)
            items.append(
                GroceryItem.objects.create(
                    name=f"Test Item {i+1}",
                    bought=bought
                )
            )
        return items