import api from './api'

export const getEvaluations = async () => {
  const response = await api.get('/evaluations/')
  return response.data
}

export const getEvaluationDetail = async (evaluationId) => {
  const response = await api.get(`/evaluations/${evaluationId}`)
  return response.data
}

export const createEvaluation = async (typeEvaluation, referentielId, systemeIaId, organisationId) => {
  const response = await api.post('/evaluations/', {
    evaluation_type: typeEvaluation,
    referentiel_id: referentielId,
    systeme_ia_id: systemeIaId || null,
    organisation_id: organisationId || null,
  })
  return response.data
}

export const repondreAClause = async (evaluationId, clauseId, reponse, commentaire) => {
  const response = await api.post(`/evaluations/${evaluationId}/reponses`, {
    clause_id: clauseId,
    reponse: reponse,
    commentaire: commentaire,
  })
  return response.data
}

export const finaliserEvaluation = async (evaluationId) => {
  const response = await api.post(`/evaluations/${evaluationId}/finaliser`)
  return response.data
}