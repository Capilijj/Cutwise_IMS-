from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sales.views import TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),   # → http://localhost:8000/api/transactions/
]