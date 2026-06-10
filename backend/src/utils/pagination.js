export const paginate = (query, { page = 1, limit = 10 }) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;
  return { ...query, skip, limit: l, page: p };
};

export const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit) || 1,
  },
});
