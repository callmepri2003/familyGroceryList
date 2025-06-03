import uuid
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator


class GroceryItem(models.Model):
    """Model for grocery items"""
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    
    name = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(1, message="Name cannot be empty"),
            MaxLengthValidator(100, message="Name cannot exceed 100 characters")
        ],
        help_text="Name of the grocery item"
    )
    
    bought = models.BooleanField(
        default=False,
        help_text="Whether the item has been bought or not"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the item was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the item was last updated"
    )
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Grocery Item"
        verbose_name_plural = "Grocery Items"
    
    def __str__(self):
        status = "✓" if self.bought else "○"
        return f"{status} {self.name}"
    
    def save(self, *args, **kwargs):
        # Ensure name is not empty or None
        if not self.name or not self.name.strip():
            raise ValueError("Name cannot be empty")
        
        # Strip whitespace from name
        self.name = self.name.strip()
        
        super().save(*args, **kwargs)