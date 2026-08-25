import string
import secrets

def password_generator(
    #length: int,
    #symbols: bool,
    #numbers: bool,
    #uppercase: bool
) -> str | None:


    lenght = int(input("Length ? "))

    # password = string.ascii_lowercase
    test = secrets.randbelow(1)

    return print(test)
    
    # symbols = bool(input("Include symbols ? (y/n)"))
    # numbers = bool(input("Include numbers ? (y/n)"))
    # uppercase = bool(input("Include uppercase ? (y/n)"))

    