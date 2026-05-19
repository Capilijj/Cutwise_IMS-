from django.db import models

# Create your models here.
from django.db import models


class Transaction(models.Model):
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending',   'Pending'),
        ('Cancelled', 'Cancelled'),
    ]

    txn_id     = models.CharField(max_length=30, unique=True)
    customer   = models.CharField(max_length=255)
    item_type  = models.CharField(max_length=100)
    size       = models.CharField(max_length=100)
    quantity   = models.FloatField()
    unit_price = models.FloatField()
    total      = models.FloatField()
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Completed')
    timestamp  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']   # newest first by default

    def __str__(self):
        return f"{self.txn_id} — {self.customer}"