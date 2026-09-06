from commands.password import password_generator


def user_choice() -> int:
    """
    Prompt the user until a valid menu option is entered.
    """
    while True:
        try:
            option = int(input("Choose an option: "))
            return option
        except ValueError:
            print("Please enter a valid number.")


def handle_menu_choice(option_selected: int) -> None:
    """
    Verify that user choose a valid option.
    """
    match option_selected:
        case 1:
            print("Password Generator selected! ")
            password_generator()
        case 2:
            print("File Hash selected !")
        case 3:
            print("Weather selected !")
        case 0:
            print("See you later !")
        case _:
            print("Invalid option ")
