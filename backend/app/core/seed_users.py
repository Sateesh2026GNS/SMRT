"""Legacy user seeding helper.

The application no longer creates default demo accounts on startup.
Use the registration endpoint to create production user accounts.
"""


def seed_admin_user(db):
    """No-op seed helper for compatibility.

    User accounts are created via /auth/register or administrator user management.
    """
    return
