from django.contrib import admin
from .models import GroceryItem


@admin.register(GroceryItem)
class GroceryItemAdmin(admin.ModelAdmin):
    """Admin interface for GroceryItem model"""
    
    list_display = ['name', 'bought', 'created_at', 'updated_at']
    list_filter = ['bought', 'created_at']
    search_fields = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'bought')
        }),
        ('Timestamps', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset for admin list view"""
        return super().get_queryset(request).select_related()