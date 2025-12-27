const carence_fields = {
    'carence_code' : {'required': true, 'key': 'code'},
    'carence_classification': {'key': 'classification', 'dropdown': true},
    'carence_description': {'key': 'description'},
    'carence_cause': {'key': 'cause'},
    'carence_responsable': {'key': 'responsable', 'dropdown': true},
    'carence_delai_fermeture': {'key': 'echeance'},
    'carence_date': {'key': 'date'},
    'carence_statut': {'key': 'statut', 'dropdown': true},
    'activity_code': {'key': 'activity_code', 'required': true}
}

const activity_fields = {
    'activity_code': {'key': 'code', 'required': true},
    'activity_type_eval': {'key': 'type_evaluation', 'dropdown': true},
    'activity_evaluateur': {'key': 'evaluateur', 'dropdown': true},
    'activity_lieu': {'key': 'lieu', 'dropdown': true},
    'activity_nature': {'key': 'nature', 'dropdown': true},
    'activity_date_debut': {'key': 'date_debut'},
    'activity_date_fin': {'key': 'date_fin'},
    'activity_description': {'key': 'description'}
}

const action_fields = {
    'action_code': {'key': 'code', 'required': true},
    'action_description': {'key': 'description'},
    'action_responsable': {'key': 'responsable', 'dropdown': true},
    'action_echeance': {'key': 'echeance'},
    'action_statut': {'key': 'statut', 'dropdown': true}
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-action-link').addEventListener('click', addActionRow, false);
    
    let cselect = CSelect(document.getElementById('activity'))
    cselect.addChangeListener((e) => {
        const cselect = CSelect(e.target)
        const activityCode = cselect.value();
        activity = null
        mode = 'edit'
        if (activityCode !== '__NEW__') {
            activity = dummyActivityByCode(activityCode);
            mode = 'view'
        } else {
            elt = document.getElementById('detail_activity');
            new bootstrap.Collapse(elt, { toggle: false }).show()
        }
        populateActivity(activity, mode);
    })

    cselect = CSelect(document.getElementById('activity_type_eval'))
    cselect.addChangeListener((e) => {
        const cselect = CSelect(e.target)
        const type_eval_code = cselect.value();
        
        // Automatically loading Nature and Evaluateur from default Type_Evaluation data when changing Type_Evaluation
        // Only when the Activity section of the form is not disabled
        if (!cselect.isDisabled()) {
            try {
                // let type_eval_data = getData('type_evaluation').find(te => te.code === type_eval_code)
                let type_eval_data = {
                    'nature': 'Externe',
                    'evaluateur': 'ANTIC'
                }
                if (type_eval_data) {
                    let elt = document.getElementById('activity_nature')
                    CSelect(elt).select(type_eval_data.nature)

                    elt = document.getElementById('activity_evaluateur')
                    CSelect(elt).select(type_eval_data.evaluateur)
                }
            } catch (e) {}
        }
    })

    document.getElementById('action-table').getElementsByTagName('tbody')[0].addEventListener('dblclick', function(e) {
            e.preventDefault()
            const row = e.target.closest('tr')
            if (row && row.getAttribute('mode') !== 'edit') {
                editActionRow(row, true)
            }
        }, false);
})

document.addEventListener('DOMContentLoaded', function() {
    data = getData('carence')
    populateForm(data);
});

document.getElementById('myForm').addEventListener('submit', handleFormSubmit, false);

function addActionRow(data, mode='edit') {
    const html_template = `
        <tr>
            <th scope="row" class="align-middle text-center">
              <input type="hidden" name="action_code">
              <span name="action_number"></span>
            </th>
            <td class="text-wrap">
              <span class="form-control-text" style="font-size : 0.875rem;" hidden></span>
              <textarea class="form-control form-control-sm" name="action_description" required></textarea>
            </td>
            <td>
              <select class="custom-select custom-select-sm" name="action_responsable"></select>
            </td>
            <td>
              <span class="form-control-text" style="font-size : 0.875rem;" hidden></span>
              <input type="date" class="form-control form-control-sm" name="action_echeance">
            </td>
            <td>
              <select class="custom-select custom-select-sm" name="action_statut"></select>
            </td>
            <td class="align-middle text-center">
              <button class="btn btn-sm btn-link p-0 edit-row-icon" title="Modifier l'action">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button class="btn btn-sm btn-link p-0 save-row-icon" title="Enregistrer la modification">
                <i class="fa-solid fa-save"></i>
              </button>
              <button class="btn btn-sm btn-link p-0 delete-row-icon" title="Supprimer l'action">
                <i class="fa-solid fa-circle-minus"></i>
              </button>
              <button class="btn btn-sm btn-link p-0 undelete-row-icon" title="Annuler la suppression">
                <i class="fa-solid fa-clock-rotate-left"></i>
              </button>
            </td>
        </tr>`

    let template = document.createElement('template');
    template.innerHTML = html_template.trim();
    template = template.content.firstChild
    
    const tbody = document.getElementById('action-table').getElementsByTagName('tbody')[0];
    const newRow = template

    const deleteButton = newRow.querySelector('.delete-row-icon');
    const editButton = newRow.querySelector('.edit-row-icon');
    const saveButton = newRow.querySelector('.save-row-icon');
    const undeleteButton = newRow.querySelector('.undelete-row-icon');
    undeleteButton.classList.add('d-none');

    deleteButton.addEventListener('click', deleteActionRow, false);
    editButton.addEventListener('click', e => {
        e.preventDefault()
        const row = e.target.closest('tr')
        editActionRow(row, true)
    }, false);
    saveButton.addEventListener('click', e => {
        e.preventDefault()
        const row = e.target.closest('tr')
        editActionRow(row, false)
    }, false);
    undeleteButton.addEventListener('click', undeleteActionRow, false);
    
    if (!data) {
        data = {}
    }
    if (!('number' in data)) {
        data['number'] = tbody.children.length + 1;
    }
    populateActionRow(newRow, data, mode)
    tbody.appendChild(newRow)
}

