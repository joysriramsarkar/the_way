module.exports = function handler(req, res) {
  res.setHeader('Set-Cookie', 'privatian_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
  return res.status(200).json({ success: true });
};
