from rest_framework import serializers
import base64, os
from django.conf import settings
from .models import User, Profile, Friendship

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'level', 'grade', 'campus']

class CustomUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'profile_picture', 'date_joined', 'profile', 'is_active', 'score']

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = CustomUserSerializer()
    to_user = CustomUserSerializer()

    class Meta:
        model = Friendship
        fields = ('id', 'from_user', 'to_user', 'created_at')

class FriendUserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'profile_picture', 'first_name', 'last_name']

    def get_profile_picture(self, obj):
        try:
            profile = Profile.objects.get(user=obj)
            if profile and profile.profile_picture:
                    return profile.profile_picture
            default_image_path = settings.DEFAULT_PROFILE_PICTURE_PATH
            if os.path.exists(default_image_path):
                with open(default_image_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    return f"data:image/jpeg;base64,{encoded_string}"
            return None
        except Profile.DoesNotExist:
            default_image_path = settings.DEFAULT_PROFILE_PICTURE_PATH
            if os.path.exists(default_image_path):
                with open(default_image_path, "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    return f"data:image/jpeg;base64,{encoded_string}"
            return None

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('profile_picture', 'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        profile_picture = validated_data.get('profile_picture')
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            profile_picture=profile_picture
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
