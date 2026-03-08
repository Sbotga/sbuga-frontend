const apiRequest = async (
  endpoint: string,
  {
    body,
    method,
    headers,
  }: {
    body?: object
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
  },
) => {
  return fetch(process.env.API_URL + endpoint, {
    ...(body && { body: JSON.stringify(body) }),
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

export default apiRequest
