from rest_framework import serializers
from .models import GroceryItem


class GroceryItemSerializer(serializers.ModelSerializer):
    """Serializer for GroceryItem model"""
    
    # Custom field name mapping for API response
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = GroceryItem
        fields = ['id', 'name', 'bought', 'createdAt']
        read_only_fields = ['id', 'createdAt']
    
    def validate_name(self, value):
        """Validate name field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Name cannot exceed 100 characters")
        
        return value.strip()
    
    def validate_bought(self, value):
        """Validate bought field"""
        if not isinstance(value, bool):
            raise serializers.ValidationError("Bought field must be a boolean value")
        
        return value
    
    def create(self, validated_data):
        """Create a new grocery item"""
        # Ensure bought defaults to False if not provided
        validated_data.setdefault('bought', False)
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Customize the serialized representation"""
        data = super().to_representation(instance)
        
        # Format datetime to ISO format with Z suffix
        if 'createdAt' in data and data['createdAt']:
            # Convert to ISO format with Z suffix for UTC
            from django.utils import timezone
            if hasattr(instance.created_at, 'isoformat'):
                data['createdAt'] = instance.created_at.isoformat().replace('+00:00', 'Z')
        
        return data


class GroceryItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating grocery items - only accepts name field"""
    
    class Meta:
        model = GroceryItem
        fields = ['name']
    
    def validate_name(self, value):
        """Validate name field"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        
        if len(value.strip()) > 100:
            raise serializers.ValidationError("Name cannot exceed 100 characters")
        
        return value.strip()
    
    def create(self, validated_data):
        """Create a new grocery item with default bought=False"""
        validated_data['bought'] = False
        return GroceryItem.objects.create(**validated_data)


class GroceryItemUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating grocery items - only accepts bought field"""
    
    bought = serializers.BooleanField(required=True)
    
    class Meta:
        model = GroceryItem
        fields = ['bought']
    
    def validate_bought(self, value):
        """Validate bought field"""
        if not isinstance(value, bool):
            raise serializers.ValidationError("Bought field must be a boolean value")
        
        return value
    
    def update(self, instance, validated_data):
        """Update only the bought field"""
        instance.bought = validated_data.get('bought', instance.bought)
        instance.save()
        return instance