function editActionRow(row, edit) {
    const deleted = row.getAttribute('deleted')
    if (edit && deleted) {
        return
    }

    row.setAttribute('mode', edit ? 'edit' : 'view');
    row.querySelector('.edit-row-icon').classList.toggle('d-none', deleted || edit);
    row.querySelector('.save-row-icon').classList.toggle('d-none', deleted || !edit);

    for (const elt of row.querySelectorAll('[name]')) {
        const name = elt.name
        if (elt.tagName === 'SPAN' || name === 'action_code') {
            // Ignore the action_code and action_number elements
            continue
        }
        
        if (action_fields[name].dropdown) {
            CSelect(elt).setReadonly(!edit)
        } else {
            let text = elt.value
            if (elt.type === 'date') {
                text = elt.valueAsDate ? elt.valueAsDate.toLocaleDateString('fr') : '';
            }
            let span = elt.previousElementSibling
            elt.hidden = !edit
            span.textContent = text
            span.hidden = edit
        }
    }
}

function saveAllActionRows() {
    const tbody = document.getElementById('action-table').getElementsByTagName('tbody')[0];
    Array.from(tbody.children).forEach((row) => {
        editActionRow(row, false)
    });
}

function deleteActionRow(evt) {
    evt.preventDefault();
    const row = evt.target.closest('tr');
    editActionRow(row, false)
    action_code = row.querySelector('[name="action_code"]').value;
    if (action_code) {
        row.classList.add('text-decoration-line-through', 'text-danger');
        row.setAttribute('deleted', true);
        row.querySelector('.delete-row-icon').classList.add('d-none');
        row.querySelector('.edit-row-icon').classList.add('d-none');
        row.querySelector('.save-row-icon').classList.add('d-none');
        row.querySelector('.undelete-row-icon').classList.remove('d-none');
    }
    else {
        row.remove();
    }
}

function undeleteActionRow(evt) {
    evt.preventDefault();
    const row = evt.target.closest('tr');
    row.classList.remove('text-decoration-line-through')
    row.removeAttribute('deleted');
    row.querySelector('.delete-row-icon').classList.remove('d-none');
    row.querySelector('.edit-row-icon').classList.remove('d-none');
    row.querySelector('.save-row-icon').classList.add('d-none');
    row.querySelector('.undelete-row-icon').classList.add('d-none');
}

function populateActionRow(row, data, mode='edit') {
    for (const elt of row.querySelectorAll('[name]')) {
        const name = elt.name
        if (elt.tagName === 'SPAN') {
            if (elt.getAttribute('name') === 'action_number') {
                elt.textContent = data['number']
                continue
            }
        }
        const afield = action_fields[name]
        if (afield.dropdown) {
            CSelect(elt, getData(afield.key)).select(data[afield.key])
        }
        else {
            elt.value = data[afield.key] || ''
        }
    }
    editActionRow(row, mode==='edit')
}

function populateActionTable(dataList, mode='edit') {
    const tbody = document.getElementById('action-table').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    dataList.forEach((data, index) => {
        data['number'] = index + 1;
        addActionRow(data, mode);
    });
}

function populateActivity(data, mode='view') {
    if (!data) {
        data = {}
    }
    for (const field_name in activity_fields) {
        const field = activity_fields[field_name]
        let elt = document.querySelector(`[name='${field_name}']`)
        if (field.dropdown) {
            const cselect = CSelect(elt, getData(field.key))
            cselect.select(data[field.key])
            cselect.setDisabled(mode === 'view')
        }
        else {
            elt.value = data[field.key] || '';
            elt.toggleAttribute('readonly', mode === 'view')
            elt.toggleAttribute('disabled', mode === 'view')
        }
    }
}

