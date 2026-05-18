from rest_framework.response import Response


def ok(data: dict, status: int = 200) -> Response:
    return Response(data, status=status)

