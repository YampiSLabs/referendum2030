from rest_framework import serializers


class TokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    valid = serializers.BooleanField()


class VoteCreateSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=12, trim_whitespace=True)
    option_id = serializers.IntegerField(min_value=1)


class VoteReceiptSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    receipt_code = serializers.CharField()
    registered_at = serializers.DateTimeField()

