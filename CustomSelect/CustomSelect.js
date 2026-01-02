function CSelect(target, datalist=null) {
    return CustomSelect.init(target, datalist)
}

function equal(a, b) {
    if (!a || !b || typeof a !== typeof b || a.length !== b.length) {
        return false
    }
    if (Array.isArray(a)) {
        return a.every(elt => b.includes(a))
    }
    return a === b
}

function split_trim(value, separator=',') {
    if (Array.isArray(value)) {
        return value
    }
    return value ? value.split(separator).map(t => t.trim()) : []
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
        const multiselect = target.ariaMultiSelectable && target.ariaMultiSelectable.toLowerCase() === 'true'
        const placeholder = target.ariaPlaceholder || "Sélectionner..."
        const label_text = target.ariaLabel || ''
        const html_template = `<div>
            <div class="select-box">
                <input type="text" class="selected-value" hidden/>
                <div class="selected-option">
                    ${label_text ? '<label class="label-floating"></label>' : ''}
                    <div class="d-flex align-middle pt-1">
                        <button class="input-group-text clear" type="button"><i class="fa fa-close"></i></button>
                        <span class="display-span d-flex flex-fill flex-wrap"></span>
                        ${multiselect ? '<div class="span-group d-flex flex-fill flex-wrap"></div>' : ''}
                        <button class="input-group-text dropdown" type="button"><i class="fa fa-chevron-down"></i></button>
                    </div>
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
        this.cselect.classList.add('empty')

        let input = this.find('.selected-value')
        input.name = name

        let display_span = this.find('.display-span')
        display_span.textContent = placeholder
        display_span.dataset.placeholder = placeholder
        
        if (label_text) {
            let label = this.find('.select-box label')
            label.textContent = label_text
        }
        this.find('button.clear').hidden = true

        this.find('.display-span').addEventListener('click', () => this.toggle())
        if (multiselect) {
            this.find('.span-group').addEventListener('click', () => this.toggle())
        }
        this.find('button.dropdown').addEventListener('click', () => this.toggle())
        this.find('button.clear').addEventListener('click', (e) => this.select(null))
        this.find('.search-box input').addEventListener('input', (e) => { this.filterOptions(e.target.value)});
        this.find('.search-box button').addEventListener('click', () => this.resetFilter())
        // close when clicking outside
        document.addEventListener('click', (e)=>{ if(!this.cselect.contains(e.target)) this.close(); });

        this.setReadonly(readonly)
        this.setDisabled(disabled)
        this.multiselect = multiselect
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
        this.filterOptions('')
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
        if (forceClose || this.isOpen()) {
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
                if (this.multiselect) {
                    this.add_tag(value)
                } else {
                    this.select(value)
                }
            })
            options.appendChild(option);
        })
    }

    reset() {
        let display_span = this.find('.display-span')
        this.find('.selected-value').value = ''
        if (this.multiselect) {
            this.find('.span-group').replaceChildren()
            display_span.classList.remove('d-none')
        }
        display_span.textContent = this.isReadonly() ? "" : display_span.dataset.placeholder
    }

    handle_empty() {
        // Display or hide the clear button
        this.find('button.clear').hidden = this.is_empty()
        let span = this.find('.display-span')
        if (this.multiselect) {
            span.classList.toggle('d-none', !this.is_empty())
        }
        this.cselect.classList.toggle('empty', this.is_empty())
    }

    is_empty() {
        let values = this.value()
        if (this.multiselect) {
            return !values.length
        }
        return !values
    }

    add_tag(tag_value, trigger_change=true) {
        if (!this.multiselect) {
            return
        }
        let selected_values = this.value()
        for (const option of this.options()) {
            if (option.classList.contains('active')) {
                continue
            }
            let value = option.dataset.value
            let text = option.textContent
            if (value === tag_value) {
                option.classList.add('active')
                selected_values.push(value)
                this.find('.selected-value').value = selected_values.join(', ')

                let span = document.createElement('span')
                span.classList.add('tag')
                span.textContent = text
                span.title = text
                span.dataset.value = value
                this.find('.span-group').appendChild(span)

                let remove_tag = document.createElement('i')
                remove_tag.classList = ['fa fa-times remove-tag']
                remove_tag.addEventListener('click', e => {
                    let tag = e.target.closest('.tag')
                    const value = tag.dataset.value
                    this.remove_tag(value)
                })
                span.appendChild(remove_tag)
            }
        }
        this.handle_empty()
        if (trigger_change) {
            this.triggerChange()
        }
    }

    remove_tag(tag_value) {
        if (!this.multiselect) {
            return
        }
        let selected_values = this.value()
        for (const option of this.options()) {
            if (!option.classList.contains('active')) {
                continue
            }
            let value = option.dataset.value
            if (value === tag_value) {
                option.classList.remove('active')
                selected_values = selected_values.filter(v => v !== value)
                this.find('.selected-value').value = selected_values.join(', ')

                let tags = this.find('.span-group').children
                for (const tag of tags) {
                    if (tag.dataset.value === value) {
                        tag.remove()
                    }
                }
            }
        }
        this.handle_empty()
        this.triggerChange()
    }

    select(selectedValues) {
        let oldValues = this.value()
        selectedValues = split_trim(selectedValues)
        this.reset()
        for (const option of this.options()) {
            let value = option.dataset.value
            let text = option.textContent
            if (selectedValues.includes(value)) {
                if (this.multiselect) {
                    this.add_tag(value, false)
                } else {
                    this.find('.selected-value').value = value
                    this.find('.display-span').textContent = text
                    option.classList.add('active')
                }
            } else {
                option.classList.remove('active')
            }
        }
        this.close()
        let newValues = this.value()
        if (!equal(newValues, oldValues)) {
            // Manually trigger change event
            let elt = this.find('.selected-value')
            elt.dispatchEvent(new Event('change', { bubbles: true }))
        }
        
        this.handle_empty()
    }

    value() {
        let value = this.find('.selected-value').value
        if (this.multiselect) {
            value = split_trim(value)
        }
        return value
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
        if (this.is_empty()) {
            let display_span = this.find('.display-span')
            display_span.textContent = readonly ? "" : display_span.dataset.placeholder
        }
    }

    setDisabled(disabled) {
        this.cselect.ariaDisabled = disabled
        // this.find('.selected-option input').disabled = disabled
        this.find('.selected-option button').disabled = disabled
        if (disabled) {
            this.close()
        }
    }

    addChangeListener(funct) {
        this.find('.selected-value').addEventListener('change', funct, false)
    }

    triggerChange() {
        const elt = this.find('.selected-value')
        elt.dispatchEvent(new Event('change', {bubbles: true}))
    }

}