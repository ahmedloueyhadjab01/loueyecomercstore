
const bcrypt = require('bcryptjs');
const hash = '$2a$10$YNzDCQ/cHVx6jk0k1CstdeRyvH2gKdQmUPQiFH1dAllvKbmw6/uZO';
console.log(bcrypt.compareSync('kalkoul.dz28', hash));

