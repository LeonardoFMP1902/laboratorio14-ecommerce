from django.db import models

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    descuento_porcentaje = models.IntegerField(default=0) # Marketing/Promociones
    stock = models.IntegerField(default=10) # Gestión de inventario
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    imagen_url = models.URLField(max_length=500, blank=True)

    @property
    def precio_final(self):
        if self.descuento_porcentaje > 0:
            return round(float(self.precio) * (1 - self.descuento_porcentaje / 100), 2)
        return float(self.precio)

    def __str__(self):
        return self.nombre