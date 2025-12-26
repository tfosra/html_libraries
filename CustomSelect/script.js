document.addEventListener("DOMContentLoaded", () => {
    const customSelects = document.querySelectorAll('select.custom-select')
    customSelects.forEach(elt => {
        cselect = CustomSelect.init(elt, dummy_data())
        cselect.select('cm')
    })
})