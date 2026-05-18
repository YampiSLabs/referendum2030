from rest_framework.routers import DefaultRouter

from .views import ReferendumViewSet

router = DefaultRouter()
router.trailing_slash = "/?"
router.register("referendums", ReferendumViewSet, basename="referendum")

urlpatterns = router.urls
