#ivoxprojects
import customtkinter, os, tkinter, shutil, ctypes
from tkinter import filedialog
from PIL import Image

customtkinter.set_appearance_mode("dark")


class App(customtkinter.CTk):
    WIDTH, HEIGHT = 600, 340

    def __init__(self):
        super(App, self).__init__()

        self.title("Startup Manager")
        self.iconbitmap(os.path.join("data", "icon.ico"))
        self.geometry(f"{App.WIDTH}x{App.HEIGHT}")
        self.resizable(False, False)
        self.path = os.path.expanduser(
            "~"
            + "\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\"
        )
        self.helpimage = customtkinter.CTkImage(
            Image.open(os.path.join("data", "helpicon.png"))
        )

        self.frame = customtkinter.CTkFrame(self)
        self.frame.pack(pady=10, padx=10, fill="both", expand=True)

        self.label1 = customtkinter.CTkLabel(
            self.frame, font=("Trebuchet MS", 25), text="Startup Applications"
        )
        self.label1.pack(pady=10, padx=15, anchor="nw")

        self.list = tkinter.Listbox(self.frame, bg="#2a2a2a", fg="#ffefeb")
        self.list.pack(padx=15, fill="x")
        self.list.bind("<<ListboxSelect>>", onselect)

        self.entry = customtkinter.CTkEntry(self.frame, font=("Trebuchet MS", 15))
        self.entry.pack(pady=15, padx=15, anchor="n", fill="x")

        self.button1 = customtkinter.CTkButton(
            self.frame,
            font=("Trebuchet MS", 16, "bold"),
            text="Add new",
            command=addNew,
            text_color="#eda850",
            hover=True,
            hover_color="black",
            height=40,
            width=120,
            border_width=2,
            corner_radius=20,
            border_color="#eda850",
            bg_color="#2c2c2c",
            fg_color="#2c2c2c",
        )
        self.button1.pack(side="left", padx=15, anchor="n")

        self.button2 = customtkinter.CTkButton(
            self.frame,
            font=("Trebuchet MS", 16, "bold"),
            text="Remove",
            command=remove,
            text_color="#c75d55",
            hover=True,
            hover_color="black",
            height=40,
            width=120,
            border_width=2,
            corner_radius=20,
            border_color="#c75d55",
            bg_color="#2c2c2c",
            fg_color="#2c2c2c",
        )
        self.button2.pack(side="left", anchor="n")

        self.button3 = customtkinter.CTkButton(
            self.frame,
            text="",
            image=self.helpimage,
            fg_color="#2c2c2c",
            width=25,
            hover_color="#6a6a6a",
            command=lambda: ctypes.windll.user32.MessageBoxW(
                0,
                "Select which programs should open "
                "up on pc startup, use the listbox "
                "to select files and get their path"
                " or remove them.\nYou can add new"
                " programs with the Add New button",
                "Startup Manager Help",
                0,
            ),
        )
        self.button3.pack(anchor="se", side="bottom")


def updateList():
    app.list.delete(0, "end")
    for file in os.listdir(app.path):
        app.list.insert("end", file)

        if file == "desktop.ini":
            app.list.delete(app.list.get(0, "end").index(file))


def addNew():
    file = filedialog.askopenfilename(initialdir="./", filetypes=[("All Files", "*")])
    try:
        shutil.copy(file, app.path)
        updateList()
    except Exception as e:
        ctypes.windll.user32.MessageBoxW(0, str(e), "Startup Manager Error", 0)


def remove():
    for i in app.list.curselection():
        selected = app.path + app.list.get(i)
        print(selected)

        try:
            os.remove(selected)
        except Exception as e:
            ctypes.windll.user32.MessageBoxW(0, str(e), "Startup Manager Error", 0)
        updateList()


def onselect(evt):
    try:
        w = evt.widget
        index = int(w.curselection()[0])
        value = w.get(index)

        app.entry.delete(0, "end")
        app.entry.insert("end", app.path + value)
    except:
        pass


if __name__ == "__main__":
    app = App()
    updateList()
    app.mainloop()
