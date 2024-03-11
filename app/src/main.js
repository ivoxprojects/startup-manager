const listbox = document.getElementById("listbox")
const addBtn = document.getElementById("add-button")
const removeBtn = document.getElementById("remove-button")
const reloadBtn = document.getElementById("refresh-button")
const { ipcRenderer } = require("electron")

ipcRenderer.send("reload-list") // Populate list on app startup

document.addEventListener("keydown", (event) => { // Handle keyboard shortcuts
    if (event.key === "Delete") {
        const selectedOption = listbox.options[listbox.selectedIndex].text;
        ipcRenderer.send('remove-file', selectedOption);
        ipcRenderer.once("removed-file", () => {
            ipcRenderer.send("reload-list")
        })
    }

    if (event.ctrlKey && event.key === "r") {
        ipcRenderer.send("reload-list")
    }

    if (event.ctrlKey && event.key === "n") {
        ipcRenderer.send("open-filedialog")
    }
});

addBtn.addEventListener("click", () => {
    ipcRenderer.send("open-filedialog")
})

removeBtn.addEventListener("click", () => {
    const selectedOption = listbox.options[listbox.selectedIndex].text;
    ipcRenderer.send("remove-file", selectedOption)
    ipcRenderer.once("removed-file", () => {
        ipcRenderer.send("reload-list")
    })
})

reloadBtn.addEventListener("click", () => {
    ipcRenderer.send("reload-list")
})

ipcRenderer.on("purge-list", () => {
    for (option in listbox) {
        listbox.remove(option)
    }
})

ipcRenderer.on("append-list", (event, name, value) => {
    var option = document.createElement("option")
    option.text = name
    option.value = value
    listbox.add(option)
})
