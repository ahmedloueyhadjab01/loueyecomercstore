// We also need to remove the comment mentioning 3 and 4
let fs = require('fs');
let text = fs.readFileSync('.env', 'utf8');
text = text.replace('# You can change this to 3 or 4 based on your MAIN store admin ID in the users table\r\n', '');
text = text.replace('# You can change this to 3 or 4 based on your MAIN store admin ID in the users table\n', '');
fs.writeFileSync('.env', text);