function populateCarence(data) {
    const activity_code = data['activity_code']
    let elt = document.querySelector(`[name='activity_code']`);
    let activity_list = getData('activities').map(activity => [activity.code, `[${activity.code}] ${activity.description}`])
    activity_list = [['__NEW__', 'NOUVELLE ACTIVITE']].concat(activity_list)
    
    let cselect = CSelect(elt, activity_list)
    cselect.select(activity_code || '__NEW__')
    cselect.setDisabled(Boolean(activity_code))
    
    for (const field_name in carence_fields) {
        const field = carence_fields[field_name]
        let elt = document.querySelector(`[name='${field_name}']`)
        if (field.dropdown) {
            CSelect(elt, getData(field.key)).select(data[field.key])
        }
        else {
            elt.value = data[field.key] || ''
        }
    }
}

function populateForm(data) {
    if (!data) {
        data = {};
    }
    populateCarence(data)
    populateActionTable(data['actions'] || [], mode='view');
    
    // Initiate form default values to the values currently loaded
    initiateFormDefaultValues()
}

function initiateFormDefaultValues(emptyFields = false) {
    let elements = document.getElementById('myForm').elements
    for (const elt of elements) {
        if (!elt.name) {
            continue
        }
        initElementDefaultValue(elt, emptyFields)
    }

    actionTableRowElements().forEach(row => {
        for (const elt of row.elements) {
            initElementDefaultValue(elt)
        }
    })
}

function initElementDefaultValue(elt, empty_field=false) {
    switch (elt.tagName) {
        case 'INPUT':
        case 'TEXTAREA':
            switch (elt.type) {
                case 'radio':
                case 'checkbox':
                    elt.defaultChecked = empty_field ? false : elt.checked
                    break
                default:
                    elt.defaultValue = empty_field ? '' : elt.value
            }
            break
        case 'SELECT':
            elt.defaultSelected = empty_field ? '' : elt.options[elt.selectedIndex]
            break
    }
}

function actionTableRowElements() {
    const row_list = []
    const tbody = document.getElementById('action-table').getElementsByTagName('tbody')[0];
    Array.from(tbody.children).forEach((row) => {
        const elts = Array.from(row.querySelectorAll('[name]'))
        const code_elt = elts.find(elt => elt.name === 'action_code')
        row_list.push({
            'new': !Boolean(code_elt.value),
            'deleted': row.hasAttribute('deleted'),
            'elements': elts
        })
    })
    return row_list
}

function handleFormSubmit(evt) {
    evt.preventDefault();
    saveAllActionRows();
    
    let data = new FormData(evt.target)
    data = Object.fromEntries(data.entries())
    data['activity_code'] = document.querySelector(`[name='activity_code']`).value || null
    
    const changedRows = actionTableRowElements().filter(hasActionRowChanged)
    let actions = changedRows.map(row => {
        let action = {}
        row.elements.filter(elt => {
            const field = action_fields[elt.name]
            const fieldExist = Boolean(field)
            const isRequired = fieldExist && field.required
            const hasChanged = hasElementChanged(elt)
            const hasValue = Boolean(elt.value)
            return fieldExist && ((isRequired && hasValue) || (!row.deleted && hasChanged))
        }).forEach(elt => {
            const field = action_fields[elt.name]
            action[field.key] = elt.value
        })
        if (row.deleted) {
            action.deleted = true
        }
        return action
    })
    data['actions'] = actions
    saveCarence(data);
}

function hasActionRowChanged(row) {
    if (row.deleted || row.new) {
        return true
    }
    return row.elements.some(hasElementChanged)
}

function hasElementChanged(elt) {
    switch (elt.tagName) {
        case 'INPUT':
        case 'TEXTAREA':
            switch (elt.type) {
                case 'radio':
                case 'checkbox':
                    return elt.checked !== elt.defaultChecked
                default:
                    return elt.value !== elt.defaultValue
            }
        case 'SELECT':
            return elt.options[elt.selectedIndex] !== elt.defaultSelected
    }
    return false
}

function identifyFormChanges() {
    const changes = {}
    let elements = document.getElementById('myForm').elements
    for (const elt of elements) {
        if (elt.name) {
            changes[elt.name] = hasElementChanged(elt)
        }
    }
    return changes
}

function saveCarence(data) {
    let changes = identifyFormChanges()

    let activityData = {};
    if (data['activity_code'] === '__NEW__') {
        data['activity_code'] = null
        for (const [name, field] of Object.entries(activity_fields)) {
            activityData[field.key] = data[name]
        }
    }
    console.log(activityData);

    carenceData = {}
    for (const [name, field] of Object.entries(carence_fields)) {
        const hasValue = Boolean(data[name])
        const hasChanged = changes[name]
        if ((field.required && hasValue) || hasChanged) {
            carenceData[field.key] = data[name]
        }
    }
    console.log(carenceData);

    actionsData = data['actions']
    console.log(actionsData);
}