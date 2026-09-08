def display_menu() -> None:
    """
    Menu displayed when start the program.

    Header: print "DEV TOOLBOX".

    Display menu: Menu option list.
    """

    print("=" * 25)
    print("DEV TOOLBOX".center(25))
    print("=" * 25)

    menu_list = [
        "Password Generator",
        "File Hash",
        "Weather",
        "Crypto",
        "GitHub",
        "Exit",
    ]

    menu_options = [f"{i + 1}- {item}" for i, item in enumerate(menu_list)]
    print(*menu_options, sep="\n")
