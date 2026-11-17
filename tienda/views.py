from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Producto, Categoria
from .serializers import ProductoSerializer, CategoriaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    # Funcionalidad de gestión de inventario (restar stock)
    @action(detail=True, methods=['post'])
    def comprar(self, request, pk=None):
        producto = self.get_object()
        cantidad = int(request.data.get('cantidad', 1))
        if producto.stock >= cantidad:
            producto.stock -= cantidad
            producto.save()
            return Response({'mensaje': 'Compra exitosa', 'stock_restante': producto.stock})
        return Response({'error': 'Stock insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

    # Sistema de recomendación de productos (misma categoría)
    @action(detail=True, methods=['get'])
    def recomendados(self, request, pk=None):
        producto = self.get_object()
        similares = Producto.objects.filter(categoria=producto.categoria).exclude(id=producto.id)[:3]
        serializer = self.get_serializer(similares, many=True)
        return Response(serializer.data)