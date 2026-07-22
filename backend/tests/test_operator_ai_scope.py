from app.services.ai_assistant_service import should_restrict_operator_message


def test_restricts_non_operations_requests():
    assert should_restrict_operator_message("show finance report") == (
        "Access Restricted: Operator access is limited to Production and Attendance modules."
    )


def test_allows_operations_requests():
    assert should_restrict_operator_message("show machine status") is None
    assert should_restrict_operator_message("today's work orders") is None
    assert should_restrict_operator_message("my attendance") is None
