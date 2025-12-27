function CSelect(target, datalist=null) {
    return CustomSelect.init(target, datalist)
}

class CustomSelect {

    constructor(target) {
        if (target && target.tagName === 'SELECT') {
            this._init_custom_select(target)
        } else {
            if (target.classList.contains('custom-select')) {
                this.cselect = target
            } else {
                this.cselect = target.closest('.custom-select')
            }
        }
    }

    static init(target, datalist=null) {
        let cselect = new CustomSelect(target)
        if (datalist) {
            cselect.setData(datalist)
        }
        return cselect
    }

    _init_custom_select(target) {
        const id = target.id
        const name = target.name
        const disabled = target.ariaDisabled && target.ariaDisabled.toLowerCase() === 'true'
        const readonly = target.ariaReadOnly && target.ariaReadOnly.toLowerCase() === 'true'
        const placeholder = target.ariaPlaceholder || "Sélectionner une option"
        const label_text = target.ariaLabel || ''
        const html_template = `<div>
            <div class="select-box">
                <input type="text" class="selected-value" hidden/>
                <div class="input-group selected-option">
                    <button class="input-group-text ${label_text ? 'floating' : ''} clear" type="button"><i class="fa fa-close"></i></button>
                    ${label_text ? '<div class="form-floating">' : ''}
                        <input type="text" class="form-control" readonly/>
                    ${label_text ? '<label></label></div>' : ''}
                    
                    <button class="input-group-text dropdown" type="button"><i class="fa fa-chevron-down"></i></button>
                </div>
                <div class="options-list">
                    <div class="input-group search-box">
                        <input type="text" class="form-control" placeholder="Search..." />
                        <button type="button" class="input-group-text"><i class="fa fa-close"></i></button>
                    </div>
                    <div class="options"></div>
                    <div class="no-result-message">No result match</div>
                </div>
            </div>
        </div>`

        let template = document.createElement('template');
        template.innerHTML = html_template.trim();
        template = template.content.firstChild
        
        this.cselect = template
        target.replaceWith(template)
        
        this.cselect.id = id
        this.cselect.classList = target.classList

        let input = this.find('.selected-value')
        input.name = name

        input = this.find('.selected-option input')
        input.placeholder = placeholder
        
        if (label_text) {
            input.name = name+'_display'
            let label = this.find('.selected-option label')
            label.textContent = label_text
            label.htmlFor = input.name
        }

        this.find('.selected-option input').addEventListener('click', () => this.toggle())
        this.find('button.dropdown').addEventListener('click', () => this.toggle())
        this.find('button.clear').addEventListener('click', (e) => {
            e.preventDefault()
            this.select(null)
        }, false)
        this.find('.selected-option input').addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                this.open()
            }
        })
        this.find('.search-box input').addEventListener('input', (e) => { this.filterOptions(e.target.value)});
        this.find('.search-box button').addEventListener('click', () => this.resetFilter())
        // close when clicking outside
        document.addEventListener('click', (e)=>{ if(!this.cselect.contains(e.target)) this.close(); });

        this.setReadonly(readonly)
        this.setDisabled(disabled)
    }

    options() {
        return this.find('.options').children
    }

    find(query) {
        return this.cselect.querySelector(query)
    }

    name() {
        return this.find('.selected-value').name
    }

    isOpen() {
        return this.cselect.classList.contains('open')
    }

    open() {
        if (this.isReadonly() || this.isDisabled()) {
            return
        }
        this.cselect.classList.add('open')
        // this.highlightSelected()
        this.highlightFirst()
        this.find('.search-box input').focus()
        let chevron = this.find('.selected-option button.dropdown i')
        chevron.classList = ['fa fa-chevron-up']
    }

    close() {
        this.cselect.classList.remove('open')
        this.find('.search-box input').blur()
        this.resetFilter()
        let chevron = this.find('.selected-option button.dropdown i')
        chevron.classList = ['fa fa-chevron-down']
    }

    toggle(forceClose=false) {
        if (this.isOpen() || forceClose) {
            this.close()
        } else {
            this.open()
        }
    }

    highlightSelected() {
        // Focus on the selected element
        for (const option of this.options()) {
            if (option.classList.contains('active')) {
                option.scrollIntoView()
            }
        }
    }

    highlightFirst() {
        for (const option of this.options()) {
            option.scrollIntoView()
            break
        }
    }

    setData(datalist) {
        const options = this.find('.options')
        options.replaceChildren()
        datalist.forEach(([value, text]) => {
            const option = document.createElement('div');
            option.dataset.value = value
            option.classList.add('option')
            option.textContent = text;
            option.addEventListener('click', (evt) => {
                value = evt.target.dataset.value
                this.select(value)
            })
            options.appendChild(option);
        })
    }

    reset() {
        this.find('.selected-value').value = ''
        this.find('.selected-option input').value = this.isReadonly() ? " " : this.find('.selected-option input').getAttribute('placeholder')
    }

    select(selectedValue) {
        const oldValue = this.value()
        this.reset()
        for (const option of this.options()) {
            let value = option.dataset.value
            let text = option.textContent
            if (value == selectedValue) {
                option.classList.add('active')
                this.find('.selected-option input').value = text
                this.find('.selected-option input').title = text
                this.find('.selected-value').value = value
                this.close()
            } else {
                option.classList.remove('active')
            }
        }
        if (this.value() !== oldValue) {
            // Manually trigger change event
            let elt = this.find('.selected-value')
            elt.dispatchEvent(new Event('change', { bubbles: true }))
        }
    }

    value() {
        return this.find('.selected-value').value
    }

    text() {
        return this.find('.selected-option input').value
    }

    resetFilter() {
        this.find('.search-box input').value = ''
        this.filterOptions('')
        // this.highlightSelected()
        this.highlightFirst()
        this.find('.search-box input').focus({ preventScroll: true })
    }

    filterOptions(q){
      const val = q.trim().toLowerCase();
      let visible = 0
      const options = this.options()
      for (const option of options) {
        const text = option.textContent.toLowerCase();
        const vis = !val || text.includes(val)
        option.hidden = !vis
        if (vis) {
            visible++
        }
      };
      
      // If nothing is visible, display the No result match message
      this.find('.no-result-message').classList.toggle('d-none', visible)
    }

    isReadonly() {
        const aria = this.cselect.ariaReadOnly
        return aria && aria.toLowerCase() === 'true'
    }

    isDisabled() {
        const aria = this.cselect.ariaDisabled
        return aria && aria.toLowerCase() === 'true'
    }

    setReadonly(readonly) {
        this.cselect.ariaReadOnly = readonly
        // this.find('.selected-option input').classList.toggle('form-control-plaintext', !readonly)

        if (readonly) {
            this.close()
        }
        if (!this.value()) {
            this.find('.selected-option input').value = readonly ? " " : this.find('.selected-option input').getAttribute('placeholder')
        }
    }

    setDisabled(disabled) {
        this.cselect.ariaDisabled = disabled
        this.find('.selected-option input').disabled = disabled
        this.find('.selected-option button').disabled = disabled
        if (disabled) {
            this.close()
        }
    }

    addChangeListener(funct) {
        this.find('.selected-value').addEventListener('change', funct, false)
    }

}