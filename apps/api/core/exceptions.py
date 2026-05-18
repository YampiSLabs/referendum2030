from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class Conflict(APIException):
    status_code = 409
    default_detail = "Conflict."
    default_code = "conflict"


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    if isinstance(response.data, dict):
        detail = response.data.get("detail", response.data)
    else:
        detail = response.data

    response.data = {
        "message": str(detail) if not isinstance(detail, dict | list) else "Validation error.",
        "details": response.data,
        "status_code": response.status_code,
    }
    return response
