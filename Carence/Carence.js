
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-action-link').addEventListener('click', addActionRow, false);
    
    let cselect = CustomSelect.init(document.getElementById('activity'))
    cselect.addChangeListener((e) => {
        const cselect = CustomSelect.init(e.target)
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

    cselect = CustomSelect.init(document.getElementById('activity_type_eval'))
    cselect.addChangeListener((e) => {
        const cselect = CustomSelect.init(e.target)
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
                    CustomSelect.init(elt).select(type_eval_data.nature)

                    elt = document.getElementById('activity_evaluateur')
                    CustomSelect.init(elt).select(type_eval_data.evaluateur)
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
    data = dummyCarence()
    populateForm(data);
});

document.getElementById('myForm').addEventListener('submit', handleFormSubmit, false);

function addActionRow(data, mode='edit') {
    const html_template = `
        <tr>
            <th scope="row" class="align-middle text-center">
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
              <select class="custom-select custom-select-sm" name="action_sous_processus"></select>
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
    if (edit && row.getAttribute('deleted')) {
        return
    }

    row.setAttribute('mode', edit ? 'edit' : 'view');
    row.querySelector('.edit-row-icon').classList.toggle('d-none', edit);
    row.querySelector('.save-row-icon').classList.toggle('d-none', !edit);

    const inputs_and_textareas = ['action_description', 'action_echeance']
    const custom_inputs = ['action_responsable', 'action_sous_processus', 'action_statut']

    for (const name of inputs_and_textareas) {
        let elt = row.querySelector(`[name='${name}']`)
        let text = elt.value
        if (elt.type === 'date') {
            text = elt.valueAsDate ? elt.valueAsDate.toLocaleDateString('fr') : '';
        }
        let span = elt.previousElementSibling
        elt.hidden = !edit
        span.textContent = text
        span.hidden = edit
    }

    for (const name of custom_inputs) {
        let elt = row.querySelector(`[name='${name}']`)
        CustomSelect.init(elt).setReadonly(!edit)
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
    action_code = row.querySelector('[name="action_number"]').id;
    if (action_code) {
        row.classList.add('text-decoration-line-through', 'text-danger');
        row.setAttribute('deleted', 'deleted');
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
    let elt = row.querySelector('[name="action_number"]')
    elt.textContent = data['number'] || '';
    elt.id = data['action_code'] || '';

    elt = row.querySelector('[name="action_description"]')
    elt.value = data['description'] || ''
    
    elt = row.querySelector('[name="action_echeance"]')
    elt.value = data['echeance']

    elt = row.querySelector('[name="action_responsable"]')
    CustomSelect.init(elt, dummyResponsables()).select(data['responsable'])
    
    elt = row.querySelector('[name="action_sous_processus"]')
    CustomSelect.init(elt, dummySousProcessus()).select(data['sous_processus'])
    
    elt = row.querySelector('[name="action_statut"]')
    CustomSelect.init(elt, dummyStatut()).select(data['statut'])

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
    selects = [
        ['activity_type_eval', dummyTypeEvaluation, 'type_evaluation'],
        ['activity_evaluateur', dummyEvaluateur, 'evaluateur'],
        ['activity_lieu', dummyLieu, 'lieu'],
        ['activity_nature', dummyNature, 'nature']
    ]
    inputs = [
        ['activity_date_debut', 'date_debut'],
        ['activity_date_fin', 'date_fin'],
        ['activity_description', 'description']
    ]

    selects.forEach(([eltId, dataFunc, dataKey]) => {
        let elt = document.getElementById(eltId);
        let cselect = CustomSelect.init(elt, dataFunc())
        cselect.select(data[dataKey])
        cselect.setDisabled(mode === 'view')
    });

    inputs.forEach(([eltId, dataKey]) => {
        let elt = document.getElementById(eltId);
        elt.value = data[dataKey] || '';
        elt.toggleAttribute('readonly', mode === 'view')
        elt.toggleAttribute('disabled', mode === 'view')
    })
}

function populateCarence(data) {
    let elt = document.getElementById('activity');

    activityList = dummyActivities().map(activity => [activity.code, `[${activity.code}] ${activity.description}`])
    cselect = CustomSelect.init(elt, [['__NEW__', 'NOUVELLE ACTIVITE']].concat(activityList))
    cselect.select(data['activity_code'] || '__NEW__')
    if (data['activity_code']) {
        elt.setAttribute('disabled', null)
    } else {
        elt.removeAttribute('disabled')
    }

    const inputs = [
        ['carence_code', 'code'],
        ['carence_description', 'description'],
        ['carence_cause', 'cause'],
        ['carence_date', 'date'],
        ['carence_delai_fermeture', 'delai_fermeture']
    ]

    const selects = [
        ['carence_classification', dummyClassification, 'classification'],
        ['carence_responsable', dummyResponsables, 'responsable'],
        ['carence_statut', dummyStatut, 'statut']
    ]

    inputs.forEach(([eltId, dataKey]) => {
        let elt = document.getElementById(eltId);
        elt.value = data[dataKey] || '';
    })

    selects.forEach(([eltId, dataFunc, dataKey]) => {
        let elt = document.getElementById(eltId);
        let cselect = CustomSelect.init(elt, dataFunc())
        cselect.select(data[dataKey])
    })
}

function populateForm(data) {
    if (!data) {
        data = {};
    }
    populateCarence(data)
    populateActionTable(data['actions'] || [], mode='view');
}

function handleFormSubmit(evt) {
    evt.preventDefault();
    saveAllActionRows();
    
    data = new FormData(evt.target);
    actions = [];
    const tbody = document.getElementById('action-table').getElementsByTagName('tbody')[0];
    Array.from(tbody.children).forEach((row) => {
        action = {};
        action['code'] = row.querySelector('[name="action_number"]').id || null;
        if (!row.getAttribute('deleted')) {
            action['description'] = row.querySelector('[name="action_description"]').value || '';
            action['echeance'] = row.querySelector('[name="action_echeance"]').value || '';
            action['responsable'] = CustomSelect.init(row.querySelector('[name="action_responsable"]')).value();
            // action['sous_processus'] = row.querySelector('[name="action_sous_processus"]').getAttribute('value') || '';
            action['statut'] = CustomSelect.init(row.querySelector('[name="action_statut"]')).value();
        } else {
            action['deleted'] = true;
        }
        actions.push(action);
    });
    data = Object.fromEntries(data.entries());
    data['actions'] = actions;
    saveCarence(data);
}

function saveCarence(data) {
    activityData = {};
    if (data['activity_code'] === '__NEW__') {
        activityData['type_evaluation'] = data['activity_type_eval'];
        activityData['evaluateur'] = data['activity_evaluateur'];
        activityData['lieu'] = data['activity_lieu'];
        activityData['nature'] = data['activity_nature'];
        activityData['date_debut'] = data['activity_date_debut'];
        activityData['date_fin'] = data['activity_date_fin'];
        activityData['description'] = data['activity_description'];
    }
    console.log(activityData);
    
    CarenceData = {
        'code': data['carence_code'],
        'classification': data['carence_classification'],
        'description': data['carence_description'],
        'cause': data['carence_cause'],
        'responsable': data['carence_responsable'],
        'echeance': data['carence_delai_fermeture'],
        'date': data['carence_date'],
        'statut': data['carence_statut']
    }
    console.log(CarenceData);

    actionsData = data['actions']
    console.log(actionsData);
}