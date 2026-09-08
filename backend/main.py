from utils.input_choice import handle_menu_choice, user_choice
from utils.menu import display_menu


def main() -> None:
    """
    Run the Dev Toolbox CLI application.
    """

    display_menu()

    option_selected = user_choice()
    handle_menu_choice(option_selected)


if __name__ == "__main__":
    main()
