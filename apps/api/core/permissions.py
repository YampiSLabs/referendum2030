from constance import config
from rest_framework.permissions import SAFE_METHODS, BasePermission


class DemoWritePermission(BasePermission):
    message = "Demo voting is temporarily disabled."

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return bool(config.DEMO_VOTING_ENABLED)

