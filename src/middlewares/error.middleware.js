function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err);

  const status = err.statusCode || err.status || 500;

  res.status(status).json({
    message: err.message || "Erreur serveur",
  });
}

module.exports = { errorHandler };
