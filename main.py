from utils.menu import display_menu
from utils.input_choice import user_choice, handle_menu_choice
def main() -> None:
    """
    Run the Dev Toolbox CLI application.
    """
    
    display_menu()
    
    option_selected = user_choice()
    handle_menu_choice(option_selected)

if __name__ == "__main__":
    main()