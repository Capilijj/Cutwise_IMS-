from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, serializers
from .models import Transaction


# --- Serializer (converts model <-> JSON) ---

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Transaction
        fields = '__all__'


# --- ViewSet (handles GET / POST / PUT / DELETE automatically) ---

class TransactionViewSet(viewsets.ModelViewSet):
    queryset           = Transaction.objects.all()
    serializer_class   = TransactionSerializer