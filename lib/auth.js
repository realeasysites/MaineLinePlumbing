// Simple session-based auth middleware for the admin dashboard.
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminEmail) {
    return next();
  }
  return res.redirect('/admin/login');
}

module.exports = { requireAdmin };
