"""Exercise the API contract and password constraints."""

import string
import unittest
from itertools import product
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


class PasswordApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_all_character_combinations(self):
        for flags in product((False, True), repeat=3):
            if not any(flags):
                continue
            with self.subTest(flags=flags):
                options = dict(zip(("digits", "letters", "punctuation"), flags))
                response = self.client.post(
                    "/api/passwords/generate", json={"length": 24, **options}
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["cache-control"], "no-store")
                password = response.json()["password"]
                self.assertEqual(len(password), 24)
                groups = [
                    group
                    for enabled, group in zip(
                        flags, (string.digits, string.ascii_letters, string.punctuation)
                    )
                    if enabled
                ]
                self.assertTrue(set(password) <= set("".join(groups)))

    def test_invalid_requests(self):
        for options in [
            {"digits": False, "letters": False, "punctuation": False},
            {"length": 0},
            {"length": -1},
            {"length": 129},
            {"length": "12"},
            {"digits": "yes"},
        ]:
            with self.subTest(options=options):
                self.assertEqual(
                    self.client.post(
                        "/api/passwords/generate", json=options
                    ).status_code,
                    422,
                )

    def test_defaults_and_health(self):
        self.assertEqual(
            len(
                self.client.post("/api/passwords/generate", json={}).json()["password"]
            ),
            16,
        )
        self.assertEqual(self.client.get("/api/health").json(), {"status": "ok"})

    def test_api_uses_original_command_algorithm(self):
        with patch("commands.password.secrets.choice", return_value="a") as choice:
            response = self.client.post("/api/passwords/generate", json={"length": 4})
        self.assertEqual(response.json(), {"password": "aaaa"})
        self.assertEqual(choice.call_count, 4)
        choice.assert_called_with(
            string.digits + string.ascii_letters + string.punctuation
        )

    def test_single_character_with_all_types_enabled(self):
        response = self.client.post("/api/passwords/generate", json={"length": 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["password"]), 1)
