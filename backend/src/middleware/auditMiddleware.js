// backend/src/middleware/auditMiddleware.js
const AuditLog = require("../models/AuditLog");

const auditMiddleware = (action) => {
  return async (req, res, next) => {
    const start = Date.now();
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        if (req.user) {
          await AuditLog.create({
            user: req.user.email,
            userRole: req.user.role,
            action,
            details: JSON.stringify({
              method: req.method,
              url: req.originalUrl,
              body: req.body,
              response: body,
            }),
            ip:
              req.headers["x-forwarded-for"] ||
              req.connection.remoteAddress ||
              "unknown",
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.error("❌ Audit log error:", err.message);
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = auditMiddleware;
