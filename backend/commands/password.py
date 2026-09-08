"""Random password generation and the interactive CLI command."""

import secrets
import string
from datetime import UTC, datetime


def generate_random_password(length: int, digits: str, letters: str, punctuation: str) -> str:
    """Return a random password from the supplied character sets."""
    return "".join(
        secrets.choice(digits + letters + punctuation) for _ in range(length)
    )


def prompt_character_options() -> tuple[str, str, str]:
    """Ask which character types to include and return the y/n answers."""

    digits = input("Include digits ? (y/n) ")
    letters = input("Include letters ? (y/n) ")
    punctuation = input("Include punctuation ? (y/n) ")

    return digits, letters, punctuation


def run_password_cli() -> None:
    """Prompt for options, validate answers, generate a password and save it to a file."""

    length = int(input("Length ? default = 12 ") or 12)
    digits, letters, punctuation = prompt_character_options()

    while True:
        options = [digits, letters, punctuation]
        if not all(option in ["y", "n"] for option in options):
            print("Invalid input. Please enter 'y' or 'n' only. ")
        elif "y" not in options:
            print("Please answer 'y' to at least one option. ")
        else:
            break
        digits, letters, punctuation = prompt_character_options()

    if digits != "y":
        digits = ""
    else:
        digits = string.digits

    if letters != "y":
        letters = ""
    else:
        letters = string.ascii_letters

    if punctuation != "y":
        punctuation = ""
    else:
        punctuation = string.punctuation

    print(f"Generating password of length {length}...")
    password = generate_random_password(length, digits, letters, punctuation)


    filename = input("Filename ? default = password ") or "password"
    # Writing plain text to a file
    with open(f"passwords/{filename}.txt", "w", encoding="utf-8") as password_file:
        time = datetime.now(UTC)
        password_file.write(f"Password generated at {time}\n")
        password_file.write(f"Password: {password}")

    print(f"Password saved to passwords/{filename}.txt")
