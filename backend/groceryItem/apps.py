from django.apps import AppConfig


class GroceryConfig(AppConfig):
    """Configuration for the grocery app"""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'groceryItem'  # Replace with your actual app name
    verbose_name = 'Grocery Items'
    
    def ready(self):
        """Initialize app when Django starts"""
        pass