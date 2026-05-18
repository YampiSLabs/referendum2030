from rest_framework.throttling import ScopedRateThrottle


class DemoTokenRateThrottle(ScopedRateThrottle):
    scope = "demo_token"


class DemoVoteRateThrottle(ScopedRateThrottle):
    scope = "demo_vote"

