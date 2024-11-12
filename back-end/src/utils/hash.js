const bcrypt = require("bcrypt");

module.exports = {
  hashPassword: (password) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  },
  comparePassword: (password, hash) => {
    return bcrypt.compareSync(password, hash);
  },
};
