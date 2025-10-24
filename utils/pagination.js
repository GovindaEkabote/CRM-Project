const pegination = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    select = "",
    sort = { createdAt: -1 },
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [data, total] = await Promise.all([
    model
      .find(query)
      .select(select)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort),
    model.countDocuments(query),
  ]);
  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      totalItems: total,
      totalPages,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1,
    },
    data,
  };
};

module.exports = pegination;
