from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display  = ('txn_id', 'customer', 'item_type', 'quantity', 'total', 'status', 'timestamp')
    list_filter   = ('status', 'item_type')
    search_fields = ('txn_id', 'customer')
    ordering      = ('-timestamp',)