from constance import config
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.serializers import CharField, Serializer
from rest_framework.views import APIView

from audit.models import AuditEvent
from audit.selectors import public_audit_events
from audit.serializers import AuditEventSerializer
from audit.services import record_event
from core.permissions import DemoWritePermission
from core.throttling import DemoTokenRateThrottle, DemoVoteRateThrottle
from votes.serializers import TokenResponseSerializer, VoteCreateSerializer, VoteReceiptSerializer
from votes.services import cast_demo_vote, issue_demo_token

from .selectors import current_referendum_queryset, referendum_queryset
from .serializers import ReferendumSerializer
from .services import build_results_payload


class HealthCheckSerializer(Serializer):
    status = CharField()


@extend_schema(responses=HealthCheckSerializer)
class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok"})


class ReferendumViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReferendumSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    lookup_value_regex = "[-a-zA-Z0-9_]+"

    def get_queryset(self):
        return referendum_queryset()

    @action(detail=False, methods=["get"], url_path="current")
    def current(self, request):
        referendum = current_referendum_queryset().first()
        if referendum is None:
            raise NotFound("Current referendum not found.")
        return Response(self.get_serializer(referendum).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[DemoWritePermission],
        throttle_classes=[DemoTokenRateThrottle],
        url_path="tokens",
    )
    def tokens(self, request, slug=None):
        payload = issue_demo_token(referendum=self.get_object())
        return Response(TokenResponseSerializer(payload).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[DemoWritePermission],
        throttle_classes=[DemoVoteRateThrottle],
        url_path="votes",
    )
    def votes(self, request, slug=None):
        serializer = VoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = cast_demo_vote(
            referendum=self.get_object(),
            token=serializer.validated_data["token"],
            option_id=serializer.validated_data["option_id"],
            request=request,
        )
        return Response(VoteReceiptSerializer(payload).data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[DemoWritePermission],
        throttle_classes=[DemoVoteRateThrottle],
        url_path="vote",
    )
    def vote_alias(self, request, slug=None):
        return self.votes(request, slug=slug)

    @action(detail=True, methods=["get"], url_path="results")
    def results(self, request, slug=None):
        if not config.PUBLIC_RESULTS_ENABLED:
            raise PermissionDenied("Public results are temporarily disabled.")
        referendum = self.get_object()
        record_event(
            referendum=referendum,
            event_type=AuditEvent.RESULTS_VIEWED,
            public_message="S'han consultat els resultats agregats.",
        )
        return Response(build_results_payload(referendum))

    @action(detail=True, methods=["get"], url_path="logs")
    def logs(self, request, slug=None):
        events = public_audit_events(self.get_object())
        return Response(AuditEventSerializer(events, many=True).data)

    @action(detail=True, methods=["get"], url_path="audit")
    def audit_alias(self, request, slug=None):
        return self.logs(request, slug=slug)
