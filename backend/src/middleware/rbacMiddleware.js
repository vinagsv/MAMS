module.exports = function (allowedRoles = []) {
  if (!Array.isArray(allowedRoles)) {
    throw new Error("rbacMiddleware: allowedRoles must be an array");
  }

  return (req, res, next) => {
    const { role } = req.user || {};
    if (allowedRoles.length === 0) return next();
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
