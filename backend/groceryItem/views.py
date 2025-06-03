import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.core.exceptions import ValidationError
from .models import GroceryItem
from .serializers import (
    GroceryItemSerializer, 
    GroceryItemCreateSerializer, 
    GroceryItemUpdateSerializer
)

logger = logging.getLogger(__name__)


class GroceryItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing grocery items
    
    Provides CRUD operations:
    - GET /items/ - List all items
    - POST /items/ - Create new item
    - GET /items/{id}/ - Retrieve specific item
    - PATCH /items/{id}/ - Update item status
    - DELETE /items/{id}/ - Delete item
    """
    
    queryset = GroceryItem.objects.all().order_by('created_at')
    serializer_class = GroceryItemSerializer
    lookup_field = 'pk'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return GroceryItemCreateSerializer
        elif self.action == 'partial_update':
            return GroceryItemUpdateSerializer
        return GroceryItemSerializer
    
    def list(self, request, *args, **kwargs):
        """
        GET /items/
        Retrieve all grocery items
        """
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving grocery items: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request, *args, **kwargs):
        """
        POST /items/
        Create a new grocery item
        """
        try:
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                item = serializer.save()
                
                # Return the created item using the display serializer
                response_serializer = GroceryItemSerializer(item)
                return Response(
                    response_serializer.data, 
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating grocery item: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, pk=None):
        """
        GET /items/{id}/
        Retrieve a specific grocery item
        """
        try:
            item = get_object_or_404(GroceryItem, pk=pk)
            serializer = self.get_serializer(item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Http404:
            return Response(
                {"error": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error retrieving grocery item {pk}: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, pk=None):
        """
        PATCH /items/{id}/
        Update grocery item status (bought field only)
        """
        try:
            item = get_object_or_404(GroceryItem, pk=pk)
            serializer = self.get_serializer(item, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_item = serializer.save()
                
                # Return the updated item using the display serializer
                response_serializer = GroceryItemSerializer(updated_item)
                return Response(
                    response_serializer.data, 
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Http404:
            return Response(
                {"error": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error updating grocery item {pk}: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, pk=None):
        """
        DELETE /items/{id}/
        Delete a grocery item
        """
        try:
            item = get_object_or_404(GroceryItem, pk=pk)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Http404:
            return Response(
                {"error": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting grocery item {pk}: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, pk=None):
        """
        PUT /items/{id}/
        Full update not allowed - return 405 Method Not Allowed
        """
        return Response(
            {"error": "Method not allowed"},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def get_object(self):
        """
        Override to handle invalid UUIDs gracefully
        """
        try:
            return super().get_object()
        except (ValueError, ValidationError):
            raise Http404("Invalid item ID format")