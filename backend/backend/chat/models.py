from django.db import models

# Create your models here.

class Message(models.Model):
    user = models.CharField(max_length=255)
    message = models.TextField()
    room = models.CharField(max_length=255, default="general")  # Oda adı
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user}: {self.message}'
