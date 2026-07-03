import axiosClient from './axiosClient'

const notifyTrashChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('goalstore-trash-updated'))
  }
}

const withTrashEvent = (request) => request.then((res) => {
  notifyTrashChanged()
  return res
})

export const authApi = {
  login: (data) => axiosClient.post('/auth/login', data).then((res) => res.data),
  me: () => axiosClient.get('/auth/me').then((res) => res.data),
  logout: () => axiosClient.post('/auth/logout'),
}

export const userApi = {
  getAll: () => axiosClient.get('/users').then((res) => res.data),
  create: (data) => axiosClient.post('/users', data).then((res) => res.data),
  update: (id, data) => axiosClient.put(`/users/${id}`, data).then((res) => res.data),
  remove: (id) => withTrashEvent(axiosClient.delete(`/users/${id}`)),
}

export const categoryApi = {
  getAll: () => axiosClient.get('/categories').then((res) => res.data),
  create: (data) => axiosClient.post('/categories', data).then((res) => res.data),
  update: (id, data) => axiosClient.put(`/categories/${id}`, data).then((res) => res.data),
  remove: (id) => withTrashEvent(axiosClient.delete(`/categories/${id}`)),
}

export const productApi = {
  getAll: () => axiosClient.get('/products').then((res) => res.data),
  getById: (id) => axiosClient.get(`/products/${id}`).then((res) => res.data),
  featured: () => axiosClient.get('/products/featured').then((res) => res.data),
  newest: (limit = 6) => axiosClient.get('/products/new', { params: { limit } }).then((res) => res.data),
  related: (id, limit = 4) => axiosClient.get(`/products/${id}/related`, { params: { limit } }).then((res) => res.data),
  lowStock: () => axiosClient.get('/products/low-stock').then((res) => res.data),
  search: (keyword) => axiosClient.get('/products/search', { params: { keyword } }).then((res) => res.data),
  create: (data) => axiosClient.post('/products', data).then((res) => res.data),
  update: (id, data) => axiosClient.put(`/products/${id}`, data).then((res) => res.data),
  remove: (id) => withTrashEvent(axiosClient.delete(`/products/${id}`)),
}

export const orderApi = {
  getAll: () => axiosClient.get('/orders').then((res) => res.data),
  getById: (id) => axiosClient.get(`/orders/${id}`).then((res) => res.data),
  create: (data) => axiosClient.post('/orders', data).then((res) => res.data),
  updateStatus: (id, status) => axiosClient.put(`/orders/${id}/status`, { status }).then((res) => res.data),
  remove: (id) => withTrashEvent(axiosClient.delete(`/orders/${id}`)),
}

export const customerApi = {
  getAll: () => axiosClient.get('/customers').then((res) => res.data),
  create: (data) => axiosClient.post('/customers', data).then((res) => res.data),
  update: (id, data) => axiosClient.put(`/customers/${id}`, data).then((res) => res.data),
  remove: (id) => withTrashEvent(axiosClient.delete(`/customers/${id}`)),
}

export const postApi = {
  getAll: () => axiosClient.get('/posts').then((res) => res.data),
  create: (data) => axiosClient.post('/posts', data).then((res) => res.data),
  update: (id, data) => axiosClient.put(`/posts/${id}`, data).then((res) => res.data),
  remove: (id) => withTrashEvent(axiosClient.delete(`/posts/${id}`)),
}

export const dashboardApi = {
  statistics: () => axiosClient.get('/dashboard/statistics').then((res) => res.data),
}

export const trashApi = {
  getAll: () => axiosClient.get('/trash').then((res) => res.data),
  restore: (type, id) => withTrashEvent(axiosClient.put(`/trash/${type}/${id}/restore`)),
  removePermanent: (type, id) => withTrashEvent(axiosClient.delete(`/trash/${type}/${id}/permanent`)),
}

export const uploadApi = {
  image: (file) => {
    const data = new FormData()
    data.append('file', file)
    return axiosClient.post('/uploads/images', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data)
  },
}
