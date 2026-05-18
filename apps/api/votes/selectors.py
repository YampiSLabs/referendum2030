from referendums.models import Referendum

from .models import VoterToken
from .security import hash_token


def get_token_for_update(*, referendum: Referendum, token: str) -> VoterToken:
    return VoterToken.objects.select_for_update().get(
        referendum=referendum,
        token_hash=hash_token(token),
    )

