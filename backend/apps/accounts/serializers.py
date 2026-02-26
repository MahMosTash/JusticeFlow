"""
Serializers for accounts app (User, Role, Authentication).
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User, Role, RoleAssignment


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model."""
    
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoleAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for RoleAssignment model."""
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.filter(is_active=True),
        source='role',
        write_only=True
    )
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = RoleAssignment
        fields = ['id', 'user', 'user_username', 'role', 'role_id', 'assigned_at', 
                  'assigned_by', 'is_active']
        read_only_fields = ['id', 'assigned_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    roles = serializers.SerializerMethodField()
    role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.filter(is_active=True),
        many=True,
        write_only=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'national_id',
            'first_name', 'last_name', 'is_active', 'date_joined',
            'last_login', 'roles', 'role_ids'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True},
            'phone_number': {'required': True},
            'national_id': {'required': True},
        }
        
    def get_roles(self, obj):
        return RoleSerializer(obj.get_active_roles(), many=True).data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'phone_number', 'national_id',
            'first_name', 'last_name', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Assign default role: Basic User
        try:
            basic_user_role = Role.objects.get(name='Basic User')
            user.assign_role(basic_user_role)
        except Role.DoesNotExist:
            pass  # Role will be created via migration
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login (supports multiple identifiers)."""
    identifier = serializers.CharField(help_text="Username, email, phone number, or national ID")
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')
        
        if not identifier or not password:
            raise serializers.ValidationError("Both identifier and password are required.")
            
        identifier = identifier.strip()
        
        from django.db.models import Q
        user = User.objects.filter(
            Q(username__iexact=identifier) |
            Q(email__iexact=identifier) |
            Q(phone_number=identifier) |
            Q(national_id=identifier)
        ).first()
        
        if user and user.check_password(password):
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Invalid credentials.")


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for user with roles."""
    roles = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'national_id',
            'first_name', 'last_name', 'full_name', 'is_active',
            'date_joined', 'last_login', 'roles'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_roles(self, obj):
        return RoleSerializer(obj.get_active_roles(), many=True).data

