from rest_framework import serializers


class TokenResponseSerializer(serializers.Serializer):
    """Returned after successfully issuing a demo token."""

    token = serializers.CharField()
    valid = serializers.BooleanField()


class VoteCreateSerializer(serializers.Serializer):
    """Deserialises the incoming vote request body."""

    token = serializers.CharField(min_length=12, trim_whitespace=True)
    option_id = serializers.IntegerField(min_value=1)


class VoteReceiptSerializer(serializers.Serializer):
    """Returned after a successful vote — includes the public receipt code."""

    success = serializers.BooleanField()
    receipt_code = serializers.CharField()
    registered_at = serializers.DateTimeField()

