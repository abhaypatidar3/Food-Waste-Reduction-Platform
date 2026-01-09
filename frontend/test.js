const {authAPI} = require('./api');

for (let i = 0; i < 10; i++) {
  await authAPI.login(email, password);
}