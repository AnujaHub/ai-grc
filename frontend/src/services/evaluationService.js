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
    framework_id: referentielId,
    ai_system_id: systemeIaId || null,
    organization_id: organisationId || null,
  })
  return response.data
}

export const repondreAClause = async (evaluationId, clauseId, answer, comment) => {
  const response = await api.post(`/evaluations/${evaluationId}/responses`, {
    clause_id: clauseId,
    response: answer,
    comment: comment,
  })
  return response.data
}

export const finaliserEvaluation = async (evaluationId) => {
  const response = await api.post(`/evaluations/${evaluationId}/finaliser`)
  return response.data
}