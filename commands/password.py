"""Password generation module/command."""

import secrets
import string
from datetime import UTC, datetime


def password_options() -> tuple[str, str, str]:
    """Prompt the user for password options and return them as a tuple."""

    digits = input("Include digits ? (y/n) ")
    letters = input("Include letters ? (y/n) ")
    punctuation = input("Include punctuation ? (y/n) ")

    return digits, letters, punctuation


def password_generator() -> str | None:
    """Generate a password based on the user's options and print it."""

    length = int(input("Length ? default = 12 ") or 12)
    digits, letters, punctuation = password_options()

    while True:
        options = [digits, letters, punctuation]
        if not all(option in ["y", "n"] for option in options):
            print("Invalid input. Please enter 'y' or 'n' only. ")
        elif "y" not in options:
            print("Please answer 'y' to at least one option. ")
        else:
            break
        digits, letters, punctuation = password_options()

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
    password = "".join(
        secrets.choice(digits + letters + punctuation) for _ in range(length)
    )


    file_name_counting = input("Filename ? default = password ") or "password"
    # Writing plain text to a file
    with open(f"passwords/{file_name_counting}.txt", "w", encoding="utf-8") as password_file:
        time = datetime.now(UTC)
        password_file.write(f"Password generated at {time}\n")
        password_file.write(f"Password: {password}")

    return print(f"Password saved to passwords/{file_name_counting}.txt")
