from collections.abc import Callable

from django.http import HttpRequest, HttpResponse


class DemoProjectHeaderMiddleware:
    """Expose clear machine-readable disclaimer for this fictitious demo API."""

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        response.headers.setdefault("X-Referendum-2030-Demo", "fictitious-no-legal-validity")
        return response

