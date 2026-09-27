import api from './api'

export const envoyerMessageAssistant = async (messages, organisationId) => {
  const response = await api.post('/assistant/chat', {
    messages: messages,
    organisation_id: organisationId || null,
  })
  return response.data
}