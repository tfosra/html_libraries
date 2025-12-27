function dummyActionData() {
    return [
        {
            'code': '2025-DSA-01-01-001',
            'description': 'Contact the maintenance team to schedule an inspection.',
            'echeance': '2024-07-15',
            'responsable': 'dupont',
            'sous_processus': 'sp1'
        },
        {
            'code': '2025-DSA-01-01-002',
            'description': 'Review the incident report and identify root causes.',
            'echeance': '2024-07-20',
            'responsable': 'martin',
            'sous_processus': 'sp2',
            'statut': 'EN_COURS'
        },
        {
            'code': '2025-DSA-01-01-003',
            'description': 'Implement corrective actions based on findings.',
            'echeance': '2024-07-30',
            'responsable': 'martin',
            'sous_processus': 'sp3'
        }
    ]
}

function dummyResponsables() {
    return [
        ['dupont', 'Alice Dupont'], 
        ['martin', 'Bob Martin'],
        ['durand', 'Charlie Durand']
    ]
}

function dummySousProcessus() {
    return [
        ['sp1', 'Sous-Processus 1'], 
        ['sp2', 'Sous-Processus 2'],
        ['sp3', 'Sous-Processus 3']
    ]
}

function dummyClassification() {
    return [
        ['OBS', 'Observation'],
        ['NIV1', 'Non-Conformité Mineure'],
        ['NIV2', 'Non-Conformité Majeure']
    ]
}

function dummyEvaluateur() {
    return [
        ['ART','ART'],
        ['ANTIC', 'ANTIC'],
        ['SGS', 'SGS'],
        ['DSA', 'DSA'],
        ['OACI', 'OACI']
    ]
}

function dummyTypeEvaluation() {
    return [
        ['AI', 'Audit Interne'],
        ['AE', 'Audit Externe'],
        ['AQ', 'Audit Qualité'],
        ['INSP', 'Inspection'],
        ['SURV', 'Surveillance'],
        ['ICVM', 'ICVM OACI']
    ]
}

function dummyLieu() {
    return [
        ['BFX', 'Bafoussam'],
        ['DLA', 'Douala'],
        ['GOU', 'Garoua'],
        ['MVR', 'Maroua'],
        ['YDE', 'Yaounde']
    ]
}

function dummyNature() {
    return [
        ['Interne', 'Interne'],
        ['Externe', 'Externe']
    ]
}

function dummyStatut() {
    return [
        ['NON_DEMARRE', 'Non démarré'],
        ['EN_COURS', 'En cours'],
        ['CLOTURE', 'Clôturé']
    ]
}

function dummyActivities() {
    return [
        {
            'code': '2025-DSA-01',
            'type_evaluation': 'AQ',
            'evaluateur': 'SGS',
            'date_debut': '2025-05-10',
            'date_fin': '2025-05-15',
            'lieu': 'YDE',
            'nature': 'Externe',
            'description': 'Audit qualité annuel des opérations de la DSA pour l\'année 2025.'
        },
        {
            'code': '2025-DSA-02',
            'type_evaluation': 'ICVM',
            'evaluateur': 'OACI',
            'lieu': 'DLA',
            'nature': 'Externe',
            'description': 'Evaluation de la conformité aux normes OACI pour les services de la DSA en 2025.'
        }
    ]
}

function dummyActivityByCode(activity_code) {
    const activities = dummyActivities();
    return activities.find(activity => activity['code'] === activity_code);;
}

function dummyCarence() {
    return {
        'code': '2025-DSA-01-001',
        'activity_code': '2025-DSA-02',
        'classification': 'NIV1',
        'responsable': 'dupont',
        'description': 'Non-conformité majeure identifiée lors du dernier audit qualité.',
        'delai_fermeture': '2026-03-31',
        'date': '2025-06-15',
        'statut': 'EN_COURS',
        'actions': dummyActionData()
    }
}

function getData(key) {
    const functMap = {
        'carence': dummyCarence,
        'actions': dummyActionData,
        'activities': dummyActivities,
        'responsable': dummyResponsables,
        'sous_processus': dummySousProcessus,
        'classification': dummyClassification,
        'evaluateur': dummyEvaluateur,
        'lieu': dummyLieu,
        'nature': dummyNature,
        'statut': dummyStatut,
        'type_evaluation': dummyTypeEvaluation
    }
    if (key in functMap) {
        return functMap[key]()
    }
    return []
